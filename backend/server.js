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

// 📌 Endpoint de login (SIMULADO, NO USA MySQL AÚN)
const users = {
    "admin@admin.com": { password: "123", role: "admin" },
    "user@user.com": { password: "123", role: "user" },
    "tec@tec.com": { password: "123", role: "tech" }
};

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
    const { chargerId, locationName } = req.body;
    const userId = req.user.id;
    const currentDate = new Date();

    if (!chargerId || !locationName) {
        return res.status(400).json({ message: "ID de cargador y ubicación son requeridos" });
    }

    const sql = "INSERT INTO reservas (usuario_id, cargador_id, ubicacion, fecha_reserva) VALUES (?, ?, ?, ?)";
    db.query(sql, [userId, chargerId, locationName, currentDate], (err, result) => {
        if (err) {
            console.error("❌ Error creando reserva:", err);
            return res.status(500).json({ error: "Error del servidor" });
        }
        res.json({ message: "Reserva creada exitosamente" });
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
