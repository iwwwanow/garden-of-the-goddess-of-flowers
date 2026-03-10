import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db, sqlite } from './index';
import path from 'path';

migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
console.log('Migrations applied');
sqlite.close();
