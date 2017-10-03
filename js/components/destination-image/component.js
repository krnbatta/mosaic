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
    }
    addEvents() {
        let image = Store.getRecord('mosaicImage');
        this.image = image;
        image.node.addEventListener('load', this.initiateCanvas.bind(this));
        this.setTileRows;
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
            let tileRow = Store.findBy('tileRow', {
                row
            });
            if(!tileRow.rowLoaded){
              return;
            }
            this.fillImage(tileRow)
            this.currentRow += 1;
            this.loadImage(row + 1);
        }
    }
    //canvas image is filled with tileRow
    fillImage(tileRow) {
        let self = this;
        tileRow.tiles.forEach((tile) => {
            var svgImg = new Image();
            svgImg.onload = function() {
                self.canvasContext.drawImage(svgImg, tile.column * TILE_WIDTH, tileRow.row * TILE_HEIGHT);
            }
            svgImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(tile.svg);
        });
    }
}
export default DestinationImageComponent;
