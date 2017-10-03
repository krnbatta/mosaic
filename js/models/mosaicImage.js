//fileds: id, node, width, height, horizontalTiles, verticalTiles
let id = 1;
class MosaicImage{
  constructor(){
    this._modelName = "mosaicImage";
    this.id = id;
    this.node = new Image();
    id++;
  }
  getModelName(){
    return this._modelName;
  }
  get width(){
    return this.node.width;
  }
  get height(){
    return this.node.height;
  }
  get horizontalTiles(){
    let width = this.width;
    let tileWidth = TILE_WIDTH;
    return Math.ceil(width/tileWidth);
  }
  get verticalTiles(){
    let height = this.height;
    let tileHeight = TILE_HEIGHT;
    return Math.ceil(height/tileHeight);
  }
}
MosaicImage.modelName = "mosaicImage";
export default MosaicImage;
