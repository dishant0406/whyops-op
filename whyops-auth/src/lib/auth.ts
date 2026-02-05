import env from '@whyops/shared/env';
import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

// Create Kysely instance for Better Auth
const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: env.DATABASE_URL,
      max: env.DB_POOL_MAX,
      min: env.DB_POOL_MIN,
    }),
  }),
});

// Configure Better Auth
export const auth = betterAuth({
  database: {
    db,
    type: 'postgres',
  } as any,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true when email service is configured
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - update session if older than this
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      organizationId: {
        type: 'string',
        required: false,
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Sync Better Auth user with Sequelize users table after sign-up
      if (ctx.path.startsWith('/sign-up')) {
        const newSession = ctx.context.newSession;
        
        if (newSession?.user) {
          const betterAuthUser = newSession.user;
          try {
            const { User } = await import('@whyops/shared/models');
            
            // Check if Sequelize user already exists
            const existingUser = await User.findOne({ 
              where: { email: betterAuthUser.email } 
            });
            
            if (!existingUser) {
              // Create corresponding Sequelize user with same ID
              await User.create({
                id: betterAuthUser.id,
                email: betterAuthUser.email,
                name: betterAuthUser.name || undefined,
                passwordHash: 'managed_by_better_auth', // Placeholder since Better Auth manages passwords
                isActive: true,
                organizationId: (betterAuthUser as any).organizationId || undefined,
              });
              console.log(`Synced Better Auth user ${betterAuthUser.id} to Sequelize users table`);
            }
          } catch (error) {
            console.error('Failed to sync user to Sequelize:', error);
          }
        }
      }
    }),
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
    },
  },
  trustedOrigins: [
    env.PROXY_URL,
    env.ANALYSE_URL,
    env.AUTH_URL,
    'http://localhost:3000', // Add your frontend URL
  ],
});

export type Auth = typeof auth;
