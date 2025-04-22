document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#pills-login form");
    const logoutButton = document.querySelector("#logoutButton");
    const API_URL = "http://localhost:5000"; // Backend URL

    const rolePaths = {
        1: "../pages/admin-dashboard.html", // Admin
        2: "../pages/user-dashboard.html",  // Usuario
        3: "../pages/tech-dashboard.html"   // Técnico
    };

    function checkAuthentication() {
        const token = localStorage.getItem("token");
        const role = parseInt(localStorage.getItem("role")); // 👈 Convertir a número
        const currentPath = window.location.pathname;

        if (!token) {
            // Si no hay token y no estamos en login, redirigir al login
            if (!currentPath.includes("login.html")) {
                window.location.href = "/pages/login.html";
            }
            return;
        }

        if (rolePaths[role] && !currentPath.includes(rolePaths[role])) {
            window.location.href = rolePaths[role]; // 👈 Usar role directamente
        }
    }

    checkAuthentication(); // Verificar si el usuario está autenticado

    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.querySelector("#loginEmail").value.trim();
        const password = document.querySelector("#loginPassword").value.trim();

        if (!email || !password) {
            alert("Por favor, ingrese su correo y contraseña.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error en el inicio de sesión");
            }

            // Guardamos token y rol en LocalStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            alert("Inicio de sesión exitoso. Redirigiendo...");

            // Redirigir al dashboard correspondiente
            const redirectPath = rolePaths[data.role];
            if (redirectPath) {
                window.location.href = redirectPath;
            } else {
                alert("Rol desconocido. No se puede redirigir.");
            }

        } catch (error) {
            alert(error.message);
        }
    });

    // Función de cierre de sesión
    logoutButton?.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        alert("Sesión cerrada. Redirigiendo al inicio...");
        window.location.href = "/pages/login.html";
    });
});
