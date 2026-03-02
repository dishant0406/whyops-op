import { zValidator } from '@hono/zod-validator';
import { createServiceLogger } from '@whyops/shared/logger';
import { Hono } from 'hono';
import { z } from 'zod';
import { AgentAnalysisService } from '../services/agent-analysis.service';

const logger = createServiceLogger('analyse:agent-analyses-routes');
const app = new Hono();

const runParamsSchema = z.object({
  agentId: z.string().uuid('Invalid agentId'),
});

const runBodySchema = z.object({
  lookbackDays: z.number().int().min(1).max(90).optional(),
  mode: z.enum(['quick', 'standard', 'deep']).optional(),
  judgeModel: z.string().max(64).optional(),
  dimensions: z
    .array(
      z.enum([
        'intent_precision',
        'followup_repair',
        'answer_completeness_clarity',
        'tool_routing_quality',
        'tool_invocation_quality',
        'tool_output_utilization',
        'reliability_recovery',
        'latency_cost_efficiency',
        'conversation_ux',
      ])
    )
    .min(1)
    .max(9)
    .optional(),
});

const runIdParamsSchema = z.object({
  runId: z.string().uuid('Invalid runId'),
});

const configBodySchema = z.object({
  enabled: z.boolean(),
  cronExpr: z.string().min(5).max(128),
  timezone: z.string().min(1).max(64),
  lookbackDays: z.number().int().min(1).max(90),
  mode: z.enum(['quick', 'standard', 'deep']).optional(),
  judgeModel: z.string().max(64).optional(),
  dimensions: z
    .array(
      z.enum([
        'intent_precision',
        'followup_repair',
        'answer_completeness_clarity',
        'tool_routing_quality',
        'tool_invocation_quality',
        'tool_output_utilization',
        'reliability_recovery',
        'latency_cost_efficiency',
        'conversation_ux',
      ])
    )
    .min(1)
    .max(9)
    .optional(),
});

// POST /api/agent-analyses/:agentId/run
app.post(
  '/:agentId/run',
  zValidator('param', runParamsSchema),
  zValidator('json', runBodySchema),
  async (c) => {
    const auth = c.get('whyopsAuth');
    if (!auth) {
      return c.json({ success: false, error: 'Unauthorized: authentication required' }, 401);
    }

    try {
      const { agentId } = c.req.valid('param');
      const body = c.req.valid('json');
      const accept = c.req.header('accept') || '';
      const wantsStream =
        c.req.query('stream') === 'true' || accept.includes('application/x-ndjson');

      if (wantsStream) {
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
          start(controller) {
            let closed = false;
            let sentFailedSnapshot = false;

            const writeChunk = async (chunk: unknown) => {
              if (closed) return;
              try {
                controller.enqueue(encoder.encode(`${JSON.stringify(chunk)}\n`));
              } catch (error: any) {
                closed = true;
                logger.warn(
                  {
                    errorMessage: error?.message || String(error),
                    errorCode: error?.code,
                  },
                  'Agent analysis stream write skipped because stream is closed'
                );
              }
            };

            const close = () => {
              if (closed) return;
              closed = true;
              try {
                controller.close();
              } catch (error: any) {
                logger.warn(
                  {
                    errorMessage: error?.message || String(error),
                    errorCode: error?.code,
                  },
                  'Agent analysis stream close ignored because stream is already closed'
                );
              }
            };

            void (async () => {
              try {
                const result = await AgentAnalysisService.runManualAnalysis({
                  userId: auth.userId,
                  projectId: auth.projectId,
                  environmentId: auth.environmentId,
                  agentId,
                  lookbackDays: body.lookbackDays,
                  mode: body.mode,
                  judgeModel: body.judgeModel,
                  dimensions: body.dimensions,
                  onCheckpoint: async (event) => {
                    if (!event.snapshot) return;
                    if (event.snapshot.status === 'failed') sentFailedSnapshot = true;
                    await writeChunk({
                      success: true,
                      run: {
                        ...event.snapshot,
                        summary: {
                          ...event.snapshot.summary,
                          checkpoint: {
                            key: event.key,
                            sequence: event.sequence,
                            at: event.at,
                            data: event.data,
                          },
                        },
                      },
                    });
                  },
                });

                await writeChunk({
                  success: true,
                  run: result,
                });
              } catch (error: any) {
                if (sentFailedSnapshot) {
                  // A failed snapshot was already streamed.
                } else if (error?.message === 'AGENT_NOT_FOUND') {
                  await writeChunk({ success: false, error: 'Agent not found' });
                } else if (error?.message === 'JUDGE_NOT_CONFIGURED') {
                  await writeChunk({
                    success: false,
                    error: 'LLM Judge not configured. Set JUDGE_LLM_API_KEY environment variable.',
                  });
                } else {
                  logger.error({ error }, 'Failed to run agent analysis (stream)');
                  await writeChunk({ success: false, error: 'Failed to run agent analysis' });
                }
              } finally {
                close();
              }
            })();
          },
        });

        return new Response(stream, {
          status: 200,
          headers: {
            'content-type': 'application/x-ndjson; charset=utf-8',
            'cache-control': 'no-cache, no-transform',
            connection: 'keep-alive',
            'x-accel-buffering': 'no',
          },
        });
      }

      const result = await AgentAnalysisService.runManualAnalysis({
        userId: auth.userId,
        projectId: auth.projectId,
        environmentId: auth.environmentId,
        agentId,
        lookbackDays: body.lookbackDays,
        mode: body.mode,
        judgeModel: body.judgeModel,
        dimensions: body.dimensions,
      });

      return c.json({ success: true, run: result }, 201);
    } catch (error: any) {
      if (error?.message === 'AGENT_NOT_FOUND') {
        return c.json({ success: false, error: 'Agent not found' }, 404);
      }
      if (error?.message === 'JUDGE_NOT_CONFIGURED') {
        return c.json(
          {
            success: false,
            error: 'LLM Judge not configured. Set JUDGE_LLM_API_KEY environment variable.',
          },
          500
        );
      }
      logger.error({ error }, 'Failed to run agent analysis');
      return c.json({ success: false, error: 'Failed to run agent analysis' }, 500);
    }
  }
);

// GET /api/agent-analyses/:agentId/latest
app.get('/:agentId/latest', zValidator('param', runParamsSchema), async (c) => {
  const auth = c.get('whyopsAuth');
  if (!auth) {
    return c.json({ success: false, error: 'Unauthorized: authentication required' }, 401);
  }

  try {
    const { agentId } = c.req.valid('param');
    const run = await AgentAnalysisService.getLatestRun(agentId, {
      userId: auth.userId,
      projectId: auth.projectId,
      environmentId: auth.environmentId,
    });

    if (!run) {
      return c.json({ success: false, error: 'No analysis run found' }, 404);
    }

    return c.json({ success: true, run });
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch latest agent analysis run');
    return c.json({ success: false, error: 'Failed to fetch latest run' }, 500);
  }
});

// GET /api/agent-analyses/:agentId/runs
app.get('/:agentId/runs', zValidator('param', runParamsSchema), async (c) => {
  const auth = c.get('whyopsAuth');
  if (!auth) {
    return c.json({ success: false, error: 'Unauthorized: authentication required' }, 401);
  }

  try {
    const { agentId } = c.req.valid('param');
    const count = Math.min(Math.max(parseInt(c.req.query('count') || '20', 10) || 20, 1), 100);
    const page = Math.max(parseInt(c.req.query('page') || '1', 10) || 1, 1);

    const result = await AgentAnalysisService.listRunsForAgent(agentId, {
      userId: auth.userId,
      projectId: auth.projectId,
      environmentId: auth.environmentId,
      count,
      page,
    });

    return c.json({ success: true, ...result });
  } catch (error: any) {
    logger.error({ error }, 'Failed to list agent analysis runs');
    return c.json({ success: false, error: 'Failed to list runs' }, 500);
  }
});

// GET /api/agent-analyses/:agentId/config
app.get('/:agentId/config', zValidator('param', runParamsSchema), async (c) => {
  const auth = c.get('whyopsAuth');
  if (!auth) {
    return c.json({ success: false, error: 'Unauthorized: authentication required' }, 401);
  }

  try {
    const { agentId } = c.req.valid('param');
    const config = await AgentAnalysisService.getConfigForAgent(agentId, {
      userId: auth.userId,
      projectId: auth.projectId,
      environmentId: auth.environmentId,
    });

    if (!config) {
      return c.json({ success: true, config: null }, 200);
    }

    return c.json({ success: true, config }, 200);
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch agent analysis config');
    return c.json({ success: false, error: 'Failed to fetch analysis config' }, 500);
  }
});

// PUT /api/agent-analyses/:agentId/config
app.put(
  '/:agentId/config',
  zValidator('param', runParamsSchema),
  zValidator('json', configBodySchema),
  async (c) => {
    const auth = c.get('whyopsAuth');
    if (!auth) {
      return c.json({ success: false, error: 'Unauthorized: authentication required' }, 401);
    }

    try {
      const { agentId } = c.req.valid('param');
      const body = c.req.valid('json');
      const config = await AgentAnalysisService.upsertConfigForAgent({
        userId: auth.userId,
        projectId: auth.projectId,
        environmentId: auth.environmentId,
        agentId,
        enabled: body.enabled,
        cronExpr: body.cronExpr,
        timezone: body.timezone,
        lookbackDays: body.lookbackDays,
        mode: body.mode,
        judgeModel: body.judgeModel,
        dimensions: body.dimensions,
      });

      return c.json({ success: true, config }, 200);
    } catch (error: any) {
      if (error?.message === 'AGENT_NOT_FOUND') {
        return c.json({ success: false, error: 'Agent not found' }, 404);
      }
      logger.error({ error }, 'Failed to upsert agent analysis config');
      return c.json({ success: false, error: 'Failed to save analysis config' }, 500);
    }
  }
);

// GET /api/agent-analyses/runs/:runId
app.get('/runs/:runId', zValidator('param', runIdParamsSchema), async (c) => {
  const auth = c.get('whyopsAuth');
  if (!auth) {
    return c.json({ success: false, error: 'Unauthorized: authentication required' }, 401);
  }

  try {
    const { runId } = c.req.valid('param');
    const run = await AgentAnalysisService.getRunById(runId, {
      userId: auth.userId,
      projectId: auth.projectId,
      environmentId: auth.environmentId,
    });

    if (!run) {
      return c.json({ success: false, error: 'Run not found' }, 404);
    }

    return c.json({ success: true, run });
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch agent analysis run');
    return c.json({ success: false, error: 'Failed to fetch run' }, 500);
  }
});

export default app;
