import "dotenv/config";
import * as grpc from "@grpc/grpc-js";
import pino from "pino";

import { IzpitiServiceUC } from "./app/usecases";
import { makeGrpcServer } from "./grpc/server";
import { makePool, initSchema } from "./infra/postgres";
import { PostgresRepo } from "./infra/repoPostgres";

const logger = pino();

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://izpiti:izpiti@localhost:5432/izpiti";
  const GRPC_PORT = process.env.GRPC_PORT ?? "50051";

  const pool = makePool(DATABASE_URL);
  await initSchema(pool);

  const repo = new PostgresRepo(pool);
  const uc = new IzpitiServiceUC(repo);

  const server = makeGrpcServer(uc);

  server.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) throw err;
    logger.info({ port: GRPC_PORT }, "izpiti grpc listening");
    server.start();
  });
}

main().catch((e) => {
  // log
  console.error(e);
  process.exit(1);
});