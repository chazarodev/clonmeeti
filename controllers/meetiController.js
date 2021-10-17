const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');

//Muestra el formulario para nuevos meeti
exports.formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({
        where: {
            usuarioId: req.user.id
        }
    });

    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    });
}

//Inserta nuevos meeti en la base de datos
exports.crearMeeti = async (req, res) => {
    //Obtener los datos
    const meeti = req.body;

    //Asignar el usuario que crea el meeti
    meeti.usuarioId = req.user.id;

    //Almacena la ubicacion con un point
    const point = {
        type: 'Point',
        coordinates: [
            parseFloat(req.body.lat),
            parseFloat(req.body.lng)
        ]
    };
    meeti.ubicacion = point;

    //cupo opcional
    if (req.body.cupo === '') {
        meeti.cupo = 0;
    }

    //Almacenar en la db
    try {
       await Meeti.create(meeti); 
       req.flash('exito', 'Meeti creado con éxito');
       res.redirect('/administracion');
    } catch (error) {
        //extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
}