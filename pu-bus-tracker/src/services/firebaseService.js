import { ref, onValue, off } from 'firebase/database'
import { collection, onSnapshot, doc } from 'firebase/firestore'
import { db, rtdb } from '../config/firebase'
import { DEMO_BUSES, ROUTES, STOPS } from '../data/demoData'

function isDemoMode() {
  const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || ''
  return !dbUrl || dbUrl.includes('demo') || dbUrl.includes('your-')
}

const USE_DEMO = isDemoMode()

// ─── Live Bus Locations (Realtime Database) ─────────────────────────
export function subscribeToBuses(callback) {
  if (USE_DEMO) {
    let buses = JSON.parse(JSON.stringify(DEMO_BUSES))
    callback(buses)
    const interval = setInterval(() => {
      Object.keys(buses).forEach(busId => {
        const bus = buses[busId]
        const route = ROUTES[bus.route_id]
        if (!route) return
        const jitterLat = (Math.random() - 0.5) * 0.0004
        const jitterLng = (Math.random() - 0.5) * 0.0004
        if (bus.current_location) {
          bus.current_location.lat += jitterLat
          bus.current_location.lng += jitterLng
        }
      })
      callback({ ...buses })
    }, 3000)
    return () => clearInterval(interval)
  }

  const busesRef = ref(rtdb, 'buses')
  const unsubscribe = onValue(busesRef, (snapshot) => {
    callback(snapshot.val() || {})
  })

  return () => off(busesRef, 'value', unsubscribe)
}

// ─── Routes (Firestore) ─────────────────────────────────────────────
export function subscribeToRoutes(callback) {
  if (USE_DEMO) {
    callback(ROUTES)
    return () => {}
  }

  const routesCol = collection(db, 'routes')
  return onSnapshot(routesCol, (snapshot) => {
    const routes = {}
    snapshot.forEach(doc => {
      routes[doc.id] = doc.data()
    })
    callback(routes)
  })
}

// ─── Stops (Firestore) ──────────────────────────────────────────────
export function subscribeToStops(callback) {
  if (USE_DEMO) {
    callback(STOPS)
    return () => {}
  }

  const stopsCol = collection(db, 'stops')
  return onSnapshot(stopsCol, (snapshot) => {
    const stops = {}
    snapshot.forEach(doc => {
      stops[doc.id] = doc.data()
    })
    callback(stops)
  })
}

// ─── ETA Calculation ──────────────────────────────────────────────
export function calculateETA(busLocation, stopLocation, speedKmh) {
  const R = 6371
  const dLat = toRad(stopLocation.latitude - busLocation.latitude)
  const dLng = toRad(stopLocation.longitude - busLocation.longitude)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(busLocation.latitude)) * Math.cos(toRad(stopLocation.latitude)) *
    Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distanceKm = R * c
  const avgSpeed = speedKmh > 0 ? speedKmh : 20
  return Math.ceil((distanceKm / avgSpeed) * 60)
}

function toRad(deg) {
  return deg * (Math.PI / 180)
}
