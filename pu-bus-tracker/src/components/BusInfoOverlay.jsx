import { useEffect, useRef } from 'react'
import { ROUTES, STOPS } from '../data/demoData'

export default function BusInfoOverlay({ busId, buses, onClose }) {
  const bus = buses[busId]
  const scrollRef = useRef(null)
  
  if (!bus) return null

  const route = ROUTES[bus.route_id]
  const nextStopId = bus.next_stop
  const stops = route ? route.stops.map(sId => STOPS[sId]).filter(Boolean) : []
  const etaMins = bus.eta_next_stop_seconds ? Math.ceil(bus.eta_next_stop_seconds / 60) : '—'

  // Find index of next stop to determine "current" stop (previous one)
  const nextStopIndex = stops.findIndex(s => s.id === nextStopId)
  const currentStopId = nextStopIndex > 0 ? stops[nextStopIndex - 1].id : null

  // Auto-scroll to current position
  useEffect(() => {
    if (scrollRef.current) {
      const activeItem = scrollRef.current.querySelector('.stop-item-mini.active')
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [busId, nextStopId])

  return (
    <div className="info-overlay">
      <div className="info-card">
        <div className="info-card-header">
          <div className="info-card-title">
            🚌 {bus.bus_number}
          </div>
          <button className="info-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="info-card-body">
          {/* Route Info */}
          <div className="info-detail-row">
            <div className="info-detail-icon" style={{ background: route ? `${route.color}15` : undefined }}>
              🛤️
            </div>
            <div className="info-detail-content">
              <div className="info-detail-label">Route</div>
              <div className="info-detail-value" style={{ color: route?.color }}>
                {route?.name || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Next Stop & ETA Row */}
          <div className="info-detail-row">
            <div className="info-detail-icon">📍</div>
            <div className="info-detail-content">
              <div className="info-detail-label">Next Stop</div>
              <div className="info-detail-value">
                {STOPS[nextStopId]?.name || '—'}
                <span style={{
                  marginLeft: 8,
                  fontSize: 13,
                  color: 'var(--color-accent)',
                  fontWeight: 700
                }}>
                  {etaMins} min
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Speed */}
            <div className="info-detail-row">
              <div className="info-detail-icon">⚡</div>
              <div className="info-detail-content">
                <div className="info-detail-label">Speed</div>
                <div className="info-detail-value">
                  {bus.current_location?.speed ? `${Math.round(bus.current_location.speed)} km/h` : 'Stopped'}
                </div>
              </div>
            </div>

            {/* Driver */}
            {bus.driver_name && (
              <div className="info-detail-row">
                <div className="info-detail-icon">👤</div>
                <div className="info-detail-content">
                  <div className="info-detail-label">Driver</div>
                  <div className="info-detail-value">{bus.driver_name}</div>
                </div>
              </div>
            )}
          </div>

          {/* Route stops list with scrollable effect */}
          {stops.length > 0 && (
            <div className="stop-list-section" style={{ marginTop: '12px' }}>
              <div className="info-detail-label" style={{ marginBottom: 6, paddingLeft: 4 }}>
                ROUTE STOPS ({stops.length})
              </div>
              <div className="stop-list-mini" ref={scrollRef}>
                {stops.map((stop, idx) => {
                  const isNext = stop.id === nextStopId
                  const isCurrent = stop.id === currentStopId
                  const isActive = isNext || isCurrent

                  return (
                    <div key={stop.id}>
                      <div className={`stop-item-mini ${isActive ? 'active' : ''}`}>
                        <div
                          className={`stop-dot-mini ${isNext ? 'next' : ''}`}
                          style={{
                            borderColor: route?.color || 'var(--color-accent)',
                            background: isActive ? route?.color : 'transparent'
                          }}
                        />
                        <span style={{
                          fontWeight: isActive ? 700 : 400,
                          opacity: isActive ? 1 : 0.6
                        }}>
                          {stop.name} {isCurrent && '(Last)'} {isNext && '(Next)'}
                        </span>
                      </div>
                      {idx < stops.length - 1 && (
                        <div 
                          className="stop-connector" 
                          style={{ 
                            background: route?.color || 'var(--color-accent)',
                            opacity: (isCurrent && isNext) || (stops[idx].id === currentStopId && stops[idx+1].id === nextStopId) ? 1 : 0.2
                          }} 
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
