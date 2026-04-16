/**
 * U-Bahn-Netzwerk München (vereinfacht)
 * Nur Kernabschnitte, die für die U9-Wirkungsanalyse relevant sind
 *
 * Kapazitäten: Züge/Stunde/Richtung × Plätze/Zug
 * Quelle: MVG Betriebsdaten, Wikipedia U-Bahn München
 */

export const lines = [
  {
    id: 'U1',
    name: 'U1',
    color: '#3d7c2a',
    segments: [
      { from: 'Olympia-Einkaufszentrum', to: 'Hauptbahnhof', zoneFrom: 7, zoneTo: 2 },
      { from: 'Hauptbahnhof', to: 'Sendlinger Tor', zoneFrom: 2, zoneTo: 0 },
      { from: 'Sendlinger Tor', to: 'Mangfallplatz', zoneFrom: 0, zoneTo: 7 },
    ],
  },
  {
    id: 'U2',
    name: 'U2',
    color: '#c4122f',
    segments: [
      { from: 'Feldmoching', to: 'Hauptbahnhof', zoneFrom: 7, zoneTo: 2 },
      { from: 'Hauptbahnhof', to: 'Sendlinger Tor', zoneFrom: 2, zoneTo: 0 },
      { from: 'Sendlinger Tor', to: 'Messestadt Ost', zoneFrom: 0, zoneTo: 7 },
    ],
  },
  {
    id: 'U3',
    name: 'U3',
    color: '#ec6726',
    segments: [
      { from: 'Moosach', to: 'Münchner Freiheit', zoneFrom: 7, zoneTo: 5 },
      { from: 'Münchner Freiheit', to: 'Odeonsplatz', zoneFrom: 5, zoneTo: 4 },
      { from: 'Odeonsplatz', to: 'Sendlinger Tor', zoneFrom: 4, zoneTo: 0 },
      { from: 'Sendlinger Tor', to: 'Fürstenried West', zoneFrom: 0, zoneTo: 7 },
    ],
  },
  {
    id: 'U6',
    name: 'U6',
    color: '#0065ae',
    segments: [
      { from: 'Garching-Forschungszentrum', to: 'Fröttmaning', zoneFrom: 7, zoneTo: 6 },
      { from: 'Fröttmaning', to: 'Münchner Freiheit', zoneFrom: 6, zoneTo: 5 },
      { from: 'Münchner Freiheit', to: 'Odeonsplatz', zoneFrom: 5, zoneTo: 4 },
      { from: 'Odeonsplatz', to: 'Sendlinger Tor', zoneFrom: 4, zoneTo: 0 },
      { from: 'Sendlinger Tor', to: 'Klinikum Großhadern', zoneFrom: 0, zoneTo: 7 },
    ],
  },
  {
    id: 'U4',
    name: 'U4',
    color: '#00a984',
    segments: [
      { from: 'Westendstraße', to: 'Schwanthalerhöhe', zoneFrom: 7, zoneTo: 1 },
      { from: 'Schwanthalerhöhe', to: 'Hauptbahnhof', zoneFrom: 1, zoneTo: 2 },
      { from: 'Hauptbahnhof', to: 'Arabellapark', zoneFrom: 2, zoneTo: 7 },
    ],
  },
  {
    id: 'U5',
    name: 'U5',
    color: '#b47c00',
    segments: [
      { from: 'Laimer Platz', to: 'Schwanthalerhöhe', zoneFrom: 7, zoneTo: 1 },
      { from: 'Schwanthalerhöhe', to: 'Hauptbahnhof', zoneFrom: 1, zoneTo: 2 },
      { from: 'Hauptbahnhof', to: 'Neuperlach Süd', zoneFrom: 2, zoneTo: 7 },
    ],
  },
]

export const u9Line = {
  id: 'U9',
  name: 'U9',
  color: '#9333ea',
  segments: [
    { from: 'Implerstraße', to: 'Poccistraße', zoneFrom: 0, zoneTo: 0 },
    { from: 'Poccistraße', to: 'Hauptbahnhof', zoneFrom: 0, zoneTo: 2 },
    { from: 'Hauptbahnhof', to: 'Pinakotheken', zoneFrom: 2, zoneTo: 3 },
    { from: 'Pinakotheken', to: 'Elisabethplatz', zoneFrom: 3, zoneTo: 4 },
    { from: 'Elisabethplatz', to: 'Münchner Freiheit', zoneFrom: 4, zoneTo: 5 },
  ],
}

/**
 * Kritische Streckenabschnitte für die Belastungsanalyse
 * baseLoad: Tägliche Fahrgäste OHNE U9 (Quelle: MVG, Wikipedia)
 * capacity: Maximale tägliche Kapazität (Züge × Plätze × Betriebsstunden)
 */
export const criticalSegments = [
  {
    id: 'stammstrecke1',
    name: 'Stammstrecke 1 (U3/U6)',
    description: 'Münchner Freiheit – Odeonsplatz – Sendlinger Tor',
    lines: ['U3', 'U6'],
    baseLoad: 240000,
    capacity: 320000,
    zones: [5, 4, 0],
    color: '#0065ae',
  },
  {
    id: 'stammstrecke2',
    name: 'Stammstrecke 2 (U1/U2)',
    description: 'Hauptbahnhof – Sendlinger Tor',
    lines: ['U1', 'U2'],
    baseLoad: 200000,
    capacity: 280000,
    zones: [2, 0],
    color: '#c4122f',
  },
  {
    id: 'u4u5_core',
    name: 'U4/U5 Kern',
    description: 'Schwanthalerhöhe – Hauptbahnhof',
    lines: ['U4', 'U5'],
    baseLoad: 120000,
    capacity: 200000,
    zones: [1, 2],
    color: '#00a984',
  },
  {
    id: 'u6_nord',
    name: 'U6 Nord',
    description: 'Fröttmaning – Münchner Freiheit',
    lines: ['U6'],
    baseLoad: 95000,
    capacity: 160000,
    zones: [6, 5],
    color: '#0065ae',
  },
  {
    id: 'u9_core',
    name: 'U9 Kernabschnitt',
    description: 'Hauptbahnhof – Münchner Freiheit',
    lines: ['U9'],
    baseLoad: 0,
    capacity: 180000,
    zones: [2, 3, 4, 5],
    color: '#9333ea',
  },
]

/**
 * SVG-Pfade für die schematische Netzdarstellung
 * Koordinaten relativ zum ViewBox 0 0 600 600
 */
export const networkPaths = {
  U1: {
    path: 'M 120,60 L 250,300 L 250,500 L 280,580',
    stations: [
      { name: 'OEZ', x: 120, y: 60 },
      { name: 'Hbf', x: 250, y: 300 },
      { name: 'Sendl. Tor', x: 250, y: 420 },
      { name: 'Mangfallpl.', x: 280, y: 580 },
    ],
  },
  U2: {
    path: 'M 350,20 L 250,300 L 250,420 L 520,560',
    stations: [
      { name: 'Feldmoching', x: 350, y: 20 },
      { name: 'Hbf', x: 250, y: 300 },
      { name: 'Sendl. Tor', x: 250, y: 420 },
      { name: 'Messestadt', x: 520, y: 560 },
    ],
  },
  U3: {
    path: 'M 80,120 L 400,120 Q 430,120 430,150 L 380,220 L 300,300 L 250,420 L 120,580',
    stations: [
      { name: 'Moosach', x: 80, y: 120 },
      { name: 'Mü. Freiheit', x: 400, y: 120 },
      { name: 'Odeonspl.', x: 380, y: 220 },
      { name: 'Sendl. Tor', x: 250, y: 420 },
      { name: 'Fürstenried', x: 120, y: 580 },
    ],
  },
  U6: {
    path: 'M 420,10 L 420,60 L 400,120 L 380,220 L 250,420 L 100,540',
    stations: [
      { name: 'Garching', x: 420, y: 10 },
      { name: 'Fröttmaning', x: 420, y: 60 },
      { name: 'Mü. Freiheit', x: 400, y: 120 },
      { name: 'Odeonspl.', x: 380, y: 220 },
      { name: 'Sendl. Tor', x: 250, y: 420 },
      { name: 'Klinikum', x: 100, y: 540 },
    ],
  },
  U4: {
    path: 'M 80,350 L 200,380 L 250,300 L 530,300',
    stations: [
      { name: 'Westendstr.', x: 80, y: 350 },
      { name: 'Schwanth.', x: 200, y: 380 },
      { name: 'Hbf', x: 250, y: 300 },
      { name: 'Arabellapark', x: 530, y: 300 },
    ],
  },
  U5: {
    path: 'M 60,400 L 200,380 L 250,300 L 540,450',
    stations: [
      { name: 'Laimer Pl.', x: 60, y: 400 },
      { name: 'Schwanth.', x: 200, y: 380 },
      { name: 'Hbf', x: 250, y: 300 },
      { name: 'Neuperlach', x: 540, y: 450 },
    ],
  },
  U9: {
    path: 'M 250,500 L 250,420 L 250,300 L 300,220 L 380,180 L 400,120',
    stations: [
      { name: 'Implerstr.', x: 250, y: 500 },
      { name: 'Poccistr.', x: 250, y: 420 },
      { name: 'Hbf', x: 250, y: 300 },
      { name: 'Pinakotheken', x: 300, y: 220 },
      { name: 'Elisabethpl.', x: 380, y: 180 },
      { name: 'Mü. Freiheit', x: 400, y: 120 },
    ],
  },
}
