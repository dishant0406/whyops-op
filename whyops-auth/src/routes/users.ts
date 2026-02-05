import { Hono } from 'hono';
import { UserController } from '../controllers';

const app = new Hono();

// GET /api/users/me - Get current user profile
app.get('/me', UserController.getCurrentUser);

// PUT /api/users/me - Update current user profile
app.put('/me', UserController.updateCurrentUser);

export default app;
