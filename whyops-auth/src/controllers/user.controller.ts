import { createServiceLogger } from '@whyops/shared/logger';
import { Context } from 'hono';
import { auth } from '../lib/auth';
import { UserService } from '../services';
import { ResponseUtil } from '../utils';

const logger = createServiceLogger('auth:user-controller');

export class UserController {
  /**
   * Get current user profile
   */
  static async getCurrentUser(c: Context) {
    try {
      const user = c.get('user');

      if (!user) {
        return ResponseUtil.unauthorized(c, 'Not authenticated');
      }

      return ResponseUtil.success(c, {
        id: user.id,
        email: user.email,
        name: user.name,
        metadata: user.metadata,
        onboardingComplete: Boolean(user.metadata?.onboardingComplete),
        isActive: user.isActive,
      });
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
      const user = c.get('user');
      
      if (!user) {
        return ResponseUtil.unauthorized(c, 'Not authenticated');
      }

      const data = await c.req.json();

      // Use Better Auth's update user API
      await auth.api.updateUser({
        headers: c.req.raw.headers,
        body: {
          name: data.name,
          image: data.image,
        },
      });

      if (typeof data.onboardingComplete === 'boolean') {
        await UserService.updateUser(user.id, {
          onboardingComplete: data.onboardingComplete,
        });
      }

      return ResponseUtil.success(c, {
        message: 'User updated successfully',
      });
    } catch (error: any) {
      logger.error({ error }, 'Failed to update user');
      return ResponseUtil.internalError(c, 'Failed to update user');
    }
  }
}
