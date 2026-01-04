// app/lookup/vehicleCatalog.ts

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
  if (make === "Saab" && model === "9-5")
    return [{ id: "saab95-a20dth", label: "2.0 TiD (A20DTH)" }];

  if (make === "Saab" && model === "9-3")
    return [{ id: "saab93-b207", label: "2.0T (B207)" }];

  if (make === "VW" && model === "Golf")
    return [{ id: "golf-2.0tdi", label: "2.0 TDI" }];

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
        // ===== OIL / PRESSURE (kritisk) =====
        {
          id: "oil-pickup-seal",
          title: "Lavt olietryk (oil pickup seal / O-ring)",
          severity: "Kritisk",
          tags: ["olie", "motorlampe", "lyde"],
          symptoms: [
            "Olietryk-advarsel (ofte ved koldstart)",
            "Kort raslen/lejetik de første sekunder",
            "Kan være OK varm men dårlig kold",
          ],
          typicalFix:
            "Sump af: skift pickup O-ring/seal, rens pickup og slam i bund. Brug korrekt del og olie+filter bagefter.",
          costDkk: { low: 2500, high: 8000 },
        },
        {
          id: "sump-sludge",
          title: "Slam/tilstopning i sump og pickup",
          severity: "Kritisk",
          tags: ["olie", "motorlampe", "lyde"],
          symptoms: ["Olietryk-alarmer", "Turbo-/lejestøj over tid", "Meget sort/sodet olie og aflejringer"],
          typicalFix: "Sump af + grundig rens af pickup/si og oliekanaler. Forkort olieinterval fremover.",
          costDkk: { low: 3000, high: 9000 },
        },
        {
          id: "oil-pressure-sensor",
          title: "Olietryksensor fejl / falske olietryk-alarmer",
          severity: "Mellem",
          tags: ["olie", "motorlampe", "elektrisk"],
          symptoms: ["Olietryk-advarsel uden tydelig mekanisk støj", "Kommer ved bestemt temperatur/RPM"],
          typicalFix: "Mål mekanisk olietryk først. Hvis tryk er OK: skift sensor/stik/ledning.",
          costDkk: { low: 500, high: 3000 },
        },

        // ===== DPF / EGR / INTAKE =====
        {
          id: "dpf-clog",
          title: "DPF tilstoppet / mislykkede regenereringer",
          severity: "Høj",
          tags: ["motorlampe", "træk", "røg", "udstødning"],
          symptoms: [
            "Nødløb / manglende træk",
            "Hyppige regenereringer / høj tomgang efter kørsel",
            "Stigende olie-niveau (diesel i olie)",
            "Advarsler om partikelfilter / service",
          ],
          typicalFix:
            "Diagnose med live-data (differenstryk/temp), tvangsregen eller DPF-rens. Løs rodårsag (korte ture, sensorer, EGR).",
          costDkk: { low: 1500, high: 14000 },
        },
        {
          id: "egr",
          title: "EGR soder til",
          severity: "Mellem",
          tags: ["motorlampe", "tomgang", "røg", "træk"],
          symptoms: ["Ujævn tomgang", "Nødløb", "Tøven ved gas", "Sort røg ved belastning"],
          typicalFix: "Rens/udskift EGR og tjek EGR-køler/kanaler for tilstopning.",
          costDkk: { low: 1500, high: 6500 },
        },
        {
          id: "swirl-flaps",
          title: "Swirl flaps/arm i indsugning (arm falder af / klapper binder)",
          severity: "Høj",
          tags: ["motorlampe", "træk", "tomgang"],
          symptoms: ["Dårlig bundtræk", "Fejl/advarsler", "Nødløb på nogle biler", "Ujævn motorgang ved bestemte belastninger"],
          typicalFix: "Reparer/udskift indsugningsmanifold eller swirl-komponenter afhængigt af skade. Kontroller samtidig sod i indsugning.",
          costDkk: { low: 3000, high: 12000 },
        },
        {
          id: "map-sensor-soot",
          title: "MAP-sensor/indsugning soder til (forkert boost/luftdata)",
          severity: "Mellem",
          tags: ["motorlampe", "træk", "røg", "sensor"],
          symptoms: ["Tøven ved speeder", "Ujævnt træk", "Underboost/overboost-fejl", "Sort røg"],
          typicalFix: "Rens MAP-sensor, indsugningskanaler og tjek for olie/sod. Kontroller også trykrør og intercooler.",
          costDkk: { low: 300, high: 3500 },
        },
        {
          id: "boost-leak",
          title: "Boost-læk (intercooler/trykrør/slange-samlinger)",
          severity: "Mellem",
          tags: ["træk", "røg", "lyde"],
          symptoms: ["Hvæsen under load", "Oliesved ved trykrør", "Manglende træk ved acceleration", "Nødløb ved overhaling"],
          typicalFix: "Tryktest systemet, skift revnede slanger/intercooler, nye O-ringe/klemmer hvor nødvendigt.",
          costDkk: { low: 800, high: 6500 },
        },
        {
          id: "vacuum-control",
          title: "Vakuumslanger/booststyring (magnetventil/actuator) fejl",
          severity: "Høj",
          tags: ["træk", "motorlampe", "lyde", "vakuum"],
          symptoms: ["Ustabilt boost", "Ryk ved acceleration", "Nødløb", "Summen/brummen fra vakuumventil efter stop"],
          typicalFix: "Tjek vakuum med håndpumpe, udskift porøse slanger, test/udskift magnetventil og kontroller actuator bevægelse.",
          costDkk: { low: 800, high: 8000 },
        },
        {
          id: "maf-sensor",
          title: "MAF (luftmængdemåler) fejl / forkerte luftdata",
          severity: "Mellem",
          tags: ["motorlampe", "træk", "sensor"],
          symptoms: ["Dårligt træk", "Tøven", "Ujævn respons", "Nødløb i perioder"],
          typicalFix: "Test via live-data (g/s) og prøv evt. kendt god MAF. Tjek også utætheder i indsugning.",
          costDkk: { low: 700, high: 3500 },
        },

        // ===== FUEL / INJECTORS =====
        {
          id: "fuel-pressure-control",
          title: "Railtryk-ustabilitet (trykregulator/IMV/SCV) → ujævn tomgang",
          severity: "Mellem",
          tags: ["tomgang", "start", "motorlampe", "brændstof"],
          symptoms: ["Omdrejninger 'jager' (især varm/kold overgang)", "Tøven ved speeder", "Kan dø efter kort tid ved ustabil regulering"],
          typicalFix: "Læs railtryk ønsket/aktuelt i live-data. Rens/udskift regulator/ventil efter måling (ikke gæt).",
          costDkk: { low: 1500, high: 7000 },
        },
        {
          id: "injector-leakoff",
          title: "Injektor returflow / utætte kobberpakninger (blow-by)",
          severity: "Høj",
          tags: ["start", "tomgang", "brændstof", "røg"],
          symptoms: ["Dårlig start varm/kold", "Diesellugt", "Ujævn gang", "Sort tjære omkring injektorer"],
          typicalFix: "Returflow-test. Skift kobberpakninger/bolte og rens sæder. Ved behov: renover/udskift injektor.",
          costDkk: { low: 1500, high: 15000 },
        },

        // ===== START / GLOW =====
        {
          id: "glow-plugs",
          title: "Gløderør / gløderørsmodul",
          severity: "Mellem",
          tags: ["start", "motorlampe", "elektrisk"],
          symptoms: ["Lang koldstart", "Ryster når kold", "Hvid/grå røg ved koldstart", "Glødelampe/fejl"],
          typicalFix: "Mål gløderør, skift defekte gløderør og evt. gløderørsstyring.",
          costDkk: { low: 1200, high: 5500 },
        },
        {
          id: "battery-low-voltage",
          title: "Lav spænding / dårligt batteri → mærkelige fejl og ustabil drift",
          severity: "Mellem",
          tags: ["elektrisk", "start", "motorlampe"],
          symptoms: ["Mange tilfældige fejl", "Dårlig start", "Moduler opfører sig mærkeligt", "Spænding falder ved belastning"],
          typicalFix: "Load-test batteri, tjek generator-ladespænding, rens poler og stel.",
          costDkk: { low: 800, high: 3500 },
        },

        // ===== COOLING =====
        {
          id: "thermostat",
          title: "Termostat fejl (motor kører for koldt/varmt)",
          severity: "Lav",
          tags: ["kølervæske", "temperatur"],
          symptoms: ["Lang opvarmning", "Lav driftstemperatur", "Svingende temperatur", "Øget forbrug hvis for kold"],
          typicalFix: "Skift termostat og luft kølesystem korrekt ud.",
          costDkk: { low: 1000, high: 4000 },
        },
        {
          id: "coolant-temp-sensor",
          title: "Kølervæske-temp sensor (ECT) fejl → forkert temp/regen/forbrug",
          severity: "Mellem",
          tags: ["kølervæske", "sensor", "motorlampe"],
          symptoms: ["Forkert temp-visning", "Dårlig koldstart/forbrug", "DPF-regenerering opfører sig underligt"],
          typicalFix: "Læs temp i live-data, sammenlign med realtemp. Skift sensor/stik hvis afvigelse.",
          costDkk: { low: 400, high: 2500 },
        },
        {
          id: "water-pump",
          title: "Vandpumpe læk/defekt (tandrem-side)",
          severity: "Høj",
          tags: ["kølervæske", "lyde", "temperatur"],
          symptoms: ["Kølervæsketab", "Fugt ved pumpe", "Hvin/rumlen fra remside", "Overophedning"],
          typicalFix: "Skift vandpumpe sammen med tandremssæt (strammer/løbere).",
          costDkk: { low: 4000, high: 11000 },
        },
        {
          id: "timing-belt",
          title: "Tandrem/strammer/løberhjul overskredet service",
          severity: "Kritisk",
          tags: ["lyde", "service"],
          symptoms: ["Mislyde fra remside", "Ujævn gang", "Risiko for motorstop hvis rem hopper/knækker"],
          typicalFix: "Skift tandremssæt + vandpumpe efter interval/historik. Køb ikke 'billigste kit'.",
          costDkk: { low: 4500, high: 13000 },
        },

        // ===== OIL/WATER MIX =====
        {
          id: "oil-cooler-gaskets",
          title: "Oliekøler/oliehus-pakninger (olie og kølervand blander sig)",
          severity: "Høj",
          tags: ["olie", "kølervæske", "motorlampe"],
          symptoms: ["Olie i ekspansionsbeholder", "Kølervæske misfarvet", "Kølervæsketab eller olieforbrug"],
          typicalFix: "Trykprøv og udeluk toppakning. Skift pakninger/komponent efter korrekt diagnose og skyl kølesystem.",
          costDkk: { low: 2500, high: 9500 },
        },

        // ===== PCV / LEAKS =====
        {
          id: "pcv-leaks",
          title: "PCV/krumtapsudluftning utæt → olieforbrug/oliesved",
          severity: "Lav",
          tags: ["olie", "tomgang"],
          symptoms: ["Oliesved ved slanger", "Olie i indsugning", "Hvæsen/utæthed"],
          typicalFix: "Udskift sprøde slanger/ventiler, tjek tæthed og korrekt routing.",
          costDkk: { low: 300, high: 2500 },
        },

        // ===== DRIVELINE (mange klager på NG 9-5 generelt) =====
        {
          id: "dmf-wear",
          title: "DMF (dobbeltmassesvinghjul) slidt → vibration/klonk",
          severity: "Høj",
          tags: ["gear", "lyde", "vibration"],
          symptoms: ["Klonk/raslen i tomgang", "Vibration ved igangsætning", "Lyden ændrer sig når du træder kobling"],
          typicalFix: "Bekræft lyd/vibration. Skift DMF + kobling hvis slidt.",
          costDkk: { low: 7000, high: 18000 },
        },
        {
          id: "engine-mounts",
          title: "Motorophæng slidt → rystelser i kabinen",
          severity: "Mellem",
          tags: ["vibration", "lyde"],
          symptoms: ["Rystelser i tomgang", "Dunk ved gearskift", "Mere vibration ved belastning"],
          typicalFix: "Tjek øvre/nedre motorophæng. Skift de defekte ophæng.",
          costDkk: { low: 1500, high: 8000 },
        },

        // ===== ELECTRICAL / SENSORS =====
        {
          id: "crank-sensor",
          title: "Krumtapsføler (CKP) fejl → kan stoppe / svært at starte",
          severity: "Høj",
          tags: ["start", "motorlampe", "sensor", "elektrisk"],
          symptoms: ["Kan gå ud pludseligt", "Svær at starte varm", "Ujævn drift uden klare mønstre"],
          typicalFix: "Læs fejl/livedata. Skift CKP ved tydelige udfald (ikke gæt).",
          costDkk: { low: 900, high: 4500 },
        },
      ],
    };
  }

  if (id === "saab93-b207") {
    return {
      make: "Saab",
      model: "9-3",
      yearFrom: 2007,
      yearTo: 2009,
      engine: "2.0T",
      engineCode: "B207",
      fuel: "Benzin",
      issues: [
        {
          id: "pcv",
          title: "PCV/krumtapsudluftning problemer",
          severity: "Mellem",
          tags: ["olie", "tomgang"],
          symptoms: ["Olieforbrug", "Oliesved", "Ujævn tomgang"],
          typicalFix: "Tjek PCV-system, slanger og ventiler",
          costDkk: { low: 800, high: 3000 },
        },
      ],
    };
  }

  if (id === "golf-2.0tdi") {
    return {
      make: "VW",
      model: "Golf",
      yearFrom: 2017,
      yearTo: 2019,
      engine: "2.0 TDI",
      engineCode: "EA288",
      fuel: "Diesel",
      issues: [
        {
          id: "dpf",
          title: "DPF regenereringsproblemer ved korte ture",
          severity: "Mellem",
          tags: ["motorlampe", "udstødning", "røg"],
          symptoms: ["DPF-lampe", "Hyppig regenerering", "Høj tomgang efter kørsel"],
          typicalFix: "Længere motorvejsture + diagnose af sensorer",
          costDkk: { low: 1000, high: 8000 },
        },
      ],
    };
  }

  return null;
}
