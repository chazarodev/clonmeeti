import { OpenStreetMapProvider } from "leaflet-geosearch";

const lat = 19.654790;
const lng = -99.103562
const map = L.map('mapa').setView([lat, lng], 15);
let markers = new L.FeatureGroup().addTo(map);
let marker;

document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Buscar la direccion
    const buscador = document.querySelector('#formbuscador');
    buscador.addEventListener('input', buscarDireccion);
})

function buscarDireccion(e) {
    if (e.target.value.length > 8) {
        
        //si existe pin anterior, limpiarlo
        markers.clearLayers();

        //Utilizar el provider y geocoder
        const geocodeService = L.esri.Geocoding.geocodeService();
        const provider = new OpenStreetMapProvider();
        provider.search({query: e.target.value}).then((resultado) => {
            
            geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function(error, result) {

                llenarInputs(result);

                //Mostrar el mapa
                map.setView(resultado[0].bounds[0], 15);

                //agregar el pin
                marker = new L.marker(resultado[0].bounds[0], {
                    draggable: true,
                    autoPan: true
                })
                .addTo(map)
                .bindPopup(resultado[0].label)
                .openPopup()

                //Detectar movimiento del marker
                marker.on('moveend', function(e) {
                    marker = e.target;
                    const posicion = marker.getLatLng();
                    map.panTo(new L.LatLng(posicion.lat, posicion.lng));

                    // reverse geocoding
                    geocodeService.reverse().latlng(posicion, 15).run(function(error, result) {
                        
                        llenarInputs(result);
                        //Asignar valores al pouup del marker
                        marker.bindPopup(result.address.LongLabel);
                    })
                })

                //asignar al contenedor
                markers.addLayer(marker);
            })
        })
    }
}

function llenarInputs(resultado) {
    document.querySelector('#direccion').value = resultado.address.Address || '';
    document.querySelector('#ciudad').value = resultado.address.City || '';
    document.querySelector('#estado').value = resultado.address.Region || '';
    document.querySelector('#pais').value = resultado.address.CountryCode || '';
    document.querySelector('#lat').value = resultado.address.lat || '';
    document.querySelector('#lng').value = resultado.address.lng || '';
}

