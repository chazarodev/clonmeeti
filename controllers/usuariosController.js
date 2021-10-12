const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/emails');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea Tu Cuenta'
    })
}

exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body
    console.log(usuario);

    req.checkBody('confirmar', 'El password confirmado no puede ir vacío').notEmpty();
    req.checkBody('confirmar', 'El password no coincide').equals(req.body.password);

    // Lee los errores de express
    const erroresExpress = req.validationErrors();

    try {
        await Usuarios.create(usuario);

        //URL de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        //Enviar email de confirmación
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        })


        // flash message y redireccionar
        req.flash('exito', 'Hemos enviado un email, confirma tu cuenta');
        res.redirect('/iniciar-sesion')

    } catch (error) {

        // Extraer el message de los errores sequelize
        const erroresSequelize = error.errors.map(err => err.message);
        
        // Extraer el msg de los errores de express
        const errExp = erroresExpress.map(err => err .msg)

        // Unir ambos errores
        const listaErrores = [...erroresSequelize, ...errExp]

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
}

//Confirma la suscripción del usuario
exports.confirmarCuenta = async (req, res, next) => {
    // Verificar que el usuario exista
    const usuario = await Usuarios.findOne({where: {email: req.params.correo}})

    // De no existir, reddireccionar
    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    // Si existe, confirmar suscripción y redireccionar
    usuario.activo = 1;
    await usuario.save();
    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');
}

// Formulario para iniciar sesión
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión'
    })
}