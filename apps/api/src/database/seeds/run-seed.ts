import { UserRole } from '@nurses/shared';
import { AuthService } from '../../modules/auth/auth.service';
import { User } from '../../modules/auth/entities/user.entity';
import dataSource from '../data-source';

/**
 * Idempotent seed: creates an initial ADMIN account if none exists.
 * Run with: pnpm --filter @nurses/api seed
 */
async function run(): Promise<void> {
  const ds = await dataSource.initialize();
  const users = ds.getRepository(User);

  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@rs.example.id';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';

  const existing = await users.findOne({ where: { email } });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Admin already exists: ${email}`);
  } else {
    await users.save(
      users.create({
        email,
        passwordHash: await AuthService.hashPassword(password),
        displayName: 'Administrator',
        role: UserRole.ADMIN,
        isActive: true,
      }),
    );
    // eslint-disable-next-line no-console
    console.log(`Seeded admin: ${email} / ${password}`);
  }

  await ds.destroy();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
