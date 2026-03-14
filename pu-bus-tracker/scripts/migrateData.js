import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

// Config matches user's provided keys
const firebaseConfig = {
  apiKey: "AIzaSyARKn3gfNWA0cwDGU7x6cDi_nRNAgGN0OA",
  authDomain: "pu-bus.firebaseapp.com",
  databaseURL: "https://pu-bus-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pu-bus",
  storageBucket: "pu-bus.firebasestorage.app",
  messagingSenderId: "368216113936",
  appId: "1:368216113936:web:7a61133e16c7855eef1b95"
};

const STOPS = {
  stop_001: { id: 'stop_001', name: 'Library', lat: 12.020523, lng: 79.856310, routes: ['university_route'] },
  stop_002: { id: 'stop_002', name: 'Reading Room', lat: 12.020846, lng: 79.855354, routes: ['university_route'] },
  stop_003: { id: 'stop_003', name: 'Shopping Complex', lat: 12.017482, lng: 79.853662, routes: ['university_route'] },
  stop_004: { id: 'stop_004', name: 'Health Centre', lat: 12.019190, lng: 79.850368, routes: ['university_route'] },
  stop_005: { id: 'stop_005', name: 'Mother Teresa Mess', lat: 12.022273, lng: 79.848055, routes: ['university_route'] },
  stop_006: { id: 'stop_006', name: 'Narmada Hostel', lat: 12.022946, lng: 79.847169, routes: ['university_route'] },
  stop_007: { id: 'stop_007', name: 'MAKA Hostel', lat: 12.029539, lng: 79.848924, routes: ['university_route'] },
  stop_008: { id: 'stop_008', name: 'Amudham Mess', lat: 12.029693, lng: 79.850892, routes: ['university_route'] },
  stop_009: { id: 'stop_009', name: 'Mega Mess', lat: 12.029188, lng: 79.852368, routes: ['university_route'] },
  stop_010: { id: 'stop_010', name: 'Boys Tea Time', lat: 12.027674, lng: 79.853402, routes: ['university_route'] },
  stop_011: { id: 'stop_011', name: 'Food Science', lat: 12.028419, lng: 79.855489, routes: ['university_route'] },
  stop_012: { id: 'stop_012', name: 'Mass Media', lat: 12.032330, lng: 79.856865, routes: ['university_route'] },
  stop_013: { id: 'stop_013', name: 'SJ Bus Stop', lat: 12.033131, lng: 79.857597, routes: ['university_route'] },
  stop_014: { id: 'stop_014', name: 'UNESCO Bus Stop', lat: 12.031327, lng: 79.857984, routes: ['university_route'] }
};

const ROUTES = {
  university_route: {
    id: 'university_route',
    name: 'University Campus Route',
    color: '#4361ee',
    description: 'Bi-directional campus shuttle connecting all departments and hostels',
    stops: Object.keys(STOPS),
    path: [
      { lat: 12.020523, lng: 79.856310 }, { lat: 12.020846, lng: 79.855354 }, { lat: 12.020918, lng: 79.855107 },
      { lat: 12.017482, lng: 79.853662 }, { lat: 12.018541, lng: 79.850744 }, { lat: 12.019190, lng: 79.850368 },
      { lat: 12.021921, lng: 79.848978 }, { lat: 12.022273, lng: 79.848055 }, { lat: 12.022540, lng: 79.847429 },
      { lat: 12.022946, lng: 79.847169 }, { lat: 12.024112, lng: 79.846629 }, { lat: 12.026538, lng: 79.847420 },
      { lat: 12.029166, lng: 79.848368 }, { lat: 12.029539, lng: 79.848924 }, { lat: 12.030007, lng: 79.849891 },
      { lat: 12.029693, lng: 79.850892 }, { lat: 12.029188, lng: 79.852368 }, { lat: 12.027674, lng: 79.853402 },
      { lat: 12.028419, lng: 79.855489 }, { lat: 12.028858, lng: 79.856544 }, { lat: 12.032330, lng: 79.856865 },
      { lat: 12.033131, lng: 79.857597 }, { lat: 12.032327, lng: 79.858761 }, { lat: 12.031327, lng: 79.857984 },
      // Return
      { lat: 12.032327, lng: 79.858761 }, { lat: 12.033131, lng: 79.857597 }, { lat: 12.032330, lng: 79.856865 },
      { lat: 12.028858, lng: 79.856544 }, { lat: 12.028419, lng: 79.855489 }, { lat: 12.027674, lng: 79.853402 },
      { lat: 12.029188, lng: 79.852368 }, { lat: 12.029693, lng: 79.850892 }, { lat: 12.030007, lng: 79.849891 },
      { lat: 12.029539, lng: 79.848924 }, { lat: 12.029166, lng: 79.848368 }, { lat: 12.026538, lng: 79.847420 },
      { lat: 12.024112, lng: 79.846629 }, { lat: 12.022946, lng: 79.847169 }, { lat: 12.022540, lng: 79.847429 },
      { lat: 12.022273, lng: 79.848055 }, { lat: 12.021921, lng: 79.848978 }, { lat: 12.019190, lng: 79.850368 },
      { lat: 12.018541, lng: 79.850744 }, { lat: 12.017482, lng: 79.853662 }, { lat: 12.020918, lng: 79.855107 },
      { lat: 12.020846, lng: 79.855354 }, { lat: 12.020523, lng: 79.856310 }
    ],
    schedule: { start: '07:30', end: '21:00', frequency: 10 }
  }
};

const migrate = async () => {
  console.log("🚀 Starting Migration...");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // 1. Migrate Stops
    console.log("📍 Migrating Stops...");
    for (const [id, stop] of Object.entries(STOPS)) {
      const stopData = {
        name: stop.name,
        latitude: stop.lat,
        longitude: stop.lng,
        routes: stop.routes
      };
      await setDoc(doc(db, "stops", id), stopData);
      console.log(`✅ Stop ${id} migrated.`);
    }

    // 2. Migrate Routes
    console.log("🛣️ Migrating Routes...");
    for (const [id, route] of Object.entries(ROUTES)) {
      const routeData = {
        name: route.name,
        color: route.color,
        description: route.description,
        stops: route.stops,
        path: route.path.map(p => ({ latitude: p.lat, longitude: p.lng })), // Use latitude/longitude
        schedule: route.schedule
      };
      await setDoc(doc(db, "routes", id), routeData);
      console.log(`✅ Route ${id} migrated.`);
    }

    console.log("🎉 Migration Complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration Failed:", error);
    process.exit(1);
  }
};

migrate();
