//fields: id, tileRow, image, row, column, r, g, b, hexCode, svgString
import Store from '../services/store';
import rgbToHex from '../utils/rgbToHex';
import Pool from '../services/pool';

let id = 1
class Tile {
    constructor(attributes) {
        this.id = id;
        this._modelName = "tile";
        //tileRowId, column, r, g, b
        Object.assign(this, attributes);
        id++;
    }
    getModelName() {
        return this._modelName;
    }
    // get tileRow() {
    //     return Store.belongsTo('tile', this.tileRowId, 'tileRow');
    // }
    get image() {
        return this.tileRow.image;
    }
    get row() {
        return this.tileRow.row;
    }
    get hexCode() {
        return rgbToHex(this.r, this.g, this.b);
    }
}
Tile.modelName = "tile";
export default Tile;
