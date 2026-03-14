import { useState, useEffect } from 'react'
import { subscribeToBuses } from './services/firebaseService'
import BusMap from './components/BusMap'
import BottomPanel from './components/BottomPanel'
import RouteSelector from './components/RouteSelector'
import BusInfoOverlay from './components/BusInfoOverlay'
import StopInfoOverlay from './components/StopInfoOverlay'
import './index.css'

export default function App() {
  const [buses, setBuses] = useState({})
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [selectedBus, setSelectedBus] = useState(null)
  const [selectedStop, setSelectedStop] = useState(null)
  const [showSplash, setShowSplash] = useState(true)

  // Subscribe to live bus locations
  useEffect(() => {
    const unsubscribe = subscribeToBuses((data) => {
      setBuses(data)
    })
    return () => unsubscribe()
  }, [])

  // Hide splash after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200)
    return () => clearTimeout(timer)
  }, [])

  const handleSelectBus = (busId) => {
    setSelectedStop(null)
    setSelectedBus(busId)
  }

  const handleSelectStop = (stopId) => {
    setSelectedBus(null)
    setSelectedStop(stopId)
  }

  const activeBusCount = Object.keys(buses).length

  return (
    <>
      {/* Loading Splash */}
      {showSplash && (
        <div className="splash">
          <div className="splash-icon">🚌</div>
          <div className="splash-text">PU BUS</div>
          <div className="splash-sub">Pondicherry University Bus Tracker</div>
        </div>
      )}

      <div className="app-container">
        {/* Map */}
        <BusMap
          buses={buses}
          selectedRoute={selectedRoute}
          selectedBus={selectedBus}
          onSelectBus={handleSelectBus}
          onSelectStop={handleSelectStop}
        />

        {/* Header */}
        <div className="header">
          <div className="logo-pill">
            <div className="logo-icon">🚌</div>
            <span className="logo-text">PU BUS</span>
          </div>
          <div className="status-pill">
            <span className="status-dot" />
            {activeBusCount} bus{activeBusCount !== 1 ? 'es' : ''} active
          </div>
        </div>

        {/* Route Filter */}
        <RouteSelector
          selectedRoute={selectedRoute}
          onSelectRoute={setSelectedRoute}
        />

        {/* Info Overlays */}
        {selectedBus && !selectedStop && (
          <BusInfoOverlay
            busId={selectedBus}
            buses={buses}
            onClose={() => setSelectedBus(null)}
          />
        )}

        {selectedStop && !selectedBus && (
          <StopInfoOverlay
            stopId={selectedStop}
            buses={buses}
            onClose={() => setSelectedStop(null)}
          />
        )}

        {/* Bottom Panel (hidden when overlay is showing) */}
        {!selectedBus && !selectedStop && (
          <BottomPanel
            buses={buses}
            selectedBus={selectedBus}
            onSelectBus={handleSelectBus}
            selectedRoute={selectedRoute}
          />
        )}
      </div>
    </>
  )
}
