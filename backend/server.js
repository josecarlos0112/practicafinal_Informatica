// 📌 Cargar variables de entorno
require("dotenv").config();
console.log("Conectando a MySQL en:", process.env.DB_HOST);

// 📌 Importar módulos
const express = require("express");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const path = require("path");

const app = express();
app.use(cors({ origin: "*" })); // Habilitar CORS para todas las solicitudes
app.use(express.json()); // Para recibir JSON en las peticiones

const SECRET_KEY = process.env.JWT_SECRET || "clave_secreta";

// 📌 Conectar a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// 📌 Verificar conexión
db.connect(err => {
    if (err) {
        console.error("❌ Error conectando a MySQL:", err);
        return;
    }
    console.log("✅ Conexión a MySQL exitosa");
});

// 📌 Servir archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// 📌 Redirigir la raíz al login
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/pages/login.html"));
});

// 📌 Ruta para autenticar usuario (USANDO BASE DE DATOS REAL)
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("❌ Error en la consulta de login:", err);
            return res.status(500).json({ error: "Error en el servidor" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        const user = results[0];

        if (user.password_hash !== password) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Generar el token JWT incluyendo id, email y rol_id
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.rol_id },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json({ token, role: user.rol_id }); // Ahora devuelve role_id (1, 2 o 3)
    });
});

// 📌 Middleware para verificar token
function authenticateToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Acceso denegado" });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Token inválido" });
        req.user = user;
        next();
    });
}

// 📌 Ruta protegida para obtener datos del usuario autenticado
app.get("/user", authenticateToken, (req, res) => {
    res.json({ email: req.user.email, role: req.user.role });
});

// 📌 Ruta para obtener usuarios desde MySQL
app.get("/3", (req, res) => {
    db.query("SELECT * FROM usuarios", (err, results) => {
        if (err) {
            console.error("❌ Error en consulta:", err);
            res.status(500).json({ error: "Error obteniendo usuarios", details: err });
            return;
        }
        res.json(results);
    });
});

// 📌 Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// 📌 Crear nueva reserva
app.post("/reserve", authenticateToken, (req, res) => {
    const { chargerId, fecha, hora } = req.body;
    const userId = req.user.id;

    if (!chargerId || !fecha || !hora) {
        return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const fechaCompleta = `${fecha} ${hora}:00`; // Generamos un TIMESTAMP válido

    const sqlReserva = `
        INSERT INTO reservas (usuario_id, cargador_id, fecha_reserva, estado)
        VALUES (?, ?, ?, 'activa')
    `;

    const sqlActualizarCargador = `
        UPDATE cargadores SET estado = 'ocupado' WHERE id = ?
    `;

    db.query(sqlReserva, [userId, chargerId, fechaCompleta], (err) => {
        if (err) {
            console.error("❌ Error insertando reserva:", err);
            return res.status(500).json({ message: "Error al guardar la reserva" });
        }

        db.query(sqlActualizarCargador, [chargerId], (err2) => {
            if (err2) {
                console.error("❌ Error actualizando cargador:", err2);
                return res.status(500).json({ message: "Reserva hecha, pero no se cambió el estado" });
            }

            res.json({ message: "✅ Reserva completada y cargador actualizado" });
        });
    });
});

// 📌 Obtener historial de reservas del usuario autenticado
app.get("/reservations", authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT id, cargador_id, ubicacion, fecha_reserva
        FROM reservas
        WHERE usuario_id = ?
        ORDER BY fecha_reserva DESC
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("❌ Error obteniendo historial:", err);
            return res.status(500).json({ error: "Error del servidor" });
        }
        res.json(results);
    });
});

// 📌 Ruta para obtener todos los cargadores
app.get('/chargers', authenticateToken, (req, res) => {
    const sql = `
        SELECT id, ubicacion, tipo, latitud, longitud, estado, nivel_carga
        FROM cargadores
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener cargadores:", err);
            return res.status(500).json({ error: "Error al obtener cargadores" });
        }

        res.json(results);
    });
});


// 📌 Crear nueva incidencia
app.post("/incidencias", authenticateToken, (req, res) => {
    const { cargador_id, descripcion } = req.body;
    const usuario_id = req.user.id;
    const fecha = new Date();

    if (!cargador_id || !descripcion) {
        return res.status(400).json({ message: "Datos incompletos" });
    }

    const sql =
        'INSERT INTO incidencias (cargador_id, descripcion, usuario_id, fecha_reporte, estado)\n' +
        '    VALUES (?, ?, ?, ?, \'pendiente\')'
    ;
    db.query(sql, [cargador_id, descripcion, usuario_id, fecha], (err, result) => {
        if (err) {
            console.error("❌ Error al registrar incidencia:", err);
            return res.status(500).json({ error: "Error del servidor" });
        }
        res.json({ message: "Incidencia registrada con éxito" });
    });
});

// 📌 Obtener todas las incidencias
app.get("/incidencias", authenticateToken, (req, res) => {
    const sql =
        'SELECT i.*, c.ubicacion, u.email\n' +
        '    FROM incidencias i\n' +
        '    JOIN cargadores c ON i.cargador_id = c.id\n' +
        '    JOIN usuarios u ON i.usuario_id = u.id\n' +
        '    ORDER BY fecha_reporte DESC'
    ;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener incidencias:", err);
            return res.status(500).json({ error: "Error del servidor" });
        }
        res.json(results);
    });
});

app.get('/reservas', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT r.id, r.fecha_reserva, r.estado, c.ubicacion, c.nivel_carga
        FROM reservas r
        JOIN cargadores c ON r.cargador_id = c.id
        WHERE r.usuario_id = ?
        ORDER BY r.fecha_reserva DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("❌ Error obteniendo reservas:", err);
            return res.status(500).json({ error: "Error al obtener historial" });
        }
            res.json(results);
        });
    });
