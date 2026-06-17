import { config as loadEnv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

loadEnv();

/**
 * Standalone DataSource used by the TypeORM CLI for migrations.
 * The runtime app builds its options from ConfigService (see database.module.ts),
 * but both share the same entity/migration globs.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'nurses',
  // Migrations are the source of truth; never auto-synchronize a real DB.
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
};

export default new DataSource(dataSourceOptions);
