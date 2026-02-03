import { createServiceLogger } from '@whyops/shared/logger';
import { Entity } from '@whyops/shared/models';

const logger = createServiceLogger('analyse:entity-service');

export class EntityService {
  /**
   * Resolves entity ID by user ID and entity name
   * Returns the latest version of the entity
   */
  static async resolveEntityId(
    userId: string,
    entityName?: string
  ): Promise<string | undefined> {
    if (!entityName) return undefined;

    try {
      const entity = await Entity.findOne({
        where: { userId, name: entityName },
        order: [['createdAt', 'DESC']],
      });

      return entity?.id;
    } catch (error) {
      logger.error({ error, userId, entityName }, 'Failed to resolve entity ID');
      return undefined;
    }
  }

  /**
   * Gets entity by user ID and name
   */
  static async getEntity(
    userId: string,
    entityName: string
  ): Promise<Entity | null> {
    try {
      return await Entity.findOne({
        where: { userId, name: entityName },
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      logger.error({ error, userId, entityName }, 'Failed to get entity');
      return null;
    }
  }
}
