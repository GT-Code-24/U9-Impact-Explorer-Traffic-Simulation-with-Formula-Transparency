/**
 * 8 Verkehrszonen entlang des U9-Korridors München
 * Quellen: Statistisches Amt München, Stadtbezirke 2024
 *
 * Jede Zone enthält:
 * - Bevölkerung und Beschäftigung (Basis 2024)
 * - SVG-Koordinaten für die schematische Darstellung
 * - Zuordnung zu U-Bahn-Linien
 */

export const zones = [
  {
    id: 0,
    name: 'Sendling',
    shortName: 'SEN',
    station: 'Implerstraße',
    population: 40000,
    employment: 15000,
    x: 250,
    y: 500,
    lines: ['U3', 'U6', 'U9'],
  },
  {
    id: 1,
    name: 'Schwanthalerhöhe',
    shortName: 'SCH',
    station: 'Schwanthalerhöhe',
    population: 30000,
    employment: 25000,
    x: 200,
    y: 380,
    lines: ['U4', 'U5'],
  },
  {
    id: 2,
    name: 'Hauptbahnhof',
    shortName: 'HBF',
    station: 'Hauptbahnhof',
    population: 15000,
    employment: 80000,
    x: 250,
    y: 300,
    lines: ['U1', 'U2', 'U4', 'U5', 'U9'],
  },
  {
    id: 3,
    name: 'Maxvorstadt-West',
    shortName: 'MVW',
    station: 'Pinakotheken',
    population: 25000,
    employment: 30000,
    x: 300,
    y: 220,
    lines: ['U9'],
  },
  {
    id: 4,
    name: 'Maxvorstadt-Ost',
    shortName: 'MVO',
    station: 'Elisabethplatz',
    population: 35000,
    employment: 20000,
    x: 380,
    y: 180,
    lines: ['U9'],
  },
  {
    id: 5,
    name: 'Schwabing',
    shortName: 'SWB',
    station: 'Münchner Freiheit',
    population: 45000,
    employment: 25000,
    x: 400,
    y: 120,
    lines: ['U3', 'U6', 'U9'],
  },
  {
    id: 6,
    name: 'Schwabing-Freimann',
    shortName: 'FRM',
    station: 'Schwabing-Freimann',
    population: 80000,
    employment: 35000,
    x: 420,
    y: 60,
    lines: ['U6'],
  },
  {
    id: 7,
    name: 'Rest-München',
    shortName: 'MUC',
    station: '(aggregiert)',
    population: 1240000,
    employment: 670000,
    x: 350,
    y: 350,
    lines: [],
  },
]

/**
 * Reisezeitmatrix OHNE U9 (Minuten, symmetrisch)
 * Generalisierte Reisezeit mit ÖPNV (inkl. Umsteigezeit)
 * Quelle: MVG Fahrplanauskunft, gerundete Durchschnittswerte
 */
export const travelTimeWithoutU9 = [
  //SEN  SCH  HBF  MVW  MVO  SWB  FRM  MUC
  [  0,  12,  10,  18,  20,  15,  20,  22], // SEN
  [ 12,   0,   5,  14,  16,  18,  22,  18], // SCH
  [ 10,   5,   0,  12,  14,  15,  20,  15], // HBF
  [ 18,  14,  12,   0,   8,  12,  16,  18], // MVW
  [ 20,  16,  14,   8,   0,   8,  12,  16], // MVO
  [ 15,  18,  15,  12,   8,   0,   6,  14], // SWB
  [ 20,  22,  20,  16,  12,   6,   0,  18], // FRM
  [ 22,  18,  15,  18,  16,  14,  18,   0], // MUC
]

/**
 * Reisezeitmatrix MIT U9 (Minuten)
 * U9-Korridor (SEN-HBF-MVW-MVO-SWB) verkürzt Reisezeiten
 * auf diesem Korridor um ca. 3-6 Minuten
 */
export const travelTimeWithU9 = [
  //SEN  SCH  HBF  MVW  MVO  SWB  FRM  MUC
  [  0,  12,   8,  12,  14,  12,  18,  22], // SEN
  [ 12,   0,   5,  14,  16,  18,  22,  18], // SCH
  [  8,   5,   0,   8,  10,  12,  18,  15], // HBF
  [ 12,  14,   8,   0,   5,   8,  14,  18], // MVW
  [ 14,  16,  10,   5,   0,   5,  10,  16], // MVO
  [ 12,  18,  12,   8,   5,   0,   6,  14], // SWB
  [ 18,  22,  18,  14,  10,   6,   0,  18], // FRM
  [ 22,  18,  15,  18,  16,  14,  18,   0], // MUC
]

/**
 * Reisezeit MIV (Auto) zwischen Zonen (Minuten)
 * Berücksichtigt Münchner Stausituation (Spitzenstunde)
 */
export const travelTimeCar = [
  //SEN  SCH  HBF  MVW  MVO  SWB  FRM  MUC
  [  0,  10,  12,  15,  16,  18,  22,  20], // SEN
  [ 10,   0,   8,  12,  14,  16,  20,  18], // SCH
  [ 12,   8,   0,  10,  12,  14,  18,  15], // HBF
  [ 15,  12,  10,   0,   8,  10,  14,  16], // MVW
  [ 16,  14,  12,   8,   0,   8,  12,  15], // MVO
  [ 18,  16,  14,  10,   8,   0,   8,  14], // SWB
  [ 22,  20,  18,  14,  12,   8,   0,  16], // FRM
  [ 20,  18,  15,  16,  15,  14,  16,   0], // MUC
]

/**
 * Reisezeit Fahrrad zwischen Zonen (Minuten)
 */
export const travelTimeBike = [
  //SEN  SCH  HBF  MVW  MVO  SWB  FRM  MUC
  [  0,  12,  15,  20,  22,  25,  30,  25], // SEN
  [ 12,   0,  10,  15,  18,  22,  28,  22], // SCH
  [ 15,  10,   0,  12,  15,  18,  25,  20], // HBF
  [ 20,  15,  12,   0,   8,  12,  18,  20], // MVW
  [ 22,  18,  15,   8,   0,   8,  15,  18], // MVO
  [ 25,  22,  18,  12,   8,   0,  10,  18], // SWB
  [ 30,  28,  25,  18,  15,  10,   0,  22], // FRM
  [ 25,  22,  20,  20,  18,  18,  22,   0], // MUC
]

/**
 * Reisezeit zu Fuß zwischen Zonen (Minuten)
 * Nur Nachbarzonen realistisch, Rest sehr hoch (= unattraktiv)
 */
export const travelTimeWalk = [
  //SEN  SCH  HBF  MVW  MVO  SWB  FRM  MUC
  [  0,  25,  30,  45,  50,  55,  70,  60], // SEN
  [ 25,   0,  20,  30,  35,  45,  60,  45], // SCH
  [ 30,  20,   0,  25,  30,  40,  55,  40], // HBF
  [ 45,  30,  25,   0,  15,  25,  40,  45], // MVW
  [ 50,  35,  30,  15,   0,  15,  30,  40], // MVO
  [ 55,  45,  40,  25,  15,   0,  20,  40], // SWB
  [ 70,  60,  55,  40,  30,  20,   0,  50], // FRM
  [ 60,  45,  40,  45,  40,  40,  50,   0], // MUC
]
