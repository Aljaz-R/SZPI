import { useState } from "react";

const API = "http://localhost:8080";

export default function IzpitiApp() {
  const [out, setOut] = useState<any>(null);
  const [id, setId] = useState("");
  const [predmet_id, setPredmet] = useState("OIT101");
  const [datum_cas, setDatum] = useState("2026-04-01T10:00:00.000Z");
  const [lokacija, setLokacija] = useState("P-201");
  const [prijave_od, setOd] = useState("2026-03-20T00:00:00.000Z");
  const [prijave_do, setDo] = useState("2026-03-30T23:59:59.000Z");
  const [kapaciteta, setKap] = useState(30);

  async function create() {
    const r = await fetch(`${API}/web/izpiti`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ predmet_id, datum_cas, lokacija, prijave_od, prijave_do, kapaciteta }),
    });
    setOut(await r.json());
  }

  async function list() {
    const r = await fetch(`${API}/web/izpiti?limit=50&offset=0`);
    setOut(await r.json());
  }

  async function getById() {
    const r = await fetch(`${API}/web/izpiti/${id}`);
    setOut(await r.json());
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Izpiti</h2>

      <h3>Create</h3>
      <input value={predmet_id} onChange={(e) => setPredmet(e.target.value)} />
      <input value={datum_cas} onChange={(e) => setDatum(e.target.value)} />
      <input value={lokacija} onChange={(e) => setLokacija(e.target.value)} />
      <input value={prijave_od} onChange={(e) => setOd(e.target.value)} />
      <input value={prijave_do} onChange={(e) => setDo(e.target.value)} />
      <input type="number" value={kapaciteta} onChange={(e) => setKap(Number(e.target.value))} />
      <button onClick={create}>Create</button>

      <h3>List</h3>
      <button onClick={list}>List</button>

      <h3>Get</h3>
      <input placeholder="id" value={id} onChange={(e) => setId(e.target.value)} />
      <button onClick={getById}>Get</button>

      <pre style={{ marginTop: 16 }}>{JSON.stringify(out, null, 2)}</pre>
    </div>
  );
}