const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const multer = require('multer');
const shortid = require('shortid');

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
    console.log(grupo);

    //No es el dueño del grupo || no existe grupo
    if (!grupo) {
        req.flash('error', 'Operacion no válida');
        res.redirect('/administracion');
        return next();
    }

    //Datos correctos
    const {nombre, descripcion, categoriaId, url} = req.body;   

    //Asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    //Guardar cambios
    await grupo.save();

    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}