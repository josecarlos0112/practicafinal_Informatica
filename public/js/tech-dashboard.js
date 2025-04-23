document.addEventListener("DOMContentLoaded", () => {
    fetch("/chargers", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(chargers => {
        const cont = document.getElementById("chargers-container");
        chargers.forEach(c => {
            const div = document.createElement("div");
            div.innerHTML =
            '<h3>Cargador ${c.id} - ${c.ubicacion}</h3>\n' +
                '                <p><strong>Estado:</strong> ${c.estado}</p>\n' +
                '                <p><strong>Nivel carga:</strong> ${c.nivel_carga}%</p>\n' +
                '                <button onclick="abrirModal(${c.id})">🚨 Reportar problema</button>\n' +
                '                <hr>'
            ;
            cont.appendChild(div);
        });
    });
});

        let cargadorSeleccionado = null;

        function abrirModal(id) {
            cargadorSeleccionado = id;
            document.getElementById("modal-incidencia").style.display = "block";
        }

        function enviarIncidencia() {
            const descripcion = document.getElementById("descripcion").value;
            if (!descripcion.trim()) {
                alert("Por favor, escribe una descripción.");
                return;
            }

            fetch("/incidencias", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({ cargador_id: cargadorSeleccionado, descripcion })
            })
                .then(res => res.json())
                .then(data => {
                alert(data.message);
                document.getElementById("modal-incidencia").style.display = "none";
                document.getElementById("descripcion").value = "";
            })
                .catch(err => {
                console.error(err);
                alert("Error al enviar la incidencia.");
            });
        }