document.getElementById("cargarDatos").addEventListener("click", async () => {
    try {
        const response = await fetch("http://localhost:5000/");
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
});
