const path = require("path");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const pino = require("pino");
const pinoHttp = require("pino-http");

const CircuitBreaker = require("opossum");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const log = pino({ level: process.env.LOG_LEVEL || "info" });

const PORT = process.env.PORT || 8080;
const STUDENTI_BASE_URL = process.env.STUDENTI_BASE_URL || "http://localhost:8001";
const IZPITI_GRPC_ADDR = process.env.IZPITI_GRPC_ADDR || "localhost:50051";

const PROTO_PATH = path.join(__dirname, "api", "izpiti.proto");
const pkgDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(pkgDef);

const IzpitiClientCtor = proto.izpiti.v1.IzpitiService;
const izpitiClient = new IzpitiClientCtor(
  IZPITI_GRPC_ADDR,
  grpc.credentials.createInsecure()
);

function grpcCall(method, request) {
  return new Promise((resolve, reject) => {
    izpitiClient[method](request, (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
}

const breakerOpts = {
  timeout: 2500,
  errorThresholdPercentage: 50,
  resetTimeout: 8000,
};

// REST (studenti) breaker
const studentiBreaker = new CircuitBreaker(
  async (method, url, data, params) => {
    const r = await axios({ method, url, data, params });
    return { status: r.status, data: r.data };
  },
  breakerOpts
);

studentiBreaker.fallback(() => ({
  status: 503,
  data: { error: "STUDENTI_UNAVAILABLE" },
}));

// gRPC (izpiti) breaker - LIST
const izpitiListBreaker = new CircuitBreaker(
  async (method, request) => await grpcCall(method, request),
  breakerOpts
);
izpitiListBreaker.fallback(() => ({
  terms: [],
  warning: "IZPITI_UNAVAILABLE",
}));

// gRPC (izpiti) breaker - GET/CREATE
const izpitiBreaker = new CircuitBreaker(
  async (method, request) => await grpcCall(method, request),
  breakerOpts
);
izpitiBreaker.fallback(() => ({ __fallback: true, error: "IZPITI_UNAVAILABLE" }));

// Log breaker stanj
studentiBreaker.on("open", () => log.warn("studenti breaker OPEN"));
studentiBreaker.on("halfOpen", () => log.warn("studenti breaker HALF_OPEN"));
studentiBreaker.on("close", () => log.info("studenti breaker CLOSED"));

izpitiListBreaker.on("open", () => log.warn("izpitiList breaker OPEN"));
izpitiListBreaker.on("halfOpen", () => log.warn("izpitiList breaker HALF_OPEN"));
izpitiListBreaker.on("close", () => log.info("izpitiList breaker CLOSED"));

izpitiBreaker.on("open", () => log.warn("izpiti breaker OPEN"));
izpitiBreaker.on("halfOpen", () => log.warn("izpiti breaker HALF_OPEN"));
izpitiBreaker.on("close", () => log.info("izpiti breaker CLOSED"));

const app = express();
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger: log }));

app.get("/web/health", (req, res) => res.json({ status: "ok" }));

// -------- Studenti (REST proxy) --------
app.get("/web/studenti/:id", async (req, res) => {
  const out = await studentiBreaker.fire(
    "GET",
    `${STUDENTI_BASE_URL}/studenti/${req.params.id}`,
    null,
    null
  );
  res.status(out.status).json(out.data);
});

app.get("/web/izpiti", async (req, res) => {
  const out = await izpitiListBreaker.fire("ListExamTerms", {
    predmet_id: req.query.predmetId || "",
    od: req.query.od || "",
    do: req.query.do || "",
    limit: Number(req.query.limit || 50),
    offset: Number(req.query.offset || 0),
  });
  res.json(out);
});

app.post("/web/studenti", async (req, res) => {
  const out = await studentiBreaker.fire(
    "POST",
    `${STUDENTI_BASE_URL}/studenti`,
    req.body,
    null
  );
  res.status(out.status).json(out.data);
});

app.patch("/web/studenti/:id/status", async (req, res) => {
  const out = await studentiBreaker.fire(
    "PATCH",
    `${STUDENTI_BASE_URL}/studenti/${req.params.id}/status`,
    req.body,
    null
  );
  res.status(out.status).json(out.data);
});

app.get("/web/studenti/:id/upravicenost", async (req, res) => {
  const out = await studentiBreaker.fire(
    "GET",
    `${STUDENTI_BASE_URL}/studenti/${req.params.id}/upravicenost`,
    null,
    req.query
  );
  res.status(out.status).json(out.data);
});

// -------- Izpiti (gRPC -> REST) --------
app.get("/web/izpiti", async (req, res) => {
  const out = await izpitiListBreaker.fire("ListExamTerms", {
    predmet_id: req.query.predmetId || "",
    od: req.query.od || "",
    do: req.query.do || "",
    limit: Number(req.query.limit || 50),
    offset: Number(req.query.offset || 0),
  });
  res.json(out);
});

app.post("/web/izpiti", async (req, res) => {
  const out = await izpitiBreaker.fire("CreateExamTerm", {
    predmet_id: req.body.predmet_id,
    datum_cas: req.body.datum_cas,
    lokacija: req.body.lokacija,
    prijave_od: req.body.prijave_od,
    prijave_do: req.body.prijave_do,
    kapaciteta: Number(req.body.kapaciteta),
  });

  if (out && out.__fallback) {
    return res.status(503).json({ error: out.error });
  }
  res.status(201).json(out);
});

app.get("/web/izpiti/:id", async (req, res) => {
  const out = await izpitiBreaker.fire("GetExamTerm", { id: String(req.params.id) });

  if (out && out.__fallback) {
    return res.status(503).json({ error: out.error });
  }
  res.json(out);
});

// -------- Agregacija (WEB specifično) --------
app.get("/web/dashboard", async (req, res) => {
  const studentId = req.query.studentId;
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  const [studentOut, termsOut] = await Promise.all([
    studentiBreaker.fire("GET", `${STUDENTI_BASE_URL}/studenti/${studentId}`, null, null),
    izpitiListBreaker.fire("ListExamTerms", { predmet_id: "", od: "", do: "", limit: 10, offset: 0 }),
  ]);

  if (studentOut.status !== 200) {
    return res.status(studentOut.status).json(studentOut.data);
  }

  res.json({ student: studentOut.data, terms: termsOut });
});

app.listen(PORT, () => log.info({ port: PORT }, "gateway-web listening"));