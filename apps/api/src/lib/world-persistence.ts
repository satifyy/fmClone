import prismaClientPackage from "@prisma/client";

type PrismaClientLike = {
  $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<unknown>;
  $queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
};

type PrismaClientModule = {
  PrismaClient: new () => PrismaClientLike;
};

const { PrismaClient } = prismaClientPackage as unknown as PrismaClientModule;

const PRIMARY_WORLD_ID = "primary";

type WorldRow = {
  payload: string;
};

class WorldPersistence {
  private prisma: PrismaClientLike | null;
  private initialized = false;
  private disabled = false;
  private queue: Promise<void> = Promise.resolve();

  constructor() {
    try {
      this.prisma = new PrismaClient();
    } catch {
      this.prisma = null;
      this.disabled = true;
    }
  }

  private async ensureInitialized(): Promise<boolean> {
    if (this.disabled || !this.prisma) {
      return false;
    }

    if (this.initialized) {
      return true;
    }

    try {
      await this.prisma.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS world_state (
          id TEXT PRIMARY KEY,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`
      );
      this.initialized = true;
      return true;
    } catch {
      this.disabled = true;
      return false;
    }
  }

  async load<T>(): Promise<T | null> {
    if (!(await this.ensureInitialized()) || !this.prisma) {
      return null;
    }

    try {
      const rows = await this.prisma.$queryRawUnsafe<WorldRow[]>(
        "SELECT payload FROM world_state WHERE id = ? LIMIT 1",
        PRIMARY_WORLD_ID
      );
      if (!rows[0]) {
        return null;
      }

      return JSON.parse(rows[0].payload) as T;
    } catch {
      return null;
    }
  }

  async save(payload: unknown): Promise<void> {
    if (!(await this.ensureInitialized()) || !this.prisma) {
      return;
    }

    const prisma = this.prisma;

    const serialized = JSON.stringify(payload);
    this.queue = this.queue.then(async () => {
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO world_state (id, payload, updated_at)
           VALUES (?, ?, datetime('now'))
           ON CONFLICT(id) DO UPDATE SET
             payload = excluded.payload,
             updated_at = excluded.updated_at`,
          PRIMARY_WORLD_ID,
          serialized
        );
      } catch {
        this.disabled = true;
      }
    });

    await this.queue;
  }
}

export const worldPersistence = new WorldPersistence();
