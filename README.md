# Análisis de la Aplicación

## Descripción

Esto es la API de la aplicación de prueba para Tailor Hub. Su objetivo es gestionar las peticiones de la aplicación web (ver el repositorio de la aplicación web [aquí](https://github.com/Lelieur/TailorChallenge_Frontend)).

## Rutas de la API

- **GET** `/api/restaurants`: Obtener la lista de restaurantes.
- **GET** `/api/restaurants/:id`: Obtener los detalles de un restaurante específico.
- **POST** `/api/restaurants`: Crear un nuevo restaurante.
- **POST** `/api/restaurants/:id/favorite`: Añadir un restaurante a favoritos.
- **DELETE** `/api/restaurants/:id/favorite`: Eliminar un restaurante de favoritos.
- **POST** `/api/reviews`: Crear una reseña para un restaurante.
- **PUT** `/api/reviews/:id`: Editar una reseña propia.
- **DELETE** `/api/reviews/:id`: Eliminar una reseña propia.
- **POST** `/api/login`: Iniciar sesión.
- **POST** `/api/register`: Registrar un nuevo usuario.
- **POST** `/api/verify-token`: Verificar el token de autenticación.
- **GET** `/api/cloudinary/signuploadform`: Obtener la información de Cloudinary para el formulario de subida de imágenes.

## Tecnologías Utilizadas

- **Lenguaje de Programación**: TypeScript
- **Framework**: Express.js
- **Base de Datos**: MongoDB
- **Otras Tecnologías**: Mongoose

## Instalación

Para instalar la API, sigue estos pasos:

1. Clona el repositorio de la API: `git clone https://github.com/Lelieur/TailorChallenge_Backend`
2. Navega al directorio del proyecto: `cd TailorChallenge_Backend`
3. Instala las dependencias: `npm install`

## Uso

Para ejecutar la API, utiliza el siguiente comando:

```bash
npm run dev
```

## Configuración

Para configurar la API, sigue estos pasos:

1. Copia el archivo `.env.example` a `.env`: `cp .env.example .env`
2. Edita el archivo `.env` con tus credenciales y configuraciones específicas.
