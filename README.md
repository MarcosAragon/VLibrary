# Biblioteca Virtual 🎮

Una biblioteca virtual interactiva construida con React y Vite. Esta aplicación está diseñada para gestionar y visualizar colecciones personales de medios físicos o digitales (videojuegos, libros, películas) a través de una interfaz inmersiva inspirada en los menús cinemáticos (HUD) de las consolas modernas.

## Características Principales

* **Diseño estilo cover flow:** Navegación fluida por las colecciones mediante un carrusel dinámico en 3D soportado por CSS transforms.
* **Gestión Integrada (CRUD):** Interfaz gráfica dedicada para añadir, editar o eliminar elementos de tu biblioteca directamente desde el navegador, con persistencia en tiempo real.
* **Colecciones Personalizadas:** Capacidad para agrupar títulos en colecciones (ej. "Grand Theft Auto", "Sagas Favoritas") manteniendo el orden cronológico o personalizado.
* **Tematización:** Selector de apariencia integrado para personalizar el color principal (cian, verde, naranja, etc.) con persistencia en `localStorage`.
* **Responsive Design:** La interfaz se adapta dinámicamente tanto a resoluciones de escritorio completas como a dispositivos móviles mediante ajustes de dimensiones y gestos táctiles (swipe).
* **Experiencia Sensorial:** Reproducción de efectos de sonido UI en la navegación, mejorando el peso y la retroalimentación de cada interacción.

## Arquitectura del Proyecto

El proyecto sigue una arquitectura limpia orientada a componentes usando React:

* `src/components/CarruselJuegos.jsx`: El núcleo visual. Maneja la lógica matemática del carrusel 3D, intersección de eventos de teclado/ratón/gestos, y el filtrado por consola o colección.
* `src/components/CrudJuegos.jsx`: El panel de administración modularizado, donde se aloja el estado del formulario y la lógica de mutación de datos.
* `src/styles/`: Archivos CSS estandarizados. Se utiliza un enfoque centrado en variables CSS nativas (`--primary-color`) para la tematización dinámica.
* `src/data/bibliotecaData.js`: Almacén local de datos (simulando una base de datos) donde reside el estado base de la biblioteca.

## Instalación y Desarrollo Local

Asegúrate de tener [Node.js](https://nodejs.org/) instalado.

1. Clona el repositorio:
   ```bash
   git clone https://github.com/MarcosAragon/biblioteca-virtual.git
   ```
2. Navega al directorio del proyecto:
   ```bash
   cd biblioteca-virtual
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:5173`. (el puerto es el 5173 ya que es el predeterminado de Vite)

## Créditos y Recursos

* Las portadas de los juegos han sido obtenidas de [The Cover Project](https://www.thecoverproject.net/).
* Efectos de sonido por [Pixabay](http://pixabay.com/).
* Imágenes de fondo obtenidas a través de [Pinterest](https://pinterest.com).

## Autor

Creado por **Marcos Aragón** como proyecto de aprendizaje avanzado en desarrollo Frontend y manejo de UI/UX complejas. Para más información, visita mi perfil de [GitHub](https://github.com/MarcosAragon).
