/**
 * Formelsammlung für KPI-Erklärungen
 * Zeigt Rechenweg für jede wichtige Kennzahl
 */

export const formulas = {
  modalSplitOepnv: {
    title: 'ÖPNV-Anteil (Modal Split)',
    keyFormula: 'P(ÖPNV) = P(Nest_motorisiert) × P(ÖPNV | Nest_motorisiert)',

    steps: [
      {
        title: 'Schritt 1: Utility-Werte (Nutzen pro Modus)',
        description: 'Berechnung des erwarteten Nutzens für Auto und ÖPNV basierend auf Zeit, Kosten und Komfort.',
        equations: [
          'V_car = ASC_car + β_time × TT_car + β_cost × Cost_car',
          'V_oepnv = ASC_oepnv + β_time × TT_oepnv + β_cost × Cost_oepnv + β_comfort × Comfort + Crowding_penalty',
        ],
        explanation: 'ASC = Alternative Specific Constant (Grundnutzen); β = Koeffizient; TT = Reisezeit (min); Cost = Kosten (€); Comfort = Komfortbonus (bei U9)'
      },
      {
        title: 'Schritt 2: Logit-Wahrscheinlichkeit innerhalb Nest',
        description: 'Nested Logit: bedingte Wahrscheinlichkeit gegeben das Nest "Motorisiert".',
        equations: [
          'P(ÖPNV | Nest_motorisiert) = exp(V_oepnv / λ_motorisiert) / [exp(V_car / λ_motorisiert) + exp(V_oepnv / λ_motorisiert)]',
        ],
        explanation: 'λ_motorisiert = 0.7 (Nest-Skalierungsparameter); λ < 1 bedeutet stärkere Korrelation innerhalb des Nests (ÖPNV & Auto ähneln sich mehr als Rad/Fuß)'
      },
      {
        title: 'Schritt 3: Logsum & Nest-Wahrscheinlichkeit',
        description: 'Berechnung der Wahrscheinlichkeit, überhaupt ein motorisiertes Verkehrsmittel zu wählen.',
        equations: [
          'I_motorisiert = λ_motorisiert × log[exp(V_car/λ_motorisiert) + exp(V_oepnv/λ_motorisiert)]',
          'P(Nest_motorisiert) = exp(I_motorisiert) / [exp(I_motorisiert) + exp(I_muskelbetrieben)]',
        ],
        explanation: 'I = Logsum (erwarteter Maximalnutzen des Nests); P(Nest) = Wahrscheinlichkeit für motorisierte vs. nicht-motorisierte Modi'
      },
      {
        title: 'Schritt 4: Gesamtwahrscheinlichkeit',
        description: 'Finale ÖPNV-Wahrscheinlichkeit = Nest-Wahrscheinlichkeit × bedingte Wahrscheinlichkeit.',
        equations: [
          'P(ÖPNV) = P(Nest_motorisiert) × P(ÖPNV | Nest_motorisiert)',
        ],
        explanation: 'Dieser Wert wird über alle OD-Paare aufsummiert → Gesamtanteil im Modal Split'
      },
    ],

    parameters: [
      { name: 'ASC_oepnv', value: '0.40', unit: 'Grundnutzen', source: 'Shoman & Moreno 2021' },
      { name: 'β_time', value: '-0.055', unit: 'EUR/min', source: 'Shoman & Moreno 2021' },
      { name: 'β_cost', value: '-0.10', unit: '1/EUR', source: 'Kalibriert auf München' },
      { name: 'β_comfort', value: '0.20', unit: 'Utility-Einheiten', source: 'U9-Komfortbonus (neue Züge)' },
      { name: 'λ_motorisiert', value: '0.7', unit: 'Nest-Parameter', source: 'Munizaga et al. 2000' },
      { name: 'λ_muskelbetrieben', value: '0.5', unit: 'Nest-Parameter', source: 'Munizaga et al. 2000' },
    ],

    sources: [
      { author: 'Munizaga et al. (2000)', title: 'Mixed Logit vs. Nested Logit and Probit Models', journal: 'DICTUC' },
      { author: 'Shoman & Moreno (2021)', title: 'Exploring Preferences for Transportation Modes in Munich', journal: 'Transportation Research Record 2675(5)' },
      { author: 'McFadden & Train (2000)', title: 'Mixed MNL Models for Discrete Response', journal: 'Journal of Applied Econometrics' },
    ]
  },

  u9Fahrgaeste: {
    title: 'U9 Kernabschnitt Fahrgäste/Tag',
    keyFormula: 'Fahrgäste_U9 = Σ_{i,j ∈ U9-Korridor} T_ij^ÖPNV × f_UBahn × δ_U9(i,j)',

    steps: [
      {
        title: 'Schritt 1: ÖPNV-Fahrten nach OD-Paar',
        description: 'Aus Stufe 3 (Moduswahl): Anzahl ÖPNV-Fahrten pro Zone-zu-Zone Relation.',
        equations: [
          'T_ij^ÖPNV = [OD-Matrix aus Stufe 2] × [ÖPNV-Anteil aus Stufe 3]',
        ],
        explanation: 'T_ij = Gesamtwege von Zone i zu Zone j; ÖPNV-Anteil = P(ÖPNV) aus Nested Logit'
      },
      {
        title: 'Schritt 2: U-Bahn-Anteil am ÖPNV',
        description: 'Nicht alle ÖPNV-Fahrten nutzen die U-Bahn (manche Tram/Bus).',
        equations: [
          'f_UBahn = 0.55  (55% des gesamten ÖPNV sind U-Bahn)',
        ],
        explanation: 'Kalibriert auf MVG-Daten: U-Bahn trägt 55% des ÖPNV-Verkehrs, Rest verteilt sich auf Tram/Bus'
      },
      {
        title: 'Schritt 3: Routing zur U9',
        description: 'Nur OD-Paare im U9-Korridor (Sendling ↔ Schwabing) nutzen die U9.',
        equations: [
          'δ_U9(i,j) = { 1 falls i,j ∈ {0,2,3,4,5}; 0 sonst }',
          '(Zone 0=Sendling, 2=Hbf, 3=Pinakotheken, 4=Elisabethplatz, 5=Schwabing)',
        ],
        explanation: 'All-or-Nothing-Routing: OD-Paare im Korridor nutzen 100% die U9 (nicht Stammstrecke)'
      },
      {
        title: 'Schritt 4: Summation',
        description: 'Addiere alle U9-Fahrten über alle relevanten OD-Paare.',
        equations: [
          'Fahrgäste_U9 = Σ T_ij^ÖPNV × 0.55 × δ_U9(i,j)',
        ],
        explanation: 'Ergebnis = tägliche Fahrgäste im U9-Kernabschnitt (Prognose: ~90.000 nach MVG)'
      },
    ],

    parameters: [
      { name: 'f_UBahn', value: '0.55 (55%)', unit: 'Anteil', source: 'MVG Daten' },
      { name: 'U9-Zonen', value: '0,2,3,4,5', unit: 'Zone IDs', source: 'Netzwerk-Definition' },
      { name: 'Kapazität U9', value: '180.000', unit: 'Pax/Tag', source: 'u9Params' },
    ],

    sources: [
      { author: 'MVG (2024)', title: 'U9-Entlastungsspange Projektbeschreibung', url: 'mvg.de/projekte/u9' },
      { author: 'Wikipedia (2024)', title: 'Münchner U-Bahn Fahrgastzahlen' },
    ]
  },

  nkv: {
    title: 'Nutzen-Kosten-Verhältnis (NKV)',
    keyFormula: 'NKV = Barwert(Nutzen) / Barwert(Kosten)',

    steps: [
      {
        title: 'Schritt 1: Jahresnutzen berechnen',
        description: 'Summe aller Nutzenkomponenten pro Jahr.',
        equations: [
          'Jahresnutzen = Zeitersparnis-Nutzen + Externe-Kosten-Reduktion + CO₂-Nutzen',
          '             = (ΔT × Fahrten × WdR) + (Modal-Shift × 0.05€/km × 8,5km) + (CO₂-Einsparung × 195€/t)',
        ],
        explanation: 'WdR = Wert der Reisezeit (8,70€/h gemäß BMV); ΔT = durchschnittliche Zeiteinsparung pro U9-Fahrt; CO₂ = kg CO₂ pro PKW-Fahrt × 1.8'
      },
      {
        title: 'Schritt 2: Jahresnutzen auf 30 Jahre hochrechnen (Barwert)',
        description: 'Diskontierung zukünftiger Nutzen auf Gegenwartswert.',
        equations: [
          'BWF = (1 - (1 + r)^-n) / r',
          'Barwert(Nutzen) = Jahresnutzen × BWF',
          'mit r = 0.017 (1,7% p.a.), n = 30 Jahre, BWF ≈ 25,8',
        ],
        explanation: 'Diskontierungssatz 1,7% gemäß BVWP 2030 (Standardisierte Bewertung 2016+); 30 Jahre = Standard Planungshorizont'
      },
      {
        title: 'Schritt 3: Gesamtkosten (Investition + Betrieb)',
        description: 'Summe aller Kosten über Planungshorizont (diskontiert).',
        equations: [
          'Gesamtkosten = Investitionskosten + Barwert(Betriebskosten-Delta)',
          '             = 3,1 Mrd € + (0,035 Mrd €/a × 25,8)',
          '             ≈ 3,1 Mrd € + 0,90 Mrd € = 4,0 Mrd €',
        ],
        explanation: 'Investitionskosten U9 = 3,1 Mrd € (Quelle: mvg.de); Betriebskosten-Delta ≈ 35 Mio €/Jahr (Mehrkosten neue Linie)'
      },
      {
        title: 'Schritt 4: NKV-Verhältnis',
        description: 'Nutzen durch Kosten dividiert.',
        equations: [
          'NKV = Barwert(Nutzen) / Gesamtkosten',
          'NKV ≥ 1,0 → volkswirtschaftlich gerechtfertigt',
          'NKV ≥ 1,5 → sehr rentabel',
        ],
        explanation: 'NKV > 1 bedeutet: Für jeden Euro Kosten entstehen mindestens 1 Euro Nutzen'
      },
    ],

    parameters: [
      { name: 'WdR gesamt', value: '8,70 €/h', unit: 'Wert Reisezeit', source: 'BMV 2016, Anhang A3' },
      { name: 'WdR Pendler', value: '9,80 €/h', unit: 'Berufswege', source: 'BMV 2016' },
      { name: 'WdR Freizeit', value: '7,20 €/h', unit: 'Freizeitwege', source: 'BMV 2016' },
      { name: 'Diskontierungssatz', value: '1,7% p.a.', unit: 'Zinssatz', source: 'BVWP 2030' },
      { name: 'Prognosehorizont', value: '30 Jahre', unit: 'Betrachtungszeitraum', source: 'Standardisierte Bewertung 2016+' },
      { name: 'CO₂-Vermeidungskosten', value: '195 €/t', unit: 'Preis CO₂-Einsparung', source: 'UBA 2022, Fortschreibung' },
      { name: 'Investitionskosten U9', value: '3,1 Mrd €', unit: '2012-Preise', source: 'mvg.de/projekte/u9' },
      { name: 'Betriebskosten-Delta', value: '35 Mio €/a', unit: 'Mehrkosten/Jahr', source: 'Schätzung' },
    ],

    sources: [
      { author: 'BMV (2016)', title: 'Standardisierte Bewertung von Verkehrswegeinvestitionen 2016+', url: 'bmv.de' },
      { author: 'BVWP 2030 Glossar', title: 'Diskontierungssatz', url: 'bvwp-projekte.de/glossar' },
      { author: 'UBA (2022)', title: 'Leitfaden zur Fortschreibung Umweltkosten', url: 'uba.de' },
      { author: 'Heimerl (1994)', title: 'Standardisierte Bewertung von Verkehrswegeinvestitionen', journal: 'OR Spectrum' },
    ]
  },

  stammstrecke1Relief: {
    title: 'Stammstrecke 1 Entlastung (%)',
    keyFormula: 'Entlastung = (Load_ohne_U9 - Load_mit_U9) / Load_ohne_U9 × 100%',

    steps: [
      {
        title: 'Schritt 1: Baseline-Last (ohne U9)',
        description: 'Tägliche Fahrgäste auf Stammstrecke 1 im Status quo.',
        equations: [
          'Load_baseline = 240.000 Pax/Tag',
        ],
        explanation: 'Quelle: MVG Betriebsdaten 2024 (Stammstrecke 1 = U3/U6 Korridor: Münchner Freiheit – Odeonsplatz – Sendlinger Tor)'
      },
      {
        title: 'Schritt 2: Mit-U9-Last (Modellprognose)',
        description: 'U9 zieht OD-Paare im Korridor von Stammstrecke ab.',
        equations: [
          'Load_mit_U9 = Load_baseline - [ÖPNV-Fahrten die zur U9 wechseln]',
          '            = 240.000 - 79.200 (geschätzt, basierend auf Moduswahl)',
          '            ≈ 160.800 Pax/Tag',
        ],
        explanation: 'Berechnung: Modal-Shift-Trips × Anteil U9-Routing × U-Bahn-Anteil'
      },
      {
        title: 'Schritt 3: Entlastungswirkung',
        description: 'Prozentuale Reduktion der Belastung.',
        equations: [
          'Entlastung = (240.000 - 160.800) / 240.000 × 100%',
          '           = 79.200 / 240.000 × 100%',
          '           = 33,0%',
        ],
        explanation: 'MVG-Prognose: bis zu 44% Entlastung; unser konservatives Modell: ~33%'
      },
    ],

    parameters: [
      { name: 'Load_baseline', value: '240.000', unit: 'Pax/Tag', source: 'MVG 2024' },
      { name: 'Kapazität Stammstrecke 1', value: '320.000', unit: 'Pax/Tag', source: 'MVG Betriebsdaten' },
      { name: 'U9-Prognose', value: '90.000', unit: 'Pax/Tag', source: 'mvg.de/projekte/u9' },
    ],

    sources: [
      { author: 'MVG (2024)', title: 'U9-Entlastungsspange: Fahrgastprognose', url: 'mvg.de' },
      { author: 'Hörl et al. (2024)', title: 'Public transport across models and scales: A case study of the Munich network', journal: 'PLOS ONE' },
    ]
  },

  umweltverbund: {
    title: 'Umweltverbund-Anteil',
    keyFormula: 'Umweltverbund = ÖPNV + Fahrrad + Fuß = P_oepnv + P_bike + P_walk',

    steps: [
      {
        title: 'Schritt 1: Modal-Split aus Nested Logit',
        description: 'Wie bei ÖPNV-Anteil, aber für alle 4 Modi.',
        equations: [
          'P(Auto) = P(Motorisiert) × P(Auto | Motorisiert)',
          'P(ÖPNV) = P(Motorisiert) × P(ÖPNV | Motorisiert)',
          'P(Rad) = P(Muskelbetrieben) × P(Rad | Muskelbetrieben)',
          'P(Fuß) = P(Muskelbetrieben) × P(Fuß | Muskelbetrieben)',
        ],
        explanation: 'Zwei Nests: Motorisiert (Auto + ÖPNV, λ=0.7) und Muskelbetrieben (Rad + Fuß, λ=0.5)'
      },
      {
        title: 'Schritt 2: Umweltverbund-Definition',
        description: 'Nachhaltige Verkehrsmittel (nicht motorisiert).',
        equations: [
          'Umweltverbund = P(ÖPNV) + P(Rad) + P(Fuß)',
        ],
        explanation: 'Ziel München 2035: 80% Umweltverbund (Mobilitätsstrategie muenchenunterwegs.de)'
      },
      {
        title: 'Schritt 3: Ergebnis',
        description: 'Gesamtanteil ohne MIV.',
        equations: [
          'Umweltverbund % = [P(ÖPNV) + P(Rad) + P(Fuß)] × 100%',
        ],
        explanation: 'Typisches Ergebnis München heute: ~66% (davon ÖPNV 24%, Rad 21%, Fuß 21%)'
      },
    ],

    parameters: [
      { name: 'Zielwert 2035', value: '80%', unit: 'Umweltverbund', source: 'Mobilitätsstrategie München' },
      { name: 'Baseline 2023', value: '66%', unit: 'Umweltverbund', source: 'SrV München 2023' },
    ],

    sources: [
      { author: 'Stadt München (2023)', title: 'Mobilitätsstrategie 2035', url: 'muenchenunterwegs.de' },
      { author: 'TU Dresden (2023)', title: 'Mobilität in Städten – SrV 2023 München', journal: 'SrV' },
    ]
  },
}
