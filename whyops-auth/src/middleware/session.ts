import { createServiceLogger } from '@whyops/shared/logger';
import type { Context, Next } from 'hono';
import { auth } from '../lib/auth';

const logger = createServiceLogger('auth:session');

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  metadata?: any;
  onboardingComplete?: boolean;
  isActive?: boolean;
}

export interface UserSession {
  user: SessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

declare module 'hono' {
  interface ContextVariableMap {
    user: SessionUser;
    session: UserSession['session'];
  }
}

/**
 * Middleware to load Better Auth session and user into context
 * Also loads application-specific user data from Sequelize users table
 */
export async function sessionMiddleware(c: Context, next: Next) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      c.set('user', null as any);
      c.set('session', null as any);
      await next();
      return;
    }

    // Load application-specific user data from Sequelize
    try {
      const { User } = await import('@whyops/shared/models');
      const appUser = await User.findByPk(session.user.id);
      
      if (appUser) {
        // Merge Better Auth user with Sequelize user data
        const mergedUser: SessionUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          metadata: appUser.metadata,
          onboardingComplete: Boolean(appUser.metadata?.onboardingComplete),
          isActive: appUser.isActive,
        };
        c.set('user', mergedUser);
      } else {
        // Fallback to Better Auth user if no Sequelize record
        c.set('user', session.user as SessionUser);
      }
    } catch (error) {
      logger.warn({ error }, 'Failed to load Sequelize user data, using Better Auth user');
      c.set('user', session.user as SessionUser);
    }

    c.set('session', session.session);
    await next();
  } catch (error) {
    logger.error({ error }, 'Failed to load session');
    c.set('user', null as any);
    c.set('session', null as any);
    await next();
  }
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(c: Context, next: Next) {
  const user = c.get('user');

  if (!user) {
    logger.warn('Unauthorized access attempt');
    return c.json({ error: 'Unauthorized: Authentication required' }, 401);
  }

  await next();
}
