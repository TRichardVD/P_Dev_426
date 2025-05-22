// let map;
Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhODUxNWEzNy1lYjkxLTQyMjUtYjIwYS00OGVlYzEwNTRmN2IiLCJpZCI6Mjg4NzMwLCJpYXQiOjE3NDMxNjYyMzh9.DiCViUqiY8bfqjpLdNtcKLZO5RHs6JVUH3UjEQJfssY";

const pinBuilder = new Cesium.PinBuilder();
// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.  CesiumWidget
const viewer = new Cesium.Viewer("cesiumContainer", {
    timeline: false,
    animation: false,
    infoBox: false, // Désactive la box par défaut
});
let i = 0;

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
            pinBuilder.fromMakiIconId("marker-stroked", Cesium.Color.RED, 48)
        ).then(function (canvas) {
            return viewer.entities.add({
                name: "You",
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
    // Récupère les listes de l'utilisateur
    const userLists = await fetch("/user/list", {
        method: "GET",
    })
        .then((response) => response.json())
        .catch((error) => {
            console.error("Error loading or processing data:", error);
            return [];
        });
    console.log(userLists);

    // Crée une map siteId -> couleur de la liste
    const siteIdToColor = {};
    if (Array.isArray(userLists)) {
        userLists.forEach((list) => {
            // On suppose que chaque list a une propriété color et une propriété sites (array d'id)
            if (Array.isArray(list.sites) && list.color) {
                list.sites.forEach((site) => {
                    siteIdToColor[site._id] = list.color;
                });
            }
        });
    }
    console.log(siteIdToColor);
    fetch("./site/sites")
        .then((response) => response.json())
        .then((data) => {
            data.forEach((site) => {
                const lat = site.coordinates.coordinates[1];
                const lon = site.coordinates.coordinates[0];
                const name = site.name;
                const link = "./site/" + site.id;
                let color;
                let marker;

                // Si le site est dans une liste utilisateur, on utilise la couleur de la liste
                if (siteIdToColor[site.id]) {
                    // On suppose que la couleur est une string CSS, on la convertit en Cesium.Color
                    color = Cesium.Color.fromCssColorString(
                        siteIdToColor[site.id]
                    );
                    marker = "star"; // On peut choisir un marker spécial ou garder le même
                } else if (site.category == "Cultural") {
                    color = Cesium.Color.YELLOW;
                    marker = "museum";
                } else if (site.category == "Natural") {
                    color = Cesium.Color.GREEN;
                    marker = "park";
                } else {
                    color = Cesium.Color.ROYALBLUE;
                    marker = "zoo";
                }

                //afficher sur la carte
                pinBuilder
                    .fromMakiIconId(marker, color, 48)
                    .then(function (canvas) {
                        viewer.entities.add({
                            name: name,
                            position: Cesium.Cartesian3.fromDegrees(lon, lat),
                            billboard: {
                                image: canvas.toDataURL(),
                                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            },
                            description: `<b>${name}</b><br>Catégorie : ${site.category}<br><a href="${link}" target="_blank">Voir plus</a>`,
                        });
                    });
            });
        })
        .catch((error) =>
            console.error("Error loading or processing data:", error)
        );
}

// Gestion de la box personnalisée
const customInfoBox = document.getElementById("customInfoBox");
const customInfoBoxContent = document.getElementById("customInfoBoxContent");
const closeInfoBoxBtn = document.getElementById("closeInfoBox");
if (closeInfoBoxBtn) {
    closeInfoBoxBtn.onclick = () => {
        customInfoBox.style.display = "none";
    };
}

// Affichage de la box personnalisée lors du clic sur un pin
viewer.selectedEntityChanged.addEventListener(function (entity) {
    if (entity && entity.billboard) {
        customInfoBoxContent.innerHTML =
            entity.description && entity.description.getValue
                ? entity.description.getValue()
                : entity.description || "<i>Aucune information</i>";
        customInfoBox.style.display = "flex";
    } else {
        customInfoBox.style.display = "none";
    }
});
