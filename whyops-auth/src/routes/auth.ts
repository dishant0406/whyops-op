import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { AuthController, UserController } from '../controllers';

const app = new Hono();

// Register schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register - Register new user
app.post('/register', zValidator('json', registerSchema), AuthController.register);

// POST /api/auth/login - Login user
app.post('/login', zValidator('json', loginSchema), AuthController.login);

// GET /api/auth/me - Get current user (requires JWT middleware)
app.get('/me', UserController.getCurrentUser);

export default app;
