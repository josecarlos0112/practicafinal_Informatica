document.addEventListener("DOMContentLoaded", () => {
    const API_OPENCHARGEMAP = "https://api.openchargemap.io/v3/poi/?output=json&countrycode=ES&latitude=40.4168&longitude=-3.7038&distance=20";

    // Inicializar el mapa
    const map = L.map('map').setView([40.4168, -3.7038], 12); // Madrid

    // Cargar el mapa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Función para cargar cargadores desde Open Charge Map
    async function cargarCargadores() {
        try {
            const response = await fetch(API_OPENCHARGEMAP);
            const cargadores = await response.json();

            cargadores.forEach(cargador => {
                const lat = cargador.AddressInfo.Latitude;
                const lon = cargador.AddressInfo.Longitude;
                const title = cargador.AddressInfo.Title || "Cargador sin nombre";

                if (lat && lon) {
                    L.marker([lat, lon])
                        .addTo(map)
                        .bindPopup(`<strong>${title}</strong><br>Lat: ${lat}<br>Lon: ${lon}`);
                }
            });
        } catch (error) {
            console.error("Error al cargar cargadores:", error);
        }
    }

    cargarCargadores();
});
