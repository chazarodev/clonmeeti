const express = require('express');
const router = express.Router();

module.exports = function() {
    router.get('/', (req, res) => {
        res.send('Inicio')
    });
    router.get('/crear-cuenta', (req, res) => {
        res.send('Crear cuenta');
    });

    return router;
}