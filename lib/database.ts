import postgres from 'postgres';
import { getRuntimeEnv } from '@/lib/runtime-env';

type Row = Record<string, unknown>;
type PostgresClient = ReturnType<typeof postgres>;

export type DatabaseResult<T extends Row = Row> = {
  results: T[];
  success: boolean;
  meta: { changes: number };
};

export interface DatabaseStatement {
  bind(...values: unknown[]): DatabaseStatement;
  all<T extends Row = Row>(): Promise<DatabaseResult<T>>;
  first<T extends Row = Row>(): Promise<T | null>;
  run<T extends Row = Row>(): Promise<DatabaseResult<T>>;
}

export interface Database {
  prepare(query: string): DatabaseStatement;
  batch<T extends Row = Row>(
    statements: DatabaseStatement[],
  ): Promise<DatabaseResult<T>[]>;
}

class PostgresStatement implements DatabaseStatement {
  constructor(
    private readonly client: PostgresClient,
    private readonly query: string,
    private readonly values: unknown[] = [],
  ) {}

  bind(...values: unknown[]): DatabaseStatement {
    return new PostgresStatement(this.client, this.query, values);
  }

  async all<T extends Row = Row>(): Promise<DatabaseResult<T>> {
    return this.execute<T>(this.client);
  }

  async first<T extends Row = Row>(): Promise<T | null> {
    const result = await this.execute<T>(this.client);
    return result.results[0] ?? null;
  }

  async run<T extends Row = Row>(): Promise<DatabaseResult<T>> {
    return this.execute<T>(this.client);
  }

  async execute<T extends Row = Row>(
    client: PostgresClient,
  ): Promise<DatabaseResult<T>> {
    const query = normalizePostgresQuery(this.query);
    const rows = await client.unsafe<T[]>(query, this.values as never[]);
    return {
      results: Array.from(rows),
      success: true,
      meta: { changes: rows.count },
    };
  }
}

class PostgresDatabase implements Database {
  constructor(private readonly client: PostgresClient) {}

  prepare(query: string): DatabaseStatement {
    return new PostgresStatement(this.client, query);
  }

  async batch<T extends Row = Row>(statements: DatabaseStatement[]) {
    return this.client.begin(async (transaction) => {
      const client = transaction as unknown as PostgresClient;
      const results: DatabaseResult<T>[] = [];
      for (const statement of statements) {
        if (!(statement instanceof PostgresStatement)) {
          throw new Error('Cannot mix database providers in one batch.');
        }
        results.push(await statement.execute<T>(client));
      }
      return results;
    }) as unknown as Promise<DatabaseResult<T>[]>;
  }
}

let railwayDatabase: Database | null = null;

export async function getDatabase(): Promise<Database> {
  const databaseUrl = getRuntimeEnv('DATABASE_URL');
  if (databaseUrl) {
    if (!railwayDatabase) {
      const requestedPoolSize = Number(getRuntimeEnv('DATABASE_POOL_SIZE') ?? 10);
      const poolSize =
        Number.isInteger(requestedPoolSize) &&
        requestedPoolSize >= 1 &&
        requestedPoolSize <= 20
          ? requestedPoolSize
          : 10;
      const client = postgres(databaseUrl, {
        max: poolSize,
        idle_timeout: 20,
        connect_timeout: 15,
        prepare: false,
        ssl: getRuntimeEnv('DATABASE_SSL') === 'disable' ? false : 'require',
      });
      const database = new PostgresDatabase(client);
      railwayDatabase = database;
      return database;
    }
    return railwayDatabase;
  }

  const { env } = await import('cloudflare:workers');
  return env.DB as unknown as Database;
}

function normalizePostgresQuery(query: string) {
  const ignoresConflicts = /INSERT\s+OR\s+IGNORE/i.test(query);
  let index = 0;
  let normalized = query
    .replace(/INSERT\s+OR\s+IGNORE/i, 'INSERT')
    .replace(
      /\bAS\s+([a-z][A-Za-z0-9]*[A-Z][A-Za-z0-9]*)\b/g,
      (_match, alias: string) => `AS "${alias}"`,
    )
    .replace(/\?/g, () => `$${++index}`)
    .trim()
    .replace(/;$/, '');
  if (ignoresConflicts && !/ON\s+CONFLICT/i.test(normalized)) {
    normalized += ' ON CONFLICT DO NOTHING';
  }
  return normalized;
}
