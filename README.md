# U9 Impact Explorer

**Interaktives 4-Stufen-Verkehrsmodell zur Wirkungsanalyse der U9-Entlastungsspange München**

Die U9 soll die überlastete Stammstrecke 1 (U3/U6) um bis zu 44% entlasten. Dieses Tool macht die Wirkungsmechanismen interaktiv erlebbar: Reisezeitgewinne, Modal-Split-Verschiebungen, Kapazitätsauslastung — auf Basis echter Münchner Verkehrsdaten.

→ **[Live Demo](https://gt-code-24.github.io/U9-Impact-Explorer-Traffic-Simulation-with-Formula-Transparency/)** &nbsp;|&nbsp; Quellcode unten

---

## Was das Modell leistet

| Szenario | Fragestellung |
|---|---|
| Status quo 2024 | Wie belastet ist die Stammstrecke heute? |
| Mit U9 | Wie stark entlastet die neue Linie? |
| Wachstum 2035 (+12%) | Reicht die Entlastung trotz Bevölkerungszuwachs? |
| Mobilitätswende 2035 | Was, wenn 80% Umweltverbund-Ziel erreicht wird? |

Alle Parameter sind live anpassbar: Kraftstoffpreis, Deutschlandticket-Preis, Radinfrastrukturqualität, Bevölkerungswachstum, Wegerate.

---

## Implementierte Methodik

Das Modell folgt dem klassischen **4-Stufen-Ansatz** mit iterativer Kapazitätsrückkopplung:

```
Stufe 1 — Verkehrserzeugung
  Bevölkerungs- und beschäftigungsbasierte Trip Rates (SrV 2023 München)

Stufe 2 — Verkehrsverteilung
  Gravitationsmodell mit Tanner-Impedanz (t^α · e^{-β·t})
  Furness-Iteration zur Skalierungskorrektur (Konvergenz < 1%)

Stufe 3 — Verkehrsmittelwahl
  Nested Logit (2 Nests: motorisiert vs. nicht-motorisiert)
  Empirische ASC aus Shoman & Moreno (2021), kalibriert auf Münchner Modal Split

Stufe 4 — Umlegung
  All-or-Nothing auf schematischem Netz
  Kapazitätsrückkopplung (Crowding Penalty) nach Weiner (1997)
  Konvergenzkriterium: ÖPNV-Anteil-Änderung < 0,1% zwischen Iterationen
```

**Nutzen-Kosten-Analyse** nach Standardisierter Bewertung 2016+ (BMV), inkl. CO₂-Fortschreibung 2022, Diskontierungssatz 1,7% p.a. (BVWP 2030).

---

## Bewusste Vereinfachungen

Das Modell ist eine methodische Arbeitsprobe, kein Produktivmodell. Wichtige Vereinfachungen:

- **8 Verkehrszonen** statt 500+ Verkehrszellen (reale Modelle: VISUM/MATSim-Zellraster)
- **All-or-Nothing-Umlegung** statt stochastischem Gleichgewicht (SUE)
- **Keine Wegezweck-Differenzierung** (Pendler vs. Freizeit vs. Einkauf)
- **Nest-Parameter aus Literatur**, nicht aus SP/RP-Erhebung geschätzt
- **Stochastische Variation** nicht modelliert (deterministische Ergebnisse)

Ein Produktivmodell würde RP/SP-Daten, MATSim-Kalibrierung und SUE-Umlegung einsetzen.

---

## Visualisierungen

| Tab | Inhalt |
|---|---|
| Netzbelastung | Schematisches U-Bahn-Netz mit Kapazitätsauslastung pro Abschnitt |
| Modal Split | Balkendiagramm Verkehrsmittelverteilung mit Szenariovergleich |
| Geographische Karte | Leaflet-Karte mit Zonendarstellung über München |
| Belastungsvergleich | Stammstrecken-Entlastung je Streckenabschnitt |
| OD-Matrix | Fahrtenmatrix zwischen den 8 Zonen |
| Sensitivität | Wie reagiert das Modell auf Parameteränderungen? |
| Validierung | Kalibrierungsprüfung gegen Zielvorgaben (SrV 2023) |
| Methodik | Vollständige Formel-Dokumentation mit Quellenangaben |

Jede KPI-Karte enthält einen **Formel-Button** (Taschenrechner-Icon) mit dem vollständigen Rechenweg.

---

## Datenquellen

| Datenbasis | Quelle |
|---|---|
| Modal Split München 2023 | SrV (Mobilität in Städten), Stat. Amt München |
| Bevölkerung & Beschäftigung | Statistisches Amt München, Stadtbezirke 2024 |
| MVG Betriebsdaten | MVG Jahresbericht 2024 |
| Logit-Parameter | Shoman & Moreno (2021), Transportation Research Record 2675(5) |
| Impedanzfunktion | AETRANSPORT "Alternative Gravity Modelling Approaches" |
| Kapazitätsrückkopplung | Weiner (1997), 4-Stufen-Modell mit Feedback |
| NKA-Methodik | BMV: Standardisierte Bewertung 2016+, Fortschreibung 01.07.2022 |
| NKA-Parameter | BVWP 2030 Methodenhandbuch, Heimerl (1994) OR Spectrum |
| CO₂-Vermeidungskosten | UBA Leitfaden 2022 (195 EUR/t CO₂-Äq.) |
| Investitionskosten U9 | mvg.de/projekte/u9 (3,1 Mrd. EUR) |

---

## Tech Stack

```
React 19   Vite   Tailwind CSS 4   Recharts   D3.js   Leaflet   Radix UI
```

Vollständig clientseitig — kein Backend, kein Server. Modellberechnung in Echtzeit bei jeder Parameteränderung. PDF-Export über html2pdf.js.

---

## Lokale Installation

```bash
git clone https://github.com/GT-Code-24/U9-Impact-Explorer-Traffic-Simulation-with-Formula-Transparency.git
cd U9-Impact-Explorer-Traffic-Simulation-with-Formula-Transparency
npm install
npm run dev
```

Öffne `http://localhost:5173` im Browser.

---

## Über dieses Projekt

Eigeninitiativ entwickelt als methodische Arbeitsprobe im Bereich Verkehrsmodellierung und Datenanalyse. Das Projekt demonstriert die Anwendung verkehrsplanerischer Standardmethoden auf eine aktuelle Münchner Infrastrukturentscheidung.

**Gabriel Tsonyev** — Business Analyst, Verkehrsplanung & Digitalisierung  
[LinkedIn](https://www.linkedin.com/in/gabriel-tsonyev) · [GitHub](https://github.com/GT-Code-24)
