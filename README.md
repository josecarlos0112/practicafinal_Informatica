# 🚗 Encuentra tu Cargador

**Aplicación web para la localización y reserva de cargadores de coches eléctricos.**

## 📋 Descripción

"Encuentra tu Cargador" es un proyecto desarrollado en el marco de la asignatura **Informática II**.  
Esta aplicación permite a los usuarios encontrar, visualizar, reservar y gestionar cargadores para vehículos eléctricos, integrando funcionalidades específicas según el rol del usuario (usuario, administrador, técnico).

El proyecto combina tecnologías de frontend y backend, haciendo uso de bases de datos y autenticación mediante JWT.

---

## 🎯 Objetivos

- Permitir la localización de cargadores cercanos mediante geolocalización.
- Mostrar en un mapa los cargadores disponibles y su estado.
- Permitir la reserva de un cargador y la gestión de las reservas.
- Ofrecer un sistema de roles (usuario, administrador, técnico) con distintos permisos.
- Asegurar tiempos de respuesta rápidos y un diseño responsivo.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:**  
  - HTML5
  - CSS3 (con soporte de MDBootstrap y Bootstrap)
  - JavaScript Vanilla

- **Backend:**  
  - Node.js
  - Express
  - MySQL
  - JWT (JSON Web Tokens)

- **Otros:**  
  - LocalStorage
  - CORS
  - dotenv

---

## ⚙️ Estructura del Proyecto

```
/public
  /css
    - styles.css
  /img
    - icono.png
    - login.png
  /js
    - auth.js
    - dashboard.js
    - reservations.js
  /pages
    - login.html
    - user-dashboard.html
    - admin-dashboard.html
    - tech-dashboard.html
    - user_reservations.html
server.js
index.js
app.js
```

---

## 👥 Roles de Usuario

| Rol          | Funciones principales                                   |
|--------------|---------------------------------------------------------|
| Usuario      | Buscar cargadores, reservar, cancelar y ver historial. |
| Administrador| Gestionar cargadores, estadísticas y logs de auditoría. |
| Técnico      | Actualizar estados de cargadores y reportar incidencias.|

---

## 📄 Funcionalidades Principales

- **Geolocalización de cargadores.**
- **Visualización de detalles del cargador.**
- **Filtrado por tipo de cargador.**
- **Reserva y cancelación de reservas.**
- **Historial de reservas.**
- **Notificaciones de estado.**
- **Roles con permisos diferenciados.**
- **Inicio de sesión y registro de usuarios.**

---

## 📚 Créditos

Proyecto realizado para la asignatura de **Informática II** bajo la supervisión del profesor **Raúl Sacristán**.



## 👨‍💻 Creadores

- Jose Carlos Zorrilla
- Mohamed ElGhali Sabil


---

## ⚖️ Derechos de Autor

© 2025 Proyecto académico realizado para la Universidad Alfonso X El Sabio (UAX).  
Todos los derechos reservados. Uso exclusivo con fines educativos.
