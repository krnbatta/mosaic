import template from './template';
import Store from '../../services/store';
import ObserverObj from '../../services/observer';
import rgbToHex from '../../utils/rgbToHex';

class SourceImageComponent {
    constructor() {
        document.getElementById("source-image").innerHTML = template();
        this.addEvents();
    }
    addEvents() {
        let image = Store.getRecord('mosaicImage');
        this.image = image;
        image.node.addEventListener('load', this.imageLoaded.bind(this));
    }
    imageLoaded() {
        this.initiateCanvas();
        this.sliceImage();
    }
    initiateCanvas() {
        let canvas = document.getElementById('source');
        let ctx = canvas.getContext('2d');
        let image = this.image;
        let imageWidth = image.width;
        let imageHeight = image.height;
        ctx.canvas.width = imageWidth;
        ctx.canvas.height = imageHeight;
        ctx.drawImage(image.node, 0, 0);
        this.canvas = canvas;
        this.canvasContext = ctx;
    }
    //Image is divided into tiles. R,G,B values are calculated from tiles. Tile record and tileRow record is created. The observer is binded with reference to tileRow creation which will hint DestinationImageComponent to proceed with further processing.
    async sliceImage() {
        var promisesArr = [];
        var self = this;
        for (let i = 0; i < this.image.verticalTiles; i++) {
            let tileRow = Store.createRecord('tileRow', {
                image: this.image,
                row: i,
            });

            let promise = new Promise(function(resolve) {
                window.requestAnimationFrame(function sliceRow() {
                    for (let j = 0; j < self.image.horizontalTiles; j++) {
                        let r = 0,
                            g = 0,
                            b = 0;
                        let imgData = self.canvasContext.getImageData(j * TILE_WIDTH, i * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                        let pix = imgData.data;
                        r = pix[0];
                        g = pix[1];
                        b = pix[2];
                        let tile = {
                            column: j,
                            r: r,
                            g: g,
                            b: b,
                            hexCode: rgbToHex(r, g, b)
                        };
                        tileRow.tiles.push(tile);
                    }
                    tileRow.processTiles();
                    resolve(tileRow);
                });
            });
            promisesArr.push(promise);
        }
        Promise.all(promisesArr).then((tileRows) => {
            ObserverObj.dependableKey = 'tileRowsCreated';
            ObserverObj.toggleValue = !ObserverObj.toggleValue;
        });
    }
}
export default SourceImageComponent;
