const map = L.map('map').setView([46.519962, 6.633597], 12);

// Ajouter un fond de carte
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

fetch('../world-heritage-list.json')
  .then((response) => response.json())
  .then((data) => {
    data.forEach((site) => {
      const lat = site.coordinates.lat;
      const lon = site.coordinates.lon;
      const name = site.site;
      L.marker([lat, lon]).addTo(map).bindPopup(name);
    });
  })
  .catch((error) => console.error('Error loading or processing data:', error));
