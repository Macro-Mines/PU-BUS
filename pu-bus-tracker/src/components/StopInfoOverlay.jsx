import { ROUTES, STOPS } from '../data/demoData'

export default function StopInfoOverlay({ stopId, buses, onClose }) {
  const stop = STOPS[stopId]
  if (!stop) return null

  // Find buses heading to this stop
  const incomingBuses = Object.entries(buses)
    .filter(([_, bus]) => bus.next_stop === stopId)
    .map(([id, bus]) => ({
      id,
      ...bus,
      route: ROUTES[bus.route_id],
      etaMins: bus.eta_next_stop_seconds ? Math.ceil(bus.eta_next_stop_seconds / 60) : null
    }))
    .sort((a, b) => (a.etaMins || 999) - (b.etaMins || 999))

  const stopRoutes = (stop.routes || []).map(rId => ROUTES[rId]).filter(Boolean)

  return (
    <div className="info-overlay">
      <div className="info-card">
        <div className="info-card-header">
          <div className="info-card-title">📍 {stop.name}</div>
          <button className="info-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="info-card-body">
          {/* Routes serving this stop */}
          <div className="info-detail-row">
            <div className="info-detail-icon">🛤️</div>
            <div className="info-detail-content">
              <div className="info-detail-label">Routes</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
                {stopRoutes.map(route => (
                  <span
                    key={route.id}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 10px',
                      borderRadius: 999,
                      background: route.color,
                      color: 'white'
                    }}
                  >
                    {route.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Incoming buses */}
          <div style={{ marginTop: 8 }}>
            <div className="info-detail-label" style={{ marginBottom: 8, paddingLeft: 2 }}>
              NEXT ARRIVING BUSES
            </div>
            {incomingBuses.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '8px 0' }}>
                No buses currently heading here
              </div>
            ) : (
              incomingBuses.map(bus => (
                <div key={bus.id} className="bus-card" style={{ marginBottom: 6 }}>
                  <div
                    className="bus-card-icon"
                    style={{ background: bus.route ? `${bus.route.color}15` : '#f0f0f0' }}
                  >
                    🚌
                  </div>
                  <div className="bus-card-info">
                    <div className="bus-card-header">
                      <span className="bus-card-number">{bus.bus_number}</span>
                    </div>
                    <div className="bus-card-location" style={{ color: bus.route?.color }}>
                      {bus.route?.name}
                    </div>
                  </div>
                  <div className="bus-card-eta">
                    <div className="eta-value">{bus.etaMins ?? '—'}</div>
                    <div className="eta-label">min</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
