import { NextResponse } from "next/server";

type Vehicle = {
  make: string | null;
  model: string | null;
  year: number | null;
  engine: string | null;
  fuel: string | null;
  country: string | null;
};

type ApiOk = {
  ok: true;
  vin: string;
  message: string;
  vehicle: Vehicle;
  raw?: any; // behold hvis du vil debugge
};

type ApiErr = { ok: false; error: string };

function normalizeStr(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  // NHTSA bruger ofte "0" / "Not Applicable" / "Not Available"
  const bad = new Set(["0", "not applicable", "not available", "n/a", "na"]);
  if (bad.has(s.toLowerCase())) return null;
  return s;
}

function toYear(v: unknown): number | null {
  const s = normalizeStr(v);
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  if (n < 1886 || n > 2100) return null;
  return n;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const vinRaw = typeof body?.vin === "string" ? body.vin : "";
    const vin = vinRaw.trim().toUpperCase();

    // DIN eksisterende validering (regex+længde) – behold/tilpas efter din nuværende
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/; // ingen I,O,Q
    if (!vinRegex.test(vin)) {
      const out: ApiErr = { ok: false, error: "Ugyldigt VIN (tjek længde/tegn)" };
      return NextResponse.json(out, { status: 400 });
    }

    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`;
    const r = await fetch(url, {
      method: "GET",
      // cache på Vercel/Next: gør at samme VIN ikke hammer API'et
      next: { revalidate: 60 * 60 * 24 }, // 24 timer
    });

    if (!r.ok) {
      const out: ApiErr = { ok: false, error: `NHTSA fejl: ${r.status}` };
      return NextResponse.json(out, { status: 502 });
    }

    const data = await r.json();
    const row = Array.isArray(data?.Results) ? data.Results[0] : null;

    if (!row) {
      const out: ApiErr = { ok: false, error: "NHTSA svarede uden Results" };
      return NextResponse.json(out, { status: 502 });
    }

    // Map de vigtigste felter fra NHTSA
    const make = normalizeStr(row.Make);
    const model = normalizeStr(row.Model);
    const year = toYear(row.ModelYear);

    // Motor: prøv et par felter og byg en kort streng
    const disp = normalizeStr(row.DisplacementL) ?? normalizeStr(row.DisplacementCC);
    const cyl = normalizeStr(row.EngineCylinders);
    const engModel = normalizeStr(row.EngineModel);
    const engine = normalizeStr(
      [disp ? (disp.includes(".") ? `${disp}L` : `${disp}`) : null, cyl ? `${cyl} cyl` : null, engModel].filter(Boolean).join(" ")
    );

    // Brændstof
    const fuel =
      normalizeStr(row.FuelTypePrimary) ??
      normalizeStr(row.FuelTypePrimaryDesc) ??
      normalizeStr(row.FuelTypeSecondary);

    // Land: NHTSA har ofte PlantCountry (ikke altid)
    const country =
      normalizeStr(row.PlantCountry) ??
      normalizeStr(row.Manufacturer) ??
      null;

    const vehicle: Vehicle = {
      make,
      model,
      year,
      engine: engine || null,
      fuel,
      country: country || "Europa", // fallback så din UI stadig viser noget
    };

    const out: ApiOk = {
      ok: true,
      vin,
      message: "VIN er gyldigt",
      vehicle,
      // raw: data, // slå til hvis du vil se hele payload i debug JSON
    };

    return NextResponse.json(out);
  } catch (e: any) {
    const out: ApiErr = { ok: false, error: "Serverfejl" };
    return NextResponse.json(out, { status: 500 });
  }
}
