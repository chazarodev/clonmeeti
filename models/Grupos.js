const Sequelize = require('sequelize');
const db = require('../config/db');
const Categorias = require('./Categorias');
const Usuarios = require('./Usuarios');

const Grupos = db.define('grupos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
    },
    nombre: {
        type: Sequelize.TEXT(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Ponle nombre al grupo'
            }
        }
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Agrega una descripción al grupo'
            }
        }
    },
    url: Sequelize.TEXT,
    imagen: Sequelize.TEXT
})

Grupos.belongsTo(Categorias);
Grupos.belongsTo(Usuarios);

module.exports = Grupos;