import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CAMPUS_CENTER, DEFAULT_ZOOM, ROUTES, STOPS } from '../data/demoData'

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
function UserLocationMarker({ enabled, onNearestStopFound }) {
  const [position, setPosition] = useState(null)
  const map = useMap()

  useMapEvents({
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, 17)
      
      // Find nearest stop
      let nearest = null
      let minDistance = Infinity
      
      Object.values(STOPS).forEach(stop => {
        const dist = getDistance(e.latlng.lat, e.latlng.lng, stop.lat, stop.lng)
        if (dist < minDistance) {
          minDistance = dist
          nearest = stop
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

// ─── Main Component ──────────────────────────────────
export default function BusMap({
  buses,
  selectedRoute,
  selectedBus,
  onSelectBus,
  onSelectStop,
  trackingEnabled,
  onNearestStopFound
}) {
  const busArray = useMemo(() =>
    Object.entries(buses).map(([id, data]) => ({ id, ...data })),
    [buses]
  )

  const stopsArray = useMemo(() => Object.values(STOPS), [])

  const routesArray = useMemo(() =>
    selectedRoute
      ? [ROUTES[selectedRoute]].filter(Boolean)
      : Object.values(ROUTES),
    [selectedRoute]
  )

  const flyToPos = useMemo(() => {
    if (selectedBus && buses[selectedBus]?.current_location) {
      const loc = buses[selectedBus].current_location
      return [loc.lat, loc.lng]
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
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Tracking */}
        <UserLocationMarker 
          enabled={trackingEnabled} 
          onNearestStopFound={onNearestStopFound} 
        />

        {/* Fly to selected bus */}
        {flyToPos && <FlyToLocation position={flyToPos} />}

        {/* Route Polylines */}
        {routesArray.map(route => (
          <Polyline
            key={route.id}
            positions={route.path.map(p => [p.lat, p.lng])}
            pathOptions={{
              color: route.color,
              weight: 5,
              opacity: 0.7,
              dashArray: selectedRoute === route.id ? null : '10 6',
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        ))}

        {/* Stop Markers */}
        {stopsArray.map(stop => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={stopIcon}
            eventHandlers={{
              click: () => onSelectStop(stop.id)
            }}
          >
            <Popup className="stop-popup" closeButton={false}>
              <div className="popup-title">📍 {stop.name}</div>
              <div className="popup-routes">
                {(stop.routes || []).map(rId => {
                  const r = ROUTES[rId]
                  return r ? (
                    <span key={rId} className="popup-route-badge" style={{ background: r.color }}>
                      {r.name}
                    </span>
                  ) : null
                })}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Bus Markers */}
        {busArray.map(bus => {
          const route = ROUTES[bus.route_id]
          const color = route?.color || '#4285F4'
          const pos = [bus.current_location.lat, bus.current_location.lng]
          const nextStop = STOPS[bus.next_stop]
          const etaMins = bus.eta_next_stop_seconds
            ? Math.ceil(bus.eta_next_stop_seconds / 60)
            : '—'

          return (
            <Marker
              key={bus.id}
              position={pos}
              icon={createBusIcon(color, bus.bus_number)}
              zIndexOffset={1000}
              eventHandlers={{
                click: () => onSelectBus(bus.id)
              }}
            >
              <Popup className="bus-popup" closeButton={false}>
                <div className="popup-title">🚌 {bus.bus_number}</div>
                <div className="popup-subtitle" style={{ color: route?.color }}>
                  {route?.name}
                </div>
                <div className="popup-detail">
                  → {nextStop?.name || 'En route'} · <strong>{etaMins} min</strong>
                </div>
                {bus.current_location?.speed > 0 && (
                  <div className="popup-detail">
                    ⚡ {Math.round(bus.current_location.speed)} km/h
                  </div>
                )}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

