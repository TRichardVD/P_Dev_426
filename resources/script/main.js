let map;

function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    fetch('./api/site/sites')
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            data.forEach((site) => {
                const lat = site.coordinates.coordinates[1];
                const lon = site.coordinates.coordinates[0];
                const name = site.name;
                const link = './api/site/' + site.id;

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
