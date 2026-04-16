import { useState } from 'react'
import { Download } from 'lucide-react'
import { Header } from './components/layout/Header.jsx'
import { Footer } from './components/layout/Footer.jsx'
import { Sidebar } from './components/controls/Sidebar.jsx'
import { KPICards } from './components/visualizations/KPICards.jsx'
import { NetworkDiagram } from './components/visualizations/NetworkDiagram.jsx'
import { ModalSplitChart } from './components/visualizations/ModalSplitChart.jsx'
import { LoadComparison } from './components/visualizations/LoadComparison.jsx'
import { ODMatrix } from './components/visualizations/ODMatrix.jsx'
import { SensitivityAnalysis } from './components/visualizations/SensitivityAnalysis.jsx'
import { MapVisualization } from './components/visualizations/MapVisualization.jsx'
import { MethodologyPanel } from './components/methodology/MethodologyPanel.jsx'
import { ValidationPanel } from './components/visualizations/ValidationPanel.jsx'
import { AboutBanner } from './components/layout/AboutBanner.jsx'
import { generatePDFReport } from './lib/pdfExport.js'
import { useModel } from './hooks/useModel.js'

const TABS = [
  { id: 'network', label: 'Netzbelastung' },
  { id: 'modal', label: 'Modal Split' },
  { id: 'map', label: 'Geographische Karte' },
  { id: 'load', label: 'Belastungsvergleich' },
  { id: 'od', label: 'OD-Matrix' },
  { id: 'sensitivity', label: 'Sensitivität' },
  { id: 'validation', label: 'Validierung' },
  { id: 'method', label: 'Methodik' },
]

function App() {
  const {
    params,
    scenarioId,
    selectScenario,
    updateParam,
    result,
    baselineResult,
    comparison,
    sensitivity,
  } = useModel()

  const [activeTab, setActiveTab] = useState('network')

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          params={params}
          scenarioId={scenarioId}
          onSelectScenario={selectScenario}
          onUpdateParam={updateParam}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* About Banner */}
            <AboutBanner />

            {/* KPI Cards */}
            <KPICards result={result} comparison={comparison} />

            {/* Tab Navigation + Export Button */}
            <div className="border-b border-slate-200 flex items-center justify-between">
              <nav className="flex gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              <button
                onClick={() => generatePDFReport(result, comparison, params)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                title="Generiere PDF-Report des aktuellen Szenarios"
              >
                <Download className="w-4 h-4" />
                PDF exportieren
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              {activeTab === 'network' && (
                <NetworkDiagram
                  segments={result.assignment.segments}
                  withU9={params.withU9}
                />
              )}
              {activeTab === 'modal' && (
                <ModalSplitChart modalSplit={result.kpis.modalSplit} />
              )}
              {activeTab === 'map' && (
                <MapVisualization segments={result.assignment.segments} withU9={params.withU9} />
              )}
              {activeTab === 'load' && (
                <LoadComparison
                  segments={result.assignment.segments}
                  baselineSegments={baselineResult.assignment.segments}
                />
              )}
              {activeTab === 'od' && (
                <ODMatrix odMatrix={result.distribution.odMatrix} />
              )}
              {activeTab === 'sensitivity' && (
                <SensitivityAnalysis sensitivityData={sensitivity} />
              )}
              {activeTab === 'validation' && (
                <ValidationPanel result={result} baselineResult={baselineResult} />
              )}
              {activeTab === 'method' && <MethodologyPanel />}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default App
