const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/emails');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: {fileSize: 100000},
    storage: filseStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/perfiles/');
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/ png') {
            // El formato es válido
            next(null, true);
        } else {
            //Formato no válido
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

//Subir imagen en el servidor
exports.subirImagenPerfil = (req, res, next) =>  {
    upload(req, res, function(error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande');
                } else {
                    req.flash('error', error.message);
                }
            } else if (error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
            //TODO mensaje de error
        } else {
            next();
        }
    }) 
}

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

//Muestra el formulario para editar el perfil
exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Editar Perfil',
        usuario
    })
}

//Almacena en la db los cambios al perfil
exports.editarPerfil = async (req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id);

    req.sanitizeBody('nombre');
    req.sanitizeBody('email');
    //Leer los datos del form
    const {nombre, descripcion, email} = req.body;

    //Asignar los valores
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    //guardar en la db
    await usuario.save();

    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');
}

//Muestra el formulario para cambiar el password
exports.formCambiarPassword = (req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambia Password',
    });
}

//Revisa si el password anterior es correcto
exports.cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //Verificar veracidad del actual password
    if (!usuario.validarPassword(req.body.anterior)) {
        req.flash('error', 'El password actual es incorrecto');
        res.redirect('/administracion');
        return next();
    }

    //Si el password es correcto, hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo);

    //Asignar el password al usuario
    usuario.password = hash;

    //Guardar en la base de datos
    await usuario.save()

    //Redireccionar
    req.logout()
    req.flash('exito', 'Password modificado correctamente, vuelve a iniciar sesión');
    res.redirect('/iniciar-sesion');
}

//Muestra el formulario para subir imagen de perfil
exports.formSubirImagenPerfil = async (req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //Mostrar la vista
    res.render('imagen-perfil', {
        nombrePagina: 'Subir Imagen Perfil',
        usuario
    })
}

//Guarda la imagen de perfil, si hay una anterior se elimina
exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //Si hay imagen anterior, eliminarla
    if (req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;

        //Eliminar archivo con filsystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        })
    }

    //Almacenar nueva imagen
    if (req.file) {
        usuario.imagen = req.file.filename;
    }

    //Almacenar en la base de datos y redireccionar
    await usuario.save();
    req.flash('exito', 'Imagen de Perfil actualizada con éxito');
    res.redirect('/administracion');
}