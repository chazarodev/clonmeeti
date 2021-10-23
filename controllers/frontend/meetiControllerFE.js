const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const Usuarios = require('../../models/Usuarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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

    //Consultar por meetis cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText('POINT(${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})')`);
    
    //ST_DISTANCE_Sphere = Retorna un línea en metros
    const distancia = Sequelize.fn('ST_DISTANCESphere', Sequelize.col('ubicacion'), ubicacion);

    //Encontrar meetis cercanos
    const cercanos = await Meeti.findAll({
        order: distancia, //Ordenar meetis por el más cercano
        where: Sequelize.where(distancia, {[Op.lte]: 2000}), //2000 metros
        limit: 3, //Máximo tres
        offset: 1,
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ] 
    })

    //Consultar los comentarios
    const comentarios = await Comentarios.findAll({
        where: {
            meetiId: meeti.id
        },
        include: [
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen'] 
            }
        ]
    });

    //Pasar Resultado a la vista
    res.render('mostrar-meeti',{
        nombrePagina: meeti.titulo,
        meeti,
        comentarios,
        cercanos,
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

//Muestra los meetis agrupados por categoría
exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({
        attributes: ['id', 'nombre'],
        where: {
            slug: req.params.categoria
        }
    });
    const meetis = await Meeti.findAll({
        order: [
            ['fecha', 'ASC'],
            ['hora', 'ASC']
        ],
        include: [
            {
                model: Grupos,
                where: {
                    categoriaId: categoria.id
                }
            },
            {
                model: Usuarios
            }
        ]
    });

    //Pasar a la vista
    res.render('categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })
}