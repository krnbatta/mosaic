(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _components = require('./components');

var _components2 = _interopRequireDefault(_components);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', init, false); //Components are initiated as soon as the dom is loaded.
//Each element which has a component shall have same id as component name.
//The component have template and component. When initiated, events are binded according to the component.

function init() {
  (0, _components2.default)().forEach(function (component) {
    var comp = new component();
    comp.addEvents();
  });
};

},{"./components":6}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _template = require('./template');

var _template2 = _interopRequireDefault(_template);

var _store = require('../../services/store');

var _store2 = _interopRequireDefault(_store);

var _observer = require('../../services/observer');

var _observer2 = _interopRequireDefault(_observer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DestinationImageComponent = function () {
    _createClass(DestinationImageComponent, [{
        key: 'totalRows',
        get: function get() {
            return this.tileRows.length;
        }
    }]);

    function DestinationImageComponent() {
        _classCallCheck(this, DestinationImageComponent);

        document.getElementById("destination-image").innerHTML = (0, _template2.default)();
        _observer2.default.dependableObj['tileRowsCreated'] = _observer2.default.dependableObj['tileRowsCreated'] || [];
        _observer2.default.dependableObj['tileRowsCreated'].push({
            callback: this.setTileRows,
            context: this
        });
        this.currentRow = 0;
        this.addEvents();
        this.rowTileFillMap = {};
    }

    _createClass(DestinationImageComponent, [{
        key: 'addEvents',
        value: function addEvents() {
            var image = _store2.default.getRecord('mosaicImage');
            this.image = image;
            image.node.addEventListener('load', this.initiateCanvas.bind(this));
        }
    }, {
        key: 'initiateCanvas',
        value: function initiateCanvas() {
            var canvas = document.getElementById('destination');
            var ctx = canvas.getContext('2d');
            ctx.canvas.width = this.image.node.width;
            ctx.canvas.height = this.image.node.height;
            this.canvas = canvas;
            this.canvasContext = ctx;
        }
        //observer are binded to when the tileRow will have loaded rows with svg content from server

    }, {
        key: 'setTileRows',
        value: function setTileRows() {
            var _this = this;

            this.tileRows = _store2.default.findAll('tileRow');
            this.tileRows.forEach(function (tileRow) {
                _observer2.default.dependableObj['tileRowLoaded' + tileRow.row] = _observer2.default.dependableObj['tileRowLoaded' + tileRow.row] || [];
                _observer2.default.dependableObj['tileRowLoaded' + tileRow.row].push({
                    callback: _this.loadImage,
                    context: _this,
                    args: tileRow.row
                });
            });
        }
        //fired when row is loaded
        //this function only proceeeds if the row that is completed is equal to current row.
        //current row increments step wise whenever the the tileRow(with same row number) is received.
        //if any other(i.e. future) tileRow is received, it is ignored.
        //when tileRow is received matched with current tile row, it checks for the subsequent next rows

    }, {
        key: 'loadImage',
        value: function loadImage(row) {
            if (row == this.image.verticalTiles) {
                return;
            }
            if (row == this.currentRow) {
                var self = this;
                var tileRow = _store2.default.findBy('tileRow', {
                    row: row
                });
                if (!tileRow.rowLoaded) {
                    return;
                }
                if (this.rowTileFillMap[row]) {
                    self.loadImage(row + 1);
                } else {
                    self.rowTileFillMap[row] = 1;
                    var fillImagePromise = this.fillImage(tileRow);
                    fillImagePromise.then(function (val) {
                        self.currentRow += 1;
                        self.loadImage(row + 1);
                    });
                }
            }
        }
        //canvas image is filled with tileRow

    }, {
        key: 'fillImage',
        value: function fillImage(tileRow) {
            var self = this;
            return new Promise(function (resolve) {
                function fillChunk() {
                    var tilesChunk = tileRow.tiles.splice(0, 20);
                    tilesChunk.forEach(function (tile) {
                        var svgImg = new Image();
                        svgImg.onload = function () {
                            self.canvasContext.drawImage(svgImg, tile.column * TILE_WIDTH, tileRow.row * TILE_HEIGHT);
                        };
                        svgImg.src = tile.svg;
                    });
                    if (tileRow.tiles.length > 0) {
                        setTimeout(function () {
                            fillChunk();
                        }, 0);
                    } else {
                        resolve();
                    }
                }
                setTimeout(function () {
                    fillChunk();
                }, 0);
            });
        }
    }]);

    return DestinationImageComponent;
}();

exports.default = DestinationImageComponent;

},{"../../services/observer":13,"../../services/store":15,"./template":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var template = function template() {
  return "<canvas id='destination'></canvas>";
};
exports.default = template;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _template = require('./template');

var _template2 = _interopRequireDefault(_template);

var _store = require('../../services/store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ImageUploadComponent = function () {
    function ImageUploadComponent() {
        _classCallCheck(this, ImageUploadComponent);

        document.getElementById("image-upload").innerHTML = (0, _template2.default)();
    }
    //When the submit button is clicked, the file(if uploaded), is uploaded in source image canvas.


    _createClass(ImageUploadComponent, [{
        key: 'addEvents',
        value: function addEvents() {
            document.getElementById("upload").addEventListener("click", this.loadImage);
        }
    }, {
        key: 'loadImage',
        value: function loadImage() {
            var mosaicImage = _store2.default.getRecord('mosaicImage');
            var files = document.getElementById("image").files;
            if (FileReader && files && files.length) {
                var fr = new FileReader();
                fr.onload = function () {
                    mosaicImage.node.src = fr.result;
                };
                fr.onerror = function (stuff) {
                    console.log("error", stuff);
                    console.log(stuff.getMessage());
                };
                fr.readAsDataURL(files[0]);
            }
        }
    }]);

    return ImageUploadComponent;
}();

exports.default = ImageUploadComponent;

},{"../../services/store":15,"./template":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var template = function template() {
  return "<div><label for='image'>Choose image to upload</label><input type='file' id='image' name='image' accept='image/*'></div><div><button id='upload'>Upload</button></div>";
};
exports.default = template;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _component = require('./destination-image/component');

var _component2 = _interopRequireDefault(_component);

var _component3 = require('./source-image/component');

var _component4 = _interopRequireDefault(_component3);

var _component5 = require('./image-upload/component');

var _component6 = _interopRequireDefault(_component5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var components = function components() {
  return [_component6.default, _component4.default, _component2.default];
};

exports.default = components;

},{"./destination-image/component":2,"./image-upload/component":4,"./source-image/component":7}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _template = require('./template');

var _template2 = _interopRequireDefault(_template);

var _store = require('../../services/store');

var _store2 = _interopRequireDefault(_store);

var _observer = require('../../services/observer');

var _observer2 = _interopRequireDefault(_observer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SourceImageComponent = function () {
    function SourceImageComponent() {
        _classCallCheck(this, SourceImageComponent);

        document.getElementById("source-image").innerHTML = (0, _template2.default)();
        this.addEvents();
    }

    _createClass(SourceImageComponent, [{
        key: 'addEvents',
        value: function addEvents() {
            var image = _store2.default.getRecord('mosaicImage');
            this.image = image;
            image.node.addEventListener('load', this.imageLoaded.bind(this));
        }
    }, {
        key: 'imageLoaded',
        value: function imageLoaded() {
            this.initiateCanvas();
            this.sliceImage();
        }
    }, {
        key: 'initiateCanvas',
        value: function initiateCanvas() {
            var canvas = document.getElementById('source');
            var ctx = canvas.getContext('2d');
            var image = this.image;
            var imageWidth = image.width;
            var imageHeight = image.height;
            ctx.canvas.width = imageWidth;
            ctx.canvas.height = imageHeight;
            ctx.drawImage(image.node, 0, 0);
            this.canvas = canvas;
            this.canvasContext = ctx;
        }
        //Image is divided into tiles. R,G,B values are calculated from tiles. Tile record and tileRow record is created. The observer is binded with reference to tileRow creation which will hint DestinationImageComponent to proceed with further processing.

    }, {
        key: 'sliceImage',
        value: function sliceImage() {
            var _this = this;

            var self = this;

            var _loop = function _loop(i) {
                var tileRow = _store2.default.createRecord('tileRow', {
                    image: _this.image,
                    row: i
                });
                setTimeout(function () {
                    for (var j = 0; j < self.image.horizontalTiles; j++) {
                        var r = 0,
                            g = 0,
                            b = 0;
                        var imgData = self.canvasContext.getImageData(j * TILE_WIDTH, i * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                        var pix = imgData.data;
                        r = pix[0];
                        g = pix[1];
                        b = pix[2];
                        var tile = _store2.default.createRecord('tile', {
                            tileRow: tileRow,
                            column: j,
                            r: r,
                            g: g,
                            b: b
                        });
                        tileRow.tiles.push(tile);
                    }
                    tileRow.processTiles();
                }, 0);
            };

            for (var i = 0; i < this.image.verticalTiles; i++) {
                _loop(i);
            }
            _observer2.default.dependableKey = 'tileRowsCreated';
            _observer2.default.toggleValue = !_observer2.default.toggleValue;
        }
    }]);

    return SourceImageComponent;
}();

exports.default = SourceImageComponent;

},{"../../services/observer":13,"../../services/store":15,"./template":8}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var template = function template() {
  return "<canvas id='source'></canvas>";
};
exports.default = template;

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mosaicImage = require('./mosaicImage');

var _mosaicImage2 = _interopRequireDefault(_mosaicImage);

var _tile = require('./tile');

var _tile2 = _interopRequireDefault(_tile);

var _tileRow = require('./tileRow');

var _tileRow2 = _interopRequireDefault(_tileRow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var models = function models() {
  return [_mosaicImage2.default, _tile2.default, _tileRow2.default];
};

exports.default = models;

},{"./mosaicImage":10,"./tile":11,"./tileRow":12}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//fileds: id, node, width, height, horizontalTiles, verticalTiles
var id = 1;

var MosaicImage = function () {
  function MosaicImage() {
    _classCallCheck(this, MosaicImage);

    this._modelName = "mosaicImage";
    this.id = id;
    this.node = new Image();
    id++;
  }

  _createClass(MosaicImage, [{
    key: "getModelName",
    value: function getModelName() {
      return this._modelName;
    }
  }, {
    key: "width",
    get: function get() {
      return this.node.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this.node.height;
    }
  }, {
    key: "horizontalTiles",
    get: function get() {
      var width = this.width;
      var tileWidth = TILE_WIDTH;
      return Math.ceil(width / tileWidth);
    }
  }, {
    key: "verticalTiles",
    get: function get() {
      var height = this.height;
      var tileHeight = TILE_HEIGHT;
      return Math.ceil(height / tileHeight);
    }
  }]);

  return MosaicImage;
}();

MosaicImage.modelName = "mosaicImage";
exports.default = MosaicImage;

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //fields: id, tileRow, image, row, column, r, g, b, hexCode, svgString


var _store = require('../services/store');

var _store2 = _interopRequireDefault(_store);

var _rgbToHex = require('../utils/rgbToHex');

var _rgbToHex2 = _interopRequireDefault(_rgbToHex);

var _pool = require('../services/pool');

var _pool2 = _interopRequireDefault(_pool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var id = 1;

var Tile = function () {
    function Tile(attributes) {
        _classCallCheck(this, Tile);

        this.id = id;
        this._modelName = "tile";
        //tileRowId, column, r, g, b
        Object.assign(this, attributes);
        id++;
    }

    _createClass(Tile, [{
        key: 'getModelName',
        value: function getModelName() {
            return this._modelName;
        }
        // get tileRow() {
        //     return Store.belongsTo('tile', this.tileRowId, 'tileRow');
        // }

    }, {
        key: 'image',
        get: function get() {
            return this.tileRow.image;
        }
    }, {
        key: 'row',
        get: function get() {
            return this.tileRow.row;
        }
    }, {
        key: 'hexCode',
        get: function get() {
            return (0, _rgbToHex2.default)(this.r, this.g, this.b);
        }
    }]);

    return Tile;
}();

Tile.modelName = "tile";
exports.default = Tile;

},{"../services/pool":14,"../services/store":15,"../utils/rgbToHex":18}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //properties: id, column, image, tiles


var _observer = require('../services/observer');

var _observer2 = _interopRequireDefault(_observer);

var _store = require('../services/store');

var _store2 = _interopRequireDefault(_store);

var _pool = require('../services/pool');

var _pool2 = _interopRequireDefault(_pool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var id = 1;

var TileRow = function () {
    function TileRow(attributes) {
        _classCallCheck(this, TileRow);

        this._modelName = "tile";
        this.id = id;
        // this.relationships = {
        //     belongsTo: ['image'],
        //     hasMany: ['tile']
        // }
        this.tiles = [];
        //column, imageId
        Object.assign(this, attributes);
        id++;
    }

    _createClass(TileRow, [{
        key: 'getModelName',
        value: function getModelName() {
            return this._modelName;
        }
        // get tiles() {
        //     return Store.hasMany('tileRow', this.id, 'tile');
        // }
        // get image() {
        //     return Store.belongsTo('tileRow', this.imageId, 'image');
        // }
        //this fires observer when all the tiles get svg from server.(row wise)

    }, {
        key: 'addTileLoadObserver',
        value: function addTileLoadObserver() {
            this.rowLoaded = true;
            _observer2.default.dependableKey = 'tileRowLoaded' + this.row;
            _observer2.default.toggleValue = !_observer2.default.toggleValue;
        }
    }, {
        key: 'setTileSvg',
        value: function setTileSvg(tilesArr) {
            tilesArr.forEach(function (tileHash) {
                var id = Object.keys(tileHash)[0];
                var svg = tileHash[id];
                _store2.default.find('tile', id).svg = svg;
            });
        }
    }, {
        key: 'processTilesCallback',
        value: function processTilesCallback(event) {
            var tilesArr = event.data;
            this.setTileSvg(tilesArr);
            this.addTileLoadObserver();
        }
    }, {
        key: 'processTiles',
        value: function processTiles() {
            var tileArr = [];
            this.tiles.forEach(function (tile) {
                var tileHash = {};
                tileHash[tile.id] = tile.hexCode;
                tileArr.push(tileHash);
            });
            _pool2.default.addWorkerTask('../js/workers/loadContent.js', this.processTilesCallback.bind(this), JSON.stringify(tileArr));
        }
    }]);

    return TileRow;
}();

TileRow.modelName = "tileRow";
exports.default = TileRow;

},{"../services/observer":13,"../services/pool":14,"../services/store":15}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
//This is observer implementation.
//Observer is fired when toggleValue is set
//whenever toggleValue is set, it checks for the value inside dependableKey.
//dependableObj consists of keys and values where keys are dependableKeys which guides which observer to fire and value is an array. Each element of array is an object which have three values: callback function, context, arguments.
var ObserverObj = new Proxy({
  toggleValue: false,
  dependableKey: null,
  dependableObj: {},
  toggleProperty: function toggleProperty() {
    this.toggleValue = !this.toggleValue;
  }
}, {
  set: function set(target, key, value) {
    target[key] = value;
    if (key == "toggleValue") {
      for (var k in target.dependableObj) {
        if (k == target.dependableKey) {
          var dependables = target.dependableObj[k];
          dependables.forEach(function (dependable) {
            dependable.callback.call(dependable.context, dependable.args);
          });
          break;
        }
      }
    }
    return true;
  }
});
exports.default = ObserverObj;

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _workerThread = require('./workerThread');

var _workerThread2 = _interopRequireDefault(_workerThread);

var _workerTask = require('./workerTask');

var _workerTask2 = _interopRequireDefault(_workerTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instance = null;

var Pool = function () {
    function Pool() {
        _classCallCheck(this, Pool);

        if (!instance) {
            instance = this;
            this.taskQueue = []; //tasks queue
            this.workerQueue = []; //workers queue
            this.poolSize = navigator.hardwareConcurrency || 4; //set pool size equal to no of cores, if navigator object available or 4.
        }
        return instance;
    }

    _createClass(Pool, [{
        key: 'createWorkerTask',
        value: function createWorkerTask(script, callback, msg) {
            return new _workerTask2.default(script, callback, msg);
        }
    }, {
        key: 'addWorkerTask',
        value: function addWorkerTask(script, callback, msg) {
            var workerTask = this.createWorkerTask(script, callback, msg);
            if (this.workerQueue.length > 0) {
                var workerThread = this.workerQueue.shift(); // get the worker from the front of the queue
                workerThread.run(workerTask);
            } else {
                this.taskQueue.push(workerTask); // no free workers
            }
        }
    }, {
        key: 'init',
        value: function init() {
            for (var i = 0; i < this.poolSize; i++) {
                // create 'poolSize' number of worker threads
                this.workerQueue.push(new _workerThread2.default(this));
            }
            return this;
        }
    }, {
        key: 'freeWorkerThread',
        value: function freeWorkerThread(workerThread) {
            if (this.taskQueue.length > 0) {
                var workerTask = this.taskQueue.shift(); // don't put back in queue, but execute next task
                workerThread.run(workerTask);
            } else {
                workerThread.worker.terminate(); //terminate worker if no task at hand
                this.workerQueue.unshift(workerThread);
            }
        }
    }]);

    return Pool;
}();

var pool = new Pool().init();
exports.default = pool;

},{"./workerTask":16,"./workerThread":17}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //this is data store implementation. Store is a singleton class
//the values are stored in data. and it has common functions like createRecord, findAll, findBy, find, getRecord, relationships(hasMany, belongsTo)


var _models = require("../models");

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var getModel = function getModel(modelName) {
    var referredModel = void 0;
    (0, _models2.default)().forEach(function (model) {
        if (model.modelName == modelName) {
            referredModel = model;
            return;
        }
    });
    if (referredModel) {
        return referredModel;
    } else {
        //throw error saying wrong model name passed
    }
};
var instance = null;

var Store = function () {
    function Store() {
        _classCallCheck(this, Store);

        if (!instance) {
            instance = this;
            this.data = {};
        }
        return instance;
    }

    _createClass(Store, [{
        key: "createRecord",
        value: function createRecord(modelName, attributes) {
            this.data[modelName] = this.data[modelName] || {};
            var model = getModel(modelName);
            var record = new model(attributes);
            this.data[modelName][record.id] = record;
            return record;
        }
    }, {
        key: "getRecord",
        value: function getRecord(modelName) {
            if (this.data[modelName] && Object.values(this.data[modelName])[0]) {
                return Object.values(this.data[modelName])[0];
            } else {
                return this.createRecord(modelName, {});
            }
        }
    }, {
        key: "findAll",
        value: function findAll(modelName) {
            return Object.values(this.data[modelName]);
        }
    }, {
        key: "find",
        value: function find(modelName, id) {
            return this.data[modelName][id];
        }
    }, {
        key: "findBy",
        value: function findBy(modelName, hash) {
            var records = Object.values(this.data[modelName]).filter(function (record) {
                for (var k in hash) {
                    if (hash[k] != record[k]) {
                        return false;
                    }
                }
                return true;
            });
            if (records.length) {
                return records[0];
            }
            return null;
        }
    }, {
        key: "filter",
        value: function filter(modelName, hash) {
            Object.values(this.data[modelName]).map(function (record) {
                return record.hasAttributes(attributes);
            });
        }
    }, {
        key: "belongsTo",
        value: function belongsTo(modelName, id, relationModel) {
            return Object.values(this.data[relationModel]).filter(function (record) {
                return record.id == id;
            })[0];
        }
    }, {
        key: "hasMany",
        value: function hasMany(modelName, id, relationModel) {
            return Object.values(this.data[relationModel]).filter(function (record) {
                return record[modelName + "Id"] == id;
            });
        }
    }]);

    return Store;
}();

var store = new Store();
exports.default = store;

},{"../models":9}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// task to run
var WorkerTask = function WorkerTask(script, callback, msg) {
    _classCallCheck(this, WorkerTask);

    this.script = script;
    this.callback = callback;
    this.startMessage = msg;
};

exports.default = WorkerTask;

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// runner work tasks in the pool
var WorkerThread = function () {
    function WorkerThread(parentPool) {
        _classCallCheck(this, WorkerThread);

        this.parentPool = parentPool;
        this.workerTask = null;
        this.worker = null;
    }

    _createClass(WorkerThread, [{
        key: 'run',
        value: function run(workerTask) {
            if (this.worker) {
                this.worker.terminate();
            }
            this.workerTask = workerTask;
            if (this.workerTask.script != null) {
                var worker = new Worker(workerTask.script); // create a new web worker
                worker.addEventListener('message', this.dummyCallback.bind(this), false);
                worker.postMessage(workerTask.startMessage);
                this.worker = worker;
            }
        }
        // for now assume we only get a single callback from a worker
        // which also indicates the end of this worker.

    }, {
        key: 'dummyCallback',
        value: function dummyCallback(event) {
            this.workerTask.callback(event); // pass to original callback
            this.parentPool.freeWorkerThread(this); // we should use a seperate thread to add the worker
        }
    }]);

    return WorkerThread;
}();

exports.default = WorkerThread;

},{}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
//this takes r, g and b values and generate hexadecimal color code.
function componentToHex(c) {
    var hex = Math.round(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

exports.default = rgbToHex;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcHBsaWNhdGlvbi5qcyIsImpzL2NvbXBvbmVudHMvZGVzdGluYXRpb24taW1hZ2UvY29tcG9uZW50LmpzIiwianMvY29tcG9uZW50cy9kZXN0aW5hdGlvbi1pbWFnZS90ZW1wbGF0ZS5qcyIsImpzL2NvbXBvbmVudHMvaW1hZ2UtdXBsb2FkL2NvbXBvbmVudC5qcyIsImpzL2NvbXBvbmVudHMvaW1hZ2UtdXBsb2FkL3RlbXBsYXRlLmpzIiwianMvY29tcG9uZW50cy9pbmRleC5qcyIsImpzL2NvbXBvbmVudHMvc291cmNlLWltYWdlL2NvbXBvbmVudC5qcyIsImpzL2NvbXBvbmVudHMvc291cmNlLWltYWdlL3RlbXBsYXRlLmpzIiwianMvbW9kZWxzL2luZGV4LmpzIiwianMvbW9kZWxzL21vc2FpY0ltYWdlLmpzIiwianMvbW9kZWxzL3RpbGUuanMiLCJqcy9tb2RlbHMvdGlsZVJvdy5qcyIsImpzL3NlcnZpY2VzL29ic2VydmVyLmpzIiwianMvc2VydmljZXMvcG9vbC5qcyIsImpzL3NlcnZpY2VzL3N0b3JlLmpzIiwianMvc2VydmljZXMvd29ya2VyVGFzay5qcyIsImpzL3NlcnZpY2VzL3dvcmtlclRocmVhZC5qcyIsImpzL3V0aWxzL3JnYlRvSGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNHQTs7Ozs7O0FBQ0EsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsSUFBOUMsRUFBb0QsS0FBcEQsRSxDQUpBO0FBQ0E7QUFDQTs7QUFHQSxTQUFTLElBQVQsR0FBZTtBQUNiLDhCQUFhLE9BQWIsQ0FBcUIsVUFBQyxTQUFELEVBQWU7QUFDbEMsUUFBSSxPQUFPLElBQUksU0FBSixFQUFYO0FBQ0EsU0FBSyxTQUFMO0FBQ0QsR0FIRDtBQUlEOzs7Ozs7Ozs7OztBQ1ZEOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7SUFFTSx5Qjs7OzRCQUNjO0FBQ1os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QUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsUUFBZCxDQUF1QixFQUF2QixDQUFWO0FBQ0EsV0FBTyxJQUFJLE1BQUosSUFBYyxDQUFkLEdBQWtCLE1BQU0sR0FBeEIsR0FBOEIsR0FBckM7QUFDSDs7QUFFRCxTQUFTLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsRUFBMkI7QUFDdkIsV0FBTyxLQUFLLGVBQWUsQ0FBZixDQUFMLEdBQXlCLGVBQWUsQ0FBZixDQUF6QixHQUE2QyxlQUFlLENBQWYsQ0FBcEQ7QUFDSDs7a0JBRWMsUSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvL0NvbXBvbmVudHMgYXJlIGluaXRpYXRlZCBhcyBzb29uIGFzIHRoZSBkb20gaXMgbG9hZGVkLlxuLy9FYWNoIGVsZW1lbnQgd2hpY2ggaGFzIGEgY29tcG9uZW50IHNoYWxsIGhhdmUgc2FtZSBpZCBhcyBjb21wb25lbnQgbmFtZS5cbi8vVGhlIGNvbXBvbmVudCBoYXZlIHRlbXBsYXRlIGFuZCBjb21wb25lbnQuIFdoZW4gaW5pdGlhdGVkLCBldmVudHMgYXJlIGJpbmRlZCBhY2NvcmRpbmcgdG8gdGhlIGNvbXBvbmVudC5cbmltcG9ydCBjb21wb25lbnRzIGZyb20gJy4vY29tcG9uZW50cyc7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCwgZmFsc2UpO1xuZnVuY3Rpb24gaW5pdCgpe1xuICBjb21wb25lbnRzKCkuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XG4gICAgbGV0IGNvbXAgPSBuZXcgY29tcG9uZW50KCk7XG4gICAgY29tcC5hZGRFdmVudHMoKTtcbiAgfSlcbn07XG4iLCJpbXBvcnQgdGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZSc7XG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vLi4vc2VydmljZXMvc3RvcmUnO1xuaW1wb3J0IE9ic2VydmVyT2JqIGZyb20gJy4uLy4uL3NlcnZpY2VzL29ic2VydmVyJztcblxuY2xhc3MgRGVzdGluYXRpb25JbWFnZUNvbXBvbmVudCB7XG4gICAgZ2V0IHRvdGFsUm93cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZVJvd3MubGVuZ3RoO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXN0aW5hdGlvbi1pbWFnZVwiKS5pbm5lckhUTUwgPSB0ZW1wbGF0ZSgpO1xuICAgICAgICBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93c0NyZWF0ZWQnXSA9IE9ic2VydmVyT2JqLmRlcGVuZGFibGVPYmpbJ3RpbGVSb3dzQ3JlYXRlZCddIHx8IFtdO1xuICAgICAgICBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93c0NyZWF0ZWQnXS5wdXNoKHtcbiAgICAgICAgICAgIGNhbGxiYWNrOiB0aGlzLnNldFRpbGVSb3dzLFxuICAgICAgICAgICAgY29udGV4dDogdGhpc1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jdXJyZW50Um93ID0gMDtcbiAgICAgICAgdGhpcy5hZGRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5yb3dUaWxlRmlsbE1hcCA9IHt9O1xuICAgIH1cbiAgICBhZGRFdmVudHMoKSB7XG4gICAgICAgIGxldCBpbWFnZSA9IFN0b3JlLmdldFJlY29yZCgnbW9zYWljSW1hZ2UnKTtcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICBpbWFnZS5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLmluaXRpYXRlQ2FudmFzLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICBpbml0aWF0ZUNhbnZhcygpIHtcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZXN0aW5hdGlvbicpO1xuICAgICAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGN0eC5jYW52YXMud2lkdGggPSB0aGlzLmltYWdlLm5vZGUud2lkdGg7XG4gICAgICAgIGN0eC5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWFnZS5ub2RlLmhlaWdodDtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICAgIHRoaXMuY2FudmFzQ29udGV4dCA9IGN0eDtcbiAgICB9XG4gICAgLy9vYnNlcnZlciBhcmUgYmluZGVkIHRvIHdoZW4gdGhlIHRpbGVSb3cgd2lsbCBoYXZlIGxvYWRlZCByb3dzIHdpdGggc3ZnIGNvbnRlbnQgZnJvbSBzZXJ2ZXJcbiAgICBzZXRUaWxlUm93cygpIHtcbiAgICAgICAgdGhpcy50aWxlUm93cyA9IFN0b3JlLmZpbmRBbGwoJ3RpbGVSb3cnKTtcbiAgICAgICAgdGhpcy50aWxlUm93cy5mb3JFYWNoKCh0aWxlUm93KSA9PiB7XG4gICAgICAgICAgICBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93TG9hZGVkJyArIHRpbGVSb3cucm93XSA9IE9ic2VydmVyT2JqLmRlcGVuZGFibGVPYmpbJ3RpbGVSb3dMb2FkZWQnICsgdGlsZVJvdy5yb3ddIHx8IFtdO1xuICAgICAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZU9ialsndGlsZVJvd0xvYWRlZCcgKyB0aWxlUm93LnJvd10ucHVzaCh7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IHRoaXMubG9hZEltYWdlLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXG4gICAgICAgICAgICAgICAgYXJnczogdGlsZVJvdy5yb3dcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy9maXJlZCB3aGVuIHJvdyBpcyBsb2FkZWRcbiAgICAvL3RoaXMgZnVuY3Rpb24gb25seSBwcm9jZWVlZHMgaWYgdGhlIHJvdyB0aGF0IGlzIGNvbXBsZXRlZCBpcyBlcXVhbCB0byBjdXJyZW50IHJvdy5cbiAgICAvL2N1cnJlbnQgcm93IGluY3JlbWVudHMgc3RlcCB3aXNlIHdoZW5ldmVyIHRoZSB0aGUgdGlsZVJvdyh3aXRoIHNhbWUgcm93IG51bWJlcikgaXMgcmVjZWl2ZWQuXG4gICAgLy9pZiBhbnkgb3RoZXIoaS5lLiBmdXR1cmUpIHRpbGVSb3cgaXMgcmVjZWl2ZWQsIGl0IGlzIGlnbm9yZWQuXG4gICAgLy93aGVuIHRpbGVSb3cgaXMgcmVjZWl2ZWQgbWF0Y2hlZCB3aXRoIGN1cnJlbnQgdGlsZSByb3csIGl0IGNoZWNrcyBmb3IgdGhlIHN1YnNlcXVlbnQgbmV4dCByb3dzXG4gICAgbG9hZEltYWdlKHJvdykge1xuICAgICAgICBpZiAocm93ID09IHRoaXMuaW1hZ2UudmVydGljYWxUaWxlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyb3cgPT0gdGhpcy5jdXJyZW50Um93KSB7XG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBsZXQgdGlsZVJvdyA9IFN0b3JlLmZpbmRCeSgndGlsZVJvdycsIHtcbiAgICAgICAgICAgICAgICByb3dcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCF0aWxlUm93LnJvd0xvYWRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnJvd1RpbGVGaWxsTWFwW3Jvd10pIHtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShyb3cgKyAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5yb3dUaWxlRmlsbE1hcFtyb3ddID0gMTtcbiAgICAgICAgICAgICAgICBsZXQgZmlsbEltYWdlUHJvbWlzZSA9IHRoaXMuZmlsbEltYWdlKHRpbGVSb3cpXG4gICAgICAgICAgICAgICAgZmlsbEltYWdlUHJvbWlzZS50aGVuKCh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jdXJyZW50Um93ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlKHJvdyArIDEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vY2FudmFzIGltYWdlIGlzIGZpbGxlZCB3aXRoIHRpbGVSb3dcbiAgICBmaWxsSW1hZ2UodGlsZVJvdykge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBmaWxsQ2h1bmsoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRpbGVzQ2h1bmsgPSB0aWxlUm93LnRpbGVzLnNwbGljZSgwLCAyMCk7XG4gICAgICAgICAgICAgICAgdGlsZXNDaHVuay5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdmdJbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgc3ZnSW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jYW52YXNDb250ZXh0LmRyYXdJbWFnZShzdmdJbWcsIHRpbGUuY29sdW1uICogVElMRV9XSURUSCwgdGlsZVJvdy5yb3cgKiBUSUxFX0hFSUdIVCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3ZnSW1nLnNyYyA9IHRpbGUuc3ZnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0aWxlUm93LnRpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxDaHVuaygpO1xuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBmaWxsQ2h1bmsoKTtcbiAgICAgICAgICAgIH0sIDApO1xuXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnQ7XG4iLCJsZXQgdGVtcGxhdGUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gXCI8Y2FudmFzIGlkPSdkZXN0aW5hdGlvbic+PC9jYW52YXM+XCI7XG59XG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZTtcbiIsImltcG9ydCB0ZW1wbGF0ZSBmcm9tICcuL3RlbXBsYXRlJztcbmltcG9ydCBTdG9yZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9zdG9yZSc7XG5jbGFzcyBJbWFnZVVwbG9hZENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW1hZ2UtdXBsb2FkXCIpLmlubmVySFRNTCA9IHRlbXBsYXRlKCk7XG4gICAgfVxuICAgIC8vV2hlbiB0aGUgc3VibWl0IGJ1dHRvbiBpcyBjbGlja2VkLCB0aGUgZmlsZShpZiB1cGxvYWRlZCksIGlzIHVwbG9hZGVkIGluIHNvdXJjZSBpbWFnZSBjYW52YXMuXG4gICAgYWRkRXZlbnRzKCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVwbG9hZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5sb2FkSW1hZ2UpO1xuICAgIH1cblxuICAgIGxvYWRJbWFnZSgpIHtcbiAgICAgICAgdmFyIG1vc2FpY0ltYWdlID0gU3RvcmUuZ2V0UmVjb3JkKCdtb3NhaWNJbWFnZScpO1xuICAgICAgICB2YXIgZmlsZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlXCIpLmZpbGVzO1xuICAgICAgICBpZiAoRmlsZVJlYWRlciAmJiBmaWxlcyAmJiBmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBmciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICBmci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBtb3NhaWNJbWFnZS5ub2RlLnNyYyA9IGZyLnJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZyLm9uZXJyb3IgPSBmdW5jdGlvbihzdHVmZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3JcIiwgc3R1ZmYpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3R1ZmYuZ2V0TWVzc2FnZSgpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnIucmVhZEFzRGF0YVVSTChmaWxlc1swXSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBJbWFnZVVwbG9hZENvbXBvbmVudDtcbiIsInZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBcIjxkaXY+PGxhYmVsIGZvcj0naW1hZ2UnPkNob29zZSBpbWFnZSB0byB1cGxvYWQ8L2xhYmVsPjxpbnB1dCB0eXBlPSdmaWxlJyBpZD0naW1hZ2UnIG5hbWU9J2ltYWdlJyBhY2NlcHQ9J2ltYWdlLyonPjwvZGl2PjxkaXY+PGJ1dHRvbiBpZD0ndXBsb2FkJz5VcGxvYWQ8L2J1dHRvbj48L2Rpdj5cIlxufVxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGU7XG4iLCJpbXBvcnQgRGVzdGluYXRpb25JbWFnZUNvbXBvbmVudCBmcm9tICcuL2Rlc3RpbmF0aW9uLWltYWdlL2NvbXBvbmVudCc7XG5pbXBvcnQgU291cmNlSW1hZ2VDb21wb25lbnQgZnJvbSAnLi9zb3VyY2UtaW1hZ2UvY29tcG9uZW50JztcbmltcG9ydCBJbWFnZVVwbG9hZENvbXBvbmVudCBmcm9tICcuL2ltYWdlLXVwbG9hZC9jb21wb25lbnQnO1xubGV0IGNvbXBvbmVudHMgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gW0ltYWdlVXBsb2FkQ29tcG9uZW50LCBTb3VyY2VJbWFnZUNvbXBvbmVudCwgRGVzdGluYXRpb25JbWFnZUNvbXBvbmVudF07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudHM7XG4iLCJpbXBvcnQgdGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZSc7XG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vLi4vc2VydmljZXMvc3RvcmUnO1xuaW1wb3J0IE9ic2VydmVyT2JqIGZyb20gJy4uLy4uL3NlcnZpY2VzL29ic2VydmVyJztcblxuY2xhc3MgU291cmNlSW1hZ2VDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNvdXJjZS1pbWFnZVwiKS5pbm5lckhUTUwgPSB0ZW1wbGF0ZSgpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50cygpO1xuICAgIH1cbiAgICBhZGRFdmVudHMoKSB7XG4gICAgICAgIGxldCBpbWFnZSA9IFN0b3JlLmdldFJlY29yZCgnbW9zYWljSW1hZ2UnKTtcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICBpbWFnZS5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLmltYWdlTG9hZGVkLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICBpbWFnZUxvYWRlZCgpIHtcbiAgICAgICAgdGhpcy5pbml0aWF0ZUNhbnZhcygpO1xuICAgICAgICB0aGlzLnNsaWNlSW1hZ2UoKTtcbiAgICB9XG4gICAgaW5pdGlhdGVDYW52YXMoKSB7XG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc291cmNlJyk7XG4gICAgICAgIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgbGV0IGltYWdlID0gdGhpcy5pbWFnZTtcbiAgICAgICAgbGV0IGltYWdlV2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICAgICAgbGV0IGltYWdlSGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuICAgICAgICBjdHguY2FudmFzLndpZHRoID0gaW1hZ2VXaWR0aDtcbiAgICAgICAgY3R4LmNhbnZhcy5oZWlnaHQgPSBpbWFnZUhlaWdodDtcbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZS5ub2RlLCAwLCAwKTtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICAgIHRoaXMuY2FudmFzQ29udGV4dCA9IGN0eDtcbiAgICB9XG4gICAgLy9JbWFnZSBpcyBkaXZpZGVkIGludG8gdGlsZXMuIFIsRyxCIHZhbHVlcyBhcmUgY2FsY3VsYXRlZCBmcm9tIHRpbGVzLiBUaWxlIHJlY29yZCBhbmQgdGlsZVJvdyByZWNvcmQgaXMgY3JlYXRlZC4gVGhlIG9ic2VydmVyIGlzIGJpbmRlZCB3aXRoIHJlZmVyZW5jZSB0byB0aWxlUm93IGNyZWF0aW9uIHdoaWNoIHdpbGwgaGludCBEZXN0aW5hdGlvbkltYWdlQ29tcG9uZW50IHRvIHByb2NlZWQgd2l0aCBmdXJ0aGVyIHByb2Nlc3NpbmcuXG4gICAgc2xpY2VJbWFnZSgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW1hZ2UudmVydGljYWxUaWxlczsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgdGlsZVJvdyA9IFN0b3JlLmNyZWF0ZVJlY29yZCgndGlsZVJvdycsIHtcbiAgICAgICAgICAgICAgICBpbWFnZTogdGhpcy5pbWFnZSxcbiAgICAgICAgICAgICAgICByb3c6IGksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzZWxmLmltYWdlLmhvcml6b250YWxUaWxlczsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGcgPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgYiA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbWdEYXRhID0gc2VsZi5jYW52YXNDb250ZXh0LmdldEltYWdlRGF0YShqICogVElMRV9XSURUSCwgaSAqIFRJTEVfSEVJR0hULCBUSUxFX1dJRFRILCBUSUxFX0hFSUdIVCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwaXggPSBpbWdEYXRhLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIHIgPSBwaXhbMF07XG4gICAgICAgICAgICAgICAgICAgIGcgPSBwaXhbMV07XG4gICAgICAgICAgICAgICAgICAgIGIgPSBwaXhbMl07XG4gICAgICAgICAgICAgICAgICAgIGxldCB0aWxlID0gU3RvcmUuY3JlYXRlUmVjb3JkKCd0aWxlJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGlsZVJvdzogdGlsZVJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogaixcbiAgICAgICAgICAgICAgICAgICAgICAgIHI6IHIsXG4gICAgICAgICAgICAgICAgICAgICAgICBnOiBnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYjogYlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGlsZVJvdy50aWxlcy5wdXNoKHRpbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aWxlUm93LnByb2Nlc3NUaWxlcygpO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZUtleSA9ICd0aWxlUm93c0NyZWF0ZWQnO1xuICAgICAgICBPYnNlcnZlck9iai50b2dnbGVWYWx1ZSA9ICFPYnNlcnZlck9iai50b2dnbGVWYWx1ZTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBTb3VyY2VJbWFnZUNvbXBvbmVudDtcbiIsImxldCB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBcIjxjYW52YXMgaWQ9J3NvdXJjZSc+PC9jYW52YXM+XCI7XG59XG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZTtcbiIsImltcG9ydCBNb3NhaWNJbWFnZSBmcm9tICcuL21vc2FpY0ltYWdlJztcbmltcG9ydCBUaWxlIGZyb20gJy4vdGlsZSc7XG5pbXBvcnQgVGlsZVJvdyBmcm9tICcuL3RpbGVSb3cnO1xubGV0IG1vZGVscyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBbTW9zYWljSW1hZ2UsIFRpbGUsIFRpbGVSb3ddO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtb2RlbHM7XG4iLCIvL2ZpbGVkczogaWQsIG5vZGUsIHdpZHRoLCBoZWlnaHQsIGhvcml6b250YWxUaWxlcywgdmVydGljYWxUaWxlc1xubGV0IGlkID0gMTtcbmNsYXNzIE1vc2FpY0ltYWdle1xuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHRoaXMuX21vZGVsTmFtZSA9IFwibW9zYWljSW1hZ2VcIjtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5ub2RlID0gbmV3IEltYWdlKCk7XG4gICAgaWQrKztcbiAgfVxuICBnZXRNb2RlbE5hbWUoKXtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWxOYW1lO1xuICB9XG4gIGdldCB3aWR0aCgpe1xuICAgIHJldHVybiB0aGlzLm5vZGUud2lkdGg7XG4gIH1cbiAgZ2V0IGhlaWdodCgpe1xuICAgIHJldHVybiB0aGlzLm5vZGUuaGVpZ2h0O1xuICB9XG4gIGdldCBob3Jpem9udGFsVGlsZXMoKXtcbiAgICBsZXQgd2lkdGggPSB0aGlzLndpZHRoO1xuICAgIGxldCB0aWxlV2lkdGggPSBUSUxFX1dJRFRIO1xuICAgIHJldHVybiBNYXRoLmNlaWwod2lkdGgvdGlsZVdpZHRoKTtcbiAgfVxuICBnZXQgdmVydGljYWxUaWxlcygpe1xuICAgIGxldCBoZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICBsZXQgdGlsZUhlaWdodCA9IFRJTEVfSEVJR0hUO1xuICAgIHJldHVybiBNYXRoLmNlaWwoaGVpZ2h0L3RpbGVIZWlnaHQpO1xuICB9XG59XG5Nb3NhaWNJbWFnZS5tb2RlbE5hbWUgPSBcIm1vc2FpY0ltYWdlXCI7XG5leHBvcnQgZGVmYXVsdCBNb3NhaWNJbWFnZTtcbiIsIi8vZmllbGRzOiBpZCwgdGlsZVJvdywgaW1hZ2UsIHJvdywgY29sdW1uLCByLCBnLCBiLCBoZXhDb2RlLCBzdmdTdHJpbmdcbmltcG9ydCBTdG9yZSBmcm9tICcuLi9zZXJ2aWNlcy9zdG9yZSc7XG5pbXBvcnQgcmdiVG9IZXggZnJvbSAnLi4vdXRpbHMvcmdiVG9IZXgnO1xuaW1wb3J0IFBvb2wgZnJvbSAnLi4vc2VydmljZXMvcG9vbCc7XG5cbmxldCBpZCA9IDFcbmNsYXNzIFRpbGUge1xuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLl9tb2RlbE5hbWUgPSBcInRpbGVcIjtcbiAgICAgICAgLy90aWxlUm93SWQsIGNvbHVtbiwgciwgZywgYlxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIGF0dHJpYnV0ZXMpO1xuICAgICAgICBpZCsrO1xuICAgIH1cbiAgICBnZXRNb2RlbE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RlbE5hbWU7XG4gICAgfVxuICAgIC8vIGdldCB0aWxlUm93KCkge1xuICAgIC8vICAgICByZXR1cm4gU3RvcmUuYmVsb25nc1RvKCd0aWxlJywgdGhpcy50aWxlUm93SWQsICd0aWxlUm93Jyk7XG4gICAgLy8gfVxuICAgIGdldCBpbWFnZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZVJvdy5pbWFnZTtcbiAgICB9XG4gICAgZ2V0IHJvdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZVJvdy5yb3c7XG4gICAgfVxuICAgIGdldCBoZXhDb2RlKCkge1xuICAgICAgICByZXR1cm4gcmdiVG9IZXgodGhpcy5yLCB0aGlzLmcsIHRoaXMuYik7XG4gICAgfVxufVxuVGlsZS5tb2RlbE5hbWUgPSBcInRpbGVcIjtcbmV4cG9ydCBkZWZhdWx0IFRpbGU7XG4iLCIvL3Byb3BlcnRpZXM6IGlkLCBjb2x1bW4sIGltYWdlLCB0aWxlc1xuaW1wb3J0IE9ic2VydmVyT2JqIGZyb20gJy4uL3NlcnZpY2VzL29ic2VydmVyJztcbmltcG9ydCBTdG9yZSBmcm9tICcuLi9zZXJ2aWNlcy9zdG9yZSc7XG5pbXBvcnQgUG9vbCBmcm9tICcuLi9zZXJ2aWNlcy9wb29sJztcblxubGV0IGlkID0gMTtcbmNsYXNzIFRpbGVSb3cge1xuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGhpcy5fbW9kZWxOYW1lID0gXCJ0aWxlXCI7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgLy8gdGhpcy5yZWxhdGlvbnNoaXBzID0ge1xuICAgICAgICAvLyAgICAgYmVsb25nc1RvOiBbJ2ltYWdlJ10sXG4gICAgICAgIC8vICAgICBoYXNNYW55OiBbJ3RpbGUnXVxuICAgICAgICAvLyB9XG4gICAgICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICAgICAgLy9jb2x1bW4sIGltYWdlSWRcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgaWQrKztcbiAgICB9XG4gICAgZ2V0TW9kZWxOYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kZWxOYW1lO1xuICAgIH1cbiAgICAvLyBnZXQgdGlsZXMoKSB7XG4gICAgLy8gICAgIHJldHVybiBTdG9yZS5oYXNNYW55KCd0aWxlUm93JywgdGhpcy5pZCwgJ3RpbGUnKTtcbiAgICAvLyB9XG4gICAgLy8gZ2V0IGltYWdlKCkge1xuICAgIC8vICAgICByZXR1cm4gU3RvcmUuYmVsb25nc1RvKCd0aWxlUm93JywgdGhpcy5pbWFnZUlkLCAnaW1hZ2UnKTtcbiAgICAvLyB9XG4gICAgLy90aGlzIGZpcmVzIG9ic2VydmVyIHdoZW4gYWxsIHRoZSB0aWxlcyBnZXQgc3ZnIGZyb20gc2VydmVyLihyb3cgd2lzZSlcbiAgICBhZGRUaWxlTG9hZE9ic2VydmVyKCkge1xuICAgICAgICB0aGlzLnJvd0xvYWRlZCA9IHRydWU7XG4gICAgICAgIE9ic2VydmVyT2JqLmRlcGVuZGFibGVLZXkgPSAndGlsZVJvd0xvYWRlZCcgKyB0aGlzLnJvdztcbiAgICAgICAgT2JzZXJ2ZXJPYmoudG9nZ2xlVmFsdWUgPSAhT2JzZXJ2ZXJPYmoudG9nZ2xlVmFsdWU7XG4gICAgfVxuICAgIHNldFRpbGVTdmcodGlsZXNBcnIpIHtcbiAgICAgICAgdGlsZXNBcnIuZm9yRWFjaCgodGlsZUhhc2gpID0+IHtcbiAgICAgICAgICAgIGxldCBpZCA9IE9iamVjdC5rZXlzKHRpbGVIYXNoKVswXTtcbiAgICAgICAgICAgIGxldCBzdmcgPSB0aWxlSGFzaFtpZF07XG4gICAgICAgICAgICBTdG9yZS5maW5kKCd0aWxlJywgaWQpLnN2ZyA9IHN2ZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByb2Nlc3NUaWxlc0NhbGxiYWNrKGV2ZW50KSB7XG4gICAgICAgIGxldCB0aWxlc0FyciA9IGV2ZW50LmRhdGE7XG4gICAgICAgIHRoaXMuc2V0VGlsZVN2Zyh0aWxlc0Fycik7XG4gICAgICAgIHRoaXMuYWRkVGlsZUxvYWRPYnNlcnZlcigpO1xuICAgIH1cbiAgICBwcm9jZXNzVGlsZXMoKSB7XG4gICAgICAgIGxldCB0aWxlQXJyID0gW107XG4gICAgICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xuICAgICAgICAgICAgbGV0IHRpbGVIYXNoID0ge307XG4gICAgICAgICAgICB0aWxlSGFzaFt0aWxlLmlkXSA9IHRpbGUuaGV4Q29kZTtcbiAgICAgICAgICAgIHRpbGVBcnIucHVzaCh0aWxlSGFzaCk7XG4gICAgICAgIH0pO1xuICAgICAgICBQb29sLmFkZFdvcmtlclRhc2soJy4uL2pzL3dvcmtlcnMvbG9hZENvbnRlbnQuanMnLCB0aGlzLnByb2Nlc3NUaWxlc0NhbGxiYWNrLmJpbmQodGhpcyksIEpTT04uc3RyaW5naWZ5KHRpbGVBcnIpKTtcbiAgICB9XG59XG5UaWxlUm93Lm1vZGVsTmFtZSA9IFwidGlsZVJvd1wiO1xuZXhwb3J0IGRlZmF1bHQgVGlsZVJvdztcbiIsIi8vVGhpcyBpcyBvYnNlcnZlciBpbXBsZW1lbnRhdGlvbi5cbi8vT2JzZXJ2ZXIgaXMgZmlyZWQgd2hlbiB0b2dnbGVWYWx1ZSBpcyBzZXRcbi8vd2hlbmV2ZXIgdG9nZ2xlVmFsdWUgaXMgc2V0LCBpdCBjaGVja3MgZm9yIHRoZSB2YWx1ZSBpbnNpZGUgZGVwZW5kYWJsZUtleS5cbi8vZGVwZW5kYWJsZU9iaiBjb25zaXN0cyBvZiBrZXlzIGFuZCB2YWx1ZXMgd2hlcmUga2V5cyBhcmUgZGVwZW5kYWJsZUtleXMgd2hpY2ggZ3VpZGVzIHdoaWNoIG9ic2VydmVyIHRvIGZpcmUgYW5kIHZhbHVlIGlzIGFuIGFycmF5LiBFYWNoIGVsZW1lbnQgb2YgYXJyYXkgaXMgYW4gb2JqZWN0IHdoaWNoIGhhdmUgdGhyZWUgdmFsdWVzOiBjYWxsYmFjayBmdW5jdGlvbiwgY29udGV4dCwgYXJndW1lbnRzLlxubGV0IE9ic2VydmVyT2JqID0gbmV3IFByb3h5KHtcbiAgdG9nZ2xlVmFsdWU6IGZhbHNlLFxuICBkZXBlbmRhYmxlS2V5OiBudWxsLFxuICBkZXBlbmRhYmxlT2JqOiB7fSxcbiAgdG9nZ2xlUHJvcGVydHkoKXtcbiAgICB0aGlzLnRvZ2dsZVZhbHVlID0gIXRoaXMudG9nZ2xlVmFsdWU7XG4gIH1cbn0sIHtcbiAgc2V0KHRhcmdldCwga2V5LCB2YWx1ZSl7XG4gICAgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcbiAgICBpZihrZXk9PVwidG9nZ2xlVmFsdWVcIil7XG4gICAgICBmb3IodmFyIGsgaW4gdGFyZ2V0LmRlcGVuZGFibGVPYmope1xuICAgICAgICBpZihrPT10YXJnZXQuZGVwZW5kYWJsZUtleSl7XG4gICAgICAgICAgbGV0IGRlcGVuZGFibGVzID0gdGFyZ2V0LmRlcGVuZGFibGVPYmpba107XG4gICAgICAgICAgZGVwZW5kYWJsZXMuZm9yRWFjaCgoZGVwZW5kYWJsZSkgPT4ge1xuICAgICAgICAgICAgZGVwZW5kYWJsZS5jYWxsYmFjay5jYWxsKGRlcGVuZGFibGUuY29udGV4dCwgZGVwZW5kYWJsZS5hcmdzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufSk7XG5leHBvcnQgZGVmYXVsdCBPYnNlcnZlck9iajtcbiIsImltcG9ydCBXb3JrZXJUaHJlYWQgZnJvbSAnLi93b3JrZXJUaHJlYWQnO1xuaW1wb3J0IFdvcmtlclRhc2sgZnJvbSAnLi93b3JrZXJUYXNrJztcblxubGV0IGluc3RhbmNlID0gbnVsbDtcbmNsYXNzIFBvb2wge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLnRhc2tRdWV1ZSA9IFtdOyAvL3Rhc2tzIHF1ZXVlXG4gICAgICAgICAgICB0aGlzLndvcmtlclF1ZXVlID0gW107IC8vd29ya2VycyBxdWV1ZVxuICAgICAgICAgICAgdGhpcy5wb29sU2l6ZSA9IG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5IHx8IDQ7IC8vc2V0IHBvb2wgc2l6ZSBlcXVhbCB0byBubyBvZiBjb3JlcywgaWYgbmF2aWdhdG9yIG9iamVjdCBhdmFpbGFibGUgb3IgNC5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfVxuICAgIGNyZWF0ZVdvcmtlclRhc2soc2NyaXB0LCBjYWxsYmFjaywgbXNnKSB7XG4gICAgICAgIHJldHVybiBuZXcgV29ya2VyVGFzayhzY3JpcHQsIGNhbGxiYWNrLCBtc2cpO1xuICAgIH1cbiAgICBhZGRXb3JrZXJUYXNrKHNjcmlwdCwgY2FsbGJhY2ssIG1zZykge1xuICAgICAgICBsZXQgd29ya2VyVGFzayA9IHRoaXMuY3JlYXRlV29ya2VyVGFzayhzY3JpcHQsIGNhbGxiYWNrLCBtc2cpO1xuICAgICAgICBpZiAodGhpcy53b3JrZXJRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgd29ya2VyVGhyZWFkID0gdGhpcy53b3JrZXJRdWV1ZS5zaGlmdCgpOyAvLyBnZXQgdGhlIHdvcmtlciBmcm9tIHRoZSBmcm9udCBvZiB0aGUgcXVldWVcbiAgICAgICAgICAgIHdvcmtlclRocmVhZC5ydW4od29ya2VyVGFzayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRhc2tRdWV1ZS5wdXNoKHdvcmtlclRhc2spOyAvLyBubyBmcmVlIHdvcmtlcnNcbiAgICAgICAgfVxuICAgIH1cbiAgICBpbml0KCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucG9vbFNpemU7IGkrKykgeyAvLyBjcmVhdGUgJ3Bvb2xTaXplJyBudW1iZXIgb2Ygd29ya2VyIHRocmVhZHNcbiAgICAgICAgICAgIHRoaXMud29ya2VyUXVldWUucHVzaChuZXcgV29ya2VyVGhyZWFkKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZnJlZVdvcmtlclRocmVhZCh3b3JrZXJUaHJlYWQpIHtcbiAgICAgICAgaWYgKHRoaXMudGFza1F1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciB3b3JrZXJUYXNrID0gdGhpcy50YXNrUXVldWUuc2hpZnQoKTsgLy8gZG9uJ3QgcHV0IGJhY2sgaW4gcXVldWUsIGJ1dCBleGVjdXRlIG5leHQgdGFza1xuICAgICAgICAgICAgd29ya2VyVGhyZWFkLnJ1bih3b3JrZXJUYXNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdvcmtlclRocmVhZC53b3JrZXIudGVybWluYXRlKCk7IC8vdGVybWluYXRlIHdvcmtlciBpZiBubyB0YXNrIGF0IGhhbmRcbiAgICAgICAgICAgIHRoaXMud29ya2VyUXVldWUudW5zaGlmdCh3b3JrZXJUaHJlYWQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5sZXQgcG9vbCA9IChuZXcgUG9vbCgpKS5pbml0KCk7XG5leHBvcnQgZGVmYXVsdCBwb29sO1xuIiwiLy90aGlzIGlzIGRhdGEgc3RvcmUgaW1wbGVtZW50YXRpb24uIFN0b3JlIGlzIGEgc2luZ2xldG9uIGNsYXNzXG4vL3RoZSB2YWx1ZXMgYXJlIHN0b3JlZCBpbiBkYXRhLiBhbmQgaXQgaGFzIGNvbW1vbiBmdW5jdGlvbnMgbGlrZSBjcmVhdGVSZWNvcmQsIGZpbmRBbGwsIGZpbmRCeSwgZmluZCwgZ2V0UmVjb3JkLCByZWxhdGlvbnNoaXBzKGhhc01hbnksIGJlbG9uZ3NUbylcbmltcG9ydCBtb2RlbHMgZnJvbSAnLi4vbW9kZWxzJztcblxubGV0IGdldE1vZGVsID0gZnVuY3Rpb24obW9kZWxOYW1lKSB7XG4gICAgbGV0IHJlZmVycmVkTW9kZWw7XG4gICAgbW9kZWxzKCkuZm9yRWFjaCgobW9kZWwpID0+IHtcbiAgICAgICAgaWYgKG1vZGVsLm1vZGVsTmFtZSA9PSBtb2RlbE5hbWUpIHtcbiAgICAgICAgICAgIHJlZmVycmVkTW9kZWwgPSBtb2RlbDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChyZWZlcnJlZE1vZGVsKSB7XG4gICAgICAgIHJldHVybiByZWZlcnJlZE1vZGVsO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vdGhyb3cgZXJyb3Igc2F5aW5nIHdyb25nIG1vZGVsIG5hbWUgcGFzc2VkXG4gICAgfVxufVxubGV0IGluc3RhbmNlID0gbnVsbDtcbmNsYXNzIFN0b3JlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0ge307XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH1cbiAgICBjcmVhdGVSZWNvcmQobW9kZWxOYW1lLCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRoaXMuZGF0YVttb2RlbE5hbWVdID0gdGhpcy5kYXRhW21vZGVsTmFtZV0gfHwge307XG4gICAgICAgIGxldCBtb2RlbCA9IGdldE1vZGVsKG1vZGVsTmFtZSk7XG4gICAgICAgIGxldCByZWNvcmQgPSBuZXcgbW9kZWwoYXR0cmlidXRlcyk7XG4gICAgICAgIHRoaXMuZGF0YVttb2RlbE5hbWVdW3JlY29yZC5pZF0gPSByZWNvcmQ7XG4gICAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgfVxuICAgIGdldFJlY29yZChtb2RlbE5hbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuZGF0YVttb2RlbE5hbWVdICYmIE9iamVjdC52YWx1ZXModGhpcy5kYXRhW21vZGVsTmFtZV0pWzBdKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbbW9kZWxOYW1lXSlbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVSZWNvcmQobW9kZWxOYW1lLCB7fSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmluZEFsbChtb2RlbE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5kYXRhW21vZGVsTmFtZV0pO1xuICAgIH1cbiAgICBmaW5kKG1vZGVsTmFtZSwgaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVttb2RlbE5hbWVdW2lkXTtcbiAgICB9XG4gICAgZmluZEJ5KG1vZGVsTmFtZSwgaGFzaCkge1xuICAgICAgICBsZXQgcmVjb3JkcyA9IE9iamVjdC52YWx1ZXModGhpcy5kYXRhW21vZGVsTmFtZV0pLmZpbHRlcigocmVjb3JkKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBrIGluIGhhc2gpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzaFtrXSAhPSByZWNvcmRba10pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlY29yZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVjb3Jkc1swXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZmlsdGVyKG1vZGVsTmFtZSwgaGFzaCkge1xuICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVttb2RlbE5hbWVdKS5tYXAoKHJlY29yZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlY29yZC5oYXNBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYmVsb25nc1RvKG1vZGVsTmFtZSwgaWQsIHJlbGF0aW9uTW9kZWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5kYXRhW3JlbGF0aW9uTW9kZWxdKS5maWx0ZXIoKHJlY29yZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlY29yZC5pZCA9PSBpZDtcbiAgICAgICAgfSlbMF07XG4gICAgfVxuICAgIGhhc01hbnkobW9kZWxOYW1lLCBpZCwgcmVsYXRpb25Nb2RlbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbcmVsYXRpb25Nb2RlbF0pLmZpbHRlcigocmVjb3JkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVjb3JkW21vZGVsTmFtZSArIFwiSWRcIl0gPT0gaWQ7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmxldCBzdG9yZSA9IG5ldyBTdG9yZSgpO1xuZXhwb3J0IGRlZmF1bHQgc3RvcmU7XG4iLCIvLyB0YXNrIHRvIHJ1blxuY2xhc3MgV29ya2VyVGFzayB7XG4gICAgY29uc3RydWN0b3Ioc2NyaXB0LCBjYWxsYmFjaywgbXNnKXtcbiAgICB0aGlzLnNjcmlwdCA9IHNjcmlwdDtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5zdGFydE1lc3NhZ2UgPSBtc2c7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV29ya2VyVGFzaztcbiIsIi8vIHJ1bm5lciB3b3JrIHRhc2tzIGluIHRoZSBwb29sXG5jbGFzcyBXb3JrZXJUaHJlYWQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudFBvb2wpIHtcbiAgICAgICAgdGhpcy5wYXJlbnRQb29sID0gcGFyZW50UG9vbDtcbiAgICAgICAgdGhpcy53b3JrZXJUYXNrID0gbnVsbDtcbiAgICAgICAgdGhpcy53b3JrZXIgPSBudWxsO1xuICAgIH1cbiAgICBydW4od29ya2VyVGFzaykge1xuICAgICAgICBpZih0aGlzLndvcmtlcil7XG4gICAgICAgICAgdGhpcy53b3JrZXIudGVybWluYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53b3JrZXJUYXNrID0gd29ya2VyVGFzaztcbiAgICAgICAgaWYgKHRoaXMud29ya2VyVGFzay5zY3JpcHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgbGV0IHdvcmtlciA9IG5ldyBXb3JrZXIod29ya2VyVGFzay5zY3JpcHQpOyAvLyBjcmVhdGUgYSBuZXcgd2ViIHdvcmtlclxuICAgICAgICAgICAgd29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLmR1bW15Q2FsbGJhY2suYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHdvcmtlclRhc2suc3RhcnRNZXNzYWdlKTtcbiAgICAgICAgICAgIHRoaXMud29ya2VyID0gd29ya2VyO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGZvciBub3cgYXNzdW1lIHdlIG9ubHkgZ2V0IGEgc2luZ2xlIGNhbGxiYWNrIGZyb20gYSB3b3JrZXJcbiAgICAvLyB3aGljaCBhbHNvIGluZGljYXRlcyB0aGUgZW5kIG9mIHRoaXMgd29ya2VyLlxuICAgIGR1bW15Q2FsbGJhY2soZXZlbnQpIHtcbiAgICAgICAgdGhpcy53b3JrZXJUYXNrLmNhbGxiYWNrKGV2ZW50KTsgLy8gcGFzcyB0byBvcmlnaW5hbCBjYWxsYmFja1xuICAgICAgICB0aGlzLnBhcmVudFBvb2wuZnJlZVdvcmtlclRocmVhZCh0aGlzKTsgLy8gd2Ugc2hvdWxkIHVzZSBhIHNlcGVyYXRlIHRocmVhZCB0byBhZGQgdGhlIHdvcmtlclxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV29ya2VyVGhyZWFkO1xuIiwiLy90aGlzIHRha2VzIHIsIGcgYW5kIGIgdmFsdWVzIGFuZCBnZW5lcmF0ZSBoZXhhZGVjaW1hbCBjb2xvciBjb2RlLlxuZnVuY3Rpb24gY29tcG9uZW50VG9IZXgoYykge1xuICAgIHZhciBoZXggPSBNYXRoLnJvdW5kKGMpLnRvU3RyaW5nKDE2KTtcbiAgICByZXR1cm4gaGV4Lmxlbmd0aCA9PSAxID8gXCIwXCIgKyBoZXggOiBoZXg7XG59XG5cbmZ1bmN0aW9uIHJnYlRvSGV4KHIsIGcsIGIpIHtcbiAgICByZXR1cm4gXCJcIiArIGNvbXBvbmVudFRvSGV4KHIpICsgY29tcG9uZW50VG9IZXgoZykgKyBjb21wb25lbnRUb0hleChiKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcmdiVG9IZXg7XG4iXX0=
