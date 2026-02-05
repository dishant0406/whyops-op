import { createServiceLogger } from '@whyops/shared/logger';
import { ApiKey, Entity, Environment, Project, Provider } from '@whyops/shared/models';
import { generateApiKey, hashApiKey } from '@whyops/shared/utils';

const logger = createServiceLogger('auth:apikey-service');

export interface CreateApiKeyData {
  userId: string;
  projectId: string;
  environmentId: string;
  name: string;
  providerId?: string;
  entityId?: string;
  rateLimit?: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateApiKeyData {
  name?: string;
  rateLimit?: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface ApiKeyWithRelations extends ApiKey {
  apiKey?: string; // Only returned on creation
}

export class ApiKeyService {
  /**
   * List API keys for a user
   */
  static async listApiKeys(
    userId: string,
    filters?: { projectId?: string; environmentId?: string }
  ): Promise<ApiKey[]> {
    const where: any = { userId };
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.environmentId) where.environmentId = filters.environmentId;

    const apiKeys = await ApiKey.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
        },
        {
          model: Environment,
          as: 'environment',
          attributes: ['id', 'name'],
        },
        {
          model: Provider,
          as: 'provider',
          attributes: ['id', 'name', 'type'],
          required: false,
        },
        {
          model: Entity,
          as: 'entity',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      attributes: { exclude: ['keyHash'] },
      order: [['createdAt', 'DESC']],
    });

    return apiKeys;
  }

  /**
   * Get API key by ID
   */
  static async getApiKeyById(apiKeyId: string, userId: string): Promise<ApiKey | null> {
    const apiKey = await ApiKey.findOne({
      where: { id: apiKeyId, userId },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
        },
        {
          model: Environment,
          as: 'environment',
          attributes: ['id', 'name'],
        },
        {
          model: Provider,
          as: 'provider',
          attributes: ['id', 'name', 'type'],
          required: false,
        },
        {
          model: Entity,
          as: 'entity',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      attributes: { exclude: ['keyHash'] },
    });

    return apiKey;
  }

  /**
   * Create a new API key
   */
  static async createApiKey(data: CreateApiKeyData) {
    // Verify project and environment belong to user
    const project = await Project.findOne({
      where: { id: data.projectId, userId: data.userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const environment = await Environment.findOne({
      where: { id: data.environmentId, projectId: data.projectId },
    });

    if (!environment) {
      throw new Error('Environment not found');
    }

    // If providerId is specified, verify it belongs to user
    if (data.providerId) {
      const provider = await Provider.findOne({
        where: { id: data.providerId, userId: data.userId },
      });

      if (!provider) {
        throw new Error('Provider not found');
      }
    }

    // If entityId is specified, verify it belongs to the environment
    if (data.entityId) {
      const entity = await Entity.findOne({
        where: { id: data.entityId, environmentId: data.environmentId, userId: data.userId },
      });

      if (!entity) {
        throw new Error('Entity not found in this environment');
      }
    }

    // Generate API key with YOPS- prefix
    const apiKey = generateApiKey('YOPS-');
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = apiKey.substring(0, 12);

    // Create API key record
    const apiKeyRecord = await ApiKey.create({
      userId: data.userId,
      projectId: data.projectId,
      environmentId: data.environmentId,
      providerId: data.providerId,
      entityId: data.entityId,
      name: data.name,
      keyHash,
      keyPrefix,
      isMaster: false,
      rateLimit: data.rateLimit,
      expiresAt: data.expiresAt,
      metadata: data.metadata,
      isActive: true,
    });

    logger.info(
      {
        apiKeyId: apiKeyRecord.id,
        userId: data.userId,
        projectId: data.projectId,
        environmentId: data.environmentId,
      },
      'API key created'
    );

    // Return with the actual key (only on creation)
    return {
      ...apiKeyRecord.toJSON(),
      apiKey,
    };
  }

  /**
   * Update API key
   */
  static async updateApiKey(
    apiKeyId: string,
    userId: string,
    data: UpdateApiKeyData
  ): Promise<ApiKey> {
    const apiKey = await ApiKey.findOne({
      where: { id: apiKeyId, userId },
    });

    if (!apiKey) {
      throw new Error('API key not found');
    }

    // Update fields
    if (data.name !== undefined) apiKey.name = data.name;
    if (data.rateLimit !== undefined) apiKey.rateLimit = data.rateLimit;
    if (data.expiresAt !== undefined) apiKey.expiresAt = data.expiresAt;
    if (data.metadata !== undefined) apiKey.metadata = data.metadata;

    await apiKey.save();

    logger.info({ apiKeyId }, 'API key updated');

    return apiKey;
  }

  /**
   * Delete API key
   */
  static async deleteApiKey(apiKeyId: string, userId: string): Promise<void> {
    const apiKey = await ApiKey.findOne({
      where: { id: apiKeyId, userId },
    });

    if (!apiKey) {
      throw new Error('API key not found');
    }

    await apiKey.destroy();

    logger.info({ apiKeyId }, 'API key deleted');
  }

  /**
   * Toggle API key active status
   */
  static async toggleApiKey(apiKeyId: string, userId: string): Promise<boolean> {
    const apiKey = await ApiKey.findOne({
      where: { id: apiKeyId, userId },
    });

    if (!apiKey) {
      throw new Error('API key not found');
    }

    apiKey.isActive = !apiKey.isActive;
    await apiKey.save();

    logger.info({ apiKeyId, isActive: apiKey.isActive }, 'API key toggled');

    return apiKey.isActive;
  }
}
