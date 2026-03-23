import { Pool } from "pg";

export function makePool(databaseUrl: string) {
  return new Pool({ connectionString: databaseUrl });
}

export async function initSchema(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS izpitni_roki (
      id BIGSERIAL PRIMARY KEY,
      predmet_id TEXT NOT NULL,
      datum_cas TIMESTAMPTZ NOT NULL,
      lokacija TEXT NOT NULL,
      prijave_od TIMESTAMPTZ NOT NULL,
      prijave_do TIMESTAMPTZ NOT NULL,
      kapaciteta INT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_izpitni_roki_predmet ON izpitni_roki(predmet_id);
    CREATE INDEX IF NOT EXISTS idx_izpitni_roki_datum ON izpitni_roki(datum_cas);
  `);
}