// 📌 import-chargers.js
import mysql from 'mysql2/promise';
import fetch from 'node-fetch';

// Configuración de conexión a tu base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '110604',
    database: 'encuentra_cargador',
    port: 3306
};

// URL de Open Charge Map API (cargadores en Madrid)
const API_OPENCHARGEMAP = 'https://api.openchargemap.io/v3/poi/?output=json&countrycode=ES&latitude=40.4168&longitude=-3.7038&distance=50&maxresults=500';

async function importarCargadores() {
    let connection;
    try {
        console.log('Conectando a la base de datos...');
        connection = await mysql.createConnection(dbConfig);

        console.log('Descargando cargadores de Open Charge Map...');
        const response = await fetch(API_OPENCHARGEMAP, {
            headers: {
                'User-Agent': 'app-informatica',
                'X-API-Key': '08dc116c-ae15-4377-aa52-545e5cdb4586' // 🔥 API para Open Charge Map
            }
        });

        const cargadores = await response.json();

        console.log(`Se encontraron ${cargadores.length} cargadores. Insertando en la base de datos...`);

        for (const cargador of cargadores) {
            const ubicacion = cargador.AddressInfo?.Title || 'Ubicación desconocida';
            const tipo = obtenerTipoAleatorio(); // Rápido, Estándar o Compatible
            const estado = 'libre'; // Todos empiezan como libres
            const nivel_carga = Math.floor(Math.random() * 51) + 50; // Entre 50% y 100%

            const latitud = cargador.AddressInfo?.Latitude || null;
            const longitud = cargador.AddressInfo?.Longitude || null;

            if (latitud && longitud) {
                const sql = `
                    INSERT INTO cargadores (ubicacion, tipo, estado, nivel_carga, created_at, latitud, longitud)
                    VALUES (?, ?, ?, ?, NOW(), ?, ?)
                `;
                const values = [ubicacion, tipo, estado, nivel_carga, latitud, longitud];
                await connection.execute(sql, values);

                console.log(`✅ Insertado: ${ubicacion}`);
            } else {
                console.log(`⚠️ Cargador ignorado por falta de coordenadas: ${ubicacion}`);
            }
        }

        console.log('✅ Todos los cargadores fueron insertados exitosamente.');

    } catch (error) {
        console.error('❌ Error importando cargadores:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Conexión cerrada.');
        }
    }
}

// Función para asignar tipo aleatorio
function obtenerTipoAleatorio() {
    const tipos = ['Rápido', 'Estándar', 'Compatible'];
    const randomIndex = Math.floor(Math.random() * tipos.length);
    return tipos[randomIndex];
}

// Ejecutar
importarCargadores();
