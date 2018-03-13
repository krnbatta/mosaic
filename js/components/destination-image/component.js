import template from './template';
import Store from '../../services/store';
import ObserverObj from '../../services/observer';

class DestinationImageComponent {
    get totalRows() {
        return this.tileRows.length;
    }
    constructor() {
        document.getElementById("destination-image").innerHTML = template();
        ObserverObj.dependableObj['tileRowsCreated'] = ObserverObj.dependableObj['tileRowsCreated'] || [];
        ObserverObj.dependableObj['tileRowsCreated'].push({
            callback: this.setTileRows,
            context: this
        });
        this.currentRow = 0;
        this.addEvents();
        this.rowTileFillMap = {};
    }
    addEvents() {
        let image = Store.getRecord('mosaicImage');
        this.image = image;
        image.node.addEventListener('load', this.initiateCanvas.bind(this));
    }
    initiateCanvas() {
        let canvas = document.getElementById('destination');
        let ctx = canvas.getContext('2d');
        ctx.canvas.width = this.image.node.width;
        ctx.canvas.height = this.image.node.height;
        this.canvas = canvas;
        this.canvasContext = ctx;
    }
    //observer are binded to when the tileRow will have loaded rows with svg content from server
    setTileRows() {
        this.tileRows = Store.findAll('tileRow');
        this.tileRows.forEach((tileRow) => {
            ObserverObj.dependableObj['tileRowLoaded' + tileRow.row] = ObserverObj.dependableObj['tileRowLoaded' + tileRow.row] || [];
            ObserverObj.dependableObj['tileRowLoaded' + tileRow.row].push({
                callback: this.loadImage,
                context: this,
                args: tileRow.row
            });
        });
    }
    //fired when row is loaded
    //this function only proceeeds if the row that is completed is equal to current row.
    //current row increments step wise whenever the the tileRow(with same row number) is received.
    //if any other(i.e. future) tileRow is received, it is ignored.
    //when tileRow is received matched with current tile row, it checks for the subsequent next rows
    loadImage(row) {
        if (row == this.image.verticalTiles) {
            return;
        }
        if (row == this.currentRow) {
            let self = this;
            let tileRow = Store.findBy('tileRow', {
                row
            });
            if (!tileRow.rowLoaded) {
                return;
            }
            if (this.rowTileFillMap[row]) {
                self.loadImage(row + 1);
            } else {
                self.rowTileFillMap[row] = 1;
                let fillImagePromise = this.fillImage(tileRow)
                fillImagePromise.then((val) => {
                    self.currentRow += 1;
                    self.loadImage(row + 1);
                });
            }
        }
    }
    //canvas image is filled with tileRow
    async fillImage(tileRow) {
        let self = this;
        let promisesArr = [];

        function fillRow() {
            tileRow.tiles.forEach((tile) => {
                let promise = new Promise(function(resolve) {
                    var svgImg = new Image();
                    svgImg.onload = function() {
                        self.canvasContext.drawImage(svgImg, tile.column * TILE_WIDTH, tileRow.row * TILE_HEIGHT);
                        resolve();
                    }
                    svgImg.src = tile.svg;
                });
                promisesArr.push(promise);
            });
        }
        await window.requestAnimationFrame(fillRow);
        return Promise.all(promisesArr)
    }
}

export default DestinationImageComponent;
