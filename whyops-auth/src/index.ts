import { initDatabase } from '@whyops/shared/database';
import env from '@whyops/shared/env';
import { createServiceLogger } from '@whyops/shared/logger';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { jwtAuthMiddleware } from './middleware/jwtAuth';
import apiKeysRouter from './routes/apiKeys';
import authRouter from './routes/auth';
import healthRouter from './routes/health';
import projectsRouter from './routes/projects';
import providersRouter from './routes/providers';
import usersRouter from './routes/users';

const logger = createServiceLogger('auth');
const app = new Hono();

// Initialize database
await initDatabase();

// Global middleware
app.use('*', honoLogger());
app.use('*', cors());

// Public routes
app.route('/health', healthRouter);
app.route('/api/auth', authRouter);

// Protected routes (require JWT)
app.use('/api/*', jwtAuthMiddleware);
app.route('/api/projects', projectsRouter);
app.route('/api/providers', providersRouter);
app.route('/api/api-keys', apiKeysRouter);
app.route('/api/users', usersRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  logger.error({ err }, 'Request error');
  return c.json({ error: 'Internal server error' }, 500);
});

const port = env.AUTH_PORT;

logger.info(`🚀 WhyOps Auth Server starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
