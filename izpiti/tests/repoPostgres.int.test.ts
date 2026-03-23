import { makePool, initSchema } from "../src/infra/postgres";
import { PostgresRepo } from "../src/infra/repoPostgres";

const dbUrl = process.env.DATABASE_URL_TEST;

test("postgres repo create+get", async () => {
  if (!dbUrl) return;

  const pool = makePool(dbUrl);
  await initSchema(pool);
  const repo = new PostgresRepo(pool);

  const created = await repo.create({
    predmetId: "OIT101",
    datumCas: new Date("2026-04-01T10:00:00.000Z"),
    lokacija: "P-201",
    prijaveOd: new Date("2026-03-20T00:00:00.000Z"),
    prijaveDo: new Date("2026-03-30T23:59:59.000Z"),
    kapaciteta: 30
  });

  const got = await repo.get(created.id);
  expect(got?.predmetId).toBe("OIT101");

  await pool.end();
});