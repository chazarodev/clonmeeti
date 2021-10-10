const express = require('express');
const router = require('./routes');
require('dotenv').config({path: 'variables.env'});


const app = express();

// Routing
app.use('/', router());

// Agrega el puerto
app.listen(process.env.PORT, () => {
    console.log('Servidor funcionando');
})

