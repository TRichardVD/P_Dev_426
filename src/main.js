let map;

function initMap() {
  map = L.map('map').setView([0, 0], 2);
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
    .catch((error) =>
      console.error('Error loading or processing data:', error)
    );
}

navigator.geolocation.watchPosition((pos) => {
  map.setView([pos.coords.latitude, pos.coords.longitude], 12);
});

initMap();
