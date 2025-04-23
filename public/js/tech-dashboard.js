document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    async function cargarCargadoresTecnico() {
        try {
            const res = await fetch("http://localhost:5000/chargers", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const cargadores = await res.json();
            const contenedor = document.getElementById("chargers-container");
            contenedor.innerHTML = `
        <h4 class="mb-3">Estado Actual de Cargadores</h4>
        <table class="table table-dark table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ubicación</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Nivel Carga</th>
            </tr>
          </thead>
          <tbody>
            ${cargadores.map(c => `
              <tr>
                <td>${c.id}</td>
                <td>${c.ubicacion}</td>
                <td>${c.tipo}</td>
                <td>${c.estado}</td>
                <td>${c.nivel_carga}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
        } catch (err) {
            console.error("❌ Error al cargar cargadores:", err);
        }
    }

    cargarCargadoresTecnico();
});
