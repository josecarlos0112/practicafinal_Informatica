document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const API_BACKEND = "http://localhost:5000";

    let cargadoresData = [];
    let paginaActual = 1;
    const elementosPorPagina = 15;

    function renderizarTablaCargadores(filtrados = cargadoresData) {
        const tabla = document.getElementById("tablaCargadoresAdmin");
        tabla.innerHTML = "";

        const inicio = (paginaActual - 1) * elementosPorPagina;
        const fin = inicio + elementosPorPagina;
        const cargadoresMostrados = filtrados.slice(inicio, fin);

        cargadoresMostrados.forEach(c => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
      <td>${c.id}</td>
      <td>${c.ubicacion}</td>
      <td>${c.tipo}</td>
      <td>${c.estado}</td>
      <td>${c.nivel_carga}%</td>
      <td>${c.latitud}, ${c.longitud}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="cambiarEstadoCargador(${c.id}, '${c.estado}')">Cambiar Estado</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarCargador(${c.id})">Eliminar</button>
      </td>
    `;
            tabla.appendChild(fila);
        });

        renderizarPaginacion(filtrados.length);
    }

    function renderizarPaginacion(total) {
        const contenedor = document.getElementById("paginacionCargadores");
        contenedor.innerHTML = "";

        const totalPaginas = Math.ceil(total / elementosPorPagina);
        if (totalPaginas <= 1) return;

        const nav = document.createElement("nav");
        nav.setAttribute("aria-label", "Paginación");
        const ul = document.createElement("ul");
        ul.className = "pagination justify-content-center flex-wrap";

        // Botón <<
        const primero = document.createElement("li");
        primero.className = `page-item ${paginaActual === 1 ? "disabled" : ""}`;
        primero.innerHTML = `<button class="page-link">&laquo;</button>`;
        primero.onclick = () => {
            if (paginaActual > 1) {
                paginaActual = 1;
                renderizarTablaCargadores();
            }
        };
        ul.appendChild(primero);

        // Botón <
        const anterior = document.createElement("li");
        anterior.className = `page-item ${paginaActual === 1 ? "disabled" : ""}`;
        anterior.innerHTML = `<button class="page-link">&lt;</button>`;
        anterior.onclick = () => {
            if (paginaActual > 1) {
                paginaActual--;
                renderizarTablaCargadores();
            }
        };
        ul.appendChild(anterior);

        // Páginas visibles
        const rango = 2; // cuántos botones visibles a cada lado
        let inicio = Math.max(1, paginaActual - rango);
        let fin = Math.min(totalPaginas, paginaActual + rango);

        if (inicio > 1) {
            const li = document.createElement("li");
            li.className = "page-item disabled";
            li.innerHTML = `<span class="page-link">...</span>`;
            ul.appendChild(li);
        }

        for (let i = inicio; i <= fin; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === paginaActual ? "active" : ""}`;
            const btn = document.createElement("button");
            btn.className = "page-link";
            btn.textContent = i;
            btn.onclick = () => {
                paginaActual = i;
                renderizarTablaCargadores();
            };
            li.appendChild(btn);
            ul.appendChild(li);
        }

        if (fin < totalPaginas) {
            const li = document.createElement("li");
            li.className = "page-item disabled";
            li.innerHTML = `<span class="page-link">...</span>`;
            ul.appendChild(li);
        }

        // Botón >
        const siguiente = document.createElement("li");
        siguiente.className = `page-item ${paginaActual === totalPaginas ? "disabled" : ""}`;
        siguiente.innerHTML = `<button class="page-link">&gt;</button>`;
        siguiente.onclick = () => {
            if (paginaActual < totalPaginas) {
                paginaActual++;
                renderizarTablaCargadores();
            }
        };
        ul.appendChild(siguiente);

        // Botón >>
        const ultimo = document.createElement("li");
        ultimo.className = `page-item ${paginaActual === totalPaginas ? "disabled" : ""}`;
        ultimo.innerHTML = `<button class="page-link">&raquo;</button>`;
        ultimo.onclick = () => {
            if (paginaActual < totalPaginas) {
                paginaActual = totalPaginas;
                renderizarTablaCargadores();
            }
        };
        ul.appendChild(ultimo);

        nav.appendChild(ul);
        contenedor.appendChild(nav);
    }


    window.filtrarCargadores = function () {
        const texto = document.getElementById("buscadorCargadores").value.toLowerCase();
        const filtrados = cargadoresData.filter(c =>
            c.id.toString().includes(texto) ||
            c.ubicacion.toLowerCase().includes(texto) ||
            c.tipo.toLowerCase().includes(texto) ||
            c.estado.toLowerCase().includes(texto)
        );
        paginaActual = 1;
        renderizarTablaCargadores(filtrados);
    }

    async function cargarCargadoresAdmin() {
        try {
            const res = await fetch("http://localhost:5000/chargers", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            cargadoresData = await res.json();
            renderizarTablaCargadores();
        } catch (err) {
            console.error("Error al cargar cargadores:", err);
        }
    }


    window.cambiarEstadoCargador = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === 'libre' ? 'ocupado' : 'libre';

        try {
            await fetch(`${API_BACKEND}/chargers/${id}/estado`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            cargarCargadoresAdmin();
        } catch (err) {
            console.error("Error actualizando estado:", err);
        }
    };

    window.eliminarCargador = async (id) => {
        if (!confirm("¿Estás seguro de eliminar este cargador?")) return;
        try {
            await fetch(`${API_BACKEND}/chargers/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            cargarCargadoresAdmin();
        } catch (err) {
            console.error("Error eliminando cargador:", err);
        }
    };

    // Cargar al iniciar
    cargarCargadoresAdmin();
});
