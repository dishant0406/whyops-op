import { zValidator } from '@hono/zod-validator';
import { createServiceLogger } from '@whyops/shared/logger';
import { Hono } from 'hono';
import { z } from 'zod';
import { EventController } from '../controllers';

const logger = createServiceLogger('analyse:events-routes');
const app = new Hono();

// Validation schemas
const eventSchema = z.object({
  eventType: z.enum(['user_message', 'llm_response', 'tool_call', 'error'], {
    errorMap: () => ({ message: "Invalid event type. Must be one of: 'user_message', 'llm_response', 'tool_call', 'error'" }),
  }),
  traceId: z.string().min(1).max(128, "Trace ID must be between 1 and 128 characters"),
  spanId: z.string().max(128, "Span ID must be at most 128 characters").optional(),
  stepId: z.number().int().min(1, "Step ID must be a positive integer").optional(),
  parentStepId: z.number().int().min(1, "Parent Step ID must be a positive integer").optional(),
  userId: z.string().uuid("Invalid User ID format (UUID required)"),
  providerId: z.string().uuid("Invalid Provider ID format (UUID required)"),
  entityName: z.string().optional(),
  timestamp: z.string().datetime({ message: "Invalid timestamp format (ISO 8601 required)" }).optional(),
  content: z.any().optional(),
  metadata: z.record(z.any()).optional(),
  idempotencyKey: z.string().max(128, "Idempotency Key must be at most 128 characters").optional(),
});

const batchEventSchema = z.union([eventSchema, z.array(eventSchema)]);

// POST /api/events - Create a new event (or batch of events)
app.post('/', zValidator('json', batchEventSchema, (result, c) => {
  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));
    logger.warn({ errors }, 'Event validation failed');
    return c.json({ error: 'Validation failed', details: errors }, 400);
  }
}), async (c) => {
  return EventController.createEvent(c);
});

// GET /api/events - List events (with filters)
app.get('/', EventController.listEvents);

// GET /api/events/:id - Get single event
app.get('/:id', EventController.getEvent);

export default app;
