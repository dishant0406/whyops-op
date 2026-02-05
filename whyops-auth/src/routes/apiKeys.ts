import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { ApiKeyController } from '../controllers';

const app = new Hono();

// API Key schema - updated for new structure
const apiKeySchema = z.object({
  projectId: z.string().uuid(),
  environmentId: z.string().uuid(),
  name: z.string().min(1),
  providerId: z.string().uuid().optional(), // Optional for custom keys
  entityId: z.string().uuid().optional(), // Optional: specific to an entity/agent
  rateLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

// Update schema
const updateApiKeySchema = z.object({
  name: z.string().min(1).optional(),
  rateLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/api-keys - List all API keys for user (optionally filtered by project/environment)
app.get('/', ApiKeyController.listApiKeys);

// POST /api/api-keys - Create new API key
app.post('/', zValidator('json', apiKeySchema), ApiKeyController.createApiKey);

// GET /api/api-keys/:id - Get single API key
app.get('/:id', ApiKeyController.getApiKey);

// PUT /api/api-keys/:id - Update API key metadata
app.put('/:id', zValidator('json', updateApiKeySchema), ApiKeyController.updateApiKey);

// DELETE /api/api-keys/:id - Delete/revoke API key
app.delete('/:id', ApiKeyController.deleteApiKey);

// PATCH /api/api-keys/:id/toggle - Toggle API key active status
app.patch('/:id/toggle', ApiKeyController.toggleApiKey);

export default app;
