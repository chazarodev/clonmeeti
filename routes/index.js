const express = require('express');
const router = express.Router();

//Importar controladores
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');

module.exports = function() {
    router.get('/', homeController.home);

    // Crear y confirmar cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta);

    // Iniciar sesión
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);

    return router;
}