export function Footer() {
  return (
    <footer className="bg-navy text-slate-400 text-xs px-6 py-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-2">
        <div>
          <strong className="text-slate-300">Hinweis:</strong> Dies ist ein
          vereinfachtes Demonstrationsmodell. Ein Produktivmodell arbeitet mit
          500+ Zonen, empirisch geschätzten Parametern und
          Gleichgewichtsumlegung.
        </div>
        <div className="text-right">
          <div>Gabriel Tsonyev · Arbeitsprobe Verkehrsmodellierung</div>
          <div className="mt-1">
            Methodik: Gravitationsmodell (Tanner/Furness) · Nested Logit Mode Choice · Kapazitäts-Rückkopplung
          </div>
        </div>
      </div>
    </footer>
  )
}
