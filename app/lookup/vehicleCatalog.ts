export function uniqueMakes() {
  return ["Saab", "VW"];
}

export function modelsForMake(make: string) {
  if (make === "Saab") return ["9-5", "9-3"];
  if (make === "VW") return ["Golf"];
  return [];
}

export function yearsFor(make: string, model: string) {
  if (make === "Saab" && model === "9-5") return [2010, 2011, 2012];
  if (make === "Saab" && model === "9-3") return [2007, 2008, 2009];
  if (make === "VW" && model === "Golf") return [2017, 2018, 2019];
  return [];
}

export function enginesFor(make: string, model: string, year: number) {
  if (make === "Saab" && model === "9-5") return [{ id: "saab95-a20dth", label: "2.0 TiD (A20DTH)" }];
  if (make === "Saab" && model === "9-3") return [{ id: "saab93-b207", label: "2.0T (B207)" }];
  if (make === "VW" && model === "Golf") return [{ id: "golf-2.0tdi", label: "2.0 TDI" }];
  return [];
}

export function getVariant(id: string) {
  if (id === "saab95-a20dth") {
    return {
      make: "Saab",
      model: "9-5",
      yearFrom: 2010,
      yearTo: 2012,
      engine: "2.0 TiD",
      engineCode: "A20DTH",
      fuel: "Diesel",
      issues: [
        {
          id: "egr",
          title: "EGR soder til",
          severity: "Mellem",
          symptoms: ["Ujævn tomgang", "Nødløb"],
          typicalFix: "Rens/udskift EGR",
          costDkk: { low: 1500, high: 6000 },
        },
      ],
    };
  }
  return null;
}

