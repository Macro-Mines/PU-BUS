export default function RouteSelector({ routes, selectedRoute, onSelectRoute }) {
  const routesArray = Object.entries(routes || {}).map(([id, data]) => ({ id, ...data }))

  return (
    <div className="route-selector">
      <button
        className={`route-chip ${!selectedRoute ? 'active' : ''}`}
        onClick={() => onSelectRoute(null)}
      >
        All Routes
      </button>
      {routesArray.map(route => (
        <button
          key={route.id}
          className={`route-chip ${selectedRoute === route.id ? 'active' : ''}`}
          onClick={() => onSelectRoute(selectedRoute === route.id ? null : route.id)}
        >
          <span className="route-chip-dot" style={{ background: route.color || '#4285F4' }} />
          {route.name}
        </button>
      ))}
    </div>
  )
}
