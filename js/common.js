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
            var promisesArr = [];
            var promise = new Promise(function (resolve) {
                window.requestAnimationFrame(function fillRow() {
                    tileRow.tiles.forEach(function (tile) {
                        var p = new Promise(function (res) {
                            var svgImg = new Image();
                            svgImg.onload = function () {
                                self.canvasContext.drawImage(svgImg, tile.column * TILE_WIDTH, tileRow.row * TILE_HEIGHT);
                                res(tileRow);
                            };
                            svgImg.src = tile.svg;
                        });
                        resolve();
                        promisesArr.push(p);
                    });
                });
            });
            promisesArr.push(promise);
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

            var promisesArr = [];
            var self = this;

            var _loop = function _loop(i) {
                var tileRow = _store2.default.createRecord('tileRow', {
                    image: _this.image,
                    row: i
                });

                var promise = new Promise(function (resolve) {
                    window.requestAnimationFrame(function sliceRow() {
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
                        tileRow.processTiles();
                        resolve(tileRow);
                    });
                });
                promisesArr.push(promise);
            };

            for (var i = 0; i < this.image.verticalTiles; i++) {
                _loop(i);
            }
            Promise.all(promisesArr).then(function (tileRows) {
                _observer2.default.dependableKey = 'tileRowsCreated';
                _observer2.default.toggleValue = !_observer2.default.toggleValue;
            });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcHBsaWNhdGlvbi5qcyIsImpzL2NvbXBvbmVudHMvZGVzdGluYXRpb24taW1hZ2UvY29tcG9uZW50LmpzIiwianMvY29tcG9uZW50cy9kZXN0aW5hdGlvbi1pbWFnZS90ZW1wbGF0ZS5qcyIsImpzL2NvbXBvbmVudHMvaW1hZ2UtdXBsb2FkL2NvbXBvbmVudC5qcyIsImpzL2NvbXBvbmVudHMvaW1hZ2UtdXBsb2FkL3RlbXBsYXRlLmpzIiwianMvY29tcG9uZW50cy9pbmRleC5qcyIsImpzL2NvbXBvbmVudHMvc291cmNlLWltYWdlL2NvbXBvbmVudC5qcyIsImpzL2NvbXBvbmVudHMvc291cmNlLWltYWdlL3RlbXBsYXRlLmpzIiwianMvbW9kZWxzL2luZGV4LmpzIiwianMvbW9kZWxzL21vc2FpY0ltYWdlLmpzIiwianMvbW9kZWxzL3RpbGUuanMiLCJqcy9tb2RlbHMvdGlsZVJvdy5qcyIsImpzL3NlcnZpY2VzL29ic2VydmVyLmpzIiwianMvc2VydmljZXMvcG9vbC5qcyIsImpzL3NlcnZpY2VzL3N0b3JlLmpzIiwianMvc2VydmljZXMvd29ya2VyVGFzay5qcyIsImpzL3NlcnZpY2VzL3dvcmtlclRocmVhZC5qcyIsImpzL3V0aWxzL3JnYlRvSGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNHQTs7Ozs7O0FBQ0EsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsSUFBOUMsRUFBb0QsS0FBcEQsRSxDQUpBO0FBQ0E7QUFDQTs7QUFHQSxTQUFTLElBQVQsR0FBZTtBQUNiLDhCQUFhLE9BQWIsQ0FBcUIsVUFBQyxTQUFELEVBQWU7QUFDbEMsUUFBSSxPQUFPLElBQUksU0FBSixFQUFYO0FBQ0EsU0FBSyxTQUFMO0FBQ0QsR0FIRDtBQUlEOzs7Ozs7Ozs7OztBQ1ZEOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7SUFFTSx5Qjs7OzRCQUNjO0FBQ1os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akIsaUJBQUssVUFBTCxDQUFnQixRQUFoQixDQUF5QixLQUF6QixFQURpQixDQUNnQjtBQUNqQyxpQkFBSyxVQUFMLENBQWdCLGdCQUFoQixDQUFpQyxJQUFqQyxFQUZpQixDQUV1QjtBQUMzQzs7Ozs7O2tCQUdVLFk7Ozs7Ozs7O0FDM0JmO0FBQ0EsU0FBUyxjQUFULENBQXdCLENBQXhCLEVBQTJCO0FBQ3ZCLFFBQUksTUFBTSxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsUUFBZCxDQUF1QixFQUF2QixDQUFWO0FBQ0EsV0FBTyxJQUFJLE1BQUosSUFBYyxDQUFkLEdBQWtCLE1BQU0sR0FBeEIsR0FBOEIsR0FBckM7QUFDSDs7QUFFRCxTQUFTLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsRUFBMkI7QUFDdkIsV0FBTyxLQUFLLGVBQWUsQ0FBZixDQUFMLEdBQXlCLGVBQWUsQ0FBZixDQUF6QixHQUE2QyxlQUFlLENBQWYsQ0FBcEQ7QUFDSDs7a0JBRWMsUSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvL0NvbXBvbmVudHMgYXJlIGluaXRpYXRlZCBhcyBzb29uIGFzIHRoZSBkb20gaXMgbG9hZGVkLlxuLy9FYWNoIGVsZW1lbnQgd2hpY2ggaGFzIGEgY29tcG9uZW50IHNoYWxsIGhhdmUgc2FtZSBpZCBhcyBjb21wb25lbnQgbmFtZS5cbi8vVGhlIGNvbXBvbmVudCBoYXZlIHRlbXBsYXRlIGFuZCBjb21wb25lbnQuIFdoZW4gaW5pdGlhdGVkLCBldmVudHMgYXJlIGJpbmRlZCBhY2NvcmRpbmcgdG8gdGhlIGNvbXBvbmVudC5cbmltcG9ydCBjb21wb25lbnRzIGZyb20gJy4vY29tcG9uZW50cyc7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCwgZmFsc2UpO1xuZnVuY3Rpb24gaW5pdCgpe1xuICBjb21wb25lbnRzKCkuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XG4gICAgbGV0IGNvbXAgPSBuZXcgY29tcG9uZW50KCk7XG4gICAgY29tcC5hZGRFdmVudHMoKTtcbiAgfSlcbn07XG4iLCJpbXBvcnQgdGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZSc7XG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vLi4vc2VydmljZXMvc3RvcmUnO1xuaW1wb3J0IE9ic2VydmVyT2JqIGZyb20gJy4uLy4uL3NlcnZpY2VzL29ic2VydmVyJztcblxuY2xhc3MgRGVzdGluYXRpb25JbWFnZUNvbXBvbmVudCB7XG4gICAgZ2V0IHRvdGFsUm93cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZVJvd3MubGVuZ3RoO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXN0aW5hdGlvbi1pbWFnZVwiKS5pbm5lckhUTUwgPSB0ZW1wbGF0ZSgpO1xuICAgICAgICBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93c0NyZWF0ZWQnXSA9IE9ic2VydmVyT2JqLmRlcGVuZGFibGVPYmpbJ3RpbGVSb3dzQ3JlYXRlZCddIHx8IFtdO1xuICAgICAgICBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93c0NyZWF0ZWQnXS5wdXNoKHtcbiAgICAgICAgICAgIGNhbGxiYWNrOiB0aGlzLnNldFRpbGVSb3dzLFxuICAgICAgICAgICAgY29udGV4dDogdGhpc1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jdXJyZW50Um93ID0gMDtcbiAgICAgICAgdGhpcy5hZGRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5yb3dUaWxlRmlsbE1hcCA9IHt9O1xuICAgIH1cbiAgICBhZGRFdmVudHMoKSB7XG4gICAgICAgIGxldCBpbWFnZSA9IFN0b3JlLmdldFJlY29yZCgnbW9zYWljSW1hZ2UnKTtcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICBpbWFnZS5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLmluaXRpYXRlQ2FudmFzLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICBpbml0aWF0ZUNhbnZhcygpIHtcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZXN0aW5hdGlvbicpO1xuICAgICAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGN0eC5jYW52YXMud2lkdGggPSB0aGlzLmltYWdlLm5vZGUud2lkdGg7XG4gICAgICAgIGN0eC5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWFnZS5ub2RlLmhlaWdodDtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICAgIHRoaXMuY2FudmFzQ29udGV4dCA9IGN0eDtcbiAgICB9XG4gICAgLy9vYnNlcnZlciBhcmUgYmluZGVkIHRvIHdoZW4gdGhlIHRpbGVSb3cgd2lsbCBoYXZlIGxvYWRlZCByb3dzIHdpdGggc3ZnIGNvbnRlbnQgZnJvbSBzZXJ2ZXJcbiAgICBzZXRUaWxlUm93cygpIHtcbiAgICAgICAgdGhpcy50aWxlUm93cyA9IFN0b3JlLmZpbmRBbGwoJ3RpbGVSb3cnKTtcbiAgICAgICAgdGhpcy50aWxlUm93cy5mb3JFYWNoKCh0aWxlUm93KSA9PiB7XG4gICAgICAgICAgICBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93TG9hZGVkJyArIHRpbGVSb3cucm93XSA9IE9ic2VydmVyT2JqLmRlcGVuZGFibGVPYmpbJ3RpbGVSb3dMb2FkZWQnICsgdGlsZVJvdy5yb3ddIHx8IFtdO1xuICAgICAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZU9ialsndGlsZVJvd0xvYWRlZCcgKyB0aWxlUm93LnJvd10ucHVzaCh7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IHRoaXMubG9hZEltYWdlLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXG4gICAgICAgICAgICAgICAgYXJnczogdGlsZVJvdy5yb3dcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy9maXJlZCB3aGVuIHJvdyBpcyBsb2FkZWRcbiAgICAvL3RoaXMgZnVuY3Rpb24gb25seSBwcm9jZWVlZHMgaWYgdGhlIHJvdyB0aGF0IGlzIGNvbXBsZXRlZCBpcyBlcXVhbCB0byBjdXJyZW50IHJvdy5cbiAgICAvL2N1cnJlbnQgcm93IGluY3JlbWVudHMgc3RlcCB3aXNlIHdoZW5ldmVyIHRoZSB0aGUgdGlsZVJvdyh3aXRoIHNhbWUgcm93IG51bWJlcikgaXMgcmVjZWl2ZWQuXG4gICAgLy9pZiBhbnkgb3RoZXIoaS5lLiBmdXR1cmUpIHRpbGVSb3cgaXMgcmVjZWl2ZWQsIGl0IGlzIGlnbm9yZWQuXG4gICAgLy93aGVuIHRpbGVSb3cgaXMgcmVjZWl2ZWQgbWF0Y2hlZCB3aXRoIGN1cnJlbnQgdGlsZSByb3csIGl0IGNoZWNrcyBmb3IgdGhlIHN1YnNlcXVlbnQgbmV4dCByb3dzXG4gICAgbG9hZEltYWdlKHJvdykge1xuICAgICAgICBpZiAocm93ID09IHRoaXMuaW1hZ2UudmVydGljYWxUaWxlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyb3cgPT0gdGhpcy5jdXJyZW50Um93KSB7XG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBsZXQgdGlsZVJvdyA9IFN0b3JlLmZpbmRCeSgndGlsZVJvdycsIHtcbiAgICAgICAgICAgICAgICByb3dcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCF0aWxlUm93LnJvd0xvYWRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnJvd1RpbGVGaWxsTWFwW3Jvd10pIHtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShyb3cgKyAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5yb3dUaWxlRmlsbE1hcFtyb3ddID0gMTtcbiAgICAgICAgICAgICAgICBsZXQgZmlsbEltYWdlUHJvbWlzZSA9IHRoaXMuZmlsbEltYWdlKHRpbGVSb3cpXG4gICAgICAgICAgICAgICAgZmlsbEltYWdlUHJvbWlzZS50aGVuKCh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jdXJyZW50Um93ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlKHJvdyArIDEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vY2FudmFzIGltYWdlIGlzIGZpbGxlZCB3aXRoIHRpbGVSb3dcbiAgICBmaWxsSW1hZ2UodGlsZVJvdykge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCBwcm9taXNlc0FyciA9IFtdO1xuICAgICAgICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gZmlsbFJvdygpIHtcbiAgICAgICAgICAgICAgICB0aWxlUm93LnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHAgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdmdJbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Z0ltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNhbnZhc0NvbnRleHQuZHJhd0ltYWdlKHN2Z0ltZywgdGlsZS5jb2x1bW4gKiBUSUxFX1dJRFRILCB0aWxlUm93LnJvdyAqIFRJTEVfSEVJR0hUKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXModGlsZVJvdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmdJbWcuc3JjID0gdGlsZS5zdmc7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHByb21pc2VzQXJyLnB1c2gocCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHByb21pc2VzQXJyLnB1c2gocHJvbWlzZSk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlc0Fycik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEZXN0aW5hdGlvbkltYWdlQ29tcG9uZW50O1xuIiwibGV0IHRlbXBsYXRlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIFwiPGNhbnZhcyBpZD0nZGVzdGluYXRpb24nPjwvY2FudmFzPlwiO1xufVxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGU7XG4iLCJpbXBvcnQgdGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZSc7XG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vLi4vc2VydmljZXMvc3RvcmUnO1xuY2xhc3MgSW1hZ2VVcGxvYWRDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlLXVwbG9hZFwiKS5pbm5lckhUTUwgPSB0ZW1wbGF0ZSgpO1xuICAgIH1cbiAgICAvL1doZW4gdGhlIHN1Ym1pdCBidXR0b24gaXMgY2xpY2tlZCwgdGhlIGZpbGUoaWYgdXBsb2FkZWQpLCBpcyB1cGxvYWRlZCBpbiBzb3VyY2UgaW1hZ2UgY2FudmFzLlxuICAgIGFkZEV2ZW50cygpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1cGxvYWRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubG9hZEltYWdlKTtcbiAgICB9XG5cbiAgICBsb2FkSW1hZ2UoKSB7XG4gICAgICAgIHZhciBtb3NhaWNJbWFnZSA9IFN0b3JlLmdldFJlY29yZCgnbW9zYWljSW1hZ2UnKTtcbiAgICAgICAgdmFyIGZpbGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbWFnZVwiKS5maWxlcztcbiAgICAgICAgaWYgKEZpbGVSZWFkZXIgJiYgZmlsZXMgJiYgZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgZnIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgZnIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbW9zYWljSW1hZ2Uubm9kZS5zcmMgPSBmci5yZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmci5vbmVycm9yID0gZnVuY3Rpb24oc3R1ZmYpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIsIHN0dWZmKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHN0dWZmLmdldE1lc3NhZ2UoKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZyLnJlYWRBc0RhdGFVUkwoZmlsZXNbMF0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgSW1hZ2VVcGxvYWRDb21wb25lbnQ7XG4iLCJ2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gXCI8ZGl2PjxsYWJlbCBmb3I9J2ltYWdlJz5DaG9vc2UgaW1hZ2UgdG8gdXBsb2FkPC9sYWJlbD48aW5wdXQgdHlwZT0nZmlsZScgaWQ9J2ltYWdlJyBuYW1lPSdpbWFnZScgYWNjZXB0PSdpbWFnZS8qJz48L2Rpdj48ZGl2PjxidXR0b24gaWQ9J3VwbG9hZCc+VXBsb2FkPC9idXR0b24+PC9kaXY+XCJcbn1cbmV4cG9ydCBkZWZhdWx0IHRlbXBsYXRlO1xuIiwiaW1wb3J0IERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnQgZnJvbSAnLi9kZXN0aW5hdGlvbi1pbWFnZS9jb21wb25lbnQnO1xuaW1wb3J0IFNvdXJjZUltYWdlQ29tcG9uZW50IGZyb20gJy4vc291cmNlLWltYWdlL2NvbXBvbmVudCc7XG5pbXBvcnQgSW1hZ2VVcGxvYWRDb21wb25lbnQgZnJvbSAnLi9pbWFnZS11cGxvYWQvY29tcG9uZW50JztcbmxldCBjb21wb25lbnRzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIFtJbWFnZVVwbG9hZENvbXBvbmVudCwgU291cmNlSW1hZ2VDb21wb25lbnQsIERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnRdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb21wb25lbnRzO1xuIiwiaW1wb3J0IHRlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGUnO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uLy4uL3NlcnZpY2VzL3N0b3JlJztcbmltcG9ydCBPYnNlcnZlck9iaiBmcm9tICcuLi8uLi9zZXJ2aWNlcy9vYnNlcnZlcic7XG5pbXBvcnQgcmdiVG9IZXggZnJvbSAnLi4vLi4vdXRpbHMvcmdiVG9IZXgnO1xuXG5jbGFzcyBTb3VyY2VJbWFnZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic291cmNlLWltYWdlXCIpLmlubmVySFRNTCA9IHRlbXBsYXRlKCk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRzKCk7XG4gICAgfVxuICAgIGFkZEV2ZW50cygpIHtcbiAgICAgICAgbGV0IGltYWdlID0gU3RvcmUuZ2V0UmVjb3JkKCdtb3NhaWNJbWFnZScpO1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIGltYWdlLm5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuaW1hZ2VMb2FkZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIGltYWdlTG9hZGVkKCkge1xuICAgICAgICB0aGlzLmluaXRpYXRlQ2FudmFzKCk7XG4gICAgICAgIHRoaXMuc2xpY2VJbWFnZSgpO1xuICAgIH1cbiAgICBpbml0aWF0ZUNhbnZhcygpIHtcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb3VyY2UnKTtcbiAgICAgICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBsZXQgaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgICAgICBsZXQgaW1hZ2VXaWR0aCA9IGltYWdlLndpZHRoO1xuICAgICAgICBsZXQgaW1hZ2VIZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgICAgIGN0eC5jYW52YXMud2lkdGggPSBpbWFnZVdpZHRoO1xuICAgICAgICBjdHguY2FudmFzLmhlaWdodCA9IGltYWdlSGVpZ2h0O1xuICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLm5vZGUsIDAsIDApO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgdGhpcy5jYW52YXNDb250ZXh0ID0gY3R4O1xuICAgIH1cbiAgICAvL0ltYWdlIGlzIGRpdmlkZWQgaW50byB0aWxlcy4gUixHLEIgdmFsdWVzIGFyZSBjYWxjdWxhdGVkIGZyb20gdGlsZXMuIFRpbGUgcmVjb3JkIGFuZCB0aWxlUm93IHJlY29yZCBpcyBjcmVhdGVkLiBUaGUgb2JzZXJ2ZXIgaXMgYmluZGVkIHdpdGggcmVmZXJlbmNlIHRvIHRpbGVSb3cgY3JlYXRpb24gd2hpY2ggd2lsbCBoaW50IERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnQgdG8gcHJvY2VlZCB3aXRoIGZ1cnRoZXIgcHJvY2Vzc2luZy5cbiAgICBhc3luYyBzbGljZUltYWdlKCkge1xuICAgICAgICB2YXIgcHJvbWlzZXNBcnIgPSBbXTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW1hZ2UudmVydGljYWxUaWxlczsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgdGlsZVJvdyA9IFN0b3JlLmNyZWF0ZVJlY29yZCgndGlsZVJvdycsIHtcbiAgICAgICAgICAgICAgICBpbWFnZTogdGhpcy5pbWFnZSxcbiAgICAgICAgICAgICAgICByb3c6IGksXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiBzbGljZVJvdygpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzZWxmLmltYWdlLmhvcml6b250YWxUaWxlczsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgciA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZyA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYiA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1nRGF0YSA9IHNlbGYuY2FudmFzQ29udGV4dC5nZXRJbWFnZURhdGEoaiAqIFRJTEVfV0lEVEgsIGkgKiBUSUxFX0hFSUdIVCwgVElMRV9XSURUSCwgVElMRV9IRUlHSFQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBpeCA9IGltZ0RhdGEuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSBwaXhbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBnID0gcGl4WzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYiA9IHBpeFsyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aWxlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogaixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByOiByLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGc6IGcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYjogYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZXhDb2RlOiByZ2JUb0hleChyLCBnLCBiKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbGVSb3cudGlsZXMucHVzaCh0aWxlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aWxlUm93LnByb2Nlc3NUaWxlcygpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRpbGVSb3cpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm9taXNlc0Fyci5wdXNoKHByb21pc2UpO1xuICAgICAgICB9XG4gICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzQXJyKS50aGVuKCh0aWxlUm93cykgPT4ge1xuICAgICAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZUtleSA9ICd0aWxlUm93c0NyZWF0ZWQnO1xuICAgICAgICAgICAgT2JzZXJ2ZXJPYmoudG9nZ2xlVmFsdWUgPSAhT2JzZXJ2ZXJPYmoudG9nZ2xlVmFsdWU7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFNvdXJjZUltYWdlQ29tcG9uZW50O1xuIiwibGV0IHRlbXBsYXRlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIFwiPGNhbnZhcyBpZD0nc291cmNlJz48L2NhbnZhcz5cIjtcbn1cbmV4cG9ydCBkZWZhdWx0IHRlbXBsYXRlO1xuIiwiaW1wb3J0IE1vc2FpY0ltYWdlIGZyb20gJy4vbW9zYWljSW1hZ2UnO1xuaW1wb3J0IFRpbGUgZnJvbSAnLi90aWxlJztcbmltcG9ydCBUaWxlUm93IGZyb20gJy4vdGlsZVJvdyc7XG5sZXQgbW9kZWxzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIFtNb3NhaWNJbWFnZSwgVGlsZSwgVGlsZVJvd107XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1vZGVscztcbiIsIi8vZmlsZWRzOiBpZCwgbm9kZSwgd2lkdGgsIGhlaWdodCwgaG9yaXpvbnRhbFRpbGVzLCB2ZXJ0aWNhbFRpbGVzXG5sZXQgaWQgPSAxO1xuY2xhc3MgTW9zYWljSW1hZ2V7XG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgdGhpcy5fbW9kZWxOYW1lID0gXCJtb3NhaWNJbWFnZVwiO1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLm5vZGUgPSBuZXcgSW1hZ2UoKTtcbiAgICBpZCsrO1xuICB9XG4gIGdldE1vZGVsTmFtZSgpe1xuICAgIHJldHVybiB0aGlzLl9tb2RlbE5hbWU7XG4gIH1cbiAgZ2V0IHdpZHRoKCl7XG4gICAgcmV0dXJuIHRoaXMubm9kZS53aWR0aDtcbiAgfVxuICBnZXQgaGVpZ2h0KCl7XG4gICAgcmV0dXJuIHRoaXMubm9kZS5oZWlnaHQ7XG4gIH1cbiAgZ2V0IGhvcml6b250YWxUaWxlcygpe1xuICAgIGxldCB3aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgbGV0IHRpbGVXaWR0aCA9IFRJTEVfV0lEVEg7XG4gICAgcmV0dXJuIE1hdGguY2VpbCh3aWR0aC90aWxlV2lkdGgpO1xuICB9XG4gIGdldCB2ZXJ0aWNhbFRpbGVzKCl7XG4gICAgbGV0IGhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgIGxldCB0aWxlSGVpZ2h0ID0gVElMRV9IRUlHSFQ7XG4gICAgcmV0dXJuIE1hdGguY2VpbChoZWlnaHQvdGlsZUhlaWdodCk7XG4gIH1cbn1cbk1vc2FpY0ltYWdlLm1vZGVsTmFtZSA9IFwibW9zYWljSW1hZ2VcIjtcbmV4cG9ydCBkZWZhdWx0IE1vc2FpY0ltYWdlO1xuIiwiLy9maWVsZHM6IGlkLCB0aWxlUm93LCBpbWFnZSwgcm93LCBjb2x1bW4sIHIsIGcsIGIsIGhleENvZGUsIHN2Z1N0cmluZ1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uL3NlcnZpY2VzL3N0b3JlJztcbmltcG9ydCByZ2JUb0hleCBmcm9tICcuLi91dGlscy9yZ2JUb0hleCc7XG5pbXBvcnQgUG9vbCBmcm9tICcuLi9zZXJ2aWNlcy9wb29sJztcblxubGV0IGlkID0gMVxuY2xhc3MgVGlsZSB7XG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlcykge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMuX21vZGVsTmFtZSA9IFwidGlsZVwiO1xuICAgICAgICAvL3RpbGVSb3dJZCwgY29sdW1uLCByLCBnLCBiXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgYXR0cmlidXRlcyk7XG4gICAgICAgIGlkKys7XG4gICAgfVxuICAgIGdldE1vZGVsTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGVsTmFtZTtcbiAgICB9XG4gICAgLy8gZ2V0IHRpbGVSb3coKSB7XG4gICAgLy8gICAgIHJldHVybiBTdG9yZS5iZWxvbmdzVG8oJ3RpbGUnLCB0aGlzLnRpbGVSb3dJZCwgJ3RpbGVSb3cnKTtcbiAgICAvLyB9XG4gICAgZ2V0IGltYWdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlUm93LmltYWdlO1xuICAgIH1cbiAgICBnZXQgcm93KCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlUm93LnJvdztcbiAgICB9XG4gICAgZ2V0IGhleENvZGUoKSB7XG4gICAgICAgIHJldHVybiByZ2JUb0hleCh0aGlzLnIsIHRoaXMuZywgdGhpcy5iKTtcbiAgICB9XG59XG5UaWxlLm1vZGVsTmFtZSA9IFwidGlsZVwiO1xuZXhwb3J0IGRlZmF1bHQgVGlsZTtcbiIsIi8vcHJvcGVydGllczogaWQsIGNvbHVtbiwgaW1hZ2UsIHRpbGVzXG5pbXBvcnQgT2JzZXJ2ZXJPYmogZnJvbSAnLi4vc2VydmljZXMvb2JzZXJ2ZXInO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uL3NlcnZpY2VzL3N0b3JlJztcbmltcG9ydCBQb29sIGZyb20gJy4uL3NlcnZpY2VzL3Bvb2wnO1xuXG5sZXQgaWQgPSAxO1xuY2xhc3MgVGlsZVJvdyB7XG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlcykge1xuICAgICAgICB0aGlzLl9tb2RlbE5hbWUgPSBcInRpbGVcIjtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICAvLyB0aGlzLnJlbGF0aW9uc2hpcHMgPSB7XG4gICAgICAgIC8vICAgICBiZWxvbmdzVG86IFsnaW1hZ2UnXSxcbiAgICAgICAgLy8gICAgIGhhc01hbnk6IFsndGlsZSddXG4gICAgICAgIC8vIH1cbiAgICAgICAgdGhpcy50aWxlcyA9IFtdO1xuICAgICAgICAvL2NvbHVtbiwgaW1hZ2VJZFxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIGF0dHJpYnV0ZXMpO1xuICAgICAgICBpZCsrO1xuICAgIH1cbiAgICBnZXRNb2RlbE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RlbE5hbWU7XG4gICAgfVxuICAgIC8vIGdldCB0aWxlcygpIHtcbiAgICAvLyAgICAgcmV0dXJuIFN0b3JlLmhhc01hbnkoJ3RpbGVSb3cnLCB0aGlzLmlkLCAndGlsZScpO1xuICAgIC8vIH1cbiAgICAvLyBnZXQgaW1hZ2UoKSB7XG4gICAgLy8gICAgIHJldHVybiBTdG9yZS5iZWxvbmdzVG8oJ3RpbGVSb3cnLCB0aGlzLmltYWdlSWQsICdpbWFnZScpO1xuICAgIC8vIH1cbiAgICAvL3RoaXMgZmlyZXMgb2JzZXJ2ZXIgd2hlbiBhbGwgdGhlIHRpbGVzIGdldCBzdmcgZnJvbSBzZXJ2ZXIuKHJvdyB3aXNlKVxuICAgIGFkZFRpbGVMb2FkT2JzZXJ2ZXIoKSB7XG4gICAgICAgIHRoaXMucm93TG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZUtleSA9ICd0aWxlUm93TG9hZGVkJyArIHRoaXMucm93O1xuICAgICAgICBPYnNlcnZlck9iai50b2dnbGVWYWx1ZSA9ICFPYnNlcnZlck9iai50b2dnbGVWYWx1ZTtcbiAgICB9XG4gICAgc2V0VGlsZVN2Zyh0aWxlc0Fycikge1xuICAgICAgICB0aWxlc0Fyci5mb3JFYWNoKCh0aWxlSGFzaCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIC8vIGxldCBpZCA9IE9iamVjdC5rZXlzKHRpbGVIYXNoKVswXTtcbiAgICAgICAgICAgIGxldCBzdmcgPSB0aWxlSGFzaFtpbmRleF07XG4gICAgICAgICAgICB0aGlzLnRpbGVzW2luZGV4XS5zdmcgPSBzdmc7XG4gICAgICAgICAgICAvLyBTdG9yZS5maW5kKCd0aWxlJywgaWQpLnN2ZyA9IHN2ZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByb2Nlc3NUaWxlc0NhbGxiYWNrKGV2ZW50KSB7XG4gICAgICAgIGxldCB0aWxlc0FyciA9IGV2ZW50LmRhdGE7XG4gICAgICAgIHRoaXMuc2V0VGlsZVN2Zyh0aWxlc0Fycik7XG4gICAgICAgIHRoaXMuYWRkVGlsZUxvYWRPYnNlcnZlcigpO1xuICAgIH1cbiAgICBwcm9jZXNzVGlsZXMoKSB7XG4gICAgICAgIGxldCB0aWxlQXJyID0gW107XG4gICAgICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGxldCB0aWxlSGFzaCA9IHt9O1xuICAgICAgICAgICAgdGlsZUhhc2hbaW5kZXhdID0gdGlsZS5oZXhDb2RlO1xuICAgICAgICAgICAgdGlsZUFyci5wdXNoKHRpbGVIYXNoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFBvb2wuYWRkV29ya2VyVGFzaygnLi4vanMvd29ya2Vycy9sb2FkQ29udGVudC5qcycsIHRoaXMucHJvY2Vzc1RpbGVzQ2FsbGJhY2suYmluZCh0aGlzKSwgSlNPTi5zdHJpbmdpZnkodGlsZUFycikpO1xuICAgIH1cbn1cblRpbGVSb3cubW9kZWxOYW1lID0gXCJ0aWxlUm93XCI7XG5leHBvcnQgZGVmYXVsdCBUaWxlUm93O1xuIiwiLy9UaGlzIGlzIG9ic2VydmVyIGltcGxlbWVudGF0aW9uLlxuLy9PYnNlcnZlciBpcyBmaXJlZCB3aGVuIHRvZ2dsZVZhbHVlIGlzIHNldFxuLy93aGVuZXZlciB0b2dnbGVWYWx1ZSBpcyBzZXQsIGl0IGNoZWNrcyBmb3IgdGhlIHZhbHVlIGluc2lkZSBkZXBlbmRhYmxlS2V5LlxuLy9kZXBlbmRhYmxlT2JqIGNvbnNpc3RzIG9mIGtleXMgYW5kIHZhbHVlcyB3aGVyZSBrZXlzIGFyZSBkZXBlbmRhYmxlS2V5cyB3aGljaCBndWlkZXMgd2hpY2ggb2JzZXJ2ZXIgdG8gZmlyZSBhbmQgdmFsdWUgaXMgYW4gYXJyYXkuIEVhY2ggZWxlbWVudCBvZiBhcnJheSBpcyBhbiBvYmplY3Qgd2hpY2ggaGF2ZSB0aHJlZSB2YWx1ZXM6IGNhbGxiYWNrIGZ1bmN0aW9uLCBjb250ZXh0LCBhcmd1bWVudHMuXG5sZXQgT2JzZXJ2ZXJPYmogPSBuZXcgUHJveHkoe1xuICB0b2dnbGVWYWx1ZTogZmFsc2UsXG4gIGRlcGVuZGFibGVLZXk6IG51bGwsXG4gIGRlcGVuZGFibGVPYmo6IHt9LFxuICB0b2dnbGVQcm9wZXJ0eSgpe1xuICAgIHRoaXMudG9nZ2xlVmFsdWUgPSAhdGhpcy50b2dnbGVWYWx1ZTtcbiAgfVxufSwge1xuICBzZXQodGFyZ2V0LCBrZXksIHZhbHVlKXtcbiAgICB0YXJnZXRba2V5XSA9IHZhbHVlO1xuICAgIGlmKGtleT09XCJ0b2dnbGVWYWx1ZVwiKXtcbiAgICAgIGZvcih2YXIgayBpbiB0YXJnZXQuZGVwZW5kYWJsZU9iail7XG4gICAgICAgIGlmKGs9PXRhcmdldC5kZXBlbmRhYmxlS2V5KXtcbiAgICAgICAgICBsZXQgZGVwZW5kYWJsZXMgPSB0YXJnZXQuZGVwZW5kYWJsZU9ialtrXTtcbiAgICAgICAgICBkZXBlbmRhYmxlcy5mb3JFYWNoKChkZXBlbmRhYmxlKSA9PiB7XG4gICAgICAgICAgICBkZXBlbmRhYmxlLmNhbGxiYWNrLmNhbGwoZGVwZW5kYWJsZS5jb250ZXh0LCBkZXBlbmRhYmxlLmFyZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59KTtcbmV4cG9ydCBkZWZhdWx0IE9ic2VydmVyT2JqO1xuIiwiaW1wb3J0IFdvcmtlclRocmVhZCBmcm9tICcuL3dvcmtlclRocmVhZCc7XG5pbXBvcnQgV29ya2VyVGFzayBmcm9tICcuL3dvcmtlclRhc2snO1xuXG5sZXQgaW5zdGFuY2UgPSBudWxsO1xuY2xhc3MgUG9vbCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGluc3RhbmNlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMudGFza1F1ZXVlID0gW107IC8vdGFza3MgcXVldWVcbiAgICAgICAgICAgIHRoaXMud29ya2VyUXVldWUgPSBbXTsgLy93b3JrZXJzIHF1ZXVlXG4gICAgICAgICAgICB0aGlzLnBvb2xTaXplID0gbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgfHwgNDsgLy9zZXQgcG9vbCBzaXplIGVxdWFsIHRvIG5vIG9mIGNvcmVzLCBpZiBuYXZpZ2F0b3Igb2JqZWN0IGF2YWlsYWJsZSBvciA0LlxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9XG4gICAgY3JlYXRlV29ya2VyVGFzayhzY3JpcHQsIGNhbGxiYWNrLCBtc2cpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBXb3JrZXJUYXNrKHNjcmlwdCwgY2FsbGJhY2ssIG1zZyk7XG4gICAgfVxuICAgIGFkZFdvcmtlclRhc2soc2NyaXB0LCBjYWxsYmFjaywgbXNnKSB7XG4gICAgICAgIGxldCB3b3JrZXJUYXNrID0gdGhpcy5jcmVhdGVXb3JrZXJUYXNrKHNjcmlwdCwgY2FsbGJhY2ssIG1zZyk7XG4gICAgICAgIGlmICh0aGlzLndvcmtlclF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciB3b3JrZXJUaHJlYWQgPSB0aGlzLndvcmtlclF1ZXVlLnNoaWZ0KCk7IC8vIGdldCB0aGUgd29ya2VyIGZyb20gdGhlIGZyb250IG9mIHRoZSBxdWV1ZVxuICAgICAgICAgICAgd29ya2VyVGhyZWFkLnJ1bih3b3JrZXJUYXNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGFza1F1ZXVlLnB1c2god29ya2VyVGFzayk7IC8vIG5vIGZyZWUgd29ya2Vyc1xuICAgICAgICB9XG4gICAgfVxuICAgIGluaXQoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wb29sU2l6ZTsgaSsrKSB7IC8vIGNyZWF0ZSAncG9vbFNpemUnIG51bWJlciBvZiB3b3JrZXIgdGhyZWFkc1xuICAgICAgICAgICAgdGhpcy53b3JrZXJRdWV1ZS5wdXNoKG5ldyBXb3JrZXJUaHJlYWQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBmcmVlV29ya2VyVGhyZWFkKHdvcmtlclRocmVhZCkge1xuICAgICAgICBpZiAodGhpcy50YXNrUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIHdvcmtlclRhc2sgPSB0aGlzLnRhc2tRdWV1ZS5zaGlmdCgpOyAvLyBkb24ndCBwdXQgYmFjayBpbiBxdWV1ZSwgYnV0IGV4ZWN1dGUgbmV4dCB0YXNrXG4gICAgICAgICAgICB3b3JrZXJUaHJlYWQucnVuKHdvcmtlclRhc2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd29ya2VyVGhyZWFkLndvcmtlci50ZXJtaW5hdGUoKTsgLy90ZXJtaW5hdGUgd29ya2VyIGlmIG5vIHRhc2sgYXQgaGFuZFxuICAgICAgICAgICAgdGhpcy53b3JrZXJRdWV1ZS51bnNoaWZ0KHdvcmtlclRocmVhZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmxldCBwb29sID0gKG5ldyBQb29sKCkpLmluaXQoKTtcbmV4cG9ydCBkZWZhdWx0IHBvb2w7XG4iLCIvL3RoaXMgaXMgZGF0YSBzdG9yZSBpbXBsZW1lbnRhdGlvbi4gU3RvcmUgaXMgYSBzaW5nbGV0b24gY2xhc3Ncbi8vdGhlIHZhbHVlcyBhcmUgc3RvcmVkIGluIGRhdGEuIGFuZCBpdCBoYXMgY29tbW9uIGZ1bmN0aW9ucyBsaWtlIGNyZWF0ZVJlY29yZCwgZmluZEFsbCwgZmluZEJ5LCBmaW5kLCBnZXRSZWNvcmQsIHJlbGF0aW9uc2hpcHMoaGFzTWFueSwgYmVsb25nc1RvKVxuaW1wb3J0IG1vZGVscyBmcm9tICcuLi9tb2RlbHMnO1xuXG5sZXQgZ2V0TW9kZWwgPSBmdW5jdGlvbihtb2RlbE5hbWUpIHtcbiAgICBsZXQgcmVmZXJyZWRNb2RlbDtcbiAgICBtb2RlbHMoKS5mb3JFYWNoKChtb2RlbCkgPT4ge1xuICAgICAgICBpZiAobW9kZWwubW9kZWxOYW1lID09IG1vZGVsTmFtZSkge1xuICAgICAgICAgICAgcmVmZXJyZWRNb2RlbCA9IG1vZGVsO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHJlZmVycmVkTW9kZWwpIHtcbiAgICAgICAgcmV0dXJuIHJlZmVycmVkTW9kZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy90aHJvdyBlcnJvciBzYXlpbmcgd3JvbmcgbW9kZWwgbmFtZSBwYXNzZWRcbiAgICB9XG59XG5sZXQgaW5zdGFuY2UgPSBudWxsO1xuY2xhc3MgU3RvcmUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfVxuICAgIGNyZWF0ZVJlY29yZChtb2RlbE5hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGhpcy5kYXRhW21vZGVsTmFtZV0gPSB0aGlzLmRhdGFbbW9kZWxOYW1lXSB8fCB7fTtcbiAgICAgICAgbGV0IG1vZGVsID0gZ2V0TW9kZWwobW9kZWxOYW1lKTtcbiAgICAgICAgbGV0IHJlY29yZCA9IG5ldyBtb2RlbChhdHRyaWJ1dGVzKTtcbiAgICAgICAgdGhpcy5kYXRhW21vZGVsTmFtZV1bcmVjb3JkLmlkXSA9IHJlY29yZDtcbiAgICAgICAgcmV0dXJuIHJlY29yZDtcbiAgICB9XG4gICAgZ2V0UmVjb3JkKG1vZGVsTmFtZSkge1xuICAgICAgICBpZiAodGhpcy5kYXRhW21vZGVsTmFtZV0gJiYgT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbbW9kZWxOYW1lXSlbMF0pIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVttb2RlbE5hbWVdKVswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVJlY29yZChtb2RlbE5hbWUsIHt9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmaW5kQWxsKG1vZGVsTmFtZSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbbW9kZWxOYW1lXSk7XG4gICAgfVxuICAgIGZpbmQobW9kZWxOYW1lLCBpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhW21vZGVsTmFtZV1baWRdO1xuICAgIH1cbiAgICBmaW5kQnkobW9kZWxOYW1lLCBoYXNoKSB7XG4gICAgICAgIGxldCByZWNvcmRzID0gT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbbW9kZWxOYW1lXSkuZmlsdGVyKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGsgaW4gaGFzaCkge1xuICAgICAgICAgICAgICAgIGlmIChoYXNoW2tdICE9IHJlY29yZFtrXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVjb3Jkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiByZWNvcmRzWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBmaWx0ZXIobW9kZWxOYW1lLCBoYXNoKSB7XG4gICAgICAgIE9iamVjdC52YWx1ZXModGhpcy5kYXRhW21vZGVsTmFtZV0pLm1hcCgocmVjb3JkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVjb3JkLmhhc0F0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBiZWxvbmdzVG8obW9kZWxOYW1lLCBpZCwgcmVsYXRpb25Nb2RlbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbcmVsYXRpb25Nb2RlbF0pLmZpbHRlcigocmVjb3JkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVjb3JkLmlkID09IGlkO1xuICAgICAgICB9KVswXTtcbiAgICB9XG4gICAgaGFzTWFueShtb2RlbE5hbWUsIGlkLCByZWxhdGlvbk1vZGVsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVtyZWxhdGlvbk1vZGVsXSkuZmlsdGVyKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZWNvcmRbbW9kZWxOYW1lICsgXCJJZFwiXSA9PSBpZDtcbiAgICAgICAgfSk7XG4gICAgfVxufVxubGV0IHN0b3JlID0gbmV3IFN0b3JlKCk7XG5leHBvcnQgZGVmYXVsdCBzdG9yZTtcbiIsIi8vIHRhc2sgdG8gcnVuXG5jbGFzcyBXb3JrZXJUYXNrIHtcbiAgICBjb25zdHJ1Y3RvcihzY3JpcHQsIGNhbGxiYWNrLCBtc2cpe1xuICAgIHRoaXMuc2NyaXB0ID0gc2NyaXB0O1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLnN0YXJ0TWVzc2FnZSA9IG1zZztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXb3JrZXJUYXNrO1xuIiwiLy8gcnVubmVyIHdvcmsgdGFza3MgaW4gdGhlIHBvb2xcbmNsYXNzIFdvcmtlclRocmVhZCB7XG4gICAgY29uc3RydWN0b3IocGFyZW50UG9vbCkge1xuICAgICAgICB0aGlzLnBhcmVudFBvb2wgPSBwYXJlbnRQb29sO1xuICAgICAgICB0aGlzLndvcmtlclRhc2sgPSBudWxsO1xuICAgICAgICB0aGlzLndvcmtlciA9IG51bGw7XG4gICAgfVxuICAgIHJ1bih3b3JrZXJUYXNrKSB7XG4gICAgICAgIGlmKHRoaXMud29ya2VyKXtcbiAgICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndvcmtlclRhc2sgPSB3b3JrZXJUYXNrO1xuICAgICAgICBpZiAodGhpcy53b3JrZXJUYXNrLnNjcmlwdCAhPSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgd29ya2VyID0gbmV3IFdvcmtlcih3b3JrZXJUYXNrLnNjcmlwdCk7IC8vIGNyZWF0ZSBhIG5ldyB3ZWIgd29ya2VyXG4gICAgICAgICAgICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuZHVtbXlDYWxsYmFjay5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2Uod29ya2VyVGFzay5zdGFydE1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXIgPSB3b3JrZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gZm9yIG5vdyBhc3N1bWUgd2Ugb25seSBnZXQgYSBzaW5nbGUgY2FsbGJhY2sgZnJvbSBhIHdvcmtlclxuICAgIC8vIHdoaWNoIGFsc28gaW5kaWNhdGVzIHRoZSBlbmQgb2YgdGhpcyB3b3JrZXIuXG4gICAgZHVtbXlDYWxsYmFjayhldmVudCkge1xuICAgICAgICB0aGlzLndvcmtlclRhc2suY2FsbGJhY2soZXZlbnQpOyAvLyBwYXNzIHRvIG9yaWdpbmFsIGNhbGxiYWNrXG4gICAgICAgIHRoaXMucGFyZW50UG9vbC5mcmVlV29ya2VyVGhyZWFkKHRoaXMpOyAvLyB3ZSBzaG91bGQgdXNlIGEgc2VwZXJhdGUgdGhyZWFkIHRvIGFkZCB0aGUgd29ya2VyXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXb3JrZXJUaHJlYWQ7XG4iLCIvL3RoaXMgdGFrZXMgciwgZyBhbmQgYiB2YWx1ZXMgYW5kIGdlbmVyYXRlIGhleGFkZWNpbWFsIGNvbG9yIGNvZGUuXG5mdW5jdGlvbiBjb21wb25lbnRUb0hleChjKSB7XG4gICAgdmFyIGhleCA9IE1hdGgucm91bmQoYykudG9TdHJpbmcoMTYpO1xuICAgIHJldHVybiBoZXgubGVuZ3RoID09IDEgPyBcIjBcIiArIGhleCA6IGhleDtcbn1cblxuZnVuY3Rpb24gcmdiVG9IZXgociwgZywgYikge1xuICAgIHJldHVybiBcIlwiICsgY29tcG9uZW50VG9IZXgocikgKyBjb21wb25lbnRUb0hleChnKSArIGNvbXBvbmVudFRvSGV4KGIpO1xufVxuXG5leHBvcnQgZGVmYXVsdCByZ2JUb0hleDtcbiJdfQ==
