const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid').v4;
const slug = require('slug');
const shorid = require('shortid');

const Usuarios = require('../models/Usuarios');
const Grupos = require('../models/Grupos');

const Meeti = db.define('meeti', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: uuid()
        },
        titulo: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega un Título'
                }
            }
        },
        slug: {
            type: Sequelize.STRING
        },
        invitado: Sequelize.STRING,
        cupo: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        descripcion: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Escribe una Descripcion para tu Meeti'
                }
            }
        },
        fecha: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Indica la fecha del Meeti'
                }
            }
        },
        hora: {
            type: Sequelize.TIME,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Establece la hora del Meeti'
                }
            }
        },
        direccion: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega la Dirección'
                }
            }
        },
        ciudad: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Indica la Ciudad'
                }
            }
        },
        estado: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Indica el Estado'
                }
            }
        },
        pais: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Indica el País'
                }
            }
        },
        ubicacion: {
            type: Sequelize.DataTypes.GEOMETRY('POINT')
        },
        interesados: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            defaultValue: []
        }
    }, {
        hooks: {
            async beforeCreate(meeti) {
                const url = slug(meeti.titulo).toLowerCase();
                meeti.slug = `${url}-${shorid.generate()}`;
            }
        }
    });

Meeti.belongsTo(Usuarios);
Meeti.belongsTo(Grupos);

module.exports = Meeti;