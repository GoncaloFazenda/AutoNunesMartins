import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { getEnv } from './env.js';
import { logger } from './logger.js';
import { clerkMiddleware, requireUser, type AuthedRequest } from './middleware/clerk.js';
import clerkWebhookRouter from './routes/webhooks/clerk.js';
import vehiclesRouter from './routes/vehicles.js';
import publicVehiclesRouter from './routes/publicVehicles.js';
import vehicleWebPublicationRouter from './routes/vehicleWebPublication.js';
import vehicleStatsRouter from './routes/vehicleStats.js';
import vehicleExpensesRouter from './routes/vehicleExpenses.js';
import vehiclePhotosRouter from './routes/vehiclePhotos.js';
import customersRouter from './routes/customers.js';
import salesRouter from './routes/sales.js';
import tasksRouter from './routes/tasks.js';
import taskStatsRouter from './routes/taskStats.js';
import usersRouter from './routes/users.js';
import dashboardRouter from './routes/dashboard.js';
import dashboardTasksRouter from './routes/dashboardTasks.js';
import featuredVehicleRouter from './routes/featuredVehicle.js';
import operationalExpensesRouter from './routes/operationalExpenses.js';
import settingsRouter from './routes/settings.js';
import notificationsRouter from './routes/notifications.js';
import activityRouter from './routes/activity.js';
import searchRouter from './routes/search.js';

const env = getEnv();
const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(pinoHttp({ logger }));

app.use(
  '/webhooks/clerk',
  express.raw({ type: 'application/json' }),
  (req, _res, next) => {
    (req as Request & { rawBody?: Buffer }).rawBody = req.body as Buffer;
    next();
  },
  clerkWebhookRouter,
);

app.use(express.json({ limit: '1mb' }));
// Public read-only projection bypasses authenticated CRM auto-provisioning.
app.use('/api/public/vehicles', publicVehiclesRouter);
app.use(clerkMiddleware);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, env: env.NODE_ENV });
});

app.get('/api/me', requireUser, (req: AuthedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Stats router is mounted first so its /stats route resolves before
// vehiclesRouter would treat "stats" as an :id path param.
app.use('/api/vehicles', vehicleStatsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/vehicles', vehicleWebPublicationRouter);
app.use('/api/vehicles/:vehicleId/photos', vehiclePhotosRouter);
app.use('/api/vehicle-expenses', vehicleExpensesRouter);
app.use('/api/customers', customersRouter);
app.use('/api/sales', salesRouter);
// Stats first so /stats resolves before tasks router's /:id route.
app.use('/api/tasks', taskStatsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/users', usersRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/dashboard', dashboardTasksRouter);
app.use('/api/dashboard', featuredVehicleRouter);
app.use('/api/operational-expenses', operationalExpensesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/activity', activityRouter);
app.use('/api/search', searchRouter);

app.use((err: Error, _req: Request, res: Response, _next: (err?: Error) => void) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(env.PORT, () => {
  logger.info(`Backend listening on http://localhost:${env.PORT}`);
});
