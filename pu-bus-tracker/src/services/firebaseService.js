import { ref, onValue, off } from 'firebase/database'
import { db } from '../config/firebase'
import { DEMO_BUSES, ROUTES, STOPS } from '../data/demoData'

function isDemoMode() {
  const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || ''
  return !dbUrl || dbUrl.includes('demo') || dbUrl.includes('your-') || dbUrl === 'https://demo-default-rtdb.firebaseio.com'
}

const USE_DEMO = isDemoMode()

// ─── Live Bus Locations ──────────────────────────────
export function subscribeToBuses(callback) {
  if (USE_DEMO) {
    // Simulate moving buses with smooth animation
    let buses = JSON.parse(JSON.stringify(DEMO_BUSES))
    callback(buses)

    const interval = setInterval(() => {
      Object.keys(buses).forEach(busId => {
        const bus = buses[busId]
        const route = ROUTES[bus.route_id]
        if (!route) return

        // Move bus along route path
        const jitterLat = (Math.random() - 0.5) * 0.0004
        const jitterLng = (Math.random() - 0.5) * 0.0004
        bus.current_location.lat += jitterLat
        bus.current_location.lng += jitterLng
        bus.current_location.heading = (bus.current_location.heading + (Math.random() - 0.5) * 20) % 360
        bus.current_location.speed = Math.max(8, Math.min(35, bus.current_location.speed + (Math.random() - 0.5) * 6))
        bus.eta_next_stop_seconds = Math.max(10, bus.eta_next_stop_seconds - 5 + Math.floor(Math.random() * 3))
      })
      callback({ ...buses })
    }, 3000)

    return () => clearInterval(interval)
  }

  const tripsRef = ref(db, 'active_trips')
  const unsubscribe = onValue(tripsRef, (snapshot) => {
    const data = snapshot.val()
    callback(data || {})
  })

  return () => off(tripsRef, 'value', unsubscribe)
}

// ─── Routes ──────────────────────────────────────────
export function subscribeToRoutes(callback) {
  if (USE_DEMO) {
    callback(ROUTES)
    return () => {}
  }

  const routesRef = ref(db, 'routes')
  const unsubscribe = onValue(routesRef, (snapshot) => {
    callback(snapshot.val() || {})
  })
  return () => off(routesRef, 'value', unsubscribe)
}

// ─── Stops ───────────────────────────────────────────
export function subscribeToStops(callback) {
  if (USE_DEMO) {
    callback(STOPS)
    return () => {}
  }

  const stopsRef = ref(db, 'stops')
  const unsubscribe = onValue(stopsRef, (snapshot) => {
    callback(snapshot.val() || {})
  })
  return () => off(stopsRef, 'value', unsubscribe)
}

// ─── ETA Calculation ─────────────────────────────────
export function calculateETA(busLocation, stopLocation, speedKmh) {
  const R = 6371
  const dLat = toRad(stopLocation.lat - busLocation.lat)
  const dLng = toRad(stopLocation.lng - busLocation.lng)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(busLocation.lat)) * Math.cos(toRad(stopLocation.lat)) *
    Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distanceKm = R * c
  const avgSpeed = speedKmh > 0 ? speedKmh : 20
  return Math.ceil((distanceKm / avgSpeed) * 60)
}

function toRad(deg) {
  return deg * (Math.PI / 180)
}
