import fs from 'fs';
import https from 'https';

// Coordinates of the 14 stops as defined in demoData.js
// OSRM expects coordinates in lng,lat format
const stops = [
  { lng: 79.856310, lat: 12.020523 }, // 1. Library
  { lng: 79.855354, lat: 12.020846 }, // 2. Reading Room
  { lng: 79.853662, lat: 12.017482 }, // 3. Shopping Complex
  { lng: 79.850368, lat: 12.019190 }, // 4. Health Centre
  { lng: 79.848055, lat: 12.022273 }, // 5. Mother Teresa Mess
  { lng: 79.847169, lat: 12.022946 }, // 6. Narmada Hostel
  { lng: 79.848924, lat: 12.029539 }, // 7. MAKA Hostel
  { lng: 79.850892, lat: 12.029693 }, // 8. Amudham Mess
  { lng: 79.852368, lat: 12.029188 }, // 9. Mega Mess
  { lng: 79.853402, lat: 12.027674 }, // 10. Boys Tea Time
  { lng: 79.855489, lat: 12.028419 }, // 11. Food Science
  { lng: 79.856865, lat: 12.032330 }, // 12. Mass Media
  { lng: 79.857597, lat: 12.033131 }, // 13. SJ Bus Stop
  { lng: 79.857984, lat: 12.031327 }  // 14. UNESCO Bus Stop
];

// OSRM routing profile: driving
const profile = 'driving';
// Format coordinates for OSRM URL
const coordinatesString = stops.map(stop => `${stop.lng},${stop.lat}`).join(';');

// Build OSRM API URL
// Return geometries in geojson format (easier to read out full paths)
const url = `https://router.project-osrm.org/route/v1/${profile}/${coordinatesString}?geometries=geojson&overview=full`;

console.log(`Fetching route from OSRM API...`);
console.log(url);

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.code !== 'Ok') {
        console.error('OSRM API Error:', response.code, response.message);
        return;
      }

      // Extract geometry points (lng, lat)
      const routeGeometry = response.routes[0].geometry.coordinates;

      // Convert mapping array to JS object format
      // Need [lat, lng] array mapped to { lat, lng } format used in demoData.js
      const pathArray = routeGeometry.map(point => ({
        lat: point[1],
        lng: point[0]
      }));

      // Output to a file so we can view it
      fs.writeFileSync('routeGeometry.json', JSON.stringify(pathArray, null, 2));
      console.log(`Saved ${pathArray.length} coordinate points to routeGeometry.json`);

    } catch (e) {
      console.error('Error parsing OSRM response:', e);
    }
  });

}).on('error', (err) => {
  console.error('HTTPS Get Error:', err.message);
});
