const Comentarios = require('../../models/Comentarios');

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
    const {comentrioId} = req.body;

    //Consultar comentario
    const comentario = await Comentarios.findOne({
        where: {
            id: comentrioId
        }
    })

    //Verificar que exista en la bd
    if (!comentario) {
        res.send('Accion no válida');
        return next();
    }

    //Verificar que sea borrado por el creador

}