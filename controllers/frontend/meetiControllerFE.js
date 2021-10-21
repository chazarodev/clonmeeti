const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const moment = require('moment');
const Sequelize = require('sequelize');

exports.mostrarMeeti = async (req, res) => {
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

//Confirma o cancela si el usuario asistira a meeti
exports.confirmarAsistencia = async (req, res) => {

    const  {accion} = req.body;

    if (accion === 'confirmar') {
        //Agregar al usuario
        Meeti.update({
            'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)
        }, {
            'where': {
                'slug': req.params.slug
            }
        });
    
        //Mensaje
        res.send('Has confirmado tu asistencia');
    } else {
        //Cancelar asistencia
        Meeti.update({
            'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id)
        }, {
            'where': {
                'slug': req.params.slug
            }
        });
    
        //Mensaje
        res.send('Has cancelado tu asistencia');
    }

}

//Muestra el listado de asistentes
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        attributes: ['interesados']
    });

    //Extraer interesados
    const {interesados} = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where: {
            id: interesados
        }
    });

    //Crear la vista y pasar los datos
    res.render('asistentes-meeti', {
        nombrePagina: 'Lista de Asistentes Meeti',
        asistentes
    })
}