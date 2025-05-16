// let map;¨
Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhODUxNWEzNy1lYjkxLTQyMjUtYjIwYS00OGVlYzEwNTRmN2IiLCJpZCI6Mjg4NzMwLCJpYXQiOjE3NDMxNjYyMzh9.DiCViUqiY8bfqjpLdNtcKLZO5RHs6JVUH3UjEQJfssY';

const pinBuilder = new Cesium.PinBuilder();
// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.  CesiumWidget
const viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: false,
    animation: false,
});
let i = 0;

/* Ancienne map 2d
function initMap() {
  map = L.map("map").setView([0, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
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
      console.error("Error loading or processing data:", error)
    );
}*/

//fly to custumer location
navigator.geolocation.watchPosition((pos) => {
    if (i == 0) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                [pos.coords.longitude],
                [pos.coords.latitude],
                20000
            ),
        });

        const CostomerPos = Promise.resolve(
            pinBuilder.fromMakiIconId('marker-stroked', Cesium.Color.RED, 48)
        ).then(function (canvas) {
            return viewer.entities.add({
                name: 'You',
                position: Cesium.Cartesian3.fromDegrees(
                    [pos.coords.longitude],
                    [pos.coords.latitude]
                ),
                billboard: {
                    image: canvas.toDataURL(),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                },
            });
        });

        i++;
    }
});

//initMap();
init3dMap();

async function init3dMap() {
    fetch('./api/site/sites')
        .then((response) => response.json())
        .then((data) => {
            data.forEach((site) => {
                const lat = site.coordinates.coordinates[1];
                const lon = site.coordinates.coordinates[0];
                const name = site.name;
                //const letter = name.charAt(0);
                const link = './api/site/' + site.id;
                let color;
                let marker;
                if (site.category == 'Cultural') {
                    color = Cesium.Color.YELLOW;
                    marker = 'museum';
                } else if (site.category == 'Natural') {
                    color = Cesium.Color.GREEN;
                    marker = 'park';
                } else {
                    color = Cesium.Color.ROYALBLUE;
                    marker = 'zoo';
                }

                //afficher sur la carte
                pinBuilder
                    .fromMakiIconId(marker, color, 48)
                    .then(function (canvas) {
                        viewer.entities.add({
                            name: name,
                            description: `<b>${name}</b><br>catégorie : ${site.category}</br><a href="${link}" target="_blank">Voir plus</a>`,
                            position: Cesium.Cartesian3.fromDegrees(lon, lat),
                            billboard: {
                                image: canvas.toDataURL(),
                                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            },
                        });
                    });
            });
        })
        .catch((error) =>
            console.error('Error loading or processing data:', error)
        );
}
