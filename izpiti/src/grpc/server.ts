import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import pino from "pino";

import { IzpitiServiceUC, InvalidArgumentError, NotFoundError } from "../app/usecases";

const logger = pino();

const PROTO_PATH = path.join(__dirname, "..", "..", "api", "izpiti.proto");
const pkgDef = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, defaults: true, oneofs: true });
const proto: any = grpc.loadPackageDefinition(pkgDef);

export function makeGrpcServer(uc: IzpitiServiceUC) {
  const server = new grpc.Server();

  server.addService(proto.izpiti.v1.IzpitiService.service, {
    CreateExamTerm: async (call: any, cb: any) => {
      try {
        const t = await uc.createExamTerm({
          predmetId: call.request.predmet_id,
          datumCas: call.request.datum_cas,
          lokacija: call.request.lokacija,
          prijaveOd: call.request.prijave_od,
          prijaveDo: call.request.prijave_do,
          kapaciteta: call.request.kapaciteta
        });

        cb(null, {
          id: t.id,
          predmet_id: t.predmetId,
          datum_cas: t.datumCas.toISOString(),
          lokacija: t.lokacija,
          prijave_od: t.prijaveOd.toISOString(),
          prijave_do: t.prijaveDo.toISOString(),
          kapaciteta: t.kapaciteta
        });
      } catch (e: any) {
        if (e instanceof InvalidArgumentError) return cb({ code: grpc.status.INVALID_ARGUMENT, message: e.message });
        logger.error(e);
        return cb({ code: grpc.status.INTERNAL, message: "internal" });
      }
    },

    GetExamTerm: async (call: any, cb: any) => {
      try {
        const t = await uc.getExamTerm(Number(call.request.id));
        cb(null, {
          id: t.id,
          predmet_id: t.predmetId,
          datum_cas: t.datumCas.toISOString(),
          lokacija: t.lokacija,
          prijave_od: t.prijaveOd.toISOString(),
          prijave_do: t.prijaveDo.toISOString(),
          kapaciteta: t.kapaciteta
        });
      } catch (e: any) {
        if (e instanceof InvalidArgumentError) return cb({ code: grpc.status.INVALID_ARGUMENT, message: e.message });
        if (e instanceof NotFoundError) return cb({ code: grpc.status.NOT_FOUND, message: e.message });
        logger.error(e);
        return cb({ code: grpc.status.INTERNAL, message: "internal" });
      }
    },

    ListExamTerms: async (call: any, cb: any) => {
      try {
        const list = await uc.listExamTerms({
          predmetId: call.request.predmet_id || undefined,
          od: call.request.od || undefined,
          do: call.request.do || undefined,
          limit: call.request.limit,
          offset: call.request.offset
        });

        cb(null, {
          terms: list.map((t) => ({
            id: t.id,
            predmet_id: t.predmetId,
            datum_cas: t.datumCas.toISOString(),
            lokacija: t.lokacija,
            prijave_od: t.prijaveOd.toISOString(),
            prijave_do: t.prijaveDo.toISOString(),
            kapaciteta: t.kapaciteta
          }))
        });
      } catch (e: any) {
        if (e instanceof InvalidArgumentError) return cb({ code: grpc.status.INVALID_ARGUMENT, message: e.message });
        logger.error(e);
        return cb({ code: grpc.status.INTERNAL, message: "internal" });
      }
    }
  });

  return server;
}