document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    async function cargarHistorialReservas() {
        try {
            const response = await fetch("http://localhost:5000/reservas", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
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

        } catch (err) {
            console.error("❌ Error cargando historial de reservas:", err);
        }
    }

    cargarHistorialReservas();
});
