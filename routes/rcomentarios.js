module.exports = function (app, swig, gestorBD) {
    app.post('/comentarios/:id', function (req, res) {
        let cancion_id = req.params.id;
        let comentario = {
            autor: req.session.usuario,
            texto: req.body.texto,
            cancion_id : cancion_id
        }
        gestorBD.insertarComentario(comentario, function (id) {
            if (id == null) {
                res.send("Error al añadir ");
            } else {
                res.send("Agregado comentario id: " + id);
            }
        });
    })
}