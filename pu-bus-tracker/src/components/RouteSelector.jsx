import { ROUTES } from '../data/demoData'

export default function RouteSelector({ selectedRoute, onSelectRoute }) {
  const routes = Object.values(ROUTES)

  return (
    <div className="route-selector">
      <button
        className={`route-chip ${!selectedRoute ? 'active' : ''}`}
        onClick={() => onSelectRoute(null)}
      >
        All Routes
      </button>
      {routes.map(route => (
        <button
          key={route.id}
          className={`route-chip ${selectedRoute === route.id ? 'active' : ''}`}
          onClick={() => onSelectRoute(selectedRoute === route.id ? null : route.id)}
        >
          <span className="route-chip-dot" style={{ background: route.color }} />
          {route.name}
        </button>
      ))}
    </div>
  )
}
