import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

import { IzpitiServiceUC } from "../src/app/usecases";
import { MemoryRepo } from "../src/infra/repoMemory";
import { makeGrpcServer } from "../src/grpc/server";

const PROTO_PATH = path.join(__dirname, "..", "api", "izpiti.proto");
const pkgDef = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, defaults: true, oneofs: true });
const proto: any = grpc.loadPackageDefinition(pkgDef);

test("grpc CreateExamTerm + GetExamTerm", async () => {
  const uc = new IzpitiServiceUC(new MemoryRepo());
  const server = makeGrpcServer(uc);

  const port: number = await new Promise((resolve, reject) => {
    server.bindAsync("127.0.0.1:0", grpc.ServerCredentials.createInsecure(), (err, p) => {
      if (err) reject(err);
      else resolve(p);
    });
  });

  server.start();

  const client = new proto.izpiti.v1.IzpitiService(`127.0.0.1:${port}`, grpc.credentials.createInsecure());

  const created: any = await new Promise((resolve, reject) => {
    client.CreateExamTerm(
      {
        predmet_id: "OIT101",
        datum_cas: "2026-04-01T10:00:00.000Z",
        lokacija: "P-201",
        prijave_od: "2026-03-20T00:00:00.000Z",
        prijave_do: "2026-03-30T23:59:59.000Z",
        kapaciteta: 30
      },
      (err: any, res: any) => (err ? reject(err) : resolve(res))
    );
  });

  const got: any = await new Promise((resolve, reject) => {
    client.GetExamTerm({ id: created.id }, (err: any, res: any) => (err ? reject(err) : resolve(res)));
  });

  expect(got.predmet_id).toBe("OIT101");

  client.close();
  server.forceShutdown();
});