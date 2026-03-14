// One-time seed script to populate Firestore with campus data
// Run with: node scripts/seedFirestore.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyARKn3gfNWA0cwDGU7x6cDi_nRNAgGN0OA",
  authDomain: "pu-bus.firebaseapp.com",
  databaseURL: "https://pu-bus-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pu-bus",
  storageBucket: "pu-bus.firebasestorage.app",
  messagingSenderId: "368216113936",
  appId: "1:368216113936:web:7a61133e16c7855eef1b95",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── 14 Bus Stops ──────────────────────────────────────────
const STOPS = {
  stop_001: { name: 'Library', latitude: 12.020523, longitude: 79.856310, routes: ['university_route'] },
  stop_002: { name: 'Reading Room', latitude: 12.020846, longitude: 79.855354, routes: ['university_route'] },
  stop_003: { name: 'Shopping Complex', latitude: 12.017482, longitude: 79.853662, routes: ['university_route'] },
  stop_004: { name: 'Health Centre', latitude: 12.019190, longitude: 79.850368, routes: ['university_route'] },
  stop_005: { name: 'Mother Teresa Mess', latitude: 12.022273, longitude: 79.848055, routes: ['university_route'] },
  stop_006: { name: 'Narmada Hostel', latitude: 12.022946, longitude: 79.847169, routes: ['university_route'] },
  stop_007: { name: 'MAKA Hostel', latitude: 12.029539, longitude: 79.848924, routes: ['university_route'] },
  stop_008: { name: 'Amudham Mess', latitude: 12.029693, longitude: 79.850892, routes: ['university_route'] },
  stop_009: { name: 'Mega Mess', latitude: 12.029188, longitude: 79.852368, routes: ['university_route'] },
  stop_010: { name: 'Boys Tea Time', latitude: 12.027674, longitude: 79.853402, routes: ['university_route'] },
  stop_011: { name: 'Food Science', latitude: 12.028419, longitude: 79.855489, routes: ['university_route'] },
  stop_012: { name: 'Mass Media', latitude: 12.032330, longitude: 79.856865, routes: ['university_route'] },
  stop_013: { name: 'SJ Bus Stop', latitude: 12.033131, longitude: 79.857597, routes: ['university_route'] },
  stop_014: { name: 'UNESCO Bus Stop', latitude: 12.031327, longitude: 79.857984, routes: ['university_route'] },
};

// ── Route with bi-directional path ────────────────────────
const ROUTES = {
  university_route: {
    name: 'University Campus Route',
    color: '#4361ee',
    description: 'Bi-directional campus shuttle connecting all departments and hostels',
    stops: Object.keys(STOPS),
    path: [
      // Forward: 1 → 14
      { latitude: 12.020523, longitude: 79.856310 },
      { latitude: 12.020846, longitude: 79.855354 },
      { latitude: 12.020918, longitude: 79.855107 },
      { latitude: 12.017482, longitude: 79.853662 },
      { latitude: 12.018541, longitude: 79.850744 },
      { latitude: 12.019190, longitude: 79.850368 },
      { latitude: 12.021921, longitude: 79.848978 },
      { latitude: 12.022273, longitude: 79.848055 },
      { latitude: 12.022540, longitude: 79.847429 },
      { latitude: 12.022946, longitude: 79.847169 },
      { latitude: 12.024112, longitude: 79.846629 },
      { latitude: 12.026538, longitude: 79.847420 },
      { latitude: 12.029166, longitude: 79.848368 },
      { latitude: 12.029539, longitude: 79.848924 },
      { latitude: 12.030007, longitude: 79.849891 },
      { latitude: 12.029693, longitude: 79.850892 },
      { latitude: 12.029188, longitude: 79.852368 },
      { latitude: 12.027674, longitude: 79.853402 },
      { latitude: 12.028419, longitude: 79.855489 },
      { latitude: 12.028858, longitude: 79.856544 },
      { latitude: 12.032330, longitude: 79.856865 },
      { latitude: 12.033131, longitude: 79.857597 },
      { latitude: 12.032327, longitude: 79.858761 },
      { latitude: 12.031327, longitude: 79.857984 },
      // Return: 14 → 1
      { latitude: 12.032327, longitude: 79.858761 },
      { latitude: 12.033131, longitude: 79.857597 },
      { latitude: 12.032330, longitude: 79.856865 },
      { latitude: 12.028858, longitude: 79.856544 },
      { latitude: 12.028419, longitude: 79.855489 },
      { latitude: 12.027674, longitude: 79.853402 },
      { latitude: 12.029188, longitude: 79.852368 },
      { latitude: 12.029693, longitude: 79.850892 },
      { latitude: 12.030007, longitude: 79.849891 },
      { latitude: 12.029539, longitude: 79.848924 },
      { latitude: 12.029166, longitude: 79.848368 },
      { latitude: 12.026538, longitude: 79.847420 },
      { latitude: 12.024112, longitude: 79.846629 },
      { latitude: 12.022946, longitude: 79.847169 },
      { latitude: 12.022540, longitude: 79.847429 },
      { latitude: 12.022273, longitude: 79.848055 },
      { latitude: 12.021921, longitude: 79.848978 },
      { latitude: 12.019190, longitude: 79.850368 },
      { latitude: 12.018541, longitude: 79.850744 },
      { latitude: 12.017482, longitude: 79.853662 },
      { latitude: 12.020918, longitude: 79.855107 },
      { latitude: 12.020846, longitude: 79.855354 },
      { latitude: 12.020523, longitude: 79.856310 },
    ],
    schedule: { start: '07:30', end: '21:00', frequency: 10 }
  }
};

// ── Run seeding ───────────────────────────────────────────
async function seed() {
  console.log('🌱 Seeding Firestore...\n');

  // Seed stops
  for (const [id, data] of Object.entries(STOPS)) {
    await setDoc(doc(db, 'stops', id), data);
    console.log(`  ✅ stops/${id} → ${data.name}`);
  }

  // Seed routes
  for (const [id, data] of Object.entries(ROUTES)) {
    await setDoc(doc(db, 'routes', id), data);
    console.log(`  ✅ routes/${id} → ${data.name}`);
  }

  console.log('\n🎉 Done! 14 stops + 1 route seeded to Firestore.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
