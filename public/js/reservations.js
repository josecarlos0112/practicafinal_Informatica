document.addEventListener("DOMContentLoaded", async () => {
    const API_BACKEND = "http://localhost:5000"; // Tu servidor backend
    const API_OPENCHARGEMAP = "https://api.openchargemap.io/v3/poi/?output=json&countrycode=ES&latitude=40.4168&longitude=-3.7038&distance=20"; // Cargadores en Madrid
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../pages/login.html";
        return;
    }

    const chargersList = document.querySelector("#chargers");
    const chargerSelect = document.querySelector("#charger-id");
    const historyList = document.querySelector("#history-list");
    const reserveForm = document.querySelector("#reserve-form");

    let cargadoresExternos = []; // Guardaremos los cargadores que obtenemos

    // 👉 Obtener cargadores de Open Charge Map
    async function fetchChargers() {
        try {
            const res = await fetch(API_OPENCHARGEMAP);
            cargadoresExternos = await res.json();

            cargadoresExternos.forEach((charger, index) => {
                const locationName = charger.AddressInfo?.Title || "Ubicación desconocida";
                const id = charger.ID; // ID único de Open Charge Map

                // Mostrar en lista
                const li = document.createElement("li");
                li.textContent = `Cargador ${id} - ${locationName}`;
                chargersList.appendChild(li);

                // Agregar al select
                const option = document.createElement("option");
                option.value = index; // Guardamos el índice
                option.textContent = `Cargador ${id} - ${locationName}`;
                chargerSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error al obtener cargadores externos", error);
        }
    }

    // 👉 Obtener historial de reservas locales
    async function fetchReservations() {
        try {
            const res = await fetch(`${API_BACKEND}/reservations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const reservations = await res.json();
            historyList.innerHTML = ""; // Limpiar historial
            reservations.forEach(reservation => {
                const li = document.createElement("li");
                li.textContent = `Cargador ${reservation.cargador_id} - ${reservation.ubicacion} - Fecha: ${new Date(reservation.fecha_reserva).toLocaleString()}`;
                historyList.appendChild(li);
            });
        } catch (error) {
            console.error("Error al obtener historial", error);
        }
    }

    // 👉 Al enviar formulario de reserva
    reserveForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedIndex = chargerSelect.value;
        const selectedCharger = cargadoresExternos[selectedIndex];

        if (!selectedCharger) {
            alert("Selecciona un cargador válido.");
            return;
        }

        const chargerId = selectedCharger.ID;
        const locationName = selectedCharger.AddressInfo?.Title || "Ubicación desconocida";

        try {
            const res = await fetch(`${API_BACKEND}/reserve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ chargerId, locationName })
            });

            if (res.ok) {
                alert("Reserva realizada con éxito");
                fetchReservations(); // Recargar historial
            } else {
                alert("Error al reservar");
            }
        } catch (error) {
            console.error("Error al enviar reserva", error);
        }
    });

    // Llamadas iniciales
    fetchChargers();
    fetchReservations();
});
