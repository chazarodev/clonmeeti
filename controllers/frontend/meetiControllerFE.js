const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const moment = require('moment');

exports.mostrarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req. params.slug
        },
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ] 
    });

    //Si no existe
    if (!meeti) {
        res.redirect('/');
    }

    //Pasar Resultado a la vista
    res.render('mostrar-meeti',{
        nombrePagina: meeti.titulo,
        meeti,
        moment
    });
}