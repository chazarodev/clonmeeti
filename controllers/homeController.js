const Categorias = require('../models/Categorias');
const Meeti = require('../models/Meeti');
const Grupos = require('../models/Grupos');
const Usuarios = require('../models/Usuarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.home = async (req, res)  => {

    //Promise para consultas en el home
    const consultas = [];
    consultas.push(Categorias.findAll({}));
    consultas.push(Meeti.findAll({
        attributes: ['slug', 'titulo', 'fecha', 'hora'], //Consultar solo los campos que deseemos ver
        where: {
            fecha: {[Op.gte]: moment(new Date()).format("YYYY-MM-DD")} //Mostrar los meetis a partir de la fecha actual
        },
        limit: 3,
        order: [
            ['fecha', 'ASC']
        ],
        include: [ //Hacer un join a una tlaba
            {
                model: Grupos, //Indicamos a qué tabla queremos hacer join
                attributes: ['imagen'] //Extraemos el valor que deseamos de la tabla
            },
            {
                model: Usuarios,
                attributes: ['nombre', 'imagen']
            }
        ]
    }))

    //Extraer y pasar a la vista
    const [categorias, meetis] = await Promise.all(consultas);

    res.render('home', {
        nombrePagina: 'Inicio',
        categorias,
        meetis
    });
}