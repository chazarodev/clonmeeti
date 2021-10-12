const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new localStrategy ({
        usernameField: 'email',
        passwordField: 'password',
    },
    async (email, password, next) => {
        // Código se ejecuta al llenar el formulario
        const usuario = await Usuarios.findOne({
            where: {
                email,
                activo: 1
            }
        });

        //Revisar si existe el usuario
        if (!usuario) return next(null, false, {
            message: 'El usuario no existe'
        })
        // El usuario existe, verificar el password
        const verificarPass = usuario.validarPassword(password);
        // Si el password es incorrecto
        if (!verificarPass) return next(null, false, {
            message: 'El Password es incorrecto'
        })

        //autenticación exitosa
        return next(null, usuario);
    }
));

passport.serializeUser(function(usuario, cb) {
    cb(null, usuario);
});
passport.deserializeUser(function(usuario, cb) {
    cb(null, usuario);
});

module.exports = passport;