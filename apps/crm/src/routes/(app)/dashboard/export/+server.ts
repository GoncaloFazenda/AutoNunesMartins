import { error, type RequestHandler } from '@sveltejs/kit';
import {
  PDFDocument,
  StandardFonts,
  rgb,
  PageSizes,
  type PDFPage,
  type PDFFont,
  type RGB,
} from 'pdf-lib';
import { dashboardApi, type DashboardPayload } from '$lib/server/dashboard';
import { buildCsv, sanitizeForWinAnsi } from '$lib/server/exports';

/*
  Resumo executivo do dashboard.

    CSV — agregados mensais dos últimos 12 meses (Mês, Vendas, Faturação,
          Lucro, Comissões, Margem %) + linha "TOTAL 12M". Lucro/comissões/
          margem só ficam preenchidos para os últimos 6 meses (limite das
          sparklines).

    PDF — uma página A4 landscape com layout visual idêntico em espírito ao
          dashboard online: header brand, fila de KPI cards com sparklines,
          bar chart das vendas dos últimos 12 meses, horizontal bars dos
          best sellers, e strip de alertas em baixo. Tudo desenhado com
          primitivas do pdf-lib — nada de tabelas em texto puro.
*/

const FMT_EUR = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function fmtEur(n: number | string): string {
  return FMT_EUR.format(typeof n === 'string' ? Number(n) : n);
}

// Compact EUR para os KPI cards onde o espaço é apertado: 12 850 → "12,8k €"
// e 1 250 000 → "1,3M €". Numbers pequenos ficam com o formato normal.
function fmtEurCompact(s: string | number): string {
  const n = typeof s === 'string' ? Number(s) : s;
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M €`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')}k €`;
  return `${n.toFixed(0)} €`;
}

function fmtDelta(deltaPct: number | null): string {
  if (deltaPct === null) return '—';
  const sign = deltaPct > 0 ? '+' : '';
  return `${sign}${deltaPct.toFixed(1)}%`;
}

export const GET: RequestHandler = async (event) => {
  const sp = event.url.searchParams;
  const format = sp.get('format') === 'pdf' ? 'pdf' : 'csv';

  const data = await dashboardApi.get(event);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `dashboard_${today}.${format}`;

  // ─── CSV ────────────────────────────────────────────────────────────
  if (format === 'csv') {
    const months = data.salesChart.months;
    const sold = data.salesChart.sold;
    const revenue = data.salesChart.revenue;
    const sparkProfit = data.kpis.sparklines.lucro;
    const sparkCommission = data.kpis.sparklines.comissoes;
    const sparkMargin = data.kpis.sparklines.margem;

    // Sparklines têm os últimos 6 meses → offset para os mapear na lista
    // de 12. Os primeiros 6 meses ficam em branco (não temos profit/etc.).
    const profitAt = (i: number): number | null => {
      const off = i - (months.length - sparkProfit.length);
      return off >= 0 ? (sparkProfit[off] ?? null) : null;
    };
    const commissionAt = (i: number): number | null => {
      const off = i - (months.length - sparkCommission.length);
      return off >= 0 ? (sparkCommission[off] ?? null) : null;
    };
    const marginAt = (i: number): number | null => {
      const off = i - (months.length - sparkMargin.length);
      return off >= 0 ? (sparkMargin[off] ?? null) : null;
    };

    const headers = ['Mês', 'Vendas', 'Faturação (€)', 'Lucro (€)', 'Comissões (€)', 'Margem %'];
    const rows: (string | number)[][] = months.map((m, i) => [
      m,
      sold[i] ?? 0,
      (revenue[i] ?? 0).toFixed(2),
      profitAt(i) !== null ? (profitAt(i) as number).toFixed(2) : '',
      commissionAt(i) !== null ? (commissionAt(i) as number).toFixed(2) : '',
      marginAt(i) !== null ? (marginAt(i) as number).toFixed(1) : '',
    ]);
    rows.push([
      'TOTAL 12M',
      data.salesChart.ytdSold,
      Number(data.salesChart.ytdRevenue).toFixed(2),
      '',
      '',
      data.salesChart.ytdAvgMarginPct !== null
        ? data.salesChart.ytdAvgMarginPct.toFixed(1)
        : '',
    ]);

    const csv = buildCsv(headers, rows);
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  // ─── PDF ────────────────────────────────────────────────────────────
  try {
    const pdfBytes = await buildDashboardPdf(data);
    return new Response(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }), {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Dashboard PDF export failed:', err);
    throw error(500, 'Falha ao gerar PDF do dashboard');
  }
};

// ════════════════════════════════════════════════════════════════════════
// PDF generation — visual one-page snapshot
// ════════════════════════════════════════════════════════════════════════

// Paleta mapeada a partir das CSS variables do dashboard. Mantemos contraste
// suficiente para impressão a P&B sem perder a hierarquia visual a cores.
const C = {
  brand: rgb(0.89, 0.024, 0.075), // --color-red
  success: rgb(0.13, 0.77, 0.37), // --color-success
  warning: rgb(0.96, 0.62, 0.04), // --color-warning amber
  orange: rgb(0.97, 0.45, 0.09), // DRAFT / retoma
  text: rgb(0.12, 0.12, 0.14),
  textMuted: rgb(0.42, 0.43, 0.47),
  textFaint: rgb(0.6, 0.61, 0.65),
  border: rgb(0.87, 0.87, 0.88),
  bg2: rgb(0.96, 0.96, 0.97),
  white: rgb(1, 1, 1),
};

interface Fonts {
  font: PDFFont;
  bold: PDFFont;
}

// Helper que sanitiza sempre — proteção contra qualquer caractere fora do
// WinAnsi que possa surgir nos dados do utilizador (marcas, modelos, etc.).
function txt(page: PDFPage, s: string, opts: Parameters<PDFPage['drawText']>[1]): void {
  page.drawText(sanitizeForWinAnsi(s), opts);
}

async function buildDashboardPdf(data: DashboardPayload): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fonts: Fonts = { font, bold };

  // A4 landscape (842 × 595 pt)
  const W = PageSizes.A4[1];
  const H = PageSizes.A4[0];
  const page = pdf.addPage([W, H]);
  const margin = 24;

  // ─── Header band (red brand strip) ───────────────────────────────────
  page.drawRectangle({ x: 0, y: H - 54, width: W, height: 54, color: C.brand });
  txt(page, 'AUTO NUNES MARTINS', { x: margin, y: H - 26, size: 16, font: bold, color: C.white });
  txt(page, 'Resumo Executivo do Dashboard', {
    x: margin,
    y: H - 44,
    size: 9,
    font,
    color: C.white,
  });
  const dateStr = new Date().toLocaleDateString('pt-PT');
  txt(page, `Exportado em ${dateStr}`, {
    x: W - margin - 130,
    y: H - 26,
    size: 9,
    font,
    color: C.white,
  });
  const currentMonth = data.salesChart.months[data.salesChart.months.length - 1] ?? '';
  txt(page, `Mês actual: ${currentMonth}`, {
    x: W - margin - 130,
    y: H - 42,
    size: 9,
    font,
    color: C.white,
  });

  // ─── KPI cards row ───────────────────────────────────────────────────
  // 5 cards lado a lado, cada um com: label, valor grande, delta vs mês
  // anterior (verde/vermelho), e sparkline dos últimos 6 meses.
  const kpiTop = H - 60 - 16; // 16pt de gap após o header
  const kpiH = 100;
  const kpiGap = 8;
  const kpiW = (W - margin * 2 - kpiGap * 4) / 5;

  const kpis = [
    {
      label: 'Vendas (un.)',
      value: String(data.kpis.vendasMes.count),
      delta: fmtDelta(data.kpis.vendasMes.deltaPct),
      previous: `Anterior: ${data.kpis.vendasMes.previousCount}`,
      spark: data.kpis.sparklines.vendas,
      sparkColor: C.brand,
    },
    {
      label: 'Faturação',
      value: fmtEurCompact(data.kpis.faturacaoMes.current),
      delta: fmtDelta(data.kpis.faturacaoMes.deltaPct),
      previous: `Anterior: ${fmtEurCompact(data.kpis.faturacaoMes.previous)}`,
      spark: data.kpis.sparklines.faturacao,
      sparkColor: C.brand,
    },
    {
      label: 'Lucro real',
      value: fmtEurCompact(data.kpis.lucroMes.current),
      delta: fmtDelta(data.kpis.lucroMes.deltaPct),
      previous: `Anterior: ${fmtEurCompact(data.kpis.lucroMes.previous)}`,
      spark: data.kpis.sparklines.lucro,
      sparkColor: C.success,
    },
    {
      label: 'Comissões',
      value: fmtEurCompact(data.kpis.comissoesMes.current),
      delta: fmtDelta(data.kpis.comissoesMes.deltaPct),
      previous: `Anterior: ${fmtEurCompact(data.kpis.comissoesMes.previous)}`,
      spark: data.kpis.sparklines.comissoes,
      sparkColor: C.warning,
    },
    {
      label: 'Margem média',
      value:
        data.kpis.margemMedia.current !== null
          ? `${data.kpis.margemMedia.current.toFixed(1)}%`
          : '—',
      delta: fmtDelta(data.kpis.margemMedia.deltaPct),
      previous:
        data.kpis.margemMedia.previous !== null
          ? `Anterior: ${data.kpis.margemMedia.previous.toFixed(1)}%`
          : 'Anterior: —',
      spark: data.kpis.sparklines.margem,
      sparkColor: C.success,
    },
  ];

  for (let i = 0; i < kpis.length; i++) {
    const x = margin + i * (kpiW + kpiGap);
    drawKpiCard(page, x, kpiTop - kpiH, kpiW, kpiH, kpis[i]!, fonts);
  }

  // ─── Charts row ─────────────────────────────────────────────────────
  // Left (60%): vendas por mês — bar chart 12 meses
  // Right (40%): mais vendidos — horizontal bars
  const chartsTop = kpiTop - kpiH - 16;
  // chartsH calculado para preencher o espaço entre KPI cards e a strip de
  // alertas (60pt no rodapé + 24pt de margem inferior + 16pt de gap).
  const chartsH = chartsTop - (margin + 60 + 16);
  const innerGap = 12;
  const leftW = (W - margin * 2 - innerGap) * 0.6;
  const rightW = (W - margin * 2 - innerGap) * 0.4;

  drawMonthlyBarChart(
    page,
    margin,
    chartsTop - chartsH,
    leftW,
    chartsH,
    data.salesChart.months,
    data.salesChart.sold,
    data.salesChart.revenue,
    fonts,
  );

  drawBestSellersChart(
    page,
    margin + leftW + innerGap,
    chartsTop - chartsH,
    rightW,
    chartsH,
    data.bestSellers,
    fonts,
  );

  // ─── Alerts strip (rodapé) ──────────────────────────────────────────
  drawAlertsStrip(
    page,
    margin,
    margin,
    W - margin * 2,
    60,
    data.alerts,
    fonts,
  );

  return await pdf.save();
}

// ─── KPI card ──────────────────────────────────────────────────────────
function drawKpiCard(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  kpi: {
    label: string;
    value: string;
    delta: string;
    previous: string;
    spark: number[];
    sparkColor: RGB;
  },
  fonts: Fonts,
): void {
  // Cartão com borda subtil
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderColor: C.border,
    borderWidth: 0.6,
  });

  // Label
  txt(page, kpi.label.toUpperCase(), {
    x: x + 8,
    y: y + h - 14,
    size: 7,
    font: fonts.bold,
    color: C.textMuted,
  });

  // Valor grande
  txt(page, kpi.value, {
    x: x + 8,
    y: y + h - 36,
    size: 17,
    font: fonts.bold,
    color: C.text,
  });

  // Delta (verde positivo, vermelho negativo, cinza neutro)
  const deltaColor = kpi.delta.startsWith('+')
    ? C.success
    : kpi.delta.startsWith('-')
      ? C.brand
      : C.textFaint;
  txt(page, kpi.delta, {
    x: x + 8,
    y: y + h - 52,
    size: 9,
    font: fonts.bold,
    color: deltaColor,
  });
  txt(page, kpi.previous, {
    x: x + 8 + fonts.bold.widthOfTextAtSize(sanitizeForWinAnsi(kpi.delta), 9) + 6,
    y: y + h - 51,
    size: 7,
    font: fonts.font,
    color: C.textFaint,
  });

  // Sparkline (linha) na parte de baixo do cartão
  drawSparkline(
    page,
    x + 8,
    y + 8,
    w - 16,
    26,
    kpi.spark,
    kpi.sparkColor,
  );
}

// ─── Sparkline (linha conectada) ───────────────────────────────────────
function drawSparkline(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  values: number[],
  color: RGB,
): void {
  if (values.length === 0) return;
  // Trata a linha de baseline subtil para o sparkline "respirar" mesmo
  // quando todos os valores são zero.
  page.drawLine({
    start: { x, y },
    end: { x: x + w, y },
    thickness: 0.3,
    color: C.border,
  });
  if (values.length === 1) {
    // Único ponto: pequeno marcador no centro
    page.drawCircle({
      x: x + w / 2,
      y: y + h / 2,
      size: 1.5,
      color,
    });
    return;
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const ny = (v: number) => y + 2 + ((h - 4) * (v - min)) / range;
  for (let i = 0; i < values.length - 1; i++) {
    page.drawLine({
      start: { x: x + i * step, y: ny(values[i]!) },
      end: { x: x + (i + 1) * step, y: ny(values[i + 1]!) },
      thickness: 1.5,
      color,
    });
  }
  // Marcadores nos pontos para destacar
  for (let i = 0; i < values.length; i++) {
    page.drawCircle({
      x: x + i * step,
      y: ny(values[i]!),
      size: 1.2,
      color,
    });
  }
}

// ─── Monthly bar chart (vendas + faturação) ────────────────────────────
function drawMonthlyBarChart(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  months: string[],
  sold: number[],
  revenue: number[],
  fonts: Fonts,
): void {
  // Cartão exterior
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderColor: C.border,
    borderWidth: 0.6,
  });
  // Título
  txt(page, 'VENDAS POR MÊS · ÚLTIMOS 12', {
    x: x + 10,
    y: y + h - 14,
    size: 7,
    font: fonts.bold,
    color: C.textMuted,
  });
  // Legend (dois indicadores: vendas em barras + faturação como linha)
  txt(page, 'Vendas (un.)', {
    x: x + w - 180,
    y: y + h - 14,
    size: 7,
    font: fonts.font,
    color: C.text,
  });
  page.drawRectangle({
    x: x + w - 195,
    y: y + h - 12,
    width: 10,
    height: 6,
    color: C.brand,
  });
  txt(page, 'Faturação', {
    x: x + w - 88,
    y: y + h - 14,
    size: 7,
    font: fonts.font,
    color: C.text,
  });
  page.drawLine({
    start: { x: x + w - 103, y: y + h - 10 },
    end: { x: x + w - 92, y: y + h - 10 },
    thickness: 1.5,
    color: C.success,
  });

  // Área do gráfico (após espaço para título e labels)
  const padTop = 24;
  const padBottom = 28; // labels mensais
  const padLeft = 32;
  const padRight = 12;
  const chartX = x + padLeft;
  const chartY = y + padBottom;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  // Eixos
  page.drawLine({
    start: { x: chartX, y: chartY },
    end: { x: chartX + chartW, y: chartY },
    thickness: 0.5,
    color: C.textFaint,
  });
  page.drawLine({
    start: { x: chartX, y: chartY },
    end: { x: chartX, y: chartY + chartH },
    thickness: 0.5,
    color: C.textFaint,
  });

  // Y-axis ticks (escala automática 4 ticks)
  const maxSold = Math.max(...sold, 1);
  const niceMax = niceCeil(maxSold);
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) {
    const ty = chartY + (chartH * t) / ticks;
    const v = Math.round((niceMax * t) / ticks);
    page.drawLine({
      start: { x: chartX - 3, y: ty },
      end: { x: chartX + chartW, y: ty },
      thickness: 0.25,
      color: C.border,
    });
    txt(page, String(v), {
      x: chartX - 22,
      y: ty - 3,
      size: 6,
      font: fonts.font,
      color: C.textFaint,
    });
  }

  // Bars (vendas) + line (faturação)
  const groupW = chartW / months.length;
  const barW = Math.min(groupW * 0.6, 24);
  const barGap = (groupW - barW) / 2;

  // Bars
  for (let i = 0; i < months.length; i++) {
    const bx = chartX + i * groupW + barGap;
    const v = sold[i] ?? 0;
    const bh = niceMax > 0 ? (chartH * v) / niceMax : 0;
    page.drawRectangle({
      x: bx,
      y: chartY,
      width: barW,
      height: bh,
      color: C.brand,
    });
    // Valor em cima da barra (quando há espaço)
    if (v > 0 && bh > 8) {
      const lbl = String(v);
      const lblW = fonts.font.widthOfTextAtSize(lbl, 6);
      txt(page, lbl, {
        x: bx + barW / 2 - lblW / 2,
        y: chartY + bh + 2,
        size: 6,
        font: fonts.font,
        color: C.text,
      });
    }
    // Label mensal
    const monthLbl = months[i] ?? '';
    const mLblW = fonts.font.widthOfTextAtSize(sanitizeForWinAnsi(monthLbl), 7);
    txt(page, monthLbl, {
      x: chartX + i * groupW + groupW / 2 - mLblW / 2,
      y: chartY - 12,
      size: 7,
      font: fonts.font,
      color: C.textMuted,
    });
  }

  // Faturação: linha sobreposta (escala separada, alinha ao topo do chart)
  const maxRevenue = Math.max(...revenue, 1);
  const niceMaxR = niceCeil(maxRevenue);
  for (let i = 0; i < months.length - 1; i++) {
    const r1 = revenue[i] ?? 0;
    const r2 = revenue[i + 1] ?? 0;
    const y1 = chartY + (chartH * r1) / niceMaxR;
    const y2 = chartY + (chartH * r2) / niceMaxR;
    const x1 = chartX + i * groupW + groupW / 2;
    const x2 = chartX + (i + 1) * groupW + groupW / 2;
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 1.5,
      color: C.success,
    });
  }
  for (let i = 0; i < months.length; i++) {
    const r = revenue[i] ?? 0;
    const cy = chartY + (chartH * r) / niceMaxR;
    const cx = chartX + i * groupW + groupW / 2;
    page.drawCircle({ x: cx, y: cy, size: 1.6, color: C.success });
  }
}

// niceCeil — arredonda um número para o "tick" superior agradável (10, 20,
// 50, 100…) para o eixo Y do bar chart ficar limpo.
function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  let nice: number;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * mag;
}

// ─── Best sellers (horizontal bars) ────────────────────────────────────
function drawBestSellersChart(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  sellers: DashboardPayload['bestSellers'],
  fonts: Fonts,
): void {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderColor: C.border,
    borderWidth: 0.6,
  });
  txt(page, 'MAIS VENDIDOS · ÚLTIMOS 12 MESES', {
    x: x + 10,
    y: y + h - 14,
    size: 7,
    font: fonts.bold,
    color: C.textMuted,
  });

  if (sellers.length === 0) {
    txt(page, 'Sem dados de vendas no período.', {
      x: x + 10,
      y: y + h / 2,
      size: 9,
      font: fonts.font,
      color: C.textFaint,
    });
    return;
  }

  const padTop = 28;
  const padBottom = 12;
  const padLeft = 10;
  const padRight = 10;
  const inner = h - padTop - padBottom;
  const rowH = inner / sellers.length;
  const max = Math.max(...sellers.map((s) => s.count), 1);
  const labelW = (w - padLeft - padRight) * 0.5;
  const barAreaX = x + padLeft + labelW;
  const barAreaW = (w - padLeft - padRight) * 0.45;

  for (let i = 0; i < sellers.length; i++) {
    const s = sellers[i]!;
    const ry = y + h - padTop - (i + 1) * rowH + rowH * 0.15;
    const barH = rowH * 0.55;

    // Label (Marca Modelo)
    const label = `${s.brand} ${s.model}`;
    txt(page, label, {
      x: x + padLeft,
      y: ry + barH / 2 - 3,
      size: 8,
      font: fonts.font,
      color: C.text,
    });

    // Bar
    const bw = (barAreaW * s.count) / max;
    page.drawRectangle({
      x: barAreaX,
      y: ry,
      width: bw,
      height: barH,
      color: C.brand,
    });
    // Contagem no fim da barra
    txt(page, String(s.count), {
      x: barAreaX + bw + 4,
      y: ry + barH / 2 - 3,
      size: 8,
      font: fonts.bold,
      color: C.text,
    });
  }
}

// ─── Alerts strip ──────────────────────────────────────────────────────
function drawAlertsStrip(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  alerts: DashboardPayload['alerts'],
  fonts: Fonts,
): void {
  // Fundo subtil
  page.drawRectangle({ x, y, width: w, height: h, color: C.bg2 });
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderColor: C.border,
    borderWidth: 0.6,
  });

  txt(page, 'ALERTAS ACTIVOS', {
    x: x + 12,
    y: y + h - 14,
    size: 7,
    font: fonts.bold,
    color: C.textMuted,
  });

  const items = [
    {
      label: 'Stock parado',
      count: alerts.stockAged,
      suffix: '+ 60 dias',
      color: C.warning,
    },
    {
      label: 'Tarefas',
      count: alerts.tasksDueOrOverdue,
      suffix: 'hoje / atraso',
      color: C.brand,
    },
    {
      label: 'Lembretes',
      count: alerts.remindersToday,
      suffix: 'hoje',
      color: C.brand,
    },
    {
      label: 'Rascunhos',
      count: alerts.draftVehicles,
      suffix: 'sem preço',
      color: C.orange,
    },
  ];

  const itemW = (w - 24) / items.length;
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const ix = x + 12 + i * itemW;
    const valueColor = item.count > 0 ? item.color : C.textFaint;

    txt(page, item.label.toUpperCase(), {
      x: ix,
      y: y + h - 30,
      size: 7,
      font: fonts.bold,
      color: C.textMuted,
    });
    // Número grande
    txt(page, String(item.count), {
      x: ix,
      y: y + 10,
      size: 20,
      font: fonts.bold,
      color: valueColor,
    });
    // Suffix à direita do número
    const numW = fonts.bold.widthOfTextAtSize(String(item.count), 20);
    txt(page, item.suffix, {
      x: ix + numW + 6,
      y: y + 14,
      size: 8,
      font: fonts.font,
      color: C.textMuted,
    });
  }
}
