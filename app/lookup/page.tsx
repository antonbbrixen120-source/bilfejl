"use client";

import { useState, useEffect, FormEvent } from "react";

import { enginesFor, getVariant, modelsForMake, uniqueMakes, yearsFor } from "./vehicleCatalog";



type ApiOk = {
  ok: boolean;
  vin: string;
  message?: string;
  vehicle?: {
    make: string | null;
    model: string | null;
    year: number | null;
    engine: string | null;
    fuel: string | null;
    country: string | null;
  };
};

type ApiErr = { ok?: false; error: string };

export default function LookupPage() {
  // VIN flow (dit eksisterende)
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<ApiOk | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Manuel flow (nyt)
  const [mode, setMode] = useState<"vin" | "manual">("vin");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [variantId, setVariantId] = useState("");
  const [didInitFromUrl, setDidInitFromUrl] = useState(false);

  // Når man vælger en bil → opdatér URL
useEffect(() => {
  if (!didInitFromUrl) return; // vent til vi har læst URL

  const params = new URLSearchParams(window.location.search);

if (variantId) params.set("car", variantId);
else params.delete("car");

if (year !== "") params.set("year", String(year));
else params.delete("year");


  const qs = params.toString();
  const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;

  window.history.replaceState(null, "", next);
}, [variantId, year, didInitFromUrl]);




// Når siden åbner → læs bil fra URL
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const car = params.get("car");
  const yearParam = params.get("year");
const parsedYear = yearParam ? Number(yearParam) : null;



  if (car) {
    const v = getVariant(car);
    setMode("manual");
    setVariantId(car);

    if (v) {
      setMake(v.make);
      setModel(v.model);
     if (parsedYear && parsedYear >= v.yearFrom && parsedYear <= v.yearTo) {
  setYear(parsedYear);
} else {
  setYear(v.yearFrom);
}

    }
  }

  setDidInitFromUrl(true);
}, []);


  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const cleaned = vin.trim().toUpperCase();

    // Frontend-validering (hurtig feedback)
    if (cleaned.length !== 17) {
      setErr("VIN skal være 17 tegn.");
      return;
    }
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned)) {
      setErr("Ugyldigt VIN (I/O/Q er ikke tilladt).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: cleaned }),
      });

      const json = (await res.json()) as ApiOk | ApiErr;

      if (!res.ok) {
        setErr("error" in json ? json.error : "Noget gik galt.");
      } else {
        setOk(json as ApiOk);
      }
    } catch {
      setErr("Kunne ikke kontakte API’et.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 shadow">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">VIN opslag</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Indtast et VIN (17 tegn) for at hente bilinfo — eller vælg bil manuelt.
            </p>
          </div>

          {/* Mode switch */}
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("vin")}
              className={`rounded-lg px-3 py-2 text-sm ${
                mode === "vin" ? "bg-white text-black" : "bg-neutral-900 text-neutral-200"
              }`}
            >
              VIN opslag
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`rounded-lg px-3 py-2 text-sm ${
                mode === "manual" ? "bg-white text-black" : "bg-neutral-900 text-neutral-200"
              }`}
            >
              Vælg bil manuelt
            </button>
          </div>

          {/* VIN UI */}
          {mode === "vin" && (
            <>
              <form onSubmit={onSubmit} className="flex gap-3">
                <input
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  placeholder="Fx: W0L0AHM75B2123456"
                  className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 text-sm outline-none focus:border-neutral-500"
                  maxLength={17}
                  spellCheck={false}
                  autoCapitalize="characters"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 shrink-0 rounded-xl bg-white px-5 text-sm font-medium text-black disabled:opacity-60"
                >
                  {loading ? "Slår op..." : "Slå op"}
                </button>
              </form>

              {err && (
                <div className="mt-6 rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200">
                  {err}
                </div>
              )}

              {ok && (
                <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="text-xs text-neutral-400">Resultat</div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-neutral-900 px-3 py-1 text-sm">
                      VIN: <b>{ok.vin}</b>
                    </span>

                    {ok.message && (
                      <span className="rounded-lg bg-emerald-900/30 px-3 py-1 text-sm text-emerald-200">
                        {ok.message}
                      </span>
                    )}

                    {ok.vehicle?.country && (
                      <span className="rounded-lg bg-neutral-800 px-3 py-1 text-sm text-neutral-200">
                        Region: <b>{ok.vehicle.country}</b>
                      </span>
                    )}
                  </div>

                  {ok.vehicle && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <div className="text-xs text-neutral-500">Mærke</div>
                        <div className="mt-1 text-sm font-medium">{ok.vehicle.make ?? "Ukendt"}</div>
                      </div>

                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <div className="text-xs text-neutral-500">Model</div>
                        <div className="mt-1 text-sm font-medium">{ok.vehicle.model ?? "Ukendt"}</div>
                      </div>

                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <div className="text-xs text-neutral-500">Årgang</div>
                        <div className="mt-1 text-sm font-medium">{ok.vehicle.year ?? "Ukendt"}</div>
                      </div>

                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <div className="text-xs text-neutral-500">Motor</div>
                        <div className="mt-1 text-sm font-medium">{ok.vehicle.engine ?? "Ukendt"}</div>
                      </div>

                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <div className="text-xs text-neutral-500">Brændstof</div>
                        <div className="mt-1 text-sm font-medium">{ok.vehicle.fuel ?? "Ukendt"}</div>
                      </div>

                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <div className="text-xs text-neutral-500">Region (WMI)</div>
                        <div className="mt-1 text-sm font-medium">{ok.vehicle.country ?? "Ukendt"}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Manual UI */}
          {mode === "manual" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Mærke</label>
                  <select
                    value={make}
                    onChange={(e) => {
                      setMake(e.target.value);
                      setModel("");
                      setYear("");
                      setVariantId("");
                    }}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm"
                  >
                    <option value="">Vælg mærke…</option>
                    {uniqueMakes().map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Model</label>
                  <select
                    value={model}
                    disabled={!make}
                    onChange={(e) => {
                      setModel(e.target.value);
                      setYear("");
                      setVariantId("");
                    }}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    <option value="">{make ? "Vælg model…" : "Vælg mærke først"}</option>
                    {make &&
                      modelsForMake(make).map((mo) => (
                        <option key={mo} value={mo}>
                          {mo}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Årgang</label>
                  <select
                    value={year}
                    disabled={!make || !model}
                    onChange={(e) => {
                      const v = e.target.value ? Number(e.target.value) : "";
                      setYear(v);
                      setVariantId("");
                    }}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    <option value="">
                      {make && model ? "Vælg årgang…" : "Vælg mærke + model først"}
                    </option>
                    {make &&
                      model &&
                      yearsFor(make, model).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Motor</label>
                  <select
                    value={variantId}
                    disabled={!make || !model || !year}
                    onChange={(e) => setVariantId(e.target.value)}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    <option value="">
                      {make && model && year !== "" ? "Vælg motor…" : "Vælg mærke, model, årgang først"}
                    </option>
                    {make &&
                      model &&
                      year !== "" &&
                      enginesFor(make, model, year as number).map((en) => (
                        <option key={en.id} value={en.id}>
                          {en.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {variantId && <ManualResult variantId={variantId} />}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-neutral-500">
          Tip: /api/vin er POST-only, så 405 på GET er helt normalt.
        </div>
      </div>
    </main>
  );
}

function ManualResult({ variantId }: { variantId: string }) {
  const v = getVariant(variantId);
  if (!v) return null;

  return (
    <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-neutral-900 px-3 py-1 text-sm text-neutral-200">
          {v.make} {v.model} • {v.yearFrom}-{v.yearTo}
        </span>
        <span className="rounded-lg bg-neutral-900 px-3 py-1 text-sm text-neutral-200">
          Motor: <b>{v.engineCode ? `${v.engine} (${v.engineCode})` : v.engine}</b>
        </span>
        {v.fuel && (
          <span className="rounded-lg bg-neutral-900 px-3 py-1 text-sm text-neutral-200">
            Brændstof: <b>{v.fuel}</b>
          </span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {v.issues.map((iss) => (
          <div key={iss.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-sm font-semibold text-neutral-100">{iss.title}</div>
              <span className="rounded-lg bg-neutral-900 px-2 py-1 text-xs text-neutral-200">
                {iss.severity}
              </span>
            </div>

            <div className="text-xs text-neutral-400">Typiske symptomer</div>
            <ul className="mt-1 list-disc pl-5 text-sm text-neutral-200">
              {iss.symptoms.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

            <div className="mt-2 text-xs text-neutral-400">Typisk løsning</div>
            <div className="text-sm text-neutral-200">{iss.typicalFix}</div>

            {iss.costDkk && (
              <div className="mt-2 text-xs text-neutral-400">
                Ca. pris: <span className="text-neutral-200">{iss.costDkk.low}–{iss.costDkk.high} kr.</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
