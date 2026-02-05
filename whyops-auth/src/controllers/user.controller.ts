import { createServiceLogger } from '@whyops/shared/logger';
import { Context } from 'hono';
import { UpdateUserData, UserService } from '../services';
import { ResponseUtil } from '../utils';

const logger = createServiceLogger('auth:user-controller');

export class UserController {
  /**
   * Get current user profile
   */
  static async getCurrentUser(c: Context) {
    try {
      const jwtUser = c.get('user');
      const user = await UserService.getUserById(jwtUser.userId);

      if (!user) {
        return ResponseUtil.notFound(c, 'User not found');
      }

      return ResponseUtil.success(c, user);
    } catch (error: any) {
      logger.error({ error }, 'Failed to fetch user');
      return ResponseUtil.internalError(c, 'Failed to fetch user');
    }
  }

  /**
   * Update current user profile
   */
  static async updateCurrentUser(c: Context) {
    try {
      const jwtUser = c.get('user');
      const data = await c.req.json() as UpdateUserData;
      
      const user = await UserService.updateUser(jwtUser.userId, data);

      return ResponseUtil.success(c, {
        id: user.id,
        email: user.email,
        name: user.name,
        metadata: user.metadata,
        updatedAt: user.updatedAt,
      });
    } catch (error: any) {
      logger.error({ error }, 'Failed to update user');
      
      if (error.message === 'User not found') {
        return ResponseUtil.notFound(c, error.message);
      }
      
      return ResponseUtil.internalError(c, 'Failed to update user');
    }
  }
}
