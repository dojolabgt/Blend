/**
 * dev-plan — Seeder y gestor de planes para desarrollo
 *
 * USO:
 *   npm run dev:plan -- --list
 *   npm run dev:plan -- --clients 500 --deals 200 --projects 50
 *   npm run dev:plan -- --clients 10000 --workspace <id>
 *   npm run dev:plan -- --plan pro
 *   npm run dev:plan -- --plan pro --clients 20 --deals 10
 *   npm run dev:plan -- --wipe
 *
 * FLAGS:
 *   --clients <n>              Crear N clientes fake
 *   --deals <n>                Crear N deals fake (requiere clientes existentes)
 *   --projects <n>             Crear N proyectos fake
 *   --plan <free|pro|premium>  Cambiar plan del workspace (opcional, independiente del seed)
 *   --workspace <uuid>         Workspace target (default: SEED_FREELANCER_EMAIL)
 *   --all                      Aplicar a todos los workspaces
 *   --wipe                     Borrar todos los registros con prefijo [Fake]
 *   --list                     Listar workspaces con su plan actual
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker/locale/es';
import { Workspace, WorkspacePlan } from '../workspaces/workspace.entity';
import { BillingSubscription } from '../billing/billing-subscription.entity';
import { Client, ClientType } from '../clients/client.entity';
import { Deal } from '../deals/entities/deal.entity';
import { DealStatus } from '../deals/enums/deal-status.enum';
import { Project } from '../projects/entities/project.entity';
import { ProjectStatus } from '../projects/enums/project-status.enum';
import { randomUUID } from 'crypto';

// ─── Guard ────────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  console.error('❌ Este script no puede ejecutarse en producción.');
  process.exit(1);
}

// ─── Arg parsing ─────────────────────────────────────────────────────────────

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}
function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}
function getInt(flag: string): number | undefined {
  const v = getArg(flag);
  if (v === undefined) return undefined;
  const n = parseInt(v, 10);
  return isNaN(n) ? undefined : n;
}

const planArg      = getArg('--plan') ?? process.argv.slice(2).find(a => ['free', 'pro', 'premium'].includes(a));
const plan         = planArg as 'free' | 'pro' | 'premium' | undefined;
const wsId         = getArg('--workspace');
const doAll        = hasFlag('--all');
const doList       = hasFlag('--list');
const doWipe       = hasFlag('--wipe');

// Positional numbers: dev-plan 500 200 50  →  clients=500 deals=200 projects=50
const positional   = process.argv.slice(2).filter(a => /^\d+$/.test(a)).map(Number);
const nClients     = getInt('--clients') ?? positional[0];
const nDeals       = getInt('--deals')   ?? positional[1];
const nProjects    = getInt('--projects')?? positional[2];

const FAKE_PREFIX  = '[Fake]';
const BATCH_SIZE   = 500;

// ─── Progress helper ──────────────────────────────────────────────────────────

function progress(label: string, done: number, total: number) {
  const pct = Math.round((done / total) * 100);
  const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
  process.stdout.write(`\r  ${label} [${bar}] ${done.toLocaleString()}/${total.toLocaleString()} (${pct}%)`);
  if (done === total) process.stdout.write('\n');
}

// ─── Wipe ─────────────────────────────────────────────────────────────────────

async function wipeFakeData(dataSource: DataSource, workspaceId: string) {
  const { deals } = await dataSource.query(
    `WITH del AS (DELETE FROM deals WHERE "workspaceId" = $1 AND name LIKE $2 RETURNING id)
     SELECT count(*)::int AS deals FROM del`,
    [workspaceId, `${FAKE_PREFIX}%`],
  ).then(r => r[0]);

  const { projects } = await dataSource.query(
    `WITH del AS (DELETE FROM projects WHERE "workspaceId" = $1 AND name LIKE $2 RETURNING id)
     SELECT count(*)::int AS projects FROM del`,
    [workspaceId, `${FAKE_PREFIX}%`],
  ).then(r => r[0]);

  const { clients } = await dataSource.query(
    `WITH del AS (DELETE FROM clients WHERE "workspaceId" = $1 AND name LIKE $2 RETURNING id)
     SELECT count(*)::int AS clients FROM del`,
    [workspaceId, `${FAKE_PREFIX}%`],
  ).then(r => r[0]);

  console.log(`  🗑️  Eliminados: ${clients} clientes, ${deals} deals, ${projects} proyectos`);
}

// ─── Seed: clients ────────────────────────────────────────────────────────────

async function seedClients(
  clientRepo: import('typeorm').Repository<Client>,
  workspaceId: string,
  total: number,
): Promise<string[]> {
  const ids: string[] = [];
  let done = 0;

  while (done < total) {
    const batchSize = Math.min(BATCH_SIZE, total - done);
    const batch = Array.from({ length: batchSize }, () => {
      const isCompany = faker.datatype.boolean(0.4);
      const id = randomUUID();
      ids.push(id);
      return {
        id,
        workspaceId,
        name: `${FAKE_PREFIX} ${isCompany ? faker.company.name() : faker.person.fullName()}`,
        email: faker.internet.email({ provider: 'fake-blend.dev' }),
        type: isCompany ? ClientType.COMPANY : ClientType.PERSON,
        phone: faker.phone.number(),
        country: faker.location.countryCode('alpha-2'),
      };
    });

    await clientRepo.insert(batch);
    done += batchSize;
    progress('👤 Clientes', done, total);
  }

  return ids;
}

// ─── Seed: deals ─────────────────────────────────────────────────────────────

async function seedDeals(
  dealRepo: import('typeorm').Repository<Deal>,
  workspaceId: string,
  clientIds: string[],
  total: number,
) {
  if (!clientIds.length) {
    console.log('\n  ⚠️  No hay clientes. Crea primero con --clients <n>');
    return;
  }

  let done = 0;

  while (done < total) {
    const batchSize = Math.min(BATCH_SIZE, total - done);
    const batch = Array.from({ length: batchSize }, (_, i) => {
      const name = `${FAKE_PREFIX} ${faker.commerce.productName()}`;
      return {
        id: randomUUID(),
        workspaceId,
        clientId: clientIds[(done + i) % clientIds.length],
        name,
        slug: `fake-${randomUUID().slice(0, 8)}`,
        publicToken: randomUUID(),
        status: DealStatus.DRAFT,
        currentStep: 'brief',
      };
    });

    await dealRepo.insert(batch);
    done += batchSize;
    progress('📋 Deals   ', done, total);
  }
}

// ─── Seed: projects ───────────────────────────────────────────────────────────

async function seedProjects(
  projectRepo: import('typeorm').Repository<Project>,
  workspaceId: string,
  clientIds: string[],
  total: number,
) {
  let done = 0;

  while (done < total) {
    const batchSize = Math.min(BATCH_SIZE, total - done);
    const batch = Array.from({ length: batchSize }, (_, i) => ({
      id: randomUUID(),
      workspaceId,
      clientId: clientIds.length ? clientIds[(done + i) % clientIds.length] : null,
      name: `${FAKE_PREFIX} ${faker.commerce.department()} · ${faker.company.buzzPhrase()}`.slice(0, 120),
      status: ProjectStatus.ACTIVE,
    }));

    await projectRepo.insert(batch);
    done += batchSize;
    progress('📁 Proyectos', done, total);
  }
}

// ─── Apply plan ───────────────────────────────────────────────────────────────

async function applyPlan(
  wsRepo: import('typeorm').Repository<Workspace>,
  subRepo: import('typeorm').Repository<BillingSubscription>,
  workspace: Workspace,
  targetPlan: 'free' | 'pro' | 'premium',
) {
  const existing = await subRepo.findOne({ where: { workspaceId: workspace.id, status: 'active' } });
  if (existing) {
    existing.status = 'cancelled';
    await subRepo.save(existing);
  }

  if (targetPlan === 'free') {
    await wsRepo.update({ id: workspace.id }, { plan: WorkspacePlan.FREE, planExpiresAt: null as unknown as Date });
    console.log(`  📋 Plan → FREE`);
    return;
  }

  await subRepo.save(subRepo.create({
    workspaceId: workspace.id,
    recurrenteCheckoutId: `dev_checkout_${Date.now()}`,
    recurrenteSubscriptionId: `dev_sub_${Date.now()}`,
    plan: targetPlan,
    interval: 'month',
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }));

  await wsRepo.update(
    { id: workspace.id },
    { plan: targetPlan as WorkspacePlan, planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  );
  console.log(`  📋 Plan → ${targetPlan.toUpperCase()} (30 días)`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const configService = app.get(ConfigService);
  const dataSource    = app.get(DataSource);

  const wsRepo      = dataSource.getRepository(Workspace);
  const subRepo     = dataSource.getRepository(BillingSubscription);
  const clientRepo  = dataSource.getRepository(Client);
  const dealRepo    = dataSource.getRepository(Deal);
  const projectRepo = dataSource.getRepository(Project);

  // ── --list ──────────────────────────────────────────────────────────────────
  if (doList) {
    const workspaces = await wsRepo.find({ order: { createdAt: 'ASC' } });
    console.log('\n🗂️  Workspaces:\n');
    for (const ws of workspaces) {
      const tag     = ws.plan === 'free' ? '⬜ FREE   ' : ws.plan === 'pro' ? '🟣 PRO    ' : '🟡 PREMIUM';
      const expires = ws.planExpiresAt ? `  expira ${new Date(ws.planExpiresAt).toLocaleDateString('es')}` : '';
      console.log(`  ${tag}  ${ws.id}  ${ws.businessName}${expires}`);
    }
    console.log('');
    await app.close();
    return;
  }

  // ── Validar que hay algo que hacer ──────────────────────────────────────────
  if (!plan && nClients === undefined && nDeals === undefined && nProjects === undefined && !doWipe) {
    console.error('❌ No hay nada que hacer. Opciones:');
    console.error('   --clients <n>   --deals <n>   --projects <n>');
    console.error('   --plan <free|pro|premium>');
    console.error('   --wipe   --list');
    await app.close();
    process.exit(1);
  }

  // ── Resolver workspace(s) target ────────────────────────────────────────────
  let workspaces: Workspace[] = [];

  if (doAll) {
    workspaces = await wsRepo.find();
  } else if (wsId) {
    const ws = await wsRepo.findOne({ where: { id: wsId } });
    if (!ws) {
      console.error(`❌ Workspace ${wsId} no encontrado.`);
      await app.close();
      process.exit(1);
    }
    workspaces = [ws];
  } else {
    const seedEmail = configService.get<string>('SEED_FREELANCER_EMAIL');
    if (!seedEmail) {
      console.error('❌ Falta --workspace o SEED_FREELANCER_EMAIL en .env');
      await app.close();
      process.exit(1);
    }
    const result = await dataSource.query(
      `SELECT w.* FROM workspaces w
       JOIN workspace_members wm ON wm."workspaceId" = w.id
       JOIN users u ON u.id = wm."userId"
       WHERE u.email = $1 LIMIT 1`,
      [seedEmail],
    );
    if (!result.length) {
      console.error(`❌ No se encontró workspace para ${seedEmail}. Ejecuta primero: npm run seed`);
      await app.close();
      process.exit(1);
    }
    workspaces = result;
  }

  // ── Ejecutar por workspace ───────────────────────────────────────────────────
  for (const ws of workspaces) {
    console.log(`\n📦 ${ws.businessName || ws.id}`);
    const t0 = Date.now();

    if (doWipe) {
      await wipeFakeData(dataSource, ws.id);
    }

    if (plan) {
      await applyPlan(wsRepo, subRepo, ws, plan);
    }

    // Clientes — se crean primero porque deals y proyectos los necesitan
    let freshClientIds: string[] = [];
    if (nClients) {
      freshClientIds = await seedClients(clientRepo, ws.id, nClients);
    }

    // Deals — usa clientes recién creados o los existentes en la DB
    if (nDeals) {
      let clientIds = freshClientIds;
      if (!clientIds.length) {
        const existing = await clientRepo.find({ where: { workspaceId: ws.id }, select: ['id'] });
        clientIds = existing.map(c => c.id);
      }
      await seedDeals(dealRepo, ws.id, clientIds, nDeals);
    }

    // Proyectos
    if (nProjects) {
      let clientIds = freshClientIds;
      if (!clientIds.length) {
        const existing = await clientRepo.find({ where: { workspaceId: ws.id }, select: ['id'], take: 100 });
        clientIds = existing.map(c => c.id);
      }
      await seedProjects(projectRepo, ws.id, clientIds, nProjects);
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    const total = (nClients ?? 0) + (nDeals ?? 0) + (nProjects ?? 0);
    if (total) console.log(`  ⚡ ${total.toLocaleString()} registros en ${elapsed}s`);
  }

  console.log('\n✅ Listo!\n');
  await app.close();
}

void bootstrap();
