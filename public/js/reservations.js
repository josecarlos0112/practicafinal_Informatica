document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "http://localhost:5000";
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../pages/login.html";
        return;
    }

    const chargersList = document.querySelector("#chargers");
    const chargerSelect = document.querySelector("#charger-id");
    const historyList = document.querySelector("#history-list");
    const reserveForm = document.querySelector("#reserve-form");

    async function fetchChargers() {
        try {
            const res = await fetch(`${API_URL}/chargers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const chargers = await res.json();
            chargers.forEach(charger => {
                const li = document.createElement("li");
                li.textContent = `Cargador ${charger.id} - ${charger.location} - Estado: ${charger.status}`;
                chargersList.appendChild(li);

                const option = document.createElement("option");
                option.value = charger.id;
                option.textContent = `Cargador ${charger.id} - ${charger.location}`;
                chargerSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error al obtener cargadores", error);
        }
    }

    async function fetchReservations() {
        try {
            const res = await fetch(`${API_URL}/reservations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const reservations = await res.json();
            reservations.forEach(reservation => {
                const li = document.createElement("li");
                li.textContent = `Cargador ${reservation.chargerId} - Fecha: ${reservation.date}`;
                historyList.appendChild(li);
            });
        } catch (error) {
            console.error("Error al obtener reservas", error);
        }
    }

    reserveForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const chargerId = chargerSelect.value;
        try {
            const res = await fetch(`${API_URL}/reserve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ chargerId })
            });
            if (res.ok) {
                alert("Reserva realizada con éxito");
                location.reload();
            } else {
                alert("Error al reservar");
            }
        } catch (error) {
            console.error("Error al enviar reserva", error);
        }
    });

    fetchChargers();
    fetchReservations();
});
