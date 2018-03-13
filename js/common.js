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
        value: async function fillImage(tileRow) {
            var self = this;
            var promisesArr = [];

            function fillRow() {
                tileRow.tiles.forEach(function (tile) {
                    var promise = new Promise(function (resolve) {
                        var svgImg = new Image();
                        svgImg.onload = function () {
                            self.canvasContext.drawImage(svgImg, tile.column * TILE_WIDTH, tileRow.row * TILE_HEIGHT);
                            resolve();
                        };
                        svgImg.src = tile.svg;
                    });
                    promisesArr.push(promise);
                });
            }
            await window.requestAnimationFrame(fillRow);
            return Promise.all(promisesArr);
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

var _rgbToHex = require('../../utils/rgbToHex');

var _rgbToHex2 = _interopRequireDefault(_rgbToHex);

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
        value: async function sliceImage() {
            var _this = this;

            var self = this;

            var _loop = async function _loop(i) {
                var tileRow = _store2.default.createRecord('tileRow', {
                    image: _this.image,
                    row: i
                });
                function sliceRow() {
                    for (var j = 0; j < self.image.horizontalTiles; j++) {
                        var r = 0,
                            g = 0,
                            b = 0;
                        var imgData = self.canvasContext.getImageData(j * TILE_WIDTH, i * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                        var pix = imgData.data;
                        r = pix[0];
                        g = pix[1];
                        b = pix[2];
                        var tile = {
                            column: j,
                            r: r,
                            g: g,
                            b: b,
                            hexCode: (0, _rgbToHex2.default)(r, g, b)
                        };
                        tileRow.tiles.push(tile);
                    }
                }
                await window.requestAnimationFrame(sliceRow);
                tileRow.processTiles();
            };

            for (var i = 0; i < this.image.verticalTiles; i++) {
                await _loop(i);
            }
            _observer2.default.dependableKey = 'tileRowsCreated';
            _observer2.default.toggleValue = !_observer2.default.toggleValue;
        }
    }]);

    return SourceImageComponent;
}();

exports.default = SourceImageComponent;

},{"../../services/observer":13,"../../services/store":15,"../../utils/rgbToHex":18,"./template":8}],8:[function(require,module,exports){
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
            var _this = this;

            tilesArr.forEach(function (tileHash, index) {
                // let id = Object.keys(tileHash)[0];
                var svg = tileHash[index];
                _this.tiles[index].svg = svg;
                // Store.find('tile', id).svg = svg;
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
            this.tiles.forEach(function (tile, index) {
                var tileHash = {};
                tileHash[index] = tile.hexCode;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcHBsaWNhdGlvbi5qcyIsImpzL2NvbXBvbmVudHMvZGVzdGluYXRpb24taW1hZ2UvY29tcG9uZW50LmpzIiwianMvY29tcG9uZW50cy9kZXN0aW5hdGlvbi1pbWFnZS90ZW1wbGF0ZS5qcyIsImpzL2NvbXBvbmVudHMvaW1hZ2UtdXBsb2FkL2NvbXBvbmVudC5qcyIsImpzL2NvbXBvbmVudHMvaW1hZ2UtdXBsb2FkL3RlbXBsYXRlLmpzIiwianMvY29tcG9uZW50cy9pbmRleC5qcyIsImpzL2NvbXBvbmVudHMvc291cmNlLWltYWdlL2NvbXBvbmVudC5qcyIsImpzL2NvbXBvbmVudHMvc291cmNlLWltYWdlL3RlbXBsYXRlLmpzIiwianMvbW9kZWxzL2luZGV4LmpzIiwianMvbW9kZWxzL21vc2FpY0ltYWdlLmpzIiwianMvbW9kZWxzL3RpbGUuanMiLCJqcy9tb2RlbHMvdGlsZVJvdy5qcyIsImpzL3NlcnZpY2VzL29ic2VydmVyLmpzIiwianMvc2VydmljZXMvcG9vbC5qcyIsImpzL3NlcnZpY2VzL3N0b3JlLmpzIiwianMvc2VydmljZXMvd29ya2VyVGFzay5qcyIsImpzL3NlcnZpY2VzL3dvcmtlclRocmVhZC5qcyIsImpzL3V0aWxzL3JnYlRvSGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNHQTs7Ozs7O0FBQ0EsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsSUFBOUMsRUFBb0QsS0FBcEQsRSxDQUpBO0FBQ0E7QUFDQTs7QUFHQSxTQUFTLElBQVQsR0FBZTtBQUNiLDhCQUFhLE9BQWIsQ0FBcUIsVUFBQyxTQUFELEVBQWU7QUFDbEMsUUFBSSxPQUFPLElBQUksU0FBSixFQUFYO0FBQ0EsU0FBSyxTQUFMO0FBQ0QsR0FIRDtBQUlEOzs7Ozs7Ozs7OztBQ1ZEOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7SUFFTSx5Qjs7OzRCQUNjO0FBQ1os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LEdBQThCLEdBQXJDO0FBQ0g7O0FBRUQsU0FBUyxRQUFULENBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCLENBQXhCLEVBQTJCO0FBQ3ZCLFdBQU8sS0FBSyxlQUFlLENBQWYsQ0FBTCxHQUF5QixlQUFlLENBQWYsQ0FBekIsR0FBNkMsZUFBZSxDQUFmLENBQXBEO0FBQ0g7O2tCQUVjLFEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9Db21wb25lbnRzIGFyZSBpbml0aWF0ZWQgYXMgc29vbiBhcyB0aGUgZG9tIGlzIGxvYWRlZC5cbi8vRWFjaCBlbGVtZW50IHdoaWNoIGhhcyBhIGNvbXBvbmVudCBzaGFsbCBoYXZlIHNhbWUgaWQgYXMgY29tcG9uZW50IG5hbWUuXG4vL1RoZSBjb21wb25lbnQgaGF2ZSB0ZW1wbGF0ZSBhbmQgY29tcG9uZW50LiBXaGVuIGluaXRpYXRlZCwgZXZlbnRzIGFyZSBiaW5kZWQgYWNjb3JkaW5nIHRvIHRoZSBjb21wb25lbnQuXG5pbXBvcnQgY29tcG9uZW50cyBmcm9tICcuL2NvbXBvbmVudHMnO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQsIGZhbHNlKTtcbmZ1bmN0aW9uIGluaXQoKXtcbiAgY29tcG9uZW50cygpLmZvckVhY2goKGNvbXBvbmVudCkgPT4ge1xuICAgIGxldCBjb21wID0gbmV3IGNvbXBvbmVudCgpO1xuICAgIGNvbXAuYWRkRXZlbnRzKCk7XG4gIH0pXG59O1xuIiwiaW1wb3J0IHRlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGUnO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uLy4uL3NlcnZpY2VzL3N0b3JlJztcbmltcG9ydCBPYnNlcnZlck9iaiBmcm9tICcuLi8uLi9zZXJ2aWNlcy9vYnNlcnZlcic7XG5cbmNsYXNzIERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnQge1xuICAgIGdldCB0b3RhbFJvd3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVSb3dzLmxlbmd0aDtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzdGluYXRpb24taW1hZ2VcIikuaW5uZXJIVE1MID0gdGVtcGxhdGUoKTtcbiAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZU9ialsndGlsZVJvd3NDcmVhdGVkJ10gPSBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93c0NyZWF0ZWQnXSB8fCBbXTtcbiAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZU9ialsndGlsZVJvd3NDcmVhdGVkJ10ucHVzaCh7XG4gICAgICAgICAgICBjYWxsYmFjazogdGhpcy5zZXRUaWxlUm93cyxcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY3VycmVudFJvdyA9IDA7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRzKCk7XG4gICAgICAgIHRoaXMucm93VGlsZUZpbGxNYXAgPSB7fTtcbiAgICB9XG4gICAgYWRkRXZlbnRzKCkge1xuICAgICAgICBsZXQgaW1hZ2UgPSBTdG9yZS5nZXRSZWNvcmQoJ21vc2FpY0ltYWdlJyk7XG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgaW1hZ2Uubm9kZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5pbml0aWF0ZUNhbnZhcy5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgaW5pdGlhdGVDYW52YXMoKSB7XG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVzdGluYXRpb24nKTtcbiAgICAgICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBjdHguY2FudmFzLndpZHRoID0gdGhpcy5pbWFnZS5ub2RlLndpZHRoO1xuICAgICAgICBjdHguY2FudmFzLmhlaWdodCA9IHRoaXMuaW1hZ2Uubm9kZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgICAgICB0aGlzLmNhbnZhc0NvbnRleHQgPSBjdHg7XG4gICAgfVxuICAgIC8vb2JzZXJ2ZXIgYXJlIGJpbmRlZCB0byB3aGVuIHRoZSB0aWxlUm93IHdpbGwgaGF2ZSBsb2FkZWQgcm93cyB3aXRoIHN2ZyBjb250ZW50IGZyb20gc2VydmVyXG4gICAgc2V0VGlsZVJvd3MoKSB7XG4gICAgICAgIHRoaXMudGlsZVJvd3MgPSBTdG9yZS5maW5kQWxsKCd0aWxlUm93Jyk7XG4gICAgICAgIHRoaXMudGlsZVJvd3MuZm9yRWFjaCgodGlsZVJvdykgPT4ge1xuICAgICAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZU9ialsndGlsZVJvd0xvYWRlZCcgKyB0aWxlUm93LnJvd10gPSBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93TG9hZGVkJyArIHRpbGVSb3cucm93XSB8fCBbXTtcbiAgICAgICAgICAgIE9ic2VydmVyT2JqLmRlcGVuZGFibGVPYmpbJ3RpbGVSb3dMb2FkZWQnICsgdGlsZVJvdy5yb3ddLnB1c2goe1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0aGlzLmxvYWRJbWFnZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLFxuICAgICAgICAgICAgICAgIGFyZ3M6IHRpbGVSb3cucm93XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vZmlyZWQgd2hlbiByb3cgaXMgbG9hZGVkXG4gICAgLy90aGlzIGZ1bmN0aW9uIG9ubHkgcHJvY2VlZWRzIGlmIHRoZSByb3cgdGhhdCBpcyBjb21wbGV0ZWQgaXMgZXF1YWwgdG8gY3VycmVudCByb3cuXG4gICAgLy9jdXJyZW50IHJvdyBpbmNyZW1lbnRzIHN0ZXAgd2lzZSB3aGVuZXZlciB0aGUgdGhlIHRpbGVSb3cod2l0aCBzYW1lIHJvdyBudW1iZXIpIGlzIHJlY2VpdmVkLlxuICAgIC8vaWYgYW55IG90aGVyKGkuZS4gZnV0dXJlKSB0aWxlUm93IGlzIHJlY2VpdmVkLCBpdCBpcyBpZ25vcmVkLlxuICAgIC8vd2hlbiB0aWxlUm93IGlzIHJlY2VpdmVkIG1hdGNoZWQgd2l0aCBjdXJyZW50IHRpbGUgcm93LCBpdCBjaGVja3MgZm9yIHRoZSBzdWJzZXF1ZW50IG5leHQgcm93c1xuICAgIGxvYWRJbWFnZShyb3cpIHtcbiAgICAgICAgaWYgKHJvdyA9PSB0aGlzLmltYWdlLnZlcnRpY2FsVGlsZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocm93ID09IHRoaXMuY3VycmVudFJvdykge1xuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgbGV0IHRpbGVSb3cgPSBTdG9yZS5maW5kQnkoJ3RpbGVSb3cnLCB7XG4gICAgICAgICAgICAgICAgcm93XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghdGlsZVJvdy5yb3dMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5yb3dUaWxlRmlsbE1hcFtyb3ddKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2FkSW1hZ2Uocm93ICsgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYucm93VGlsZUZpbGxNYXBbcm93XSA9IDE7XG4gICAgICAgICAgICAgICAgbGV0IGZpbGxJbWFnZVByb21pc2UgPSB0aGlzLmZpbGxJbWFnZSh0aWxlUm93KVxuICAgICAgICAgICAgICAgIGZpbGxJbWFnZVByb21pc2UudGhlbigodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY3VycmVudFJvdyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShyb3cgKyAxKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvL2NhbnZhcyBpbWFnZSBpcyBmaWxsZWQgd2l0aCB0aWxlUm93XG4gICAgYXN5bmMgZmlsbEltYWdlKHRpbGVSb3cpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgcHJvbWlzZXNBcnIgPSBbXTtcblxuICAgICAgICBmdW5jdGlvbiBmaWxsUm93KCkge1xuICAgICAgICAgICAgdGlsZVJvdy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdmdJbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgc3ZnSW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jYW52YXNDb250ZXh0LmRyYXdJbWFnZShzdmdJbWcsIHRpbGUuY29sdW1uICogVElMRV9XSURUSCwgdGlsZVJvdy5yb3cgKiBUSUxFX0hFSUdIVCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3ZnSW1nLnNyYyA9IHRpbGUuc3ZnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHByb21pc2VzQXJyLnB1c2gocHJvbWlzZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZpbGxSb3cpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXNBcnIpXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEZXN0aW5hdGlvbkltYWdlQ29tcG9uZW50O1xuIiwibGV0IHRlbXBsYXRlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIFwiPGNhbnZhcyBpZD0nZGVzdGluYXRpb24nPjwvY2FudmFzPlwiO1xufVxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGU7XG4iLCJpbXBvcnQgdGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZSc7XG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vLi4vc2VydmljZXMvc3RvcmUnO1xuY2xhc3MgSW1hZ2VVcGxvYWRDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlLXVwbG9hZFwiKS5pbm5lckhUTUwgPSB0ZW1wbGF0ZSgpO1xuICAgIH1cbiAgICAvL1doZW4gdGhlIHN1Ym1pdCBidXR0b24gaXMgY2xpY2tlZCwgdGhlIGZpbGUoaWYgdXBsb2FkZWQpLCBpcyB1cGxvYWRlZCBpbiBzb3VyY2UgaW1hZ2UgY2FudmFzLlxuICAgIGFkZEV2ZW50cygpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1cGxvYWRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubG9hZEltYWdlKTtcbiAgICB9XG5cbiAgICBsb2FkSW1hZ2UoKSB7XG4gICAgICAgIHZhciBtb3NhaWNJbWFnZSA9IFN0b3JlLmdldFJlY29yZCgnbW9zYWljSW1hZ2UnKTtcbiAgICAgICAgdmFyIGZpbGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbWFnZVwiKS5maWxlcztcbiAgICAgICAgaWYgKEZpbGVSZWFkZXIgJiYgZmlsZXMgJiYgZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgZnIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgZnIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbW9zYWljSW1hZ2Uubm9kZS5zcmMgPSBmci5yZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmci5vbmVycm9yID0gZnVuY3Rpb24oc3R1ZmYpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIsIHN0dWZmKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHN0dWZmLmdldE1lc3NhZ2UoKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZyLnJlYWRBc0RhdGFVUkwoZmlsZXNbMF0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgSW1hZ2VVcGxvYWRDb21wb25lbnQ7XG4iLCJ2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gXCI8ZGl2PjxsYWJlbCBmb3I9J2ltYWdlJz5DaG9vc2UgaW1hZ2UgdG8gdXBsb2FkPC9sYWJlbD48aW5wdXQgdHlwZT0nZmlsZScgaWQ9J2ltYWdlJyBuYW1lPSdpbWFnZScgYWNjZXB0PSdpbWFnZS8qJz48L2Rpdj48ZGl2PjxidXR0b24gaWQ9J3VwbG9hZCc+VXBsb2FkPC9idXR0b24+PC9kaXY+XCJcbn1cbmV4cG9ydCBkZWZhdWx0IHRlbXBsYXRlO1xuIiwiaW1wb3J0IERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnQgZnJvbSAnLi9kZXN0aW5hdGlvbi1pbWFnZS9jb21wb25lbnQnO1xuaW1wb3J0IFNvdXJjZUltYWdlQ29tcG9uZW50IGZyb20gJy4vc291cmNlLWltYWdlL2NvbXBvbmVudCc7XG5pbXBvcnQgSW1hZ2VVcGxvYWRDb21wb25lbnQgZnJvbSAnLi9pbWFnZS11cGxvYWQvY29tcG9uZW50JztcbmxldCBjb21wb25lbnRzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIFtJbWFnZVVwbG9hZENvbXBvbmVudCwgU291cmNlSW1hZ2VDb21wb25lbnQsIERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnRdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb21wb25lbnRzO1xuIiwiaW1wb3J0IHRlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGUnO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uLy4uL3NlcnZpY2VzL3N0b3JlJztcbmltcG9ydCBPYnNlcnZlck9iaiBmcm9tICcuLi8uLi9zZXJ2aWNlcy9vYnNlcnZlcic7XG5pbXBvcnQgcmdiVG9IZXggZnJvbSAnLi4vLi4vdXRpbHMvcmdiVG9IZXgnO1xuXG5jbGFzcyBTb3VyY2VJbWFnZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic291cmNlLWltYWdlXCIpLmlubmVySFRNTCA9IHRlbXBsYXRlKCk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRzKCk7XG4gICAgfVxuICAgIGFkZEV2ZW50cygpIHtcbiAgICAgICAgbGV0IGltYWdlID0gU3RvcmUuZ2V0UmVjb3JkKCdtb3NhaWNJbWFnZScpO1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIGltYWdlLm5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuaW1hZ2VMb2FkZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIGltYWdlTG9hZGVkKCkge1xuICAgICAgICB0aGlzLmluaXRpYXRlQ2FudmFzKCk7XG4gICAgICAgIHRoaXMuc2xpY2VJbWFnZSgpO1xuICAgIH1cbiAgICBpbml0aWF0ZUNhbnZhcygpIHtcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb3VyY2UnKTtcbiAgICAgICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBsZXQgaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgICAgICBsZXQgaW1hZ2VXaWR0aCA9IGltYWdlLndpZHRoO1xuICAgICAgICBsZXQgaW1hZ2VIZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgICAgIGN0eC5jYW52YXMud2lkdGggPSBpbWFnZVdpZHRoO1xuICAgICAgICBjdHguY2FudmFzLmhlaWdodCA9IGltYWdlSGVpZ2h0O1xuICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLm5vZGUsIDAsIDApO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgdGhpcy5jYW52YXNDb250ZXh0ID0gY3R4O1xuICAgIH1cbiAgICAvL0ltYWdlIGlzIGRpdmlkZWQgaW50byB0aWxlcy4gUixHLEIgdmFsdWVzIGFyZSBjYWxjdWxhdGVkIGZyb20gdGlsZXMuIFRpbGUgcmVjb3JkIGFuZCB0aWxlUm93IHJlY29yZCBpcyBjcmVhdGVkLiBUaGUgb2JzZXJ2ZXIgaXMgYmluZGVkIHdpdGggcmVmZXJlbmNlIHRvIHRpbGVSb3cgY3JlYXRpb24gd2hpY2ggd2lsbCBoaW50IERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnQgdG8gcHJvY2VlZCB3aXRoIGZ1cnRoZXIgcHJvY2Vzc2luZy5cbiAgICBhc3luYyBzbGljZUltYWdlKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbWFnZS52ZXJ0aWNhbFRpbGVzOyBpKyspIHtcbiAgICAgICAgICAgIGxldCB0aWxlUm93ID0gU3RvcmUuY3JlYXRlUmVjb3JkKCd0aWxlUm93Jywge1xuICAgICAgICAgICAgICAgIGltYWdlOiB0aGlzLmltYWdlLFxuICAgICAgICAgICAgICAgIHJvdzogaSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZnVuY3Rpb24gc2xpY2VSb3coKXtcbiAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzZWxmLmltYWdlLmhvcml6b250YWxUaWxlczsgaisrKSB7XG4gICAgICAgICAgICAgICAgICBsZXQgciA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgZyA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgYiA9IDA7XG4gICAgICAgICAgICAgICAgICBsZXQgaW1nRGF0YSA9IHNlbGYuY2FudmFzQ29udGV4dC5nZXRJbWFnZURhdGEoaiAqIFRJTEVfV0lEVEgsIGkgKiBUSUxFX0hFSUdIVCwgVElMRV9XSURUSCwgVElMRV9IRUlHSFQpO1xuICAgICAgICAgICAgICAgICAgbGV0IHBpeCA9IGltZ0RhdGEuZGF0YTtcbiAgICAgICAgICAgICAgICAgIHIgPSBwaXhbMF07XG4gICAgICAgICAgICAgICAgICBnID0gcGl4WzFdO1xuICAgICAgICAgICAgICAgICAgYiA9IHBpeFsyXTtcbiAgICAgICAgICAgICAgICAgIGxldCB0aWxlID0ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogaixcbiAgICAgICAgICAgICAgICAgICAgICByOiByLFxuICAgICAgICAgICAgICAgICAgICAgIGc6IGcsXG4gICAgICAgICAgICAgICAgICAgICAgYjogYixcbiAgICAgICAgICAgICAgICAgICAgICBoZXhDb2RlOiByZ2JUb0hleChyLCBnLCBiKVxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIHRpbGVSb3cudGlsZXMucHVzaCh0aWxlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShzbGljZVJvdyk7XG4gICAgICAgICAgICB0aWxlUm93LnByb2Nlc3NUaWxlcygpO1xuICAgICAgICB9XG4gICAgICAgIE9ic2VydmVyT2JqLmRlcGVuZGFibGVLZXkgPSAndGlsZVJvd3NDcmVhdGVkJztcbiAgICAgICAgT2JzZXJ2ZXJPYmoudG9nZ2xlVmFsdWUgPSAhT2JzZXJ2ZXJPYmoudG9nZ2xlVmFsdWU7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgU291cmNlSW1hZ2VDb21wb25lbnQ7XG4iLCJsZXQgdGVtcGxhdGUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gXCI8Y2FudmFzIGlkPSdzb3VyY2UnPjwvY2FudmFzPlwiO1xufVxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGU7XG4iLCJpbXBvcnQgTW9zYWljSW1hZ2UgZnJvbSAnLi9tb3NhaWNJbWFnZSc7XG5pbXBvcnQgVGlsZSBmcm9tICcuL3RpbGUnO1xuaW1wb3J0IFRpbGVSb3cgZnJvbSAnLi90aWxlUm93JztcbmxldCBtb2RlbHMgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gW01vc2FpY0ltYWdlLCBUaWxlLCBUaWxlUm93XTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbW9kZWxzO1xuIiwiLy9maWxlZHM6IGlkLCBub2RlLCB3aWR0aCwgaGVpZ2h0LCBob3Jpem9udGFsVGlsZXMsIHZlcnRpY2FsVGlsZXNcbmxldCBpZCA9IDE7XG5jbGFzcyBNb3NhaWNJbWFnZXtcbiAgY29uc3RydWN0b3IoKXtcbiAgICB0aGlzLl9tb2RlbE5hbWUgPSBcIm1vc2FpY0ltYWdlXCI7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMubm9kZSA9IG5ldyBJbWFnZSgpO1xuICAgIGlkKys7XG4gIH1cbiAgZ2V0TW9kZWxOYW1lKCl7XG4gICAgcmV0dXJuIHRoaXMuX21vZGVsTmFtZTtcbiAgfVxuICBnZXQgd2lkdGgoKXtcbiAgICByZXR1cm4gdGhpcy5ub2RlLndpZHRoO1xuICB9XG4gIGdldCBoZWlnaHQoKXtcbiAgICByZXR1cm4gdGhpcy5ub2RlLmhlaWdodDtcbiAgfVxuICBnZXQgaG9yaXpvbnRhbFRpbGVzKCl7XG4gICAgbGV0IHdpZHRoID0gdGhpcy53aWR0aDtcbiAgICBsZXQgdGlsZVdpZHRoID0gVElMRV9XSURUSDtcbiAgICByZXR1cm4gTWF0aC5jZWlsKHdpZHRoL3RpbGVXaWR0aCk7XG4gIH1cbiAgZ2V0IHZlcnRpY2FsVGlsZXMoKXtcbiAgICBsZXQgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgbGV0IHRpbGVIZWlnaHQgPSBUSUxFX0hFSUdIVDtcbiAgICByZXR1cm4gTWF0aC5jZWlsKGhlaWdodC90aWxlSGVpZ2h0KTtcbiAgfVxufVxuTW9zYWljSW1hZ2UubW9kZWxOYW1lID0gXCJtb3NhaWNJbWFnZVwiO1xuZXhwb3J0IGRlZmF1bHQgTW9zYWljSW1hZ2U7XG4iLCIvL2ZpZWxkczogaWQsIHRpbGVSb3csIGltYWdlLCByb3csIGNvbHVtbiwgciwgZywgYiwgaGV4Q29kZSwgc3ZnU3RyaW5nXG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vc2VydmljZXMvc3RvcmUnO1xuaW1wb3J0IHJnYlRvSGV4IGZyb20gJy4uL3V0aWxzL3JnYlRvSGV4JztcbmltcG9ydCBQb29sIGZyb20gJy4uL3NlcnZpY2VzL3Bvb2wnO1xuXG5sZXQgaWQgPSAxXG5jbGFzcyBUaWxlIHtcbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5fbW9kZWxOYW1lID0gXCJ0aWxlXCI7XG4gICAgICAgIC8vdGlsZVJvd0lkLCBjb2x1bW4sIHIsIGcsIGJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgaWQrKztcbiAgICB9XG4gICAgZ2V0TW9kZWxOYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kZWxOYW1lO1xuICAgIH1cbiAgICAvLyBnZXQgdGlsZVJvdygpIHtcbiAgICAvLyAgICAgcmV0dXJuIFN0b3JlLmJlbG9uZ3NUbygndGlsZScsIHRoaXMudGlsZVJvd0lkLCAndGlsZVJvdycpO1xuICAgIC8vIH1cbiAgICBnZXQgaW1hZ2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVSb3cuaW1hZ2U7XG4gICAgfVxuICAgIGdldCByb3coKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVSb3cucm93O1xuICAgIH1cbiAgICBnZXQgaGV4Q29kZSgpIHtcbiAgICAgICAgcmV0dXJuIHJnYlRvSGV4KHRoaXMuciwgdGhpcy5nLCB0aGlzLmIpO1xuICAgIH1cbn1cblRpbGUubW9kZWxOYW1lID0gXCJ0aWxlXCI7XG5leHBvcnQgZGVmYXVsdCBUaWxlO1xuIiwiLy9wcm9wZXJ0aWVzOiBpZCwgY29sdW1uLCBpbWFnZSwgdGlsZXNcbmltcG9ydCBPYnNlcnZlck9iaiBmcm9tICcuLi9zZXJ2aWNlcy9vYnNlcnZlcic7XG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vc2VydmljZXMvc3RvcmUnO1xuaW1wb3J0IFBvb2wgZnJvbSAnLi4vc2VydmljZXMvcG9vbCc7XG5cbmxldCBpZCA9IDE7XG5jbGFzcyBUaWxlUm93IHtcbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRoaXMuX21vZGVsTmFtZSA9IFwidGlsZVwiO1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIC8vIHRoaXMucmVsYXRpb25zaGlwcyA9IHtcbiAgICAgICAgLy8gICAgIGJlbG9uZ3NUbzogWydpbWFnZSddLFxuICAgICAgICAvLyAgICAgaGFzTWFueTogWyd0aWxlJ11cbiAgICAgICAgLy8gfVxuICAgICAgICB0aGlzLnRpbGVzID0gW107XG4gICAgICAgIC8vY29sdW1uLCBpbWFnZUlkXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgYXR0cmlidXRlcyk7XG4gICAgICAgIGlkKys7XG4gICAgfVxuICAgIGdldE1vZGVsTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGVsTmFtZTtcbiAgICB9XG4gICAgLy8gZ2V0IHRpbGVzKCkge1xuICAgIC8vICAgICByZXR1cm4gU3RvcmUuaGFzTWFueSgndGlsZVJvdycsIHRoaXMuaWQsICd0aWxlJyk7XG4gICAgLy8gfVxuICAgIC8vIGdldCBpbWFnZSgpIHtcbiAgICAvLyAgICAgcmV0dXJuIFN0b3JlLmJlbG9uZ3NUbygndGlsZVJvdycsIHRoaXMuaW1hZ2VJZCwgJ2ltYWdlJyk7XG4gICAgLy8gfVxuICAgIC8vdGhpcyBmaXJlcyBvYnNlcnZlciB3aGVuIGFsbCB0aGUgdGlsZXMgZ2V0IHN2ZyBmcm9tIHNlcnZlci4ocm93IHdpc2UpXG4gICAgYWRkVGlsZUxvYWRPYnNlcnZlcigpIHtcbiAgICAgICAgdGhpcy5yb3dMb2FkZWQgPSB0cnVlO1xuICAgICAgICBPYnNlcnZlck9iai5kZXBlbmRhYmxlS2V5ID0gJ3RpbGVSb3dMb2FkZWQnICsgdGhpcy5yb3c7XG4gICAgICAgIE9ic2VydmVyT2JqLnRvZ2dsZVZhbHVlID0gIU9ic2VydmVyT2JqLnRvZ2dsZVZhbHVlO1xuICAgIH1cbiAgICBzZXRUaWxlU3ZnKHRpbGVzQXJyKSB7XG4gICAgICAgIHRpbGVzQXJyLmZvckVhY2goKHRpbGVIYXNoLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgLy8gbGV0IGlkID0gT2JqZWN0LmtleXModGlsZUhhc2gpWzBdO1xuICAgICAgICAgICAgbGV0IHN2ZyA9IHRpbGVIYXNoW2luZGV4XTtcbiAgICAgICAgICAgIHRoaXMudGlsZXNbaW5kZXhdLnN2ZyA9IHN2ZztcbiAgICAgICAgICAgIC8vIFN0b3JlLmZpbmQoJ3RpbGUnLCBpZCkuc3ZnID0gc3ZnO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJvY2Vzc1RpbGVzQ2FsbGJhY2soZXZlbnQpIHtcbiAgICAgICAgbGV0IHRpbGVzQXJyID0gZXZlbnQuZGF0YTtcbiAgICAgICAgdGhpcy5zZXRUaWxlU3ZnKHRpbGVzQXJyKTtcbiAgICAgICAgdGhpcy5hZGRUaWxlTG9hZE9ic2VydmVyKCk7XG4gICAgfVxuICAgIHByb2Nlc3NUaWxlcygpIHtcbiAgICAgICAgbGV0IHRpbGVBcnIgPSBbXTtcbiAgICAgICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRpbGVIYXNoID0ge307XG4gICAgICAgICAgICB0aWxlSGFzaFtpbmRleF0gPSB0aWxlLmhleENvZGU7XG4gICAgICAgICAgICB0aWxlQXJyLnB1c2godGlsZUhhc2gpO1xuICAgICAgICB9KTtcbiAgICAgICAgUG9vbC5hZGRXb3JrZXJUYXNrKCcuLi9qcy93b3JrZXJzL2xvYWRDb250ZW50LmpzJywgdGhpcy5wcm9jZXNzVGlsZXNDYWxsYmFjay5iaW5kKHRoaXMpLCBKU09OLnN0cmluZ2lmeSh0aWxlQXJyKSk7XG4gICAgfVxufVxuVGlsZVJvdy5tb2RlbE5hbWUgPSBcInRpbGVSb3dcIjtcbmV4cG9ydCBkZWZhdWx0IFRpbGVSb3c7XG4iLCIvL1RoaXMgaXMgb2JzZXJ2ZXIgaW1wbGVtZW50YXRpb24uXG4vL09ic2VydmVyIGlzIGZpcmVkIHdoZW4gdG9nZ2xlVmFsdWUgaXMgc2V0XG4vL3doZW5ldmVyIHRvZ2dsZVZhbHVlIGlzIHNldCwgaXQgY2hlY2tzIGZvciB0aGUgdmFsdWUgaW5zaWRlIGRlcGVuZGFibGVLZXkuXG4vL2RlcGVuZGFibGVPYmogY29uc2lzdHMgb2Yga2V5cyBhbmQgdmFsdWVzIHdoZXJlIGtleXMgYXJlIGRlcGVuZGFibGVLZXlzIHdoaWNoIGd1aWRlcyB3aGljaCBvYnNlcnZlciB0byBmaXJlIGFuZCB2YWx1ZSBpcyBhbiBhcnJheS4gRWFjaCBlbGVtZW50IG9mIGFycmF5IGlzIGFuIG9iamVjdCB3aGljaCBoYXZlIHRocmVlIHZhbHVlczogY2FsbGJhY2sgZnVuY3Rpb24sIGNvbnRleHQsIGFyZ3VtZW50cy5cbmxldCBPYnNlcnZlck9iaiA9IG5ldyBQcm94eSh7XG4gIHRvZ2dsZVZhbHVlOiBmYWxzZSxcbiAgZGVwZW5kYWJsZUtleTogbnVsbCxcbiAgZGVwZW5kYWJsZU9iajoge30sXG4gIHRvZ2dsZVByb3BlcnR5KCl7XG4gICAgdGhpcy50b2dnbGVWYWx1ZSA9ICF0aGlzLnRvZ2dsZVZhbHVlO1xuICB9XG59LCB7XG4gIHNldCh0YXJnZXQsIGtleSwgdmFsdWUpe1xuICAgIHRhcmdldFtrZXldID0gdmFsdWU7XG4gICAgaWYoa2V5PT1cInRvZ2dsZVZhbHVlXCIpe1xuICAgICAgZm9yKHZhciBrIGluIHRhcmdldC5kZXBlbmRhYmxlT2JqKXtcbiAgICAgICAgaWYoaz09dGFyZ2V0LmRlcGVuZGFibGVLZXkpe1xuICAgICAgICAgIGxldCBkZXBlbmRhYmxlcyA9IHRhcmdldC5kZXBlbmRhYmxlT2JqW2tdO1xuICAgICAgICAgIGRlcGVuZGFibGVzLmZvckVhY2goKGRlcGVuZGFibGUpID0+IHtcbiAgICAgICAgICAgIGRlcGVuZGFibGUuY2FsbGJhY2suY2FsbChkZXBlbmRhYmxlLmNvbnRleHQsIGRlcGVuZGFibGUuYXJncyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn0pO1xuZXhwb3J0IGRlZmF1bHQgT2JzZXJ2ZXJPYmo7XG4iLCJpbXBvcnQgV29ya2VyVGhyZWFkIGZyb20gJy4vd29ya2VyVGhyZWFkJztcbmltcG9ydCBXb3JrZXJUYXNrIGZyb20gJy4vd29ya2VyVGFzayc7XG5cbmxldCBpbnN0YW5jZSA9IG51bGw7XG5jbGFzcyBQb29sIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy50YXNrUXVldWUgPSBbXTsgLy90YXNrcyBxdWV1ZVxuICAgICAgICAgICAgdGhpcy53b3JrZXJRdWV1ZSA9IFtdOyAvL3dvcmtlcnMgcXVldWVcbiAgICAgICAgICAgIHRoaXMucG9vbFNpemUgPSBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSB8fCA0OyAvL3NldCBwb29sIHNpemUgZXF1YWwgdG8gbm8gb2YgY29yZXMsIGlmIG5hdmlnYXRvciBvYmplY3QgYXZhaWxhYmxlIG9yIDQuXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH1cbiAgICBjcmVhdGVXb3JrZXJUYXNrKHNjcmlwdCwgY2FsbGJhY2ssIG1zZykge1xuICAgICAgICByZXR1cm4gbmV3IFdvcmtlclRhc2soc2NyaXB0LCBjYWxsYmFjaywgbXNnKTtcbiAgICB9XG4gICAgYWRkV29ya2VyVGFzayhzY3JpcHQsIGNhbGxiYWNrLCBtc2cpIHtcbiAgICAgICAgbGV0IHdvcmtlclRhc2sgPSB0aGlzLmNyZWF0ZVdvcmtlclRhc2soc2NyaXB0LCBjYWxsYmFjaywgbXNnKTtcbiAgICAgICAgaWYgKHRoaXMud29ya2VyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIHdvcmtlclRocmVhZCA9IHRoaXMud29ya2VyUXVldWUuc2hpZnQoKTsgLy8gZ2V0IHRoZSB3b3JrZXIgZnJvbSB0aGUgZnJvbnQgb2YgdGhlIHF1ZXVlXG4gICAgICAgICAgICB3b3JrZXJUaHJlYWQucnVuKHdvcmtlclRhc2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50YXNrUXVldWUucHVzaCh3b3JrZXJUYXNrKTsgLy8gbm8gZnJlZSB3b3JrZXJzXG4gICAgICAgIH1cbiAgICB9XG4gICAgaW5pdCgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBvb2xTaXplOyBpKyspIHsgLy8gY3JlYXRlICdwb29sU2l6ZScgbnVtYmVyIG9mIHdvcmtlciB0aHJlYWRzXG4gICAgICAgICAgICB0aGlzLndvcmtlclF1ZXVlLnB1c2gobmV3IFdvcmtlclRocmVhZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGZyZWVXb3JrZXJUaHJlYWQod29ya2VyVGhyZWFkKSB7XG4gICAgICAgIGlmICh0aGlzLnRhc2tRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgd29ya2VyVGFzayA9IHRoaXMudGFza1F1ZXVlLnNoaWZ0KCk7IC8vIGRvbid0IHB1dCBiYWNrIGluIHF1ZXVlLCBidXQgZXhlY3V0ZSBuZXh0IHRhc2tcbiAgICAgICAgICAgIHdvcmtlclRocmVhZC5ydW4od29ya2VyVGFzayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3b3JrZXJUaHJlYWQud29ya2VyLnRlcm1pbmF0ZSgpOyAvL3Rlcm1pbmF0ZSB3b3JrZXIgaWYgbm8gdGFzayBhdCBoYW5kXG4gICAgICAgICAgICB0aGlzLndvcmtlclF1ZXVlLnVuc2hpZnQod29ya2VyVGhyZWFkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubGV0IHBvb2wgPSAobmV3IFBvb2woKSkuaW5pdCgpO1xuZXhwb3J0IGRlZmF1bHQgcG9vbDtcbiIsIi8vdGhpcyBpcyBkYXRhIHN0b3JlIGltcGxlbWVudGF0aW9uLiBTdG9yZSBpcyBhIHNpbmdsZXRvbiBjbGFzc1xuLy90aGUgdmFsdWVzIGFyZSBzdG9yZWQgaW4gZGF0YS4gYW5kIGl0IGhhcyBjb21tb24gZnVuY3Rpb25zIGxpa2UgY3JlYXRlUmVjb3JkLCBmaW5kQWxsLCBmaW5kQnksIGZpbmQsIGdldFJlY29yZCwgcmVsYXRpb25zaGlwcyhoYXNNYW55LCBiZWxvbmdzVG8pXG5pbXBvcnQgbW9kZWxzIGZyb20gJy4uL21vZGVscyc7XG5cbmxldCBnZXRNb2RlbCA9IGZ1bmN0aW9uKG1vZGVsTmFtZSkge1xuICAgIGxldCByZWZlcnJlZE1vZGVsO1xuICAgIG1vZGVscygpLmZvckVhY2goKG1vZGVsKSA9PiB7XG4gICAgICAgIGlmIChtb2RlbC5tb2RlbE5hbWUgPT0gbW9kZWxOYW1lKSB7XG4gICAgICAgICAgICByZWZlcnJlZE1vZGVsID0gbW9kZWw7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAocmVmZXJyZWRNb2RlbCkge1xuICAgICAgICByZXR1cm4gcmVmZXJyZWRNb2RlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvL3Rocm93IGVycm9yIHNheWluZyB3cm9uZyBtb2RlbCBuYW1lIHBhc3NlZFxuICAgIH1cbn1cbmxldCBpbnN0YW5jZSA9IG51bGw7XG5jbGFzcyBTdG9yZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGluc3RhbmNlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9XG4gICAgY3JlYXRlUmVjb3JkKG1vZGVsTmFtZSwgYXR0cmlidXRlcykge1xuICAgICAgICB0aGlzLmRhdGFbbW9kZWxOYW1lXSA9IHRoaXMuZGF0YVttb2RlbE5hbWVdIHx8IHt9O1xuICAgICAgICBsZXQgbW9kZWwgPSBnZXRNb2RlbChtb2RlbE5hbWUpO1xuICAgICAgICBsZXQgcmVjb3JkID0gbmV3IG1vZGVsKGF0dHJpYnV0ZXMpO1xuICAgICAgICB0aGlzLmRhdGFbbW9kZWxOYW1lXVtyZWNvcmQuaWRdID0gcmVjb3JkO1xuICAgICAgICByZXR1cm4gcmVjb3JkO1xuICAgIH1cbiAgICBnZXRSZWNvcmQobW9kZWxOYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFbbW9kZWxOYW1lXSAmJiBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVttb2RlbE5hbWVdKVswXSkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5kYXRhW21vZGVsTmFtZV0pWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlUmVjb3JkKG1vZGVsTmFtZSwge30pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZpbmRBbGwobW9kZWxOYW1lKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVttb2RlbE5hbWVdKTtcbiAgICB9XG4gICAgZmluZChtb2RlbE5hbWUsIGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbbW9kZWxOYW1lXVtpZF07XG4gICAgfVxuICAgIGZpbmRCeShtb2RlbE5hbWUsIGhhc2gpIHtcbiAgICAgICAgbGV0IHJlY29yZHMgPSBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVttb2RlbE5hbWVdKS5maWx0ZXIoKHJlY29yZCkgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgayBpbiBoYXNoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc2hba10gIT0gcmVjb3JkW2tdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZWNvcmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlY29yZHNbMF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGZpbHRlcihtb2RlbE5hbWUsIGhhc2gpIHtcbiAgICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbbW9kZWxOYW1lXSkubWFwKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZWNvcmQuaGFzQXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGJlbG9uZ3NUbyhtb2RlbE5hbWUsIGlkLCByZWxhdGlvbk1vZGVsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVtyZWxhdGlvbk1vZGVsXSkuZmlsdGVyKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZWNvcmQuaWQgPT0gaWQ7XG4gICAgICAgIH0pWzBdO1xuICAgIH1cbiAgICBoYXNNYW55KG1vZGVsTmFtZSwgaWQsIHJlbGF0aW9uTW9kZWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5kYXRhW3JlbGF0aW9uTW9kZWxdKS5maWx0ZXIoKHJlY29yZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlY29yZFttb2RlbE5hbWUgKyBcIklkXCJdID09IGlkO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5sZXQgc3RvcmUgPSBuZXcgU3RvcmUoKTtcbmV4cG9ydCBkZWZhdWx0IHN0b3JlO1xuIiwiLy8gdGFzayB0byBydW5cbmNsYXNzIFdvcmtlclRhc2sge1xuICAgIGNvbnN0cnVjdG9yKHNjcmlwdCwgY2FsbGJhY2ssIG1zZyl7XG4gICAgdGhpcy5zY3JpcHQgPSBzY3JpcHQ7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuc3RhcnRNZXNzYWdlID0gbXNnO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdvcmtlclRhc2s7XG4iLCIvLyBydW5uZXIgd29yayB0YXNrcyBpbiB0aGUgcG9vbFxuY2xhc3MgV29ya2VyVGhyZWFkIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnRQb29sKSB7XG4gICAgICAgIHRoaXMucGFyZW50UG9vbCA9IHBhcmVudFBvb2w7XG4gICAgICAgIHRoaXMud29ya2VyVGFzayA9IG51bGw7XG4gICAgICAgIHRoaXMud29ya2VyID0gbnVsbDtcbiAgICB9XG4gICAgcnVuKHdvcmtlclRhc2spIHtcbiAgICAgICAgaWYodGhpcy53b3JrZXIpe1xuICAgICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud29ya2VyVGFzayA9IHdvcmtlclRhc2s7XG4gICAgICAgIGlmICh0aGlzLndvcmtlclRhc2suc2NyaXB0ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGxldCB3b3JrZXIgPSBuZXcgV29ya2VyKHdvcmtlclRhc2suc2NyaXB0KTsgLy8gY3JlYXRlIGEgbmV3IHdlYiB3b3JrZXJcbiAgICAgICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5kdW1teUNhbGxiYWNrLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICAgICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZSh3b3JrZXJUYXNrLnN0YXJ0TWVzc2FnZSk7XG4gICAgICAgICAgICB0aGlzLndvcmtlciA9IHdvcmtlcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBmb3Igbm93IGFzc3VtZSB3ZSBvbmx5IGdldCBhIHNpbmdsZSBjYWxsYmFjayBmcm9tIGEgd29ya2VyXG4gICAgLy8gd2hpY2ggYWxzbyBpbmRpY2F0ZXMgdGhlIGVuZCBvZiB0aGlzIHdvcmtlci5cbiAgICBkdW1teUNhbGxiYWNrKGV2ZW50KSB7XG4gICAgICAgIHRoaXMud29ya2VyVGFzay5jYWxsYmFjayhldmVudCk7IC8vIHBhc3MgdG8gb3JpZ2luYWwgY2FsbGJhY2tcbiAgICAgICAgdGhpcy5wYXJlbnRQb29sLmZyZWVXb3JrZXJUaHJlYWQodGhpcyk7IC8vIHdlIHNob3VsZCB1c2UgYSBzZXBlcmF0ZSB0aHJlYWQgdG8gYWRkIHRoZSB3b3JrZXJcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdvcmtlclRocmVhZDtcbiIsIi8vdGhpcyB0YWtlcyByLCBnIGFuZCBiIHZhbHVlcyBhbmQgZ2VuZXJhdGUgaGV4YWRlY2ltYWwgY29sb3IgY29kZS5cbmZ1bmN0aW9uIGNvbXBvbmVudFRvSGV4KGMpIHtcbiAgICB2YXIgaGV4ID0gTWF0aC5yb3VuZChjKS50b1N0cmluZygxNik7XG4gICAgcmV0dXJuIGhleC5sZW5ndGggPT0gMSA/IFwiMFwiICsgaGV4IDogaGV4O1xufVxuXG5mdW5jdGlvbiByZ2JUb0hleChyLCBnLCBiKSB7XG4gICAgcmV0dXJuIFwiXCIgKyBjb21wb25lbnRUb0hleChyKSArIGNvbXBvbmVudFRvSGV4KGcpICsgY29tcG9uZW50VG9IZXgoYik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJnYlRvSGV4O1xuIl19
