import { useState } from "react";

const API = "http://localhost:8080";

export default function StudentiApp() {
  const [id, setId] = useState("");
  const [vpisna, setVpisna] = useState("");
  const [ime, setIme] = useState("");
  const [priimek, setPriimek] = useState("");
  const [status, setStatus] = useState<"AKTIVEN" | "NEAKTIVEN">("AKTIVEN");
  const [predmetId, setPredmetId] = useState("OIT101");
  const [out, setOut] = useState<any>(null);

  async function create() {
    const r = await fetch(`${API}/web/studenti`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vpisna, ime, priimek }),
    });
    setOut(await r.json());
  }

  async function getById() {
    const r = await fetch(`${API}/web/studenti/${id}`);
    setOut(await r.json());
  }

  async function patchStatus() {
    const r = await fetch(`${API}/web/studenti/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOut(await r.json());
  }

  async function upravicenos() {
    const r = await fetch(`${API}/web/studenti/${id}/upravicenost?predmetId=${encodeURIComponent(predmetId)}`);
    setOut(await r.json());
  }

  async function getByVpisna() {
  const r = await fetch(`${API}/web/studenti?vpisna=${encodeURIComponent(vpisna)}`);
  setOut(await r.json());
}

  return (
    <div style={{ padding: 16 }}>
      <h2>Študenti</h2>

      <h3>Create</h3>
      <input placeholder="vpisna" value={vpisna} onChange={(e) => setVpisna(e.target.value)} />
      <input placeholder="ime" value={ime} onChange={(e) => setIme(e.target.value)} />
      <input placeholder="priimek" value={priimek} onChange={(e) => setPriimek(e.target.value)} />
      <button onClick={create}>Create</button>

      <h3>Get / Update</h3>
      <input placeholder="id" value={id} onChange={(e) => setId(e.target.value)} />
      <button onClick={getById}>Get</button>

      <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
        <option value="AKTIVEN">AKTIVEN</option>
        <option value="NEAKTIVEN">NEAKTIVEN</option>
      </select>
      <button onClick={patchStatus}>Patch status</button>

<button onClick={getByVpisna}>Get by vpisna</button>

      <h3>Upravičenost</h3>
      <input placeholder="predmetId" value={predmetId} onChange={(e) => setPredmetId(e.target.value)} />
      <button onClick={upravicenos}>Check</button>

      <pre style={{ marginTop: 16 }}>{JSON.stringify(out, null, 2)}</pre>
    </div>
  );
}