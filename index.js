const express = require('express');
const expressEjsLayouts = require('express-ejs-layouts');
const path = require('path');
const router = require('./routes');

// Importar configuración db
const db = require('./config/db');
require('./models/Usuarios');
db.sync().then(() => console.log('db Conectada')).catch((error) => console.log(error));

require('dotenv').config({path: 'variables.env'});


const app = express();

// Habilitar EJS como template engine
app.use(expressEjsLayouts)
app.set('view engine', 'ejs');

// Ubicación vistas
app.set('views', path.join(__dirname, './views'));

//Archivos estáticos
app.use(express.static('public'));

// Middleware (usuario logueado, flash messages, fecha actual);
app.use((req, res, next) => {
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

// Routing
app.use('/', router());

// Agrega el puerto
app.listen(process.env.PORT, () => {
    console.log('Servidor funcionando');
})

