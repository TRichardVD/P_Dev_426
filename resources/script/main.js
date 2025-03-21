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
        const lat = site.latitude;
        const lon = site.longitude;
        const name = site.site;
        const link = './api/site/' + calculateCustomId(site);

        // Créer un pop-up avec un lien cliquable
        const popupContent = `<b>${name}</b><br><a href="${link}">Voir plus</a>`;

        // Ajouter le marqueur avec le pop-up
        L.marker([lat, lon]).addTo(map).bindPopup(popupContent);
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

function calculateCustomId(site) {
  try {
    if (!site) {
      return null;
    }

    const { latitude, longitude } = site;
    if (!latitude || !longitude) {
      return null;
    }

    return `${latitude}_${longitude}`.replace(/\./g, '_');
  } catch (error) {
    console.error('Error calculating custom ID:', error);
    throw error;
  }
}
