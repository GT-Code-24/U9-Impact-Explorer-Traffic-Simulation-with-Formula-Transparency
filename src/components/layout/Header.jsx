export function Header() {
  return (
    <header className="bg-navy text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            U9 Impact Explorer
          </h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Interaktives Verkehrsmodell zur Wirkungsanalyse der U9-Entlastungsspange München
          </p>
        </div>
        <div className="text-right text-xs text-slate-400 hidden md:block">
          <div>Vereinfachtes 4-Stufen-Modell</div>
          <div>Daten: MVG, Stat. Amt München 2024</div>
        </div>
      </div>
    </header>
  )
}
