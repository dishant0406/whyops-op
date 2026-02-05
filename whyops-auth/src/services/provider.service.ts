import { createServiceLogger } from '@whyops/shared/logger';
import { Provider } from '@whyops/shared/models';
import { encrypt } from '../utils/crypto.util';

const logger = createServiceLogger('auth:provider-service');

export interface CreateProviderData {
  userId: string;
  name: string;
  type: 'openai' | 'anthropic';
  baseUrl: string;
  apiKey: string;
  metadata?: Record<string, any>;
}

export interface UpdateProviderData {
  name?: string;
  baseUrl?: string;
  apiKey?: string;
  metadata?: Record<string, any>;
}

export class ProviderService {
  /**
   * List all providers for a user
   */
  static async listProviders(userId: string): Promise<Provider[]> {
    const providers = await Provider.findAll({
      where: { userId },
      attributes: { exclude: ['apiKey'] },
    });

    return providers;
  }

  /**
   * Get provider by ID
   */
  static async getProviderById(providerId: string, userId: string): Promise<Provider | null> {
    const provider = await Provider.findOne({
      where: { id: providerId, userId },
      attributes: { exclude: ['apiKey'] },
    });

    return provider;
  }

  /**
   * Create a new provider
   */
  static async createProvider(data: CreateProviderData): Promise<Provider> {
    const provider = await Provider.create({
      userId: data.userId,
      name: data.name,
      type: data.type,
      baseUrl: data.baseUrl,
      apiKey: encrypt(data.apiKey),
      metadata: data.metadata,
      isActive: true,
    });

    logger.info(
      { providerId: provider.id, userId: data.userId, type: data.type },
      'Provider created'
    );

    return provider;
  }

  /**
   * Update provider
   */
  static async updateProvider(
    providerId: string,
    userId: string,
    data: UpdateProviderData
  ): Promise<Provider> {
    const provider = await Provider.findOne({
      where: { id: providerId, userId },
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    // Update fields
    if (data.name !== undefined) provider.name = data.name;
    if (data.baseUrl !== undefined) provider.baseUrl = data.baseUrl;
    if (data.apiKey !== undefined) provider.apiKey = encrypt(data.apiKey);
    if (data.metadata !== undefined) provider.metadata = data.metadata;

    await provider.save();

    logger.info({ providerId, userId }, 'Provider updated');

    return provider;
  }

  /**
   * Delete provider
   */
  static async deleteProvider(providerId: string, userId: string): Promise<void> {
    const provider = await Provider.findOne({
      where: { id: providerId, userId },
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    await provider.destroy();

    logger.info({ providerId, userId }, 'Provider deleted');
  }

  /**
   * Toggle provider active status
   */
  static async toggleProvider(providerId: string, userId: string): Promise<boolean> {
    const provider = await Provider.findOne({
      where: { id: providerId, userId },
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    provider.isActive = !provider.isActive;
    await provider.save();

    logger.info({ providerId, isActive: provider.isActive }, 'Provider toggled');

    return provider.isActive;
  }
}
