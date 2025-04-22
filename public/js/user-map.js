document.addEventListener("DOMContentLoaded", () => {
    const API_BACKEND = "http://localhost:5000";
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../pages/login.html";
        return;
    }

    const map = L.map('map').setView([40.4168, -3.7038], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let markersGroup = L.layerGroup().addTo(map); // Grupo para poder limpiar marcadores
    let cargadoresData = []; // Guardar cargadores en memoria

    async function cargarCargadores() {
        try {
            const response = await fetch(`${API_BACKEND}/chargers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            cargadoresData = await response.json();
            mostrarCargadores('todos');
        } catch (error) {
            console.error("Error al cargar cargadores:", error);
        }
    }

    function mostrarCargadores(filtro) {
        markersGroup.clearLayers(); // Limpiar marcadores actuales

        cargadoresData.forEach(cargador => {
            if (filtro === 'todos' || cargador.estado === filtro) {
                const { id, ubicacion, latitud, longitud, estado } = cargador;

                if (latitud && longitud) {
                    const marker = L.marker([latitud, longitud], {
                        icon: L.icon({
                            iconUrl: estado === 'ocupado' ? '../img/marker-red.png' : '../img/marker-green.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                        })
                    }).addTo(markersGroup);

                    if (estado === 'libre') {
                        marker.bindPopup(`
                            <strong>${ubicacion}</strong><br>
                            <button class="btn btn-primary btn-sm mt-2" onclick="reservarCargador('${id}', '${ubicacion}')">
                                Reservar este cargador
                            </button>
                        `);
                    } else {
                        marker.bindPopup(`
                            <strong>${ubicacion}</strong><br>
                            <span class="text-danger">Cargador ocupado</span>
                        `);
                    }
                }
            }
        });
    }

    document.getElementById('filtro-todos').addEventListener('click', () => mostrarCargadores('todos'));
    document.getElementById('filtro-libres').addEventListener('click', () => mostrarCargadores('libre'));
    document.getElementById('filtro-ocupados').addEventListener('click', () => mostrarCargadores('ocupado'));

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
            location.reload(); // Puedes mejorar esto refrescando markers solamente
        } else {
            alert("Error al reservar cargador.");
        }
    } catch (error) {
        console.error("Error al enviar reserva:", error);
    }
}
