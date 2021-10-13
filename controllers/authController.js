const passport = require("passport");

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Inserta tus datos para iniciar sesión'
})

//Verificar autenticación del usuario
exports.usuarioAutenticado = (req, res, next) => {
    // Usuario autenticado
    if (req.isAuthenticated()) {
        return next();
    }
    //Usuario no autenticado
    return res.redirect('/iniciar-sesion');
}