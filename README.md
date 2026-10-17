# Servicio Web - Registro e Inicio de Sesión

**Evidencia:** GA7-220501096-AA5-EV01  
**Actividad:** Diseño y desarrollo de servicios web - caso  
**Componente formativo de referencia:** Construcción API

## Descripción

Servicio web (API REST) que permite:

1. **Registro** de un nuevo usuario (usuario + contraseña).
2. **Inicio de sesión (login)**: recibe usuario y contraseña.
   - Si la autenticación es **correcta** → mensaje de **autenticación satisfactoria**.
   - Si es **incorrecta** → mensaje de **error en la autenticación**.

El código está completamente comentado.

## Tecnologías utilizadas

- **Node.js** (módulo nativo `http`) – sin dependencias externas.
- **Git** para control de versiones.
- Almacenamiento en archivo JSON (`users.json`).

## Cómo ejecutar

```bash
# 1. Clonar o descomprimir el proyecto
cd api-auth-servicio

# 2. Iniciar el servidor
node server.js
# o
npm start
```

El servidor se inicia en: **http://localhost:3000**

## Endpoints

| Método | Ruta        | Descripción                          | Body (JSON)                          |
|--------|-------------|--------------------------------------|--------------------------------------|
| GET    | `/`         | Información del servicio             | -                                    |
| POST   | `/registro` | Registrar nuevo usuario              | `{ "usuario": "...", "contrasena": "..." }` |
| POST   | `/login`    | Iniciar sesión / autenticar          | `{ "usuario": "...", "contrasena": "..." }` |
| GET    | `/usuarios` | Listar usuarios (solo pruebas)       | -                                    |

## Ejemplos de uso (con curl o Postman)

### 1. Registrar un usuario

```bash
curl -X POST http://localhost:3000/registro \
  -H "Content-Type: application/json" \
  -d '{"usuario": "aprendiz", "contrasena": "sena123"}'
```

Respuesta exitosa (201):
```json
{
  "mensaje": "Registro exitoso. Usuario creado correctamente.",
  "usuario": "aprendiz"
}
```

### 2. Iniciar sesión (autenticación correcta)

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "aprendiz", "contrasena": "sena123"}'
```

Respuesta (200):
```json
{
  "mensaje": "Autenticación satisfactoria. Bienvenido/a aprendiz.",
  "autenticado": true,
  "usuario": "aprendiz"
}
```

### 3. Inicio de sesión incorrecto

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "aprendiz", "contrasena": "mala"}'
```

Respuesta (401):
```json
{
  "mensaje": "Error en la autenticación: Usuario o contraseña incorrectos.",
  "autenticado": false
}
```

## Versionamiento con Git

El proyecto fue creado y versionado con Git:

```bash
git init
git add .
git commit -m "Initial commit: Servicio web de registro e inicio de sesión - GA7-220501096-AA5-EV01"
```

**Enlace del repositorio:** (ver archivo `enlace_repositorio.txt`)

> **Importante:** Sube este proyecto a tu cuenta de GitHub/GitLab y actualiza el enlace en `enlace_repositorio.txt`.

## Estructura del proyecto

```
api-auth-servicio/
├── server.js              # Código principal del servicio (comentado)
├── users.json             # Almacenamiento de usuarios
├── package.json           # Metadatos del proyecto
├── README.md              # Este archivo
├── enlace_repositorio.txt # Enlace al repositorio Git
└── .gitignore
```

## Autor

Aprendiz – Análisis y Desarrollo de Software – SENA  
Evidencia: GA7-220501096-AA5-EV01
