import { OpenStreetMapProvider } from "leaflet-geosearch";

const lat = 19.654790;
const lng = -99.103562;

const map = L.map('mapa').setView([lat, lng], 15);

document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Buscar la direccion
    const buscador = document.querySelector('#formbuscador');
    buscardo.addEventListener('input', buscarDireccion);
})

function buscarDireccion(e) {
    if (e.target.value.length > 8) {
        
        //Utilizar el provider
        const provider = new OpenStreetMapProvider();
        provider.search({query: e.target.value}).then((resultado) => {
            //agregar el pin
        })
    }
}


