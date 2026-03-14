import { useState, useCallback, useRef } from 'react'

export default function BottomPanel({ buses, routes, stops, selectedBus, onSelectBus, selectedRoute }) {
  const [collapsed, setCollapsed] = useState(false)
  const panelRef = useRef(null)
  const startY = useRef(0)

  const busArray = Object.entries(buses || {}).map(([id, data]) => ({
    id,
    ...data
  }))

  const filteredBuses = selectedRoute
    ? busArray.filter(b => b.route_id === selectedRoute)
    : busArray

  const handleTouchStart = useCallback((e) => {
    startY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const diff = e.changedTouches[0].clientY - startY.current
    if (diff > 50) setCollapsed(true)
    if (diff < -50) setCollapsed(false)
  }, [])

  const formatETA = (seconds) => {
    if (!seconds || seconds <= 0) return { value: '—', unit: '' }
    const mins = Math.ceil(seconds / 60)
    return { value: mins, unit: 'min' }
  }

  return (
    <div className="bottom-panel-wrapper">
      <div
        ref={panelRef}
        className={`bottom-panel ${collapsed ? 'collapsed' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="panel-handle-area" onClick={() => setCollapsed(!collapsed)}>
          <div className="panel-handle" />
        </div>

        <div className="panel-header">
          <span className="panel-title">Active Buses</span>
          <span className="panel-badge">{filteredBuses.length} live</span>
        </div>

        <div className="panel-content">
          {filteredBuses.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              No active buses on this route
            </div>
          ) : (
            filteredBuses.map(bus => {
              const route = routes[bus.route_id]
              const nextStop = stops[bus.next_stop]
              const eta = formatETA(bus.eta_next_stop_seconds)
              const isSelected = selectedBus === bus.id

              return (
                <div
                  key={bus.id}
                  className={`bus-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectBus(isSelected ? null : bus.id)}
                >
                  <div
                    className="bus-card-icon"
                    style={{ background: route ? `${route.color}15` : '#f0f0f0' }}
                  >
                    🚌
                  </div>

                  <div className="bus-card-info">
                    <div className="bus-card-header">
                      <span className="bus-card-number">{bus.bus_number || 'BUS'}</span>
                      {route && (
                        <span
                          className="bus-card-route"
                          style={{ background: route.color }}
                        >
                          {route.name}
                        </span>
                      )}
                    </div>
                    <div className="bus-card-location">
                      → {nextStop ? nextStop.name : 'En route'}
                      {(bus.speed > 0 || bus.current_location?.speed > 0) && (
                        <span style={{ marginLeft: '6px', color: 'var(--color-text-muted)' }}>
                          · {Math.round(bus.speed || bus.current_location.speed)} km/h
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bus-card-eta">
                    <div className="eta-value">{eta.value}</div>
                    <div className="eta-label">{eta.unit}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
