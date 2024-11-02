let coordenadasSeleccionadas = null;
let Localizacion;
let POI;
let grafo;
let mapa;
let start;
let end;

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

export function setMap(map){
     mapa = map;
}

export function getMap(){
    return mapa;
}

export function setGraph(graph){
    grafo = graph;
}

export function getGraph(){
    return grafo;
}

export function setStart(coordenadas){
    start = coordenadas;
}
export function getStart(){
    return start;
}
export function setEnd(coordenadas){
    end = coordenadas;
}
export function getEnd(){
    return end;
}