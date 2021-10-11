const Usuarios = require('../models/Usuarios');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea Tu Cuenta'
    })
}

exports.crearNuevaCuenta = async (req, res) => {
    const Usuario = req.body

    try {
        const usuario = await Usuarios.create(Usuario);
        // TODO flash message y redireccionar
        console.log(usuario);
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message);
        // console.log(erroresSequelize);
        req.flash('error', erroresSequelize);
        res.redirect('/crear-cuenta');
    }
}