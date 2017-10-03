//properties: id, column, image, tiles
import ObserverObj from '../services/observer';
import Store from '../services/store';
import Pool from '../services/pool';

let id = 1;
class TileRow {
    constructor(attributes) {
        this._modelName = "tile";
        this.id = id;
        this.relationships = {
            belongsTo: ['image'],
            hasMany: ['tile']
        }
        //column, imageId
        Object.assign(this, attributes);
        id++;
    }
    getModelName() {
        return this._modelName;
    }
    get tiles() {
        return Store.hasMany('tileRow', this.id, 'tile');
    }
    get image() {
        return Store.belongsTo('tileRow', this.imageId, 'image');
    }
    //this fires observer when all the tiles get svg from server.(row wise)
    addTileLoadObserver() {
        this.rowLoaded = true;
        ObserverObj.dependableKey = 'tileRowLoaded' + this.row;
        ObserverObj.toggleValue = !ObserverObj.toggleValue;
    }
    setTileSvg(tilesArr) {
        tilesArr.forEach((tileHash) => {
            let id = Object.keys(tileHash)[0];
            let svg = tileHash[id];
            Store.find('tile', id).svg = svg;
        });
    }
    processTilesCallback(event) {
        let tilesArr = event.data;
        this.setTileSvg(tilesArr);
        this.addTileLoadObserver();
    }
    processTiles() {
        let tileArr = [];
        this.tiles.forEach((tile) => {
            let tileHash = {};
            tileHash[tile.id] = tile.hexCode;
            tileArr.push(tileHash);
        });
        Pool.addWorkerTask('../js/workers/loadContent.js', this.processTilesCallback.bind(this), JSON.stringify(tileArr));
    }
}
TileRow.modelName = "tileRow";
export default TileRow;
