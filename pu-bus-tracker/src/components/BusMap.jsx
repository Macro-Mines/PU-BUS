import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CAMPUS_CENTER, DEFAULT_ZOOM } from '../data/demoData'

// ─── Distance Helper (Haversine) ─────────────────────
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    0.5 - Math.cos(dLat)/2 + 
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    (1 - Math.cos(dLon))/2
  return R * 2 * Math.asin(Math.sqrt(a)) * 1000 // Distance in meters
}

// ─── Custom Bus Icon ─────────────────────────────────
function createBusIcon(color, label) {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div class="bus-marker-wrap">
        <div class="bus-marker-pulse" style="background:${color}"></div>
        <div class="bus-marker-body" style="background:${color}">🚌</div>
        <div class="bus-marker-label">${label}</div>
      </div>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 28],
    popupAnchor: [0, -30]
  })
}

// ─── Custom User Icon ────────────────────────────────
const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div class="user-marker-wrap">
      <div class="user-marker-pulse"></div>
      <div class="user-marker-dot"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
})

// ─── Custom Stop Icon ────────────────────────────────
function createStopIcon() {
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div class="stop-marker-wrap">
        <div class="stop-marker-body">
          <div class="stop-marker-inner"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
  })
}

const stopIcon = createStopIcon()

// ─── User Location Marker Logic ──────────────────────
function UserLocationMarker({ enabled, onNearestStopFound, stops }) {
  const [position, setPosition] = useState(null)
  const map = useMap()

  useMapEvents({
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, 17)
      
      // Find nearest stop
      let nearest = null
      let minDistance = Infinity
      
      Object.entries(stops || {}).forEach(([id, stop]) => {
        const stopLat = stop.latitude || stop.lat
        const stopLng = stop.longitude || stop.lng
        const dist = getDistance(e.latlng.lat, e.latlng.lng, stopLat, stopLng)
        if (dist < minDistance) {
          minDistance = dist
          nearest = { ...stop, id }
        }
      })
      
      onNearestStopFound(nearest)
    },
    locationerror() {
      console.warn("Location access denied or unavailable.")
    }
  })

  useEffect(() => {
    if (enabled) {
      map.locate({ watch: true, enableHighAccuracy: true })
    } else {
      map.stopLocate()
      setPosition(null)
      onNearestStopFound(null)
    }
  }, [enabled, map, onNearestStopFound])

  return position === null ? null : (
    <Marker position={position} icon={userIcon} zIndexOffset={2000} />
  )
}

// ─── Fly to selected bus ─────────────────────────────
function FlyToLocation({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { duration: 0.8 })
    }
  }, [position, map])
  return null
}

// ─── Smooth Bus Marker ──────────────────────────────
function SmoothBusMarker({ bus, route, stops, onSelectBus }) {
  const [renderPos, setRenderPos] = useState(null)
  const targetPos = useMemo(() => {
    const lat = bus.latitude || bus.current_location?.lat
    const lng = bus.longitude || bus.current_location?.lng
    return lat && lng ? [lat, lng] : null
  }, [bus])

  // Simple interpolation logic
  useEffect(() => {
    if (!targetPos) return
    if (!renderPos) {
      setRenderPos(targetPos)
      return
    }

    // If jump is too large (e.g. initial load), don't animate
    const dist = getDistance(renderPos[0], renderPos[1], targetPos[0], targetPos[1])
    if (dist > 500) {
      setRenderPos(targetPos)
      return
    }

    let animationId
    const startTime = performance.now()
    const duration = 1000 // Match the 1s sync interval
    const startPos = [...renderPos]

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const currentLat = startPos[0] + (targetPos[0] - startPos[0]) * progress
      const currentLng = startPos[1] + (targetPos[1] - startPos[1]) * progress
      
      setRenderPos([currentLat, currentLng])

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [targetPos])

  if (!renderPos) return null

  const color = route?.color || '#4285F4'
  const nextStop = stops[bus.next_stop]
  const etaMins = bus.eta_next_stop_seconds
    ? Math.ceil(bus.eta_next_stop_seconds / 60)
    : '—'

  return (
    <Marker
      position={renderPos}
      icon={createBusIcon(color, bus.bus_number || 'BUS')}
      zIndexOffset={1000}
      eventHandlers={{
        click: () => onSelectBus(bus.id)
      }}
    >
      <Popup className="bus-popup" closeButton={false}>
        <div className="popup-title">🚌 {bus.bus_number || 'BUS'}</div>
        <div className="popup-subtitle" style={{ color: color }}>
          {route?.name || 'In Service'}
        </div>
        <div className="popup-detail">
          → {nextStop?.name || 'En route'} · <strong>{etaMins} min</strong>
        </div>
        {(bus.speed > 0 || bus.current_location?.speed > 0) && (
          <div className="popup-detail">
            ⚡ {Math.round(bus.speed || bus.current_location.speed)} km/h
          </div>
        )}
      </Popup>
    </Marker>
  )
}

// ─── Main Component ──────────────────────────────────
export default function BusMap({
  buses,
  routes,
  stops,
  selectedRoute,
  selectedBus,
  onSelectBus,
  onSelectStop,
  trackingEnabled,
  onNearestStopFound
}) {
  const busArray = useMemo(() =>
    Object.entries(buses || {}).map(([id, data]) => ({ id, ...data })),
    [buses]
  )

  const stopsArray = useMemo(() => 
    Object.entries(stops || {}).map(([id, data]) => ({ id, ...data })), 
    [stops]
  )

  const routesArray = useMemo(() => {
    if (selectedRoute && routes[selectedRoute]) {
      return [ { id: selectedRoute, ...routes[selectedRoute] } ]
    }
    return Object.entries(routes || {}).map(([id, data]) => ({ id, ...data }))
  }, [selectedRoute, routes])

  const flyToPos = useMemo(() => {
    if (selectedBus && buses[selectedBus]) {
      const bus = buses[selectedBus]
      // Support both layouts during transition
      const lat = bus.latitude || bus.current_location?.lat
      const lng = bus.longitude || bus.current_location?.lng
      if (lat && lng) return [lat, lng]
    }
    return null
  }, [selectedBus, buses])

  return (
    <div className="map-container">
      <MapContainer
        center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Tracking */}
        <UserLocationMarker 
          enabled={trackingEnabled} 
          onNearestStopFound={onNearestStopFound} 
          stops={stops}
        />

        {/* Fly to selected bus */}
        {flyToPos && <FlyToLocation position={flyToPos} />}

        {/* Route Polylines */}
        {routesArray.map(route => {
          if (!route.path) return null
          const positions = route.path.map(p => {
            const lat = p.latitude || p.lat
            const lng = p.longitude || p.lng
            return [lat, lng]
          })
          
          return (
            <Polyline
              key={route.id}
              positions={positions}
              pathOptions={{
                color: route.color || '#4285F4',
                weight: 5,
                opacity: 0.7,
                dashArray: selectedRoute === route.id ? null : '10 6',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          )
        })}

        {/* Stop Markers */}
        {stopsArray.map(stop => {
          const lat = stop.latitude || stop.lat
          const lng = stop.longitude || stop.lng
          if (!lat || !lng) return null

          return (
            <Marker
              key={stop.id}
              position={[lat, lng]}
              icon={stopIcon}
              eventHandlers={{
                click: () => onSelectStop(stop.id)
              }}
            >
              <Popup className="stop-popup" closeButton={false}>
                <div className="popup-title">📍 {stop.name}</div>
                <div className="popup-routes">
                  {(stop.routes || []).map(rId => {
                    const r = routes[rId]
                    return r ? (
                      <span key={rId} className="popup-route-badge" style={{ background: r.color }}>
                        {r.name}
                      </span>
                    ) : null
                  })}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Smooth Bus Markers */}
        {busArray.map(bus => (
          <SmoothBusMarker
            key={bus.id}
            bus={bus}
            route={routes[bus.route_id]}
            stops={stops}
            onSelectBus={onSelectBus}
          />
        ))}
      </MapContainer>
    </div>
  )
}
