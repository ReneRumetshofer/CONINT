import pg from 'pg';
import Postgrator from 'postgrator';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function migrate() {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const postgrator = new Postgrator({
      migrationPattern: path.join(__dirname, '/migrations/*'),
      driver: 'pg',
      database: process.env.DB_NAME,
      schemaTable: 'migrations',
      currentSchema: 'public', // Postgres and MS SQL Server only
      execQuery: (query) => client.query(query),
    });

    const result = await postgrator.migrate();

    if (result.length === 0) {
      console.log(
        'No migrations run for schema "public". Already at the latest one.'
      );
    }

    console.log('Migration done.');
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }

  await client.end();
}

export default migrate;
