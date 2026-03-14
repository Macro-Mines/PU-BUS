export default function LocationToggle({ active, onClick, nearestStop }) {
  return (
    <>
      <button 
        className={`location-toggle-btn ${active ? 'active' : ''}`}
        onClick={onClick}
        title={active ? "Stop Tracking" : "Show My Location"}
      >
        {active ? '📍' : '🧭'}
      </button>

      {active && nearestStop && (
        <div className="nearest-stop-indicator pulse">
          <span>🚌 Nearby:</span>
          <strong>{nearestStop.name}</strong>
        </div>
      )}
    </>
  )
}
