const path = require("path");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const pino = require("pino");
const pinoHttp = require("pino-http");

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
const izpitiClient = new IzpitiClientCtor(IZPITI_GRPC_ADDR, grpc.credentials.createInsecure());

function grpcCall(method, request) {
  return new Promise((resolve, reject) => {
    izpitiClient[method](request, (err, res) => (err ? reject(err) : resolve(res)));
  });
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger: log }));

app.get("/web/health", (req, res) => res.json({ status: "ok" }));

// -------- Studenti (REST proxy) --------
app.get("/web/studenti/:id", async (req, res) => {
  try {
    const r = await axios.get(`${STUDENTI_BASE_URL}/studenti/${req.params.id}`);
    res.status(r.status).json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: "STUDENTI_ERROR" });
  }
});

app.get("/web/studenti", async (req, res) => {
  try {
    const r = await axios.get(`${STUDENTI_BASE_URL}/studenti`, { params: req.query });
    res.status(r.status).json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: "STUDENTI_ERROR" });
  }
});

app.post("/web/studenti", async (req, res) => {
  try {
    const r = await axios.post(`${STUDENTI_BASE_URL}/studenti`, req.body);
    res.status(r.status).json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: "STUDENTI_ERROR" });
  }
});

app.patch("/web/studenti/:id/status", async (req, res) => {
  try {
    const r = await axios.patch(`${STUDENTI_BASE_URL}/studenti/${req.params.id}/status`, req.body);
    res.status(r.status).json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: "STUDENTI_ERROR" });
  }
});

app.get("/web/studenti/:id/upravicenost", async (req, res) => {
  try {
    const r = await axios.get(`${STUDENTI_BASE_URL}/studenti/${req.params.id}/upravicenost`, { params: req.query });
    res.status(r.status).json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: "STUDENTI_ERROR" });
  }
});

// -------- Izpiti (gRPC -> REST) --------
app.get("/web/izpiti", async (req, res) => {
  try {
    const out = await grpcCall("ListExamTerms", {
      predmet_id: req.query.predmetId || "",
      od: req.query.od || "",
      do: req.query.do || "",
      limit: Number(req.query.limit || 50),
      offset: Number(req.query.offset || 0),
    });
    res.json(out);
  } catch (e) {
    res.status(502).json({ error: "IZPITI_GRPC_ERROR", details: e.message });
  }
});

app.post("/web/izpiti", async (req, res) => {
  try {
    const out = await grpcCall("CreateExamTerm", {
      predmet_id: req.body.predmet_id,
      datum_cas: req.body.datum_cas,
      lokacija: req.body.lokacija,
      prijave_od: req.body.prijave_od,
      prijave_do: req.body.prijave_do,
      kapaciteta: Number(req.body.kapaciteta),
    });
    res.status(201).json(out);
  } catch (e) {
    res.status(502).json({ error: "IZPITI_GRPC_ERROR", details: e.message });
  }
});

app.get("/web/izpiti/:id", async (req, res) => {
  try {
    const out = await grpcCall("GetExamTerm", { id: String(req.params.id) });
    res.json(out);
  } catch (e) {
    res.status(502).json({ error: "IZPITI_GRPC_ERROR", details: e.message });
  }
});

// -------- Agregacija (WEB specifično) --------
app.get("/web/dashboard", async (req, res) => {
  try {
    const studentId = req.query.studentId;
    if (!studentId) return res.status(400).json({ error: "studentId required" });

    const [student, terms] = await Promise.all([
      axios.get(`${STUDENTI_BASE_URL}/studenti/${studentId}`).then((r) => r.data),
      grpcCall("ListExamTerms", { predmet_id: "", od: "", do: "", limit: 10, offset: 0 }),
    ]);

    res.json({ student, terms });
  } catch (e) {
    res.status(500).json({ error: "DASHBOARD_ERROR", details: e.message });
  }
});

app.listen(PORT, () => log.info({ port: PORT }, "gateway-web listening"));