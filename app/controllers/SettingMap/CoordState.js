let coordenadasSeleccionadas = null;
let Localizacion;
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
