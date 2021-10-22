import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener('DOMContentLoaded', () => {
    const formsEliminar = document.querySelectorAll('.eliminar-comentario');

    //Revisar que existan los formularios
    if (formsEliminar.length > 0) {
        formsEliminar.forEach(form => {
            form.addEventListener('submit', eliminarComentario);
        })
    }
});

function eliminarComentario(e) {
    e.preventDefault();

    Swal.fire({
        title: 'Deseas eliminar el comentario?',
        text: "No podrás revertir la acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Borrar!',
        cancelButton: 'Cancelar'
    })
    .then((result) => {
        if (result.isConfirmed) {

            //Tomar el id del comentario
            const comentarioId = this.children[0].value;

            //Crear el objeto
            const datos = {
                comentarioId
            }

            //Ejecutar axios y enlazar los datos

            axios.post(this.action, datos)
                .then(respuesta => {      
                console.log(respuesta);
            })

            Swal.fire(
                'Eliminado!',
                'El comentario ha sido eliminado',
                'success'
            )
        }
    })
}