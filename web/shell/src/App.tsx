import { Suspense, lazy } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

const StudentiApp = lazy(() => import("mfStudenti/StudentiApp"));
const IzpitiApp = lazy(() => import("mfIzpiti/IzpitiApp"));

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 16 }}>
        <h1>Shell</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link to="/studenti">Študenti</Link>
          <Link to="/izpiti">Izpiti</Link>
        </nav>

        <div style={{ marginTop: 16 }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/studenti" element={<StudentiApp />} />
              <Route path="/izpiti" element={<IzpitiApp />} />
              <Route path="*" element={<div>Izberi modul.</div>} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </BrowserRouter>
  );
}