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
  // VIN flow
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<ApiOk | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Manuel flow
  const [mode, setMode] = useState<"vin" | "manual">("vin");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [variantId, setVariantId] = useState("");
  const [didInitFromUrl, setDidInitFromUrl] = useState(false);

  // Når man vælger en bil → opdatér URL
  useEffect(() => {
    if (!didInitFromUrl) return;

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

  // UI state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"severity" | "price" | "az">("severity");
  const [sev, setSev] = useState<"Alle" | "Kritisk" | "Høj" | "Mellem" | "Lav">("Alle");
  const [category, setCategory] = useState<string>("Alle");

  const CATEGORY_MAP: Record<string, string[]> = {
    Alle: [],
    Motorlampe: ["motorlampe"],
    Lyd: ["lyde"],
    Lugt: ["lugt"],
    Startproblemer: ["start"],
    Tomgang: ["tomgang"],
    "Træk/boost": ["træk", "vakuum"],
    "Røg/udstødning": ["røg", "udstødning"],
    Olie: ["olie"],
    "Kølervæske/temperatur": ["kølervæske", "temperatur"],
    Vibration: ["vibration"],
    "Gear/kobling": ["gear"],
    "Elektrisk/sensor": ["elektrisk", "sensor"],
    Service: ["service"],
    Brændstof: ["brændstof"],
  };

  const severityRank = (s: string) => {
    if (s === "Kritisk") return 0;
    if (s === "Høj") return 1;
    if (s === "Mellem") return 2;
    if (s === "Lav") return 3;
    return 9;
  };

  const issueMinCost = (iss: any) => iss?.costDkk?.low ?? Number.POSITIVE_INFINITY;

  const normalize = (s: string) =>
    (s || "")
      .toLowerCase()
      .replaceAll("å", "aa")
      .replaceAll("æ", "ae")
      .replaceAll("ø", "oe");

  const filtered = (v.issues || [])
    .filter((iss: any) => {
      if (sev !== "Alle" && iss.severity !== sev) return false;

      const need = CATEGORY_MAP[category] || [];
      if (need.length > 0) {
        const tags = Array.isArray(iss.tags) ? iss.tags : [];
        if (!need.some((t) => tags.includes(t))) return false;
      }

      return true;
    })
    .filter((iss: any) => {
      const needle = normalize(q.trim());
      if (!needle) return true;

      const hay = normalize(
        [
          iss.title,
          iss.severity,
          ...(iss.symptoms || []),
          iss.typicalFix,
          ...(Array.isArray(iss.tags) ? iss.tags : []),
        ]
          .filter(Boolean)
          .join(" ")
      );

      return hay.includes(needle);
    })
    .sort((a: any, b: any) => {
      if (sort === "severity") return severityRank(a.severity) - severityRank(b.severity);
      if (sort === "price") return issueMinCost(a) - issueMinCost(b);
      return (a.title || "").localeCompare(b.title || "", "da");
    });

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

      {/* Controls */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-1">
          <label className="mb-1 block text-xs text-neutral-400">Søg</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Søg i titel, symptomer, løsning…"
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
          />
        </div>

        <div className="md:col-span-1">
          <label className="mb-1 block text-xs text-neutral-400">Sortér</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-neutral-100"
          >
            <option value="severity">Kritisk først</option>
            <option value="price">Billigste først</option>
            <option value="az">A-Å</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="mb-1 block text-xs text-neutral-400">Find efter symptom</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-neutral-100"
          >
            {Object.keys(CATEGORY_MAP).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Severity chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["Alle", "Kritisk", "Høj", "Mellem", "Lav"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSev(s)}
            className={
              "rounded-lg border px-3 py-1 text-xs " +
              (sev === s
                ? "border-neutral-600 bg-neutral-900 text-neutral-100"
                : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900/40")
            }
            type="button"
          >
            {s}
          </button>
        ))}
        <div className="ml-auto text-xs text-neutral-500 self-center">
          Viser <span className="text-neutral-200">{filtered.length}</span> /{" "}
          <span className="text-neutral-200">{v.issues.length}</span>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
          Ingen match. Prøv at rydde filtre eller søg på noget andet.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((iss: any) => (
            <details key={iss.id} className="group rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-neutral-100">{iss.title}</div>
                  <span className="rounded-lg bg-neutral-900 px-2 py-1 text-xs text-neutral-200">
                    {iss.severity}
                  </span>
                </div>

                {Array.isArray(iss.tags) && iss.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {iss.tags.slice(0, 8).map((t: string) => (
                      <span
                        key={t}
                        className="rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-xs text-neutral-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </summary>

              <div className="mt-3">
                <div className="text-xs text-neutral-400">Typiske symptomer</div>
                <ul className="mt-1 list-disc pl-5 text-sm text-neutral-200">
                  {(iss.symptoms || []).map((s: string) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>

                <div className="mt-2 text-xs text-neutral-400">Typisk løsning</div>
                <div className="text-sm text-neutral-200">{iss.typicalFix}</div>

                {iss.costDkk && (
                  <div className="mt-2 text-xs text-neutral-400">
                    Ca. pris:{" "}
                    <span className="text-neutral-200">
                      {iss.costDkk.low}–{iss.costDkk.high} kr.
                    </span>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
