/**
 * ============================================================
 * SERVICIO WEB DE REGISTRO E INICIO DE SESIÓN
 * Evidencia: GA7-220501096-AA5-EV01
 * Diseño y desarrollo de servicios web - caso
 * 
 * Descripción:
 * API REST simple que permite registrar usuarios e iniciar sesión.
 * Recibe usuario y contraseña. Si la autenticación es correcta
 * responde con mensaje de autenticación satisfactoria.
 * En caso contrario, responde con error de autenticación.
 * 
 * Tecnologías: Node.js nativo (módulo http) - sin dependencias externas
 * Versionamiento: Git
 * ============================================================
 */

// Importar módulos nativos de Node.js
const http = require('http');       // Módulo para crear el servidor HTTP
const fs = require('fs');           // Módulo para leer/escribir archivos (persistencia)
const path = require('path');       // Módulo para manejar rutas de archivos
const url = require('url');         // Módulo para parsear la URL de la petición
const querystring = require('querystring'); // Para parsear datos de formularios si se usan

// ============================================================
// CONFIGURACIÓN
// ============================================================
const PORT = 3000;                          // Puerto donde escuchará el servidor
const USERS_FILE = path.join(__dirname, 'users.json'); // Archivo donde se guardan los usuarios

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

/**
 * Lee los usuarios almacenados en el archivo JSON.
 * Si el archivo no existe, retorna un array vacío.
 * @returns {Array} Lista de usuarios { usuario, contraseña }
 */
function leerUsuarios() {
    try {
        // Verificar si el archivo existe
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            return JSON.parse(data);
        }
        // Si no existe, crear archivo vacío
        fs.writeFileSync(USERS_FILE, '[]', 'utf8');
        return [];
    } catch (error) {
        console.error('Error al leer usuarios:', error.message);
        return [];
    }
}

/**
 * Guarda la lista de usuarios en el archivo JSON.
 * @param {Array} usuarios - Array de objetos usuario
 */
function guardarUsuarios(usuarios) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(usuarios, null, 2), 'utf8');
        console.log('Usuarios guardados correctamente.');
    } catch (error) {
        console.error('Error al guardar usuarios:', error.message);
    }
}

/**
 * Envía una respuesta JSON al cliente.
 * @param {http.ServerResponse} res - Objeto de respuesta
 * @param {number} statusCode - Código HTTP (200, 400, 401, etc.)
 * @param {Object} data - Datos a enviar en formato JSON
 */
function enviarJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',           // Permitir CORS para pruebas
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data, null, 2));
}

/**
 * Parsea el cuerpo (body) de una petición POST.
 * Soporta application/json.
 * @param {http.IncomingMessage} req - Objeto de petición
 * @returns {Promise<Object>} Datos parseados del body
 */
function parsearBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        // Acumular los datos que llegan por el stream
        req.on('data', chunk => {
            body += chunk.toString();
        });
        // Cuando termina de recibir datos
        req.on('end', () => {
            try {
                // Intentar parsear como JSON
                if (body) {
                    resolve(JSON.parse(body));
                } else {
                    resolve({});
                }
            } catch (error) {
                reject(new Error('Body inválido. Se espera JSON.'));
            }
        });
        req.on('error', reject);
    });
}

// ============================================================
// LÓGICA DE NEGOCIO: REGISTRO E INICIO DE SESIÓN
// ============================================================

/**
 * Registra un nuevo usuario.
 * Valida que el usuario no exista previamente.
 * @param {string} usuario - Nombre de usuario
 * @param {string} contrasena - Contraseña
 * @returns {Object} Resultado de la operación
 */
function registrarUsuario(usuario, contrasena) {
    // Validaciones básicas
    if (!usuario || !contrasena) {
        return {
            exito: false,
            mensaje: 'Error: Se requieren usuario y contraseña.'
        };
    }

    if (usuario.trim().length < 3) {
        return {
            exito: false,
            mensaje: 'Error: El usuario debe tener al menos 3 caracteres.'
        };
    }

    if (contrasena.length < 4) {
        return {
            exito: false,
            mensaje: 'Error: La contraseña debe tener al menos 4 caracteres.'
        };
    }

    // Leer usuarios existentes
    const usuarios = leerUsuarios();

    // Verificar si el usuario ya existe (case insensitive)
    const existe = usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase());
    if (existe) {
        return {
            exito: false,
            mensaje: 'Error: El usuario ya se encuentra registrado.'
        };
    }

    // Agregar nuevo usuario (en un sistema real se debería hashear la contraseña)
    usuarios.push({
        usuario: usuario.trim(),
        contrasena: contrasena, // NOTA: En producción usar bcrypt u otro hash
        fechaRegistro: new Date().toISOString()
    });

    // Guardar en archivo
    guardarUsuarios(usuarios);

    return {
        exito: true,
        mensaje: 'Registro exitoso. Usuario creado correctamente.',
        usuario: usuario.trim()
    };
}

/**
 * Autentica (inicia sesión) un usuario.
 * Compara usuario y contraseña con los almacenados.
 * @param {string} usuario - Nombre de usuario
 * @param {string} contrasena - Contraseña
 * @returns {Object} Resultado de la autenticación
 */
function autenticarUsuario(usuario, contrasena) {
    // Validaciones básicas
    if (!usuario || !contrasena) {
        return {
            exito: false,
            mensaje: 'Error en la autenticación: Se requieren usuario y contraseña.'
        };
    }

    // Leer usuarios
    const usuarios = leerUsuarios();

    // Buscar el usuario
    const usuarioEncontrado = usuarios.find(
        u => u.usuario.toLowerCase() === usuario.toLowerCase()
    );

    // Si no existe el usuario
    if (!usuarioEncontrado) {
        return {
            exito: false,
            mensaje: 'Error en la autenticación: Usuario o contraseña incorrectos.'
        };
    }

    // Verificar contraseña (comparación simple - en producción usar hash)
    if (usuarioEncontrado.contrasena !== contrasena) {
        return {
            exito: false,
            mensaje: 'Error en la autenticación: Usuario o contraseña incorrectos.'
        };
    }

    // Autenticación exitosa
    return {
        exito: true,
        mensaje: 'Autenticación satisfactoria. Bienvenido/a ' + usuarioEncontrado.usuario + '.',
        usuario: usuarioEncontrado.usuario
    };
}

// ============================================================
// SERVIDOR HTTP Y RUTAS
// ============================================================

/**
 * Crea y configura el servidor HTTP.
 * Rutas disponibles:
 *   POST /registro  -> Registrar nuevo usuario
 *   POST /login     -> Iniciar sesión / autenticar
 *   GET  /          -> Información del servicio
 *   GET  /usuarios  -> Listar usuarios (solo para pruebas, sin contraseñas)
 */
const servidor = http.createServer(async (req, res) => {
    // Parsear la URL
    const parsedUrl = url.parse(req.url, true);
    const ruta = parsedUrl.pathname;
    const metodo = req.method.toUpperCase();

    console.log(`[${new Date().toISOString()}] ${metodo} ${ruta}`);

    // Manejar preflight CORS (OPTIONS)
    if (metodo === 'OPTIONS') {
        enviarJSON(res, 204, {});
        return;
    }

    try {
        // ---------- RUTA: Información del servicio ----------
        if (ruta === '/' && metodo === 'GET') {
            enviarJSON(res, 200, {
                servicio: 'API de Registro e Inicio de Sesión',
                evidencia: 'GA7-220501096-AA5-EV01',
                version: '1.0.0',
                endpoints: {
                    'POST /registro': 'Registrar un nuevo usuario. Body: { "usuario": "...", "contrasena": "..." }',
                    'POST /login': 'Iniciar sesión. Body: { "usuario": "...", "contrasena": "..." }',
                    'GET /usuarios': 'Listar usuarios registrados (sin contraseñas, solo pruebas)'
                },
                mensaje: 'Servicio web funcionando correctamente.'
            });
            return;
        }

        // ---------- RUTA: REGISTRO ----------
        if (ruta === '/registro' && metodo === 'POST') {
            const body = await parsearBody(req);
            const { usuario, contrasena } = body;

            console.log('Intento de registro:', usuario);

            const resultado = registrarUsuario(usuario, contrasena);

            if (resultado.exito) {
                // 201 Created
                enviarJSON(res, 201, {
                    mensaje: resultado.mensaje,
                    usuario: resultado.usuario
                });
            } else {
                // 400 Bad Request
                enviarJSON(res, 400, {
                    mensaje: resultado.mensaje
                });
            }
            return;
        }

        // ---------- RUTA: LOGIN / AUTENTICACIÓN ----------
        if (ruta === '/login' && metodo === 'POST') {
            const body = await parsearBody(req);
            const { usuario, contrasena } = body;

            console.log('Intento de login:', usuario);

            const resultado = autenticarUsuario(usuario, contrasena);

            if (resultado.exito) {
                // 200 OK - Autenticación satisfactoria
                enviarJSON(res, 200, {
                    mensaje: resultado.mensaje,   // "Autenticación satisfactoria..."
                    autenticado: true,
                    usuario: resultado.usuario
                });
            } else {
                // 401 Unauthorized - Error en la autenticación
                enviarJSON(res, 401, {
                    mensaje: resultado.mensaje,   // "Error en la autenticación..."
                    autenticado: false
                });
            }
            return;
        }

        // ---------- RUTA: Listar usuarios (pruebas) ----------
        if (ruta === '/usuarios' && metodo === 'GET') {
            const usuarios = leerUsuarios();
            // No devolver las contraseñas por seguridad
            const listaSegura = usuarios.map(u => ({
                usuario: u.usuario,
                fechaRegistro: u.fechaRegistro
            }));
            enviarJSON(res, 200, {
                total: listaSegura.length,
                usuarios: listaSegura
            });
            return;
        }

        // ---------- Ruta no encontrada ----------
        enviarJSON(res, 404, {
            mensaje: 'Ruta no encontrada. Use /registro o /login'
        });

    } catch (error) {
        console.error('Error en el servidor:', error.message);
        enviarJSON(res, 500, {
            mensaje: 'Error interno del servidor: ' + error.message
        });
    }
});

// ============================================================
// INICIAR EL SERVIDOR
// ============================================================
servidor.listen(PORT, () => {
    console.log('================================================');
    console.log('  SERVICIO WEB DE AUTENTICACIÓN INICIADO');
    console.log('  Evidencia: GA7-220501096-AA5-EV01');
    console.log('================================================');
    console.log(`  Servidor corriendo en: http://localhost:${PORT}`);
    console.log('  Endpoints disponibles:');
    console.log('    POST http://localhost:3000/registro');
    console.log('    POST http://localhost:3000/login');
    console.log('    GET  http://localhost:3000/');
    console.log('================================================');
    console.log('  Para detener: Ctrl + C');
    console.log('================================================');
});
