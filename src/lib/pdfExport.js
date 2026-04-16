/**
 * PDF-Report-Export für U9-Modell-Ergebnisse
 * Generiert einen strukturierten Bericht mit KPIs, Grafiken und Parametern
 */

import html2pdf from 'html2pdf.js'

/**
 * Generiert einen PDF-Report aus Modell-Ergebnissen
 */
export function generatePDFReport(result, comparison, params) {
  const timestamp = new Date().toLocaleString('de-DE')
  const scenarioName = params.withU9 ? 'Mit U9' : 'Ohne U9'

  // HTML-Template für PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
        }
        .header {
          border-bottom: 3px solid #0065ae;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #0065ae;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 12px;
        }
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .section h2 {
          background: #f0f4f8;
          padding: 10px;
          border-left: 4px solid #0065ae;
          margin: 0 0 15px 0;
          font-size: 14px;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 15px;
        }
        .kpi-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 12px;
          border-radius: 4px;
        }
        .kpi-label {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .kpi-value {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          margin-top: 5px;
        }
        .kpi-unit {
          font-size: 12px;
          color: #999;
          margin-top: 3px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-top: 10px;
        }
        th {
          background: #f0f4f8;
          border: 1px solid #d1d5db;
          padding: 8px;
          text-align: left;
          font-weight: bold;
          color: #0065ae;
        }
        td {
          border: 1px solid #e5e7eb;
          padding: 8px;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
          margin-top: 30px;
          font-size: 10px;
          color: #999;
        }
        .scenario-label {
          background: ${params.withU9 ? '#dbeafe' : '#fef3c7'};
          color: ${params.withU9 ? '#0c4a6e' : '#78350f'};
          padding: 4px 8px;
          border-radius: 3px;
          font-weight: bold;
          display: inline-block;
          margin-left: 10px;
        }
        .nka-section {
          background: #ecfdf5;
          border-left: 4px solid #10b981;
          padding: 12px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .negative { color: #dc2626; }
        .positive { color: #059669; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>U9 Impact Explorer – Verkehrsmodell Report</h1>
        <p><strong>Szenario:</strong> ${scenarioName}<span class="scenario-label">${params.withU9 ? '✓ U9 aktiv' : '✗ Baseline'}</span></p>
        <p><strong>Generiert:</strong> ${timestamp}</p>
      </div>

      <!-- Parameter-Zusammenfassung -->
      <div class="section">
        <h2>Modell-Parameter</h2>
        <table>
          <tr>
            <th>Parameter</th>
            <th>Wert</th>
          </tr>
          <tr>
            <td>Bevölkerungswachstum</td>
            <td>${params.populationGrowth}%</td>
          </tr>
          <tr>
            <td>Benzinpreis</td>
            <td>${params.fuelPrice.toFixed(2)} €/l</td>
          </tr>
          <tr>
            <td>ÖPNV-Monatsticket</td>
            <td>${params.oepnvMonthlyPass} €</td>
          </tr>
          <tr>
            <td>Rad-Infrastruktur</td>
            <td>${params.bikeInfraQuality}/10</td>
          </tr>
          <tr>
            <td>Wegerate</td>
            <td>${params.tripRate.toFixed(1)} Wege/Person/Tag</td>
          </tr>
        </table>
      </div>

      <!-- KPIs -->
      <div class="section">
        <h2>Ergebnisse – Kennzahlen</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Gesamtwege/Tag</div>
            <div class="kpi-value">${formatNumber(result.kpis.totalTrips)}</div>
            <div class="kpi-unit">alle Verkehrsmittel</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">ÖPNV-Anteil</div>
            <div class="kpi-value">${(result.kpis.modalSplit.oepnv * 100).toFixed(1)}%</div>
            <div class="kpi-unit">Modal Split</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Umweltverbund</div>
            <div class="kpi-value">${(result.kpis.umweltverbund * 100).toFixed(1)}%</div>
            <div class="kpi-unit">ÖPNV + Rad + Fuß</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">MIV-Anteil</div>
            <div class="kpi-value">${(result.kpis.modalSplit.car * 100).toFixed(1)}%</div>
            <div class="kpi-unit">Autoverkehr</div>
          </div>
        </div>
        ${
          params.withU9
            ? `
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">U9 Fahrgäste/Tag</div>
              <div class="kpi-value">${formatNumber(result.kpis.u9Load)}</div>
              <div class="kpi-unit">Kernabschnitt</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Stammstrecke 1 Entlastung</div>
              <div class="kpi-value">${(result.kpis.stammstrecke1Relief * 100).toFixed(1)}%</div>
              <div class="kpi-unit">U3/U6 Korridor</div>
            </div>
          </div>
          `
            : ''
        }
      </div>

      <!-- Modal Split Tabelle -->
      <div class="section">
        <h2>Modal Split – Detaillierte Aufteilung</h2>
        <table>
          <tr>
            <th>Verkehrsmittel</th>
            <th>Anteil</th>
            <th>Absolute Fahrten/Tag</th>
          </tr>
          <tr>
            <td>MIV (Auto)</td>
            <td>${(result.kpis.modalSplit.car * 100).toFixed(1)}%</td>
            <td>${formatNumber(Math.round(result.kpis.totalTrips * result.kpis.modalSplit.car))}</td>
          </tr>
          <tr>
            <td>ÖPNV</td>
            <td>${(result.kpis.modalSplit.oepnv * 100).toFixed(1)}%</td>
            <td>${formatNumber(Math.round(result.kpis.totalTrips * result.kpis.modalSplit.oepnv))}</td>
          </tr>
          <tr>
            <td>Fahrrad</td>
            <td>${(result.kpis.modalSplit.bike * 100).toFixed(1)}%</td>
            <td>${formatNumber(Math.round(result.kpis.totalTrips * result.kpis.modalSplit.bike))}</td>
          </tr>
          <tr>
            <td>Zu Fuß</td>
            <td>${(result.kpis.modalSplit.walk * 100).toFixed(1)}%</td>
            <td>${formatNumber(Math.round(result.kpis.totalTrips * result.kpis.modalSplit.walk))}</td>
          </tr>
        </table>
      </div>

      <!-- Streckenbelastung -->
      <div class="section">
        <h2>U-Bahn Streckenbelastung</h2>
        <table>
          <tr>
            <th>Streckenabschnitt</th>
            <th>Last [Pax/Tag]</th>
            <th>Kapazität</th>
            <th>Auslastung</th>
            <th>Status</th>
          </tr>
          ${result.assignment.segments
            .map(
              (seg) => `
          <tr>
            <td>${seg.name}</td>
            <td>${formatNumber(seg.load)}</td>
            <td>${formatNumber(seg.capacity)}</td>
            <td>${(seg.utilization * 100).toFixed(1)}%</td>
            <td style="color: ${seg.utilization > 0.9 ? '#dc2626' : seg.utilization > 0.7 ? '#f59e0b' : '#10b981'}">${
                seg.utilization > 0.9 ? '⚠ Überlastet' : seg.utilization > 0.7 ? '⚠ Warnung' : '✓ OK'
              }</td>
          </tr>
          `
            )
            .join('')}
        </table>
      </div>

      <!-- NKA (falls verfügbar) -->
      ${
        comparison?.nka
          ? `
      <div class="section nka-section">
        <h2 style="color: #10b981;">Nutzen-Kosten-Analyse (NKA)</h2>
        <p style="margin: 0 0 10px 0; font-size: 12px;">
          <strong>Methodik:</strong> Standardisierte Bewertung von Verkehrswegeinvestitionen 2016+ (BMV)
        </p>
        <table style="margin-bottom: 10px;">
          <tr>
            <th>KPI</th>
            <th>Wert</th>
            <th>Einheit</th>
          </tr>
          <tr>
            <td><strong>Nutzen-Kosten-Verhältnis (NKV)</strong></td>
            <td style="font-weight: bold; ${comparison.nka.nkv >= 1.0 ? 'color: #10b981;' : 'color: #dc2626;'}">${comparison.nka.nkv.toFixed(2)}</td>
            <td>${comparison.nka.nkv >= 1.0 ? '✓ positiv' : '✗ negativ'}</td>
          </tr>
          <tr>
            <td>Jahresnutzen</td>
            <td>${comparison.nka.jahresnutzenMio}</td>
            <td>Mio €</td>
          </tr>
          <tr>
            <td>Barwert Nutzen (${comparison.nka.prognosehorizont}a, ${(comparison.nka.diskontierungssatz * 100).toFixed(1)}% Zins)</td>
            <td>${comparison.nka.barwertNutzenMrd}</td>
            <td>Mrd €</td>
          </tr>
          <tr>
            <td>Gesamtkosten (Investition + Betrieb)</td>
            <td>${comparison.nka.gesamtkostenMrd}</td>
            <td>Mrd €</td>
          </tr>
          <tr>
            <td>CO₂-Einsparung/Jahr</td>
            <td>${comparison.nka.co2EinsparungTonnenJaehrlich}</td>
            <td>t CO₂-Äq.</td>
          </tr>
        </table>
        <p style="margin: 0; font-size: 11px; color: #666;">
          <strong>Bewertung:</strong> ${comparison.nka.nkvBewertung}
          ${comparison.nka.nkv >= 1.5 ? '(sehr gut - hohe volkswirtschaftliche Rentabilität)' : ''}
          ${comparison.nka.nkv >= 1.0 && comparison.nka.nkv < 1.5 ? '(marginal - gering positive Rentabilität)' : ''}
          ${comparison.nka.nkv < 1.0 ? '(nicht empfohlen - negative Rentabilität)' : ''}
        </p>
      </div>
      `
          : ''
      }

      <div class="footer">
        <p>
          <strong>Disclaimer:</strong> Dieses Modell ist eine vereinfachte Demonstration des 4-Stufen-Verkehrsmodells.
          Produktivmodelle (z.B. bei Verkehrsplanungsbüros, TU München) nutzen 500+ Verkehrszellen, empirische Kalibrierung (RP/SP),
          und stochastische Umlegung (SUE). Diese Ergebnisse sind für Planungszwecke nicht gültig.
        </p>
        <p>Technisches Setup: React 18 + Vite | Modell: 4-Stufen (Nested Logit, Tanner-Impedanz, Kapazitäts-Rückkopplung)</p>
      </div>
    </body>
    </html>
  `

  // HTML2PDF Optionen
  const options = {
    margin: 10,
    filename: `U9-Report_${scenarioName.replace(/\s/g, '_')}_${new Date().getTime()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  }

  // Generiere PDF
  html2pdf().set(options).from(htmlContent).save()
}

/**
 * Hilfsfunktion: Zahlenformat
 */
function formatNumber(num) {
  if (!num) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
