let coordenadasSeleccionadas = null;
let Localizacion;
let POI;
export function setCoordenadasSeleccionadas(lon,lat) {
    coordenadasSeleccionadas = [lon,lat];
}

export function getCoordenadasSeleccionadas() {
    return coordenadasSeleccionadas;
}
export function setLiveLocation(lon,lat){
    Localizacion = [lat,lon];
}
export function getLiveLocation(){
    return Localizacion;
}

export function setPoi(Punto){
    POI = Punto;
}

export function getPOI(){
    return POI;
}

// export function getMap(){
//     return mapa;
// }

// export function setMap(mapa){
//     return mapa;
// }