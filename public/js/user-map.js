document.addEventListener("DOMContentLoaded", () => {
    const API_BACKEND = "http://localhost:5000";
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../pages/login.html";
        return;
    }

    // Inicializar mapa
    window.map = L.map('map').setView([40.4168, -3.7038], 15); // Centro en Madrid

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

            if (response.status === 401 || response.status === 403) {
                alert('⚠️ Sesión expirada o acceso denegado. Por favor inicia sesión nuevamente.');
                localStorage.removeItem('token');
                window.location.href = '../pages/login.html';
                return;
            }

            const cargadores = await response.json();
            cargadoresData = cargadores;
            mostrarCargadores('todos');

        } catch (error) {
            console.error('Error al cargar cargadores:', error);
        }
    }


    function mostrarCargadores(filtro) {
        markersGroup.clearLayers(); // Limpiar marcadores actuales

        cargadoresData.forEach(cargador => {
            if (filtro === 'todos' || cargador.estado === filtro) {
                const { id, ubicacion, latitud, longitud, estado, nivel_carga } = cargador;

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
                            <p>Nivel Bateria: ${Math.floor(nivel_carga)}%</p>
                            <button class="btn btn-primary btn-sm mt-2" onclick="reservarCargador('${id}', '${ubicacion}', '${nivel_carga}')">
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

    async function cargarHistorialReservas() {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${API_BACKEND}/reservas`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const reservas = await response.json();
            const tabla = document.getElementById("tablaReservas");
            tabla.innerHTML = "";

            reservas.forEach(reserva => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                <td>${reserva.id}</td>
                <td>${reserva.ubicacion}</td>
                <td>${new Date(reserva.fecha_reserva).toLocaleString()}</td>
                <td>${reserva.nivel_carga ?? "N/A"}%</td>
                <td><span class="badge bg-${reserva.estado === 'activa' ? 'success' : 'secondary'}">${reserva.estado}</span></td>
            `;
                tabla.appendChild(fila);
            });

        } catch (error) {
            console.error("❌ Error cargando historial de reservas:", error);
        }
    }

    // Función para reservar cargador
    window.reservarCargador = function(chargerId, locationName) {
        document.getElementById('ubicacionCargador').value = locationName;
        document.getElementById('idCargador').value = chargerId;

        const modal = new bootstrap.Modal(document.getElementById('modalReserva'));
        modal.show();
    };


    document.getElementById('filtro-todos').addEventListener('click', () => mostrarCargadores('todos'));
    document.getElementById('filtro-libres').addEventListener('click', () => mostrarCargadores('libre'));
    document.getElementById('filtro-ocupados').addEventListener('click', () => mostrarCargadores('ocupado'));
    const formReserva = document.getElementById('formReserva');
    formReserva?.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previene el comportamiento predeterminado del formulario

        const token = localStorage.getItem('token');
        const chargerId = document.getElementById('idCargador')?.value;
        const locationName = document.getElementById('ubicacionCargador')?.value;
        const fecha = document.getElementById('fechaReserva')?.value;
        const hora = document.getElementById('horaReserva')?.value;

        try {
            const res = await fetch(`${API_BACKEND}/reserve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    chargerId,
                    locationName,
                    fecha,
                    hora
                })
            });

            if (res.ok) {
                const toast = new bootstrap.Toast(document.getElementById('toastReserva'));
                toast.show();
                setTimeout(() => window.location.reload(), 2500);
            } else {
                const toast = new bootstrap.Toast(document.getElementById('toastError'));
                toast.show();
            }
        } catch (error) {
            console.error('Error enviando reserva:', error);
        }
    });
    cargarCargadores();
    cargarHistorialReservas();
});

