document.addEventListener("DOMContentLoaded", () => {
    const API_BACKEND = "http://localhost:5000"; // URL del backend
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../pages/login.html";
        return;
    }

    // Inicializar el mapa
    const map = L.map('map').setView([40.4168, -3.7038], 12); // Centro Madrid

    // Cargar capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Función para cargar cargadores
    async function cargarCargadores() {
        try {
            const response = await fetch(`${API_BACKEND}/chargers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const cargadores = await response.json();

            cargadores.forEach(cargador => {
                const { id, location, latitud, longitud, estado } = cargador;

                if (latitud && longitud) {
                    const marker = L.marker([latitud, longitud], {
                        icon: L.icon({
                            iconUrl: estado === 'ocupado' ? '../img/marker-red.png' : '../img/romo.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                        })
                    }).addTo(map);

                    if (estado === 'libre') {
                        marker.bindPopup(`
                            <strong>${location}</strong><br>
                            <button class="btn btn-primary btn-sm mt-2" onclick="reservarCargador('${id}', '${location}')">
                                Reservar este cargador
                            </button>
                        `);
                    } else {
                        marker.bindPopup(`
                            <strong>${location}</strong><br>
                            <span class="text-danger">Cargador ocupado</span>
                        `);
                    }
                }
            });

        } catch (error) {
            console.error("Error al cargar cargadores:", error);
        }
    }

    cargarCargadores();
});

// Función para reservar cargador
async function reservarCargador(chargerId, locationName) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("http://localhost:5000/reserve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ chargerId, locationName })
        });

        if (res.ok) {
            alert("Reserva realizada con éxito. Actualizando mapa...");
            location.reload(); // Recarga la página para ver los cambios
        } else {
            alert("Error al reservar cargador.");
        }
    } catch (error) {
        console.error("Error al enviar reserva:", error);
    }
}
