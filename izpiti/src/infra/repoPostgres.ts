import { Pool } from "pg";
import { Repo } from "../app/usecases";
import { ExamTerm } from "../domain/examTerm";

export class PostgresRepo implements Repo {
  constructor(private pool: Pool) {}

  async create(t: Omit<ExamTerm, "id">): Promise<ExamTerm> {
    const r = await this.pool.query(
      `INSERT INTO izpitni_roki (predmet_id, datum_cas, lokacija, prijave_od, prijave_do, kapaciteta)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      [t.predmetId, t.datumCas, t.lokacija, t.prijaveOd, t.prijaveDo, t.kapaciteta]
    );
    return { id: Number(r.rows[0].id), ...t };
  }

  async get(id: number): Promise<ExamTerm | null> {
    const r = await this.pool.query(
      `SELECT id, predmet_id, datum_cas, lokacija, prijave_od, prijave_do, kapaciteta
       FROM izpitni_roki WHERE id=$1`,
      [id]
    );
    if (r.rowCount === 0) return null;
    const row = r.rows[0];
    return {
      id: Number(row.id),
      predmetId: row.predmet_id,
      datumCas: new Date(row.datum_cas),
      lokacija: row.lokacija,
      prijaveOd: new Date(row.prijave_od),
      prijaveDo: new Date(row.prijave_do),
      kapaciteta: Number(row.kapaciteta)
    };
  }

  async list(filter: { predmetId?: string; od?: Date; do?: Date; limit?: number; offset?: number }): Promise<ExamTerm[]> {
    const r = await this.pool.query(
      `SELECT id, predmet_id, datum_cas, lokacija, prijave_od, prijave_do, kapaciteta
       FROM izpitni_roki
       WHERE ($1::text IS NULL OR predmet_id=$1)
         AND ($2::timestamptz IS NULL OR datum_cas >= $2)
         AND ($3::timestamptz IS NULL OR datum_cas <= $3)
       ORDER BY datum_cas ASC
       LIMIT $4 OFFSET $5`,
      [filter.predmetId ?? null, filter.od ?? null, filter.do ?? null, filter.limit ?? 50, filter.offset ?? 0]
    );

    return r.rows.map((row) => ({
      id: Number(row.id),
      predmetId: row.predmet_id,
      datumCas: new Date(row.datum_cas),
      lokacija: row.lokacija,
      prijaveOd: new Date(row.prijave_od),
      prijaveDo: new Date(row.prijave_do),
      kapaciteta: Number(row.kapaciteta)
    }));
  }
}