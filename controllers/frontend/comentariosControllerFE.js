const Comentarios = require('../../models/Comentarios');
const Meeti = require('../../models/Meeti');

exports.agregarComentario = async (req, res, next) => {
    //Obtener el Comentario
    const {comentario} = req.body;
    
    //Almacenar comentario en la bd
    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    });

    //Redireccionar al usuario a la misma página
    res.redirect('back');
    next();
}

//Elimina un comentario de la bd
exports.eliminarComentario = async (req, res, next) => {
    //Extraer id del comentario
    const {comentarioId} = req.body;

    //Consultar comentario
    const comentario = await Comentarios.findOne({
        where: {
            id: comentarioId
        }
    })

    console.log(comentario);

    //Verificar que exista en la bd
    if (!comentario) {
        res.status(404).send('Acción no válida');
        return next();
    }

    //Consultar el meeti al que pertenece el comentario
    const meeti = await Meeti.findOne({
        where: {
            id: comentario.meetiId
        }
    })
    
    //Verificar que sea borrado por el creador
    if (comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
        await Comentarios.destroy({
            where: {
                id: comentario.id
            }
        });
        res.status(200).send('Eliminado Correctamente');
        return next();
    } else {
        res.status(403).send('Acción no válida');
        return next();
    }
}