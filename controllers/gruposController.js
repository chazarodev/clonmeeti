const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: {fileSize: 100000},
    storage: filseStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/grupos/');
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
exports.subirImagen = (req, res, next) =>  {
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

exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();
    
    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    })
}

//Almacena los grupos en la bse de datos
exports.crearGrupo = async (req, res) => {
    //Sanitizar Campos
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');
    
    const grupo = req.body

    //Almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = req.user.id;
    grupo.categoriaId = req.body.categoria;

    //Leer la imagen que subió el usuario
    if (req.file) {
        grupo.imagen = req.file.filename;
    }

    try {
        //Almacenar en la bd
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el grupo correctamente');
        res.redirect('/administracion')
    } catch (error) {
        //extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}

// Editar los datos del grupo
exports.formEditarGrupo = async (req, res) => {
    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    //Promise con await
    const [grupo, categorias] = await Promise.all(consultas);

    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    })
}

//Guardar los datos actualizados en la base de datos
exports.editarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.grupoId, 
            usuarioId: req.user.id
        }
    });

    //No es el dueño del grupo || no existe grupo
    if (!grupo) {
        req.flash('error', 'Operacion no válida');
        res.redirect('/administracion');
        return next();
    }

    //Datos correctos
    const {nombre, descripcion, categoria, url} = req.body;
    
    console.log(req.body)

    //Asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoria;
    grupo.url = url;

    //Guardar cambios
    await grupo.save();

    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}

//Muestra el formulario para editar una imagen de grupo
exports.formEditarImagen = async (req, res) => {

    const grupo = await Grupos.findOne({
        where: {
            id: req.params.grupoId, 
            usuarioId: req.user.id
        }
    });

    res.render('imagen-grupo', {
        nombrePagina: `Editar Imagen Grupo: ${grupo.nombre}`,
        grupo
    });
}

//Modifica la imagen en la base de datos y elimina la anterior
exports.editarImagen = async (req, res, next) => {

    const grupo = await Grupos.findOne({
        where: {
            id: req.params.grupoId, 
            usuarioId: req.user.id
        }
    });

    //Si grupo no existe
    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    //Verificar que el archivo sea nuevo
    // if (req.file) {
    //     console.log(req.file);
    // }

    // //Que existe un archivo anterior
    // if (grupo.imagen) {
    //     console.log(grupo.imagen);
    // }

    // Si hay imagen anterior y subimos una nueva, debemos eliminar la imagen previa
    if (req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        //Eliminar archivo con filsystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        })
    }

    //Imagen nueva (No hay imagen anterior)
    if (req.file) {
        grupo.imagen = req.file.filename;
    }

    //Guardar en la base de datos
    await grupo.save();
    req.flash('exito', 'Imagen actualizada con éxito');
    res.redirect('/administracion');
}

// Muestra el formulario para eliminar un grupo
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.grupoId,
            usuarioId: req.user.id
        }
    });

    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //Validaciones correctas, ejecutar la vista
    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar Grupo: ${grupo.nombre}`
    });
}