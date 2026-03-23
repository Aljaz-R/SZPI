import { IzpitiServiceUC, InvalidArgumentError } from "../src/app/usecases";
import { MemoryRepo } from "../src/infra/repoMemory";

test("createExamTerm ok", async () => {
  const uc = new IzpitiServiceUC(new MemoryRepo());
  const t = await uc.createExamTerm({
    predmetId: "OIT101",
    datumCas: "2026-04-01T10:00:00.000Z",
    lokacija: "P-201",
    prijaveOd: "2026-03-20T00:00:00.000Z",
    prijaveDo: "2026-03-30T23:59:59.000Z",
    kapaciteta: 30
  });
  expect(t.id).toBeGreaterThan(0);
});

test("createExamTerm invalid capacity", async () => {
  const uc = new IzpitiServiceUC(new MemoryRepo());
  await expect(
    uc.createExamTerm({
      predmetId: "OIT101",
      datumCas: "2026-04-01T10:00:00.000Z",
      lokacija: "P-201",
      prijaveOd: "2026-03-20T00:00:00.000Z",
      prijaveDo: "2026-03-30T23:59:59.000Z",
      kapaciteta: 0
    })
  ).rejects.toBeInstanceOf(InvalidArgumentError);
});