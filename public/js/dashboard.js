document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userRoleSpan = document.querySelector("#user-role");
    const navLinks = document.querySelector("#nav-links");
    const dashboardContent = document.querySelector("#dashboard-content");
    const logoutButton = document.querySelector("#logoutButton");

    if (!token || !role) {
        window.location.href = "../pages/login.html";
        return;
    }

    /*userRoleSpan.textContent = role.charAt(0).toUpperCase() + role.slice(1);

    const rolePages = {
        admin: [
            { name: "Gestión de usuarios", link: "manage-users.html" },
            { name: "Reportes", link: "reports.html" },
            { name: "Configuraciones", link: "settings.html" }
        ],
        user: [
            { name: "Reservar cargador", link: "reserve-charger.html" },
            { name: "Historial de reservas", link: "history.html" },
            { name: "Soporte", link: "support.html" }
        ],
        tech: [
            { name: "Estado de cargadores", link: "chargers-status.html" },
            { name: "Mantenimiento", link: "maintenance.html" },
            { name: "Reportes de fallos", link: "failures.html" }
        ]
    };

    // Cargar la navegación dinámica con estilos modernos
    rolePages[role].forEach(page => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `../pages/${page.link}`;
        a.textContent = page.name;
        a.classList.add("nav-link");
        li.appendChild(a);
        li.classList.add("nav-item");
        navLinks.appendChild(li);
    });

    // Cargar contenido dinámico con un diseño atractivo
    dashboardContent.innerHTML = `
        <div class="dashboard-container">
            <h2>Bienvenido al panel de ${role}</h2>
            <div class="card-container">
                ${rolePages[role].map(page => `
                    <div class="card">
                        <h3>${page.name}</h3>
                        <a href="../pages/${page.link}" class="btn">Acceder</a>
                    </div>
                `).join('')}
            </div>
        </div>
    `;*/

    // Cerrar sesión
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        alert("Sesión cerrada. Redirigiendo al login...");
        window.location.href = "../pages/login.html";
    });

});