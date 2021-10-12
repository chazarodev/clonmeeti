const nodemailer = require('nodemailer');
const emailConfig = require('../config/emails');
const fs = require('fs');
const util = require('util');
const ejs = require('ejs');

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

exports.enviarEmail = async (opciones) => {
    console.log(opciones);

    //Leer el archivo para el email
    const archivo = __dirname + `../views/${opciones.archivo}.ejs`;

    //Compilarlo
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf8'));

    //Crear el HTML

    //Configurar las opciones del email

    //Enviar el email
}