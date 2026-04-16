/**
 * Kalibrierungsparameter für das Verkehrsmodell
 * Zielwerte basierend auf Münchner Verkehrserhebung 2023 (SrV/MiD)
 * und MVG-Betriebsdaten 2024
 */

// Beobachteter Modal Split München 2023
export const targetModalSplit = {
  car: 0.34,
  oepnv: 0.24,
  bike: 0.21,
  walk: 0.21,
}

// Logit-Modell: Alternative Specific Constants (ASC)
// Quelle: Shoman & Moreno (2021) "Exploring Preferences for Transportation Modes in Munich"
//         Transportation Research Record 2675(5), DOI: 10.1177/0361198121989726
//         Empirisch geschätzte Parameter aus Revealed-Preference-Daten (Münchner Haushalte)
//
// beta_time: -0.055 (Mittelwert aus Shoman Tab. 3, Pendler-Segment)
// beta_cost: -0.10  (Anpassung auf EUR-Basis, Originalwert auf CHF-Basis skaliert)
// ASC_oepnv: +0.40  (ÖPNV hat in München höheren Grundnutzen als in anderen Städten)
// ASC_bike:  -0.10  (geringeres Abschreckungspotenzial durch gute Infra in München)
// ASC_walk:  -0.35
//
// Hinweis: Direkte Übernahme wäre eine Kalibrierungsstrategie; hier werden die
// Größenordnungen aus der Literatur übernommen, Feinabstimmung erfolgt auf
// targetModalSplit (SrV 2023 München).
export const logitParams = {
  ASC_car: 0.0,       // Referenz (MIV)
  ASC_oepnv: 0.40,    // ↑ von 0.25 (empirisch München, Shoman 2021)
  ASC_bike: -0.10,    // ↑ von -0.15 (München: bessere Radinfra als Bundesdurchschnitt)
  ASC_walk: -0.35,    // leicht angepasst
  beta_time: -0.055,  // ↓ von -0.04 (empirisch stärker, Shoman 2021 Tab. 3)
  beta_cost: -0.10,   // ↑ von -0.12 (leicht reduziert für Münchner Einkommensniveau)
  beta_comfort: 0.20, // Komfort-Bonus (neue Züge, weniger Gedränge)
  beta_infra: 0.25,   // Rad-Infrastruktur-Bonus
}

// Kostenparameter (Standardwerte)
export const defaultCosts = {
  fuelPrice: 1.80,          // EUR/l
  fuelConsumption: 0.08,    // l/km Durchschnittsverbrauch
  parkingCostPerTrip: 3.0,  // EUR Parkgebühr Innenstadt
  oepnvMonthlyPass: 49,     // EUR Deutschlandticket
  oepnvTripsPerMonth: 44,   // Durchschnittliche Fahrten/Monat
  bikeInfraQuality: 6,      // Skala 1-10
}

// Gravitationsmodell-Parameter
export const gravityParams = {
  beta: 0.10,               // Impedanzparameter (Exponentialterm)
  alpha: 0.5,               // Tanner-Exponent (Potenzterm): f(t) = t^α × exp(-β×t)
                            // α=0 → rein exponentiell, α>0 → kombinierte Funktion
                            // Quelle: AETRANSPORT "Alternative Gravity Modelling Approaches"
  maxIterations: 50,        // Furness-Iteration
  convergenceThreshold: 0.01, // 1% Konvergenzkriterium
}

// Wegerate
export const tripRates = {
  tripsPerPersonPerDay: 3.0,   // Gesamtwege pro Person und Tag
  peakHourFactor: 0.12,        // Anteil Spitzenstunde am Tagesverkehr
  oepnvToUBahnFactor: 0.55,    // Anteil U-Bahn am gesamten ÖPNV
}

// Durchschnittliche Entfernung pro Weg (km) nach Verkehrsmittel
export const avgDistanceByMode = {
  car: 8.5,
  oepnv: 6.2,
  bike: 3.8,
  walk: 1.2,
}

// U9-spezifische Parameter
export const u9Params = {
  expectedDailyRidership: 90000,
  stammstrecke1Relief: 0.33,    // 33% Entlastung (konservativ)
  stammstrecke1ReliefMax: 0.44, // bis 44% laut MVG
  comfortBonus: 0.6,            // Neue Züge, Kapazitätsreserve
  trainsPerHour: 20,            // Züge pro Stunde und Richtung
  capacityPerTrain: 900,        // Stehplätze + Sitzplätze
}

// Nutzen-Kosten-Analyse (NKA) — Standardisierte Bewertung 2016+ (Fortschreibung 01.07.2022)
// Quelle: BMV "Standardisierte Bewertung von Verkehrswegeinvestitionen 2016+" (aktuell gültig)
//         Heimerl (1994) OR Spectrum: Methodische Grundlage
//         BVWP 2030 Methodenhandbuch: Basis-Parameter
//
// ⚠ Preisbasis: 2012 (alle Wert- und Kostenansätze in Preisen von 2012)
// ⚠ Diskontierungssatz: 1,7 % p.a. (BVWP 2030: "einheitlicher Diskontierungszinssatz von 1,7 % p.a.")
//   Quelle: bvwp-projekte.de/glossar.html — NOT 3%, das war Version 2006!
//
// Neue Nutzenkomponenten aus der Fortschreibung 2022:
//   (1) Treibhausgas-Lebenszyklusemissionen (Infrastruktur + Fahrzeuge)
//   (2) Implizite Nutzenbewertung (Barrierefreiheit, Brandschutz)
//   (3) Stärkere Klimaschutzgewichtung
export const nkaParams = {
  // Wert der Reisezeit (WdR) in EUR/Stunde — nach Zweck differenziert
  // Quelle: BMV (2016) Anhang 1, Tabelle A3 — Preisbasis 2012
  wdrPendler: 9.80,       // Berufswege (Pendler)
  wdrFreizeit: 7.20,      // Freizeitwege
  wdrGesamt: 8.70,        // Durchschnitt gewichtet (Pendler 35% + Freizeit 50% + Einkauf 15%)

  // Betriebstage pro Jahr
  werktage: 250,
  samstage: 52,
  sonntage: 63,
  tageFaktor: 330,        // Äquivalente Jahrestage (250×1.0 + 52×0.8 + 63×0.5)

  // Reisezeitgewinne: Durchschnittliche Einsparung pro Fahrt mit U9 (Minuten)
  // Quelle: MVG Projektbeschreibung U9, eigene Schätzung aus Reisezeitmatrizen
  durchschnittlZeitersparnis: 4.5,  // Min./Fahrt (Stammstrecken-Entlastung → weniger Wartezeit)

  // Investitionskosten U9 (Mrd. EUR)
  investitionskostenMrd: 3.1,       // Quelle: mvg.de/projekte/u9

  // Betriebskosten-Delta pro Jahr (Mrd. EUR) — Mehrkosten neuer Linie
  betriebskostenDeltaMrd: 0.035,    // ~35 Mio EUR/Jahr Schätzung

  // Prognosehorizont (Jahre) — Standard Standardisierte Bewertung
  prognosehorizont: 30,

  // ✅ KORRIGIERT: Diskontierungszinssatz 1,7 % (BVWP 2030 / Standardisierte Bewertung 2016+)
  // Quelle: bvwp-projekte.de/glossar.html
  diskontierungssatz: 0.017,        // 1,7 % p.a. — NICHT 3% (das war Version 2006)

  // CO₂-Vermeidungskosten (NEU in Fortschreibung 2022 — Lebenszyklus-Treibhausgase)
  // Quelle: Omnibusrevue-Bericht zur Fortschreibung; UBA Leitfaden 2022
  co2VermeidungskostenEurProTonne: 195,  // EUR/t CO₂-Äq. (UBA 2022, Preisbasis 2016; ~170 EUR Preisbasis 2012)
  co2EinsparungKgProPKWFahrt: 1.8,       // kg CO₂/Fahrt (PKW-Durchschnitt × 8,5 km)
}

/**
 * Berechnet den Barwert einer jährlichen Zahlung über n Jahre bei Zinssatz r
 */
export function berechneBarwertFaktor(jahre, zinssatz) {
  return (1 - Math.pow(1 + zinssatz, -jahre)) / zinssatz
}
