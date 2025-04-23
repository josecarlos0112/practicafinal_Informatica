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

    // Cerrar sesión
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        alert("Sesión cerrada. Redirigiendo al login...");
        window.location.href = "../pages/login.html";
    });

});