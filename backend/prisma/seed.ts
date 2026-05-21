/*
 * Database seed — populates the dealership with ~2 months of realistic
 * activity (customers, vehicles, expenses, sales, tasks, operational costs,
 * and activity-log entries).
 *
 * Safe to re-run: it deletes the seedable tables first while keeping the
 * Clerk-managed User rows + AppSetting defaults intact. To skip the wipe,
 * run with KEEP_DATA=1.
 */

import { PrismaClient, type Prisma } from '@prisma/client';
import { computeSaleFigures } from '../src/lib/domain/sale.js';

const prisma = new PrismaClient();

// ─── Tunables ───────────────────────────────────────────────────────────
const TODAY = new Date('2026-05-21T10:00:00Z');
const DAYS_OF_HISTORY = 60; // ≈ 2 months

const NUM_CUSTOMERS = 18;
const NUM_VEHICLES = 32;
// of those, NUM_SOLD become Sale rows; the rest stay in stock.
const NUM_SOLD = 16;
const NUM_AGED_AVAILABLE = 3; // available > 60 days → triggers smart alert

const NUM_OPERATIONAL_EXPENSES = 24;
const NUM_TASKS = 28;

// ─── Helpers ────────────────────────────────────────────────────────────
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
function pickN<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]!);
  }
  return out;
}
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, decimals = 2): number {
  const v = Math.random() * (max - min) + min;
  return Number(v.toFixed(decimals));
}
function dayOffset(days: number): Date {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function randomVin(): string {
  // 17-char VIN-shaped string (loose — uses I/O which real VINs don't, but
  // we only use it as a unique identifier here).
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let v = '';
  for (let i = 0; i < 17; i++) v += chars[Math.floor(Math.random() * chars.length)];
  return v;
}
function randomNif(seedIndex: number): string {
  // 9-digit numeric NIF. Codebase only checks "digits", not the checksum.
  // Use the seed index in the first 3 chars so re-runs don't collide.
  const prefix = String(200 + seedIndex).padStart(3, '0');
  const rest = String(rand(100000, 999999)).padStart(6, '0');
  return `${prefix}${rest}`;
}
function randomPhone(): string {
  // PT mobile (9XX XXX XXX) — 9 digits as the schema requires.
  const prefix = pick(['91', '92', '93', '96'] as const);
  return `${prefix}${String(rand(1000000, 9999999)).padStart(7, '0')}`;
}

// ─── Reference data ─────────────────────────────────────────────────────
const PT_FIRST_NAMES = [
  'João', 'Maria', 'Pedro', 'Ana', 'Tiago', 'Catarina', 'Rui',
  'Sofia', 'Manuel', 'Beatriz', 'Diogo', 'Inês', 'André', 'Carolina',
  'Ricardo', 'Mariana', 'Bruno', 'Margarida', 'Nuno', 'Patrícia',
  'Hugo', 'Filipa', 'Miguel', 'Joana',
];
const PT_SURNAMES = [
  'Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa',
  'Rodrigues', 'Martins', 'Sousa', 'Gomes', 'Marques', 'Fernandes',
  'Lopes', 'Carvalho', 'Pinto', 'Ribeiro', 'Almeida', 'Nunes',
  'Mendes', 'Henriques', 'Cardoso', 'Tavares', 'Coelho',
];
const PT_CITIES = [
  'Lisboa', 'Porto', 'Braga', 'Coimbra', 'Aveiro', 'Faro', 'Setúbal',
  'Leiria', 'Viseu', 'Évora', 'Funchal', 'Guimarães', 'Cascais',
];

const VEHICLE_CATALOG: ReadonlyArray<{
  brand: string;
  model: string;
  yearMin: number;
  yearMax: number;
  fuel: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'PLUGIN_HYBRID' | 'ELECTRIC' | 'LPG';
  purchasePrice: [number, number];
  salePrice: [number, number];
  description?: string;
}> = [
  { brand: 'Dacia', model: 'Jogger Extreme', yearMin: 2023, yearMax: 2024, fuel: 'GASOLINE', purchasePrice: [13500, 14500], salePrice: [16900, 17950], description: 'Topo de gama 7 lugares, recente.' },
  { brand: 'Dacia', model: 'Sandero Stepway', yearMin: 2022, yearMax: 2024, fuel: 'GASOLINE', purchasePrice: [9800, 11500], salePrice: [12500, 13900] },
  { brand: 'Dacia', model: 'Duster', yearMin: 2022, yearMax: 2024, fuel: 'DIESEL', purchasePrice: [13000, 16000], salePrice: [16500, 19500], description: 'SUV familiar, baixo consumo.' },
  { brand: 'Renault', model: 'Clio TCe', yearMin: 2022, yearMax: 2024, fuel: 'GASOLINE', purchasePrice: [10500, 12500], salePrice: [13500, 15500] },
  { brand: 'Renault', model: 'Captur Hybrid', yearMin: 2022, yearMax: 2024, fuel: 'HYBRID', purchasePrice: [16500, 19500], salePrice: [21000, 24500] },
  { brand: 'Renault', model: 'Mégane E-Tech', yearMin: 2023, yearMax: 2024, fuel: 'ELECTRIC', purchasePrice: [28000, 32000], salePrice: [34000, 38500], description: 'Elétrico 100%, autonomia 470 km.' },
  { brand: 'Peugeot', model: '208 GT', yearMin: 2022, yearMax: 2024, fuel: 'GASOLINE', purchasePrice: [12500, 14500], salePrice: [15500, 17800] },
  { brand: 'Peugeot', model: '3008 GT BlueHDi', yearMin: 2021, yearMax: 2023, fuel: 'DIESEL', purchasePrice: [22500, 25500], salePrice: [27000, 30900] },
  { brand: 'Peugeot', model: '508 SW', yearMin: 2021, yearMax: 2023, fuel: 'DIESEL', purchasePrice: [21000, 24000], salePrice: [26500, 30000] },
  { brand: 'Citroën', model: 'C3 Aircross', yearMin: 2022, yearMax: 2024, fuel: 'GASOLINE', purchasePrice: [11500, 13800], salePrice: [14500, 16900] },
  { brand: 'Citroën', model: 'C4 ë-C4 Electric', yearMin: 2022, yearMax: 2023, fuel: 'ELECTRIC', purchasePrice: [22000, 26000], salePrice: [27500, 31500] },
  { brand: 'Opel', model: 'Corsa Edition', yearMin: 2022, yearMax: 2024, fuel: 'GASOLINE', purchasePrice: [11000, 13000], salePrice: [13900, 15900] },
  { brand: 'Opel', model: 'Mokka-e', yearMin: 2022, yearMax: 2023, fuel: 'ELECTRIC', purchasePrice: [20000, 23500], salePrice: [25000, 28900] },
  { brand: 'Volkswagen', model: 'Polo TSI', yearMin: 2022, yearMax: 2024, fuel: 'GASOLINE', purchasePrice: [13500, 16000], salePrice: [16900, 19500] },
  { brand: 'Volkswagen', model: 'Golf 1.5 eTSI', yearMin: 2022, yearMax: 2024, fuel: 'HYBRID', purchasePrice: [18500, 22500], salePrice: [23000, 26900] },
  { brand: 'Volkswagen', model: 'T-Roc Style', yearMin: 2022, yearMax: 2024, fuel: 'GASOLINE', purchasePrice: [21000, 25000], salePrice: [26000, 30500] },
  { brand: 'Volkswagen', model: 'ID.3 Pro', yearMin: 2022, yearMax: 2023, fuel: 'ELECTRIC', purchasePrice: [27500, 31500], salePrice: [33500, 37900] },
  { brand: 'BMW', model: 'Série 1 118i', yearMin: 2021, yearMax: 2023, fuel: 'GASOLINE', purchasePrice: [22000, 27000], salePrice: [28500, 33500] },
  { brand: 'BMW', model: 'Série 3 320d Touring', yearMin: 2021, yearMax: 2023, fuel: 'DIESEL', purchasePrice: [32000, 38000], salePrice: [39500, 46900], description: 'Carrinha familiar premium.' },
  { brand: 'BMW', model: 'X1 sDrive18d', yearMin: 2020, yearMax: 2022, fuel: 'DIESEL', purchasePrice: [25500, 30500], salePrice: [31200, 36900] },
  { brand: 'BMW', model: 'M340i xDrive Touring', yearMin: 2021, yearMax: 2023, fuel: 'GASOLINE', purchasePrice: [50000, 56000], salePrice: [58900, 65900], description: 'Versão M Performance, 374 cv.' },
  { brand: 'Audi', model: 'A3 Sportback 30 TFSI', yearMin: 2021, yearMax: 2023, fuel: 'GASOLINE', purchasePrice: [21500, 26500], salePrice: [27000, 31900] },
  { brand: 'Audi', model: 'Q3 35 TDI quattro', yearMin: 2021, yearMax: 2023, fuel: 'DIESEL', purchasePrice: [27500, 32500], salePrice: [33500, 38900] },
  { brand: 'Audi', model: 'Q5 50 TFSI e quattro', yearMin: 2021, yearMax: 2023, fuel: 'PLUGIN_HYBRID', purchasePrice: [40000, 47000], salePrice: [48500, 55900] },
  { brand: 'Mercedes-Benz', model: 'Classe A 180d', yearMin: 2021, yearMax: 2023, fuel: 'DIESEL', purchasePrice: [22500, 27500], salePrice: [28500, 33500] },
  { brand: 'Mercedes-Benz', model: 'GLA 200', yearMin: 2021, yearMax: 2023, fuel: 'GASOLINE', purchasePrice: [27500, 32500], salePrice: [33900, 39500] },
  { brand: 'Tesla', model: 'Model 3 Long Range', yearMin: 2021, yearMax: 2023, fuel: 'ELECTRIC', purchasePrice: [32500, 38500], salePrice: [38500, 44900], description: 'Autonomia 580 km, AWD.' },
  { brand: 'Tesla', model: 'Model Y', yearMin: 2022, yearMax: 2023, fuel: 'ELECTRIC', purchasePrice: [38000, 44000], salePrice: [44900, 51900] },
  { brand: 'Hyundai', model: 'i30 N Line', yearMin: 2022, yearMax: 2024, fuel: 'GASOLINE', purchasePrice: [16500, 19500], salePrice: [20500, 23900] },
  { brand: 'Hyundai', model: 'Tucson Hybrid', yearMin: 2022, yearMax: 2023, fuel: 'HYBRID', purchasePrice: [24500, 29500], salePrice: [30500, 35900] },
  { brand: 'Kia', model: 'Ceed SW', yearMin: 2022, yearMax: 2024, fuel: 'DIESEL', purchasePrice: [16500, 19500], salePrice: [20500, 23900] },
  { brand: 'Fiat', model: '500e', yearMin: 2022, yearMax: 2024, fuel: 'ELECTRIC', purchasePrice: [16500, 19500], salePrice: [20900, 24500] },
];

const EXPENSE_TEMPLATES: ReadonlyArray<{
  category: 'ACQUISITION' | 'REPAIR' | 'INSPECTION' | 'TRANSPORT' | 'CLEANING' | 'DOCS' | 'OTHER';
  description: string;
  amount: [number, number];
  weight: number;
}> = [
  { category: 'TRANSPORT', description: 'Transporte do leilão', amount: [180, 380], weight: 3 },
  { category: 'CLEANING', description: 'Limpeza e detail interior', amount: [60, 140], weight: 4 },
  { category: 'INSPECTION', description: 'Inspeção periódica IPO', amount: [35, 60], weight: 3 },
  { category: 'REPAIR', description: 'Substituição de pneus', amount: [240, 480], weight: 2 },
  { category: 'REPAIR', description: 'Travões dianteiros', amount: [180, 360], weight: 2 },
  { category: 'REPAIR', description: 'Revisão e mudança de óleo', amount: [120, 250], weight: 4 },
  { category: 'REPAIR', description: 'Reparação carroçaria', amount: [350, 900], weight: 1 },
  { category: 'DOCS', description: 'Registo automóvel + IMT', amount: [85, 130], weight: 3 },
  { category: 'OTHER', description: 'Pequenos consumíveis', amount: [25, 90], weight: 2 },
];

const OPERATIONAL_TEMPLATES: ReadonlyArray<{
  category: 'RENT' | 'BILLS' | 'SERVICES' | 'OTHER';
  description: string;
  amount: [number, number];
  monthly: boolean;
}> = [
  { category: 'RENT', description: 'Renda do stand', amount: [1450, 1450], monthly: true },
  { category: 'BILLS', description: 'Eletricidade', amount: [180, 320], monthly: true },
  { category: 'BILLS', description: 'Água', amount: [35, 65], monthly: true },
  { category: 'BILLS', description: 'Internet e telecomunicações', amount: [55, 95], monthly: true },
  { category: 'SERVICES', description: 'Contabilidade', amount: [180, 220], monthly: true },
  { category: 'SERVICES', description: 'Publicidade online (Standvirtual + OLX)', amount: [220, 420], monthly: true },
  { category: 'SERVICES', description: 'Limpeza profissional do stand', amount: [80, 120], monthly: false },
  { category: 'OTHER', description: 'Café e consumíveis de escritório', amount: [40, 90], monthly: false },
];

const TASK_TEMPLATES: ReadonlyArray<{
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  recurrence?: 'NONE' | 'MONTHLY' | 'ANNUAL';
}> = [
  { title: 'Renovar seguro do stand', description: 'Apólice anual vence em breve.', priority: 'URGENT', recurrence: 'ANNUAL' },
  { title: 'Tratar IMT — Audi Q3 35 TDI', description: 'Documentos pendentes desde a aquisição.', priority: 'HIGH' },
  { title: 'Contactar Maria João Reis', description: 'Cliente recorrente, há 2 anos sem contacto.', priority: 'MEDIUM' },
  { title: 'Atualizar fotos — Peugeot 3008', description: 'Galeria precisa de fotos novas após limpeza.', priority: 'LOW' },
  { title: 'Fazer pagamento da renda', description: 'Mensal.', priority: 'HIGH', recurrence: 'MONTHLY' },
  { title: 'Inspeção IPO — BMW Série 3', description: 'Marcar na próxima semana.', priority: 'MEDIUM' },
  { title: 'Negociar com cliente sobre Tesla Model 3', description: 'Cliente quer financiamento a 60 meses.', priority: 'HIGH' },
  { title: 'Reparar travões — VW Golf', description: 'Cliente reportou ruído.', priority: 'HIGH' },
  { title: 'Atualizar listagens no Standvirtual', description: 'Renovar destaque mensal.', priority: 'MEDIUM', recurrence: 'MONTHLY' },
  { title: 'Comprar consumíveis de limpeza', priority: 'LOW' },
  { title: 'Reorganizar zona de exposição', priority: 'LOW' },
  { title: 'Enviar fatura à Sra. Mendes', description: 'Venda do Citroën C3.', priority: 'HIGH' },
  { title: 'Verificar pagamento de IUC', priority: 'MEDIUM' },
  { title: 'Conferir documentos do Volkswagen ID.3', priority: 'MEDIUM' },
  { title: 'Confirmar entrega — BMW X1', description: 'Cliente combinou para sexta.', priority: 'HIGH' },
  { title: 'Atualizar preços do stock', description: 'Revisão mensal de PVP.', priority: 'MEDIUM', recurrence: 'MONTHLY' },
  { title: 'Resposta a pedido informação Olx', priority: 'LOW' },
  { title: 'Marcar test drive — Mercedes GLA', priority: 'MEDIUM' },
  { title: 'Renovar contrato de manutenção sistema CCTV', priority: 'LOW', recurrence: 'ANNUAL' },
  { title: 'Auditoria do stock físico', priority: 'MEDIUM' },
  { title: 'Tratar do registo da Renault Mégane E-Tech', priority: 'HIGH' },
  { title: 'Atualizar bilhete de identidade cliente', priority: 'LOW' },
  { title: 'Combinar reparação carroçaria Audi A3', priority: 'MEDIUM' },
  { title: 'Verificar email de fornecedor de garantias', priority: 'LOW' },
  { title: 'Atualizar Google Business Profile', priority: 'LOW', recurrence: 'MONTHLY' },
  { title: 'Plano de marketing para próximo mês', priority: 'MEDIUM' },
  { title: 'Atualizar website com viaturas novas', priority: 'LOW' },
  { title: 'Confirmar transferência de Citroën C3 para novo dono', priority: 'HIGH' },
];

// ─── Main ───────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding 2 months of activity into Auto Nunes Martins…');
  console.log(`   Reference date: ${TODAY.toISOString().slice(0, 10)}`);

  // App-setting defaults (idempotent)
  await prisma.appSetting.upsert({
    where: { key: 'stockAgingDays' },
    update: {},
    create: { key: 'stockAgingDays', value: 60 },
  });
  await prisma.appSetting.upsert({
    where: { key: 'reminderLookaheadDays' },
    update: {},
    create: { key: 'reminderLookaheadDays', value: 0 },
  });
  await prisma.appSetting.deleteMany({ where: { key: 'doneTaskRetentionDays' } });

  // Wipe in dependency order (skip if KEEP_DATA=1)
  if (!process.env.KEEP_DATA) {
    console.log('   Wiping previous seedable data…');
    await prisma.activityLog.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.vehicleExpense.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.operationalExpense.deleteMany({});
    // Also clear the featured-vehicle pointer (may reference a deleted row)
    await prisma.appSetting.deleteMany({ where: { key: 'featuredVehicleId' } });
  }

  // ── Find or create a primary actor ────────────────────────────────────
  let primaryUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!primaryUser) {
    primaryUser = await prisma.user.create({
      data: {
        clerkId: 'seed_admin_placeholder',
        email: 'admin@nunesmartins.pt',
        name: 'Admin Stand',
        role: 'ADMIN',
      },
    });
    console.log('   Created placeholder admin user (no Clerk session yet).');
  } else {
    console.log(`   Using existing user as actor: ${primaryUser.name}`);
  }

  // Add 1-2 demo teammates so task assignments aren't all on one person.
  const teammatesData = [
    { email: 'rui.silva@nunesmartins.pt', name: 'Rui Silva' },
    { email: 'ana.costa@nunesmartins.pt', name: 'Ana Costa' },
  ];
  const teammates: { id: string; name: string }[] = [];
  for (const t of teammatesData) {
    const existing = await prisma.user.findUnique({ where: { email: t.email } });
    if (existing) {
      teammates.push({ id: existing.id, name: existing.name });
    } else {
      const created = await prisma.user.create({
        data: {
          clerkId: `seed_user_${t.email}`,
          email: t.email,
          name: t.name,
          role: 'ADMIN',
        },
      });
      teammates.push({ id: created.id, name: created.name });
    }
  }
  const allUsers = [{ id: primaryUser.id, name: primaryUser.name }, ...teammates];

  // ── Customers ─────────────────────────────────────────────────────────
  console.log(`   Creating ${NUM_CUSTOMERS} customers…`);
  const customers: { id: string; name: string }[] = [];
  for (let i = 0; i < NUM_CUSTOMERS; i++) {
    const name = `${pick(PT_FIRST_NAMES)} ${pick(PT_SURNAMES)} ${pick(PT_SURNAMES)}`;
    const created = await prisma.customer.create({
      data: {
        name,
        phone: randomPhone(),
        email: Math.random() > 0.2
          ? `${name.split(' ')[0]!.toLowerCase()}.${name.split(' ').pop()!.toLowerCase()}@gmail.com`
              .normalize('NFD')
              .replace(/[̀-ͯ]/g, '')
          : null,
        address: Math.random() > 0.4 ? `Rua ${pick(PT_SURNAMES)}, ${rand(1, 250)}, ${pick(PT_CITIES)}` : null,
        nif: randomNif(i),
        notes: Math.random() > 0.6 ? 'Cliente recorrente · prefere contacto por telefone.' : null,
        lastContactDate: dayOffset(-rand(0, DAYS_OF_HISTORY)),
        createdAt: dayOffset(-rand(7, DAYS_OF_HISTORY)),
      },
    });
    customers.push({ id: created.id, name: created.name });

    await prisma.activityLog.create({
      data: {
        actorId: pick(allUsers).id,
        type: 'CUSTOMER_ADDED',
        entityType: 'customer',
        entityId: created.id,
        message: `Cliente adicionado: ${created.name}`,
        createdAt: created.createdAt,
      },
    });
  }

  // ── Vehicles + expenses ───────────────────────────────────────────────
  console.log(`   Creating ${NUM_VEHICLES} vehicles + expenses…`);
  // Plan which vehicles will be sold, and which will be aged.
  const indices = Array.from({ length: NUM_VEHICLES }, (_, i) => i);
  const soldIndices = new Set(pickN(indices, NUM_SOLD));
  const remaining = indices.filter((i) => !soldIndices.has(i));
  const agedIndices = new Set(pickN(remaining, NUM_AGED_AVAILABLE));

  type SeededVehicle = {
    id: string;
    brand: string;
    model: string;
    purchasePrice: number;
    salePriceTarget: number;
    expensesTotal: number;
    willBeSold: boolean;
    soldDateOffset: number; // negative days from TODAY
    acquisitionOffset: number; // negative days
  };
  const vehicles: SeededVehicle[] = [];

  for (let i = 0; i < NUM_VEHICLES; i++) {
    const tpl = pick(VEHICLE_CATALOG);
    const year = rand(tpl.yearMin, tpl.yearMax);
    const purchasePrice = randFloat(tpl.purchasePrice[0], tpl.purchasePrice[1]);
    const salePriceTarget = randFloat(tpl.salePrice[0], tpl.salePrice[1]);
    const willBeSold = soldIndices.has(i);
    const isAged = agedIndices.has(i);

    let acquisitionOffset: number;
    let soldDateOffset = 0;
    let status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'DELIVERED' | 'DOCS_PENDING' = 'AVAILABLE';
    let soldDate: Date | null = null;

    if (willBeSold) {
      // Sold within last 60 days. Acquired before sale.
      soldDateOffset = -rand(0, DAYS_OF_HISTORY - 1);
      acquisitionOffset = soldDateOffset - rand(7, 45);
      soldDate = dayOffset(soldDateOffset);
      // Mix DELIVERED vs SOLD
      status = Math.random() > 0.35 ? 'DELIVERED' : 'SOLD';
    } else if (isAged) {
      acquisitionOffset = -rand(65, 120);
      status = 'AVAILABLE';
    } else {
      acquisitionOffset = -rand(2, 55);
      const r = Math.random();
      if (r < 0.78) status = 'AVAILABLE';
      else if (r < 0.9) status = 'RESERVED';
      else status = 'DOCS_PENDING';
    }

    const pendingDocs =
      status === 'DOCS_PENDING'
        ? { financing: false, imt: true, registration: true, docs: false }
        : { financing: false, imt: false, registration: false, docs: false };

    const created = await prisma.vehicle.create({
      data: {
        brand: tpl.brand,
        model: tpl.model,
        year,
        fuel: tpl.fuel,
        mileage: rand(8000, 120000),
        vin: randomVin(),
        purchasePrice,
        salePrice: salePriceTarget,
        status,
        acquisitionDate: dayOffset(acquisitionOffset),
        soldDate,
        description: tpl.description ?? null,
        photos: [],
        pendingDocFlags: pendingDocs as unknown as Prisma.InputJsonValue,
        createdAt: dayOffset(acquisitionOffset),
        updatedAt: dayOffset(soldDateOffset || acquisitionOffset),
      },
    });

    await prisma.activityLog.create({
      data: {
        actorId: pick(allUsers).id,
        type: 'VEHICLE_ADDED',
        entityType: 'vehicle',
        entityId: created.id,
        message: `Viatura adicionada: ${created.brand} ${created.model} (${year})`,
        createdAt: created.createdAt,
      },
    });

    // 2-5 expenses per vehicle, weighted by template `weight`
    const numExpenses = rand(2, 5);
    let expensesTotal = 0;
    const weightedPool: typeof EXPENSE_TEMPLATES = EXPENSE_TEMPLATES.flatMap(
      (t) => Array.from({ length: t.weight }, () => t),
    );
    for (let j = 0; j < numExpenses; j++) {
      const exp = pick(weightedPool);
      const amount = randFloat(exp.amount[0], exp.amount[1]);
      expensesTotal += amount;
      const expDate = dayOffset(
        Math.min(acquisitionOffset + rand(0, 21), willBeSold ? soldDateOffset - 1 : -1),
      );
      const expCreated = await prisma.vehicleExpense.create({
        data: {
          vehicleId: created.id,
          category: exp.category,
          description: exp.description,
          amount,
          date: expDate,
          createdAt: expDate,
        },
      });
      await prisma.activityLog.create({
        data: {
          actorId: pick(allUsers).id,
          type: 'EXPENSE_ADDED',
          entityType: 'expense',
          entityId: expCreated.id,
          message: `Despesa adicionada: ${exp.description} (${created.brand} ${created.model})`,
          createdAt: expDate,
        },
      });
    }

    vehicles.push({
      id: created.id,
      brand: created.brand,
      model: created.model,
      purchasePrice,
      salePriceTarget,
      expensesTotal,
      willBeSold,
      soldDateOffset,
      acquisitionOffset,
    });
  }

  // ── Sales (only for sold vehicles) ───────────────────────────────────
  console.log(`   Creating ${NUM_SOLD} sales…`);
  const soldVehicles = vehicles.filter((v) => v.willBeSold);
  for (const v of soldVehicles) {
    const salePrice = randFloat(v.salePriceTarget * 0.97, v.salePriceTarget * 1.02);
    const figures = computeSaleFigures({
      salePrice,
      purchasePrice: v.purchasePrice,
      expensesTotal: v.expensesTotal,
    });
    const customer = pick(customers);
    const saleDate = dayOffset(v.soldDateOffset);
    const delivered = Math.random() > 0.4;
    const created = await prisma.sale.create({
      data: {
        vehicleId: v.id,
        customerId: customer.id,
        salePrice,
        vatAmount: figures.vatAmount.toFixed(2),
        realProfit: figures.realProfit.toFixed(2),
        saleDate,
        deliveryDate: delivered ? dayOffset(v.soldDateOffset + rand(1, 7)) : null,
        deliveryStatus: delivered ? 'DELIVERED' : (Math.random() > 0.5 ? 'SCHEDULED' : 'PENDING'),
        createdAt: saleDate,
        updatedAt: saleDate,
      },
    });

    await prisma.activityLog.create({
      data: {
        actorId: pick(allUsers).id,
        type: 'SALE_CREATED',
        entityType: 'sale',
        entityId: created.id,
        message: `Venda registada: ${v.brand} ${v.model} → ${customer.name}`,
        createdAt: saleDate,
      },
    });
  }

  // ── Operational expenses (recurring + one-offs) ───────────────────────
  console.log(`   Creating ${NUM_OPERATIONAL_EXPENSES} operational expenses…`);
  for (let i = 0; i < NUM_OPERATIONAL_EXPENSES; i++) {
    const tpl = pick(OPERATIONAL_TEMPLATES);
    // For monthly items, pick day-of-month between 1 and 5; for one-offs random.
    let offset: number;
    if (tpl.monthly) {
      // ~Two payments per template across the window (months 1 + 2)
      const month = pick([1, 2] as const);
      offset = -((month - 1) * 30 + rand(20, 28));
    } else {
      offset = -rand(0, DAYS_OF_HISTORY);
    }
    await prisma.operationalExpense.create({
      data: {
        category: tpl.category,
        description: tpl.description,
        amount: randFloat(tpl.amount[0], tpl.amount[1]),
        date: dayOffset(offset),
        createdAt: dayOffset(offset),
      },
    });
  }

  // ── Tasks ─────────────────────────────────────────────────────────────
  console.log(`   Creating ${NUM_TASKS} tasks…`);
  const tasks = pickN(TASK_TEMPLATES, Math.min(NUM_TASKS, TASK_TEMPLATES.length));
  for (let i = 0; i < tasks.length; i++) {
    const tpl = tasks[i]!;
    // Status mix: ~35% done, ~25% in-progress, ~40% todo
    const r = Math.random();
    let status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    if (r < 0.35) status = 'DONE';
    else if (r < 0.6) status = 'IN_PROGRESS';
    else status = 'TODO';

    // Assignee mix: ~25% unassigned ("Geral"), ~75% one of the users
    const assignee = Math.random() < 0.25 ? null : pick(allUsers);

    // Dates
    const createdOffset = -rand(0, DAYS_OF_HISTORY - 1);
    let dueOffset: number | null = null;
    let completedOffset: number | null = null;
    if (status === 'DONE') {
      completedOffset = Math.min(createdOffset + rand(1, 14), -1);
      dueOffset = completedOffset + rand(-5, 5);
    } else if (tpl.priority === 'URGENT') {
      dueOffset = rand(-2, 1); // due today or just overdue
    } else if (Math.random() > 0.25) {
      dueOffset = rand(-3, 14);
    }

    await prisma.task.create({
      data: {
        title: tpl.title,
        description: tpl.description ?? null,
        status,
        priority: tpl.priority,
        assigneeId: assignee?.id ?? null,
        startDate: dayOffset(createdOffset),
        dueDate: dueOffset !== null ? dayOffset(dueOffset) : null,
        reminderDate:
          dueOffset !== null && Math.random() > 0.7
            ? dayOffset(dueOffset - rand(1, 3))
            : null,
        recurrence: tpl.recurrence ?? 'NONE',
        completedAt: completedOffset !== null ? dayOffset(completedOffset) : null,
        createdAt: dayOffset(createdOffset),
        updatedAt: dayOffset(completedOffset ?? createdOffset),
      },
    });
  }

  // ── Pick a featured vehicle (most recent available, with photos preferred) ─
  const featuredCandidate = vehicles.find(
    (v) => !v.willBeSold && v.acquisitionOffset > -30,
  );
  if (featuredCandidate) {
    await prisma.appSetting.upsert({
      where: { key: 'featuredVehicleId' },
      update: { value: featuredCandidate.id },
      create: { key: 'featuredVehicleId', value: featuredCandidate.id },
    });
    console.log(`   Featured vehicle: ${featuredCandidate.brand} ${featuredCandidate.model}`);
  }

  // Summary
  const [cust, veh, sales, tasksCount, exp, opExp, acts] = await Promise.all([
    prisma.customer.count(),
    prisma.vehicle.count(),
    prisma.sale.count(),
    prisma.task.count(),
    prisma.vehicleExpense.count(),
    prisma.operationalExpense.count(),
    prisma.activityLog.count(),
  ]);

  console.log('\n✅ Seed complete.');
  console.log(`   Customers: ${cust}`);
  console.log(`   Vehicles: ${veh}`);
  console.log(`   Sales: ${sales}`);
  console.log(`   Vehicle expenses: ${exp}`);
  console.log(`   Operational expenses: ${opExp}`);
  console.log(`   Tasks: ${tasksCount}`);
  console.log(`   Activity log entries: ${acts}`);
  console.log('   Open /dashboard to see it populated.');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
