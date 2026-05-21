import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

export function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]) {
  const head = headers.map(csvEscape).join(',');
  const body = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
  // UTF-8 BOM for Excel compatibility on pt-PT systems
  return '﻿' + head + '\n' + body + '\n';
}

interface PdfTableOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
  columnWidths?: number[];
}

export async function buildPdfTable(opts: PdfTableOptions): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // A4 landscape
  let page = pdf.addPage([PageSizes.A4[1], PageSizes.A4[0]]);
  const { width, height } = page.getSize();
  const margin = 30;
  let y = height - margin;

  // Header band
  page.drawRectangle({
    x: 0,
    y: height - 60,
    width,
    height: 60,
    color: rgb(0.89, 0.024, 0.075),
  });
  page.drawText('AUTO NUNES MARTINS', {
    x: margin,
    y: height - 30,
    size: 18,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText('Comércio de Automóveis', {
    x: margin,
    y: height - 48,
    size: 8,
    font,
    color: rgb(1, 1, 1),
  });
  const date = new Date().toLocaleDateString('pt-PT');
  page.drawText(`Exportado: ${date}`, {
    x: width - margin - 120,
    y: height - 30,
    size: 9,
    font,
    color: rgb(1, 1, 1),
  });

  y = height - 90;
  page.drawText(opts.title.toUpperCase(), { x: margin, y, size: 16, font: bold });
  y -= 18;
  if (opts.subtitle) {
    page.drawText(opts.subtitle, { x: margin, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
    y -= 18;
  }
  y -= 8;

  const colWidths =
    opts.columnWidths ?? new Array(opts.headers.length).fill((width - margin * 2) / opts.headers.length);

  // Table header
  let x = margin;
  page.drawRectangle({
    x: margin - 4,
    y: y - 4,
    width: width - margin * 2 + 8,
    height: 18,
    color: rgb(0.95, 0.95, 0.93),
  });
  for (let i = 0; i < opts.headers.length; i++) {
    page.drawText(opts.headers[i] ?? '', {
      x,
      y: y + 2,
      size: 8,
      font: bold,
      color: rgb(0.2, 0.2, 0.2),
    });
    x += colWidths[i] ?? 80;
  }
  y -= 18;

  // Rows
  const rowHeight = 16;
  const fontSize = 9;
  for (const row of opts.rows) {
    if (y < margin + 30) {
      page = pdf.addPage([PageSizes.A4[1], PageSizes.A4[0]]);
      y = height - margin;
    }
    x = margin;
    for (let i = 0; i < row.length; i++) {
      const cell = row[i] ?? '';
      const trimmed =
        cell.length > 36 ? cell.slice(0, 33) + '…' : cell;
      page.drawText(trimmed, { x, y, size: fontSize, font, color: rgb(0.15, 0.15, 0.17) });
      x += colWidths[i] ?? 80;
    }
    page.drawLine({
      start: { x: margin, y: y - 4 },
      end: { x: width - margin, y: y - 4 },
      thickness: 0.4,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= rowHeight;
  }

  return await pdf.save();
}
