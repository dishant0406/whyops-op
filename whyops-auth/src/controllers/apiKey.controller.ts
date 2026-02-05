import { createServiceLogger } from '@whyops/shared/logger';
import { Context } from 'hono';
import { ApiKeyService, CreateApiKeyData, UpdateApiKeyData } from '../services';
import { ResponseUtil } from '../utils';

const logger = createServiceLogger('auth:apikey-controller');

export class ApiKeyController {
  /**
   * List all API keys for user
   */
  static async listApiKeys(c: Context) {
    try {
      const user = c.get('user');
      const projectId = c.req.query('projectId');
      const environmentId = c.req.query('environmentId');
      
      const apiKeys = await ApiKeyService.listApiKeys(user.userId, {
        projectId,
        environmentId,
      });

      return ResponseUtil.success(c, { apiKeys });
    } catch (error: any) {
      logger.error({ error }, 'Failed to fetch API keys');
      return ResponseUtil.internalError(c, 'Failed to fetch API keys');
    }
  }

  /**
   * Create a new API key
   */
  static async createApiKey(c: Context) {
    try {
      const user = c.get('user');
      const data = await c.req.json();
      
      const apiKeyRecord = await ApiKeyService.createApiKey({
        userId: user.userId,
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      } as CreateApiKeyData);

      return ResponseUtil.created(c, {
        id: apiKeyRecord.id,
        name: apiKeyRecord.name,
        apiKey: apiKeyRecord.apiKey,
        keyPrefix: apiKeyRecord.keyPrefix,
        projectId: apiKeyRecord.projectId,
        environmentId: apiKeyRecord.environmentId,
        providerId: apiKeyRecord.providerId,
        entityId: apiKeyRecord.entityId,
        isMaster: apiKeyRecord.isMaster,
        rateLimit: apiKeyRecord.rateLimit,
        expiresAt: apiKeyRecord.expiresAt,
        isActive: apiKeyRecord.isActive,
        createdAt: apiKeyRecord.createdAt,
        warning: 'Save this API key securely. You will not be able to retrieve it again.',
      });
    } catch (error: any) {
      logger.error({ error }, 'Failed to create API key');
      
      if (error.message.includes('not found')) {
        return ResponseUtil.notFound(c, error.message);
      }
      
      return ResponseUtil.internalError(c, 'Failed to create API key');
    }
  }

  /**
   * Get a single API key
   */
  static async getApiKey(c: Context) {
    try {
      const user = c.get('user');
      const id = c.req.param('id');
      
      const apiKey = await ApiKeyService.getApiKeyById(id, user.userId);

      if (!apiKey) {
        return ResponseUtil.notFound(c, 'API key not found');
      }

      return ResponseUtil.success(c, apiKey);
    } catch (error: any) {
      logger.error({ error }, 'Failed to fetch API key');
      return ResponseUtil.internalError(c, 'Failed to fetch API key');
    }
  }

  /**
   * Update an API key
   */
  static async updateApiKey(c: Context) {
    try {
      const user = c.get('user');
      const id = c.req.param('id');
      const data = await c.req.json() as UpdateApiKeyData;
      
      // Convert expiresAt if present
      if (data.expiresAt) {
        data.expiresAt = new Date(data.expiresAt as any);
      }
      
      const apiKey = await ApiKeyService.updateApiKey(id, user.userId, data);

      return ResponseUtil.success(c, {
        id: apiKey.id,
        name: apiKey.name,
        rateLimit: apiKey.rateLimit,
        expiresAt: apiKey.expiresAt,
        updatedAt: apiKey.updatedAt,
      });
    } catch (error: any) {
      logger.error({ error }, 'Failed to update API key');
      
      if (error.message === 'API key not found') {
        return ResponseUtil.notFound(c, error.message);
      }
      
      return ResponseUtil.internalError(c, 'Failed to update API key');
    }
  }

  /**
   * Delete an API key
   */
  static async deleteApiKey(c: Context) {
    try {
      const user = c.get('user');
      const id = c.req.param('id');
      
      await ApiKeyService.deleteApiKey(id, user.userId);

      return ResponseUtil.success(c, { message: 'API key revoked' });
    } catch (error: any) {
      logger.error({ error }, 'Failed to delete API key');
      
      if (error.message === 'API key not found') {
        return ResponseUtil.notFound(c, error.message);
      }
      
      return ResponseUtil.internalError(c, 'Failed to delete API key');
    }
  }

  /**
   * Toggle API key active status
   */
  static async toggleApiKey(c: Context) {
    try {
      const user = c.get('user');
      const id = c.req.param('id');
      
      const isActive = await ApiKeyService.toggleApiKey(id, user.userId);

      return ResponseUtil.success(c, { isActive });
    } catch (error: any) {
      logger.error({ error }, 'Failed to toggle API key');
      
      if (error.message === 'API key not found') {
        return ResponseUtil.notFound(c, error.message);
      }
      
      return ResponseUtil.internalError(c, 'Failed to toggle API key');
    }
  }
}
