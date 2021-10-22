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