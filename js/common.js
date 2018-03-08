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
    }

    _createClass(DestinationImageComponent, [{
        key: 'addEvents',
        value: function addEvents() {
            var image = _store2.default.getRecord('mosaicImage');
            this.image = image;
            image.node.addEventListener('load', this.initiateCanvas.bind(this));
            this.setTileRows;
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
                var tileRow = _store2.default.findBy('tileRow', {
                    row: row
                });
                if (!tileRow.rowLoaded) {
                    return;
                }
                this.fillImage(tileRow);
                this.currentRow += 1;
                this.loadImage(row + 1);
            }
        }
        //canvas image is filled with tileRow

    }, {
        key: 'fillImage',
        value: function fillImage(tileRow) {
            var self = this;
            tileRow.tiles.forEach(function (tile) {
                var svgImg = new Image();
                svgImg.onload = function () {
                    self.canvasContext.drawImage(svgImg, tile.column * TILE_WIDTH, tileRow.row * TILE_HEIGHT);
                };
                svgImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(tile.svg);
            });
            //free tile row now!
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
            for (var i = 0; i < this.image.verticalTiles; i++) {
                var tileRow = _store2.default.createRecord('tileRow', {
                    imageId: image.id,
                    row: i
                });
                for (var j = 0; j < this.image.horizontalTiles; j++) {
                    var r = 0,
                        g = 0,
                        b = 0;
                    var imgData = this.canvasContext.getImageData(j * TILE_WIDTH, i * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                    var pix = imgData.data;
                    r = pix[0];
                    g = pix[1];
                    b = pix[2];
                    var tile = _store2.default.createRecord('tile', {
                        tileRowId: tileRow.id,
                        column: j,
                        r: r,
                        g: g,
                        b: b
                    });
                }
                tileRow.processTiles();
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
    }, {
        key: 'tileRow',
        get: function get() {
            return _store2.default.belongsTo('tile', this.tileRowId, 'tileRow');
        }
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
        this.relationships = {
            belongsTo: ['image'],
            hasMany: ['tile']
            //column, imageId
        };Object.assign(this, attributes);
        id++;
    }

    _createClass(TileRow, [{
        key: 'getModelName',
        value: function getModelName() {
            return this._modelName;
        }
    }, {
        key: 'addTileLoadObserver',

        //this fires observer when all the tiles get svg from server.(row wise)
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
    }, {
        key: 'tiles',
        get: function get() {
            return _store2.default.hasMany('tileRow', this.id, 'tile');
        }
    }, {
        key: 'image',
        get: function get() {
            return _store2.default.belongsTo('tileRow', this.imageId, 'image');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcHBsaWNhdGlvbi5qcyIsImpzL2NvbXBvbmVudHMvZGVzdGluYXRpb24taW1hZ2UvY29tcG9uZW50LmpzIiwianMvY29tcG9uZW50cy9kZXN0aW5hdGlvbi1pbWFnZS90ZW1wbGF0ZS5qcyIsImpzL2NvbXBvbmVudHMvaW1hZ2UtdXBsb2FkL2NvbXBvbmVudC5qcyIsImpzL2NvbXBvbmVudHMvaW1hZ2UtdXBsb2FkL3RlbXBsYXRlLmpzIiwianMvY29tcG9uZW50cy9pbmRleC5qcyIsImpzL2NvbXBvbmVudHMvc291cmNlLWltYWdlL2NvbXBvbmVudC5qcyIsImpzL2NvbXBvbmVudHMvc291cmNlLWltYWdlL3RlbXBsYXRlLmpzIiwianMvbW9kZWxzL2luZGV4LmpzIiwianMvbW9kZWxzL21vc2FpY0ltYWdlLmpzIiwianMvbW9kZWxzL3RpbGUuanMiLCJqcy9tb2RlbHMvdGlsZVJvdy5qcyIsImpzL3NlcnZpY2VzL29ic2VydmVyLmpzIiwianMvc2VydmljZXMvcG9vbC5qcyIsImpzL3NlcnZpY2VzL3N0b3JlLmpzIiwianMvc2VydmljZXMvd29ya2VyVGFzay5qcyIsImpzL3NlcnZpY2VzL3dvcmtlclRocmVhZC5qcyIsImpzL3V0aWxzL3JnYlRvSGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNHQTs7Ozs7O0FBQ0EsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsSUFBOUMsRUFBb0QsS0FBcEQsRSxDQUpBO0FBQ0E7QUFDQTs7QUFHQSxTQUFTLElBQVQsR0FBZTtBQUNiLDhCQUFhLE9BQWIsQ0FBcUIsVUFBQyxTQUFELEVBQWU7QUFDbEMsUUFBSSxPQUFPLElBQUksU0FBSixFQUFYO0FBQ0EsU0FBSyxTQUFMO0FBQ0QsR0FIRDtBQUlEOzs7Ozs7Ozs7OztBQ1ZEOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7SUFFTSx5Qjs7OzRCQUNjO0FBQ1os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QUssVUFBTCxDQUFnQixNQUFoQixJQUEwQixJQUE5QixFQUFvQztBQUNoQyxvQkFBSSxTQUFTLElBQUksTUFBSixDQUFXLFdBQVcsTUFBdEIsQ0FBYixDQURnQyxDQUNZO0FBQzVDLHVCQUFPLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLEtBQUssYUFBTCxDQUFtQixJQUFuQixDQUF3QixJQUF4QixDQUFuQyxFQUFrRSxLQUFsRTtBQUNBLHVCQUFPLFdBQVAsQ0FBbUIsV0FBVyxZQUE5QjtBQUNBLHFCQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0g7QUFDSjtBQUNEO0FBQ0E7Ozs7c0NBQ2MsSyxFQUFPO0FBQ2pCLGlCQUFLLFVBQUwsQ0FBZ0IsUUFBaEIsQ0FBeUIsS0FBekIsRUFEaUIsQ0FDZ0I7QUFDakMsaUJBQUssVUFBTCxDQUFnQixnQkFBaEIsQ0FBaUMsSUFBakMsRUFGaUIsQ0FFdUI7QUFDM0M7Ozs7OztrQkFHVSxZOzs7Ozs7OztBQzNCZjtBQUNBLFNBQVMsY0FBVCxDQUF3QixDQUF4QixFQUEyQjtBQUN2QixRQUFJLE1BQU0sS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLFFBQWQsQ0FBdUIsRUFBdkIsQ0FBVjtBQUNBLFdBQU8sSUFBSSxNQUFKLElBQWMsQ0FBZCxHQUFrQixNQUFNLEdBQXhCLEdBQThCLEdBQXJDO0FBQ0g7O0FBRUQsU0FBUyxRQUFULENBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCLENBQXhCLEVBQTJCO0FBQ3ZCLFdBQU8sS0FBSyxlQUFlLENBQWYsQ0FBTCxHQUF5QixlQUFlLENBQWYsQ0FBekIsR0FBNkMsZUFBZSxDQUFmLENBQXBEO0FBQ0g7O2tCQUVjLFEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9Db21wb25lbnRzIGFyZSBpbml0aWF0ZWQgYXMgc29vbiBhcyB0aGUgZG9tIGlzIGxvYWRlZC5cbi8vRWFjaCBlbGVtZW50IHdoaWNoIGhhcyBhIGNvbXBvbmVudCBzaGFsbCBoYXZlIHNhbWUgaWQgYXMgY29tcG9uZW50IG5hbWUuXG4vL1RoZSBjb21wb25lbnQgaGF2ZSB0ZW1wbGF0ZSBhbmQgY29tcG9uZW50LiBXaGVuIGluaXRpYXRlZCwgZXZlbnRzIGFyZSBiaW5kZWQgYWNjb3JkaW5nIHRvIHRoZSBjb21wb25lbnQuXG5pbXBvcnQgY29tcG9uZW50cyBmcm9tICcuL2NvbXBvbmVudHMnO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQsIGZhbHNlKTtcbmZ1bmN0aW9uIGluaXQoKXtcbiAgY29tcG9uZW50cygpLmZvckVhY2goKGNvbXBvbmVudCkgPT4ge1xuICAgIGxldCBjb21wID0gbmV3IGNvbXBvbmVudCgpO1xuICAgIGNvbXAuYWRkRXZlbnRzKCk7XG4gIH0pXG59O1xuIiwiaW1wb3J0IHRlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGUnO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uLy4uL3NlcnZpY2VzL3N0b3JlJztcbmltcG9ydCBPYnNlcnZlck9iaiBmcm9tICcuLi8uLi9zZXJ2aWNlcy9vYnNlcnZlcic7XG5cbmNsYXNzIERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnQge1xuICAgIGdldCB0b3RhbFJvd3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVSb3dzLmxlbmd0aDtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzdGluYXRpb24taW1hZ2VcIikuaW5uZXJIVE1MID0gdGVtcGxhdGUoKTtcbiAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZU9ialsndGlsZVJvd3NDcmVhdGVkJ10gPSBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93c0NyZWF0ZWQnXSB8fCBbXTtcbiAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZU9ialsndGlsZVJvd3NDcmVhdGVkJ10ucHVzaCh7XG4gICAgICAgICAgICBjYWxsYmFjazogdGhpcy5zZXRUaWxlUm93cyxcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY3VycmVudFJvdyA9IDA7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRzKCk7XG4gICAgfVxuICAgIGFkZEV2ZW50cygpIHtcbiAgICAgICAgbGV0IGltYWdlID0gU3RvcmUuZ2V0UmVjb3JkKCdtb3NhaWNJbWFnZScpO1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIGltYWdlLm5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuaW5pdGlhdGVDYW52YXMuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuc2V0VGlsZVJvd3M7XG4gICAgfVxuICAgIGluaXRpYXRlQ2FudmFzKCkge1xuICAgICAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rlc3RpbmF0aW9uJyk7XG4gICAgICAgIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY3R4LmNhbnZhcy53aWR0aCA9IHRoaXMuaW1hZ2Uubm9kZS53aWR0aDtcbiAgICAgICAgY3R4LmNhbnZhcy5oZWlnaHQgPSB0aGlzLmltYWdlLm5vZGUuaGVpZ2h0O1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgdGhpcy5jYW52YXNDb250ZXh0ID0gY3R4O1xuICAgIH1cbiAgICAvL29ic2VydmVyIGFyZSBiaW5kZWQgdG8gd2hlbiB0aGUgdGlsZVJvdyB3aWxsIGhhdmUgbG9hZGVkIHJvd3Mgd2l0aCBzdmcgY29udGVudCBmcm9tIHNlcnZlclxuICAgIHNldFRpbGVSb3dzKCkge1xuICAgICAgICB0aGlzLnRpbGVSb3dzID0gU3RvcmUuZmluZEFsbCgndGlsZVJvdycpO1xuICAgICAgICB0aGlzLnRpbGVSb3dzLmZvckVhY2goKHRpbGVSb3cpID0+IHtcbiAgICAgICAgICAgIE9ic2VydmVyT2JqLmRlcGVuZGFibGVPYmpbJ3RpbGVSb3dMb2FkZWQnICsgdGlsZVJvdy5yb3ddID0gT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZU9ialsndGlsZVJvd0xvYWRlZCcgKyB0aWxlUm93LnJvd10gfHwgW107XG4gICAgICAgICAgICBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93TG9hZGVkJyArIHRpbGVSb3cucm93XS5wdXNoKHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogdGhpcy5sb2FkSW1hZ2UsXG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgICAgICAgICAgICBhcmdzOiB0aWxlUm93LnJvd1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvL2ZpcmVkIHdoZW4gcm93IGlzIGxvYWRlZFxuICAgIC8vdGhpcyBmdW5jdGlvbiBvbmx5IHByb2NlZWVkcyBpZiB0aGUgcm93IHRoYXQgaXMgY29tcGxldGVkIGlzIGVxdWFsIHRvIGN1cnJlbnQgcm93LlxuICAgIC8vY3VycmVudCByb3cgaW5jcmVtZW50cyBzdGVwIHdpc2Ugd2hlbmV2ZXIgdGhlIHRoZSB0aWxlUm93KHdpdGggc2FtZSByb3cgbnVtYmVyKSBpcyByZWNlaXZlZC5cbiAgICAvL2lmIGFueSBvdGhlcihpLmUuIGZ1dHVyZSkgdGlsZVJvdyBpcyByZWNlaXZlZCwgaXQgaXMgaWdub3JlZC5cbiAgICAvL3doZW4gdGlsZVJvdyBpcyByZWNlaXZlZCBtYXRjaGVkIHdpdGggY3VycmVudCB0aWxlIHJvdywgaXQgY2hlY2tzIGZvciB0aGUgc3Vic2VxdWVudCBuZXh0IHJvd3NcbiAgICBsb2FkSW1hZ2Uocm93KSB7XG4gICAgICAgIGlmIChyb3cgPT0gdGhpcy5pbWFnZS52ZXJ0aWNhbFRpbGVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJvdyA9PSB0aGlzLmN1cnJlbnRSb3cpIHtcbiAgICAgICAgICAgIGxldCB0aWxlUm93ID0gU3RvcmUuZmluZEJ5KCd0aWxlUm93Jywge1xuICAgICAgICAgICAgICAgIHJvd1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZighdGlsZVJvdy5yb3dMb2FkZWQpe1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZpbGxJbWFnZSh0aWxlUm93KVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Um93ICs9IDE7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZShyb3cgKyAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL2NhbnZhcyBpbWFnZSBpcyBmaWxsZWQgd2l0aCB0aWxlUm93XG4gICAgZmlsbEltYWdlKHRpbGVSb3cpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aWxlUm93LnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgICAgIHZhciBzdmdJbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIHN2Z0ltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbnZhc0NvbnRleHQuZHJhd0ltYWdlKHN2Z0ltZywgdGlsZS5jb2x1bW4gKiBUSUxFX1dJRFRILCB0aWxlUm93LnJvdyAqIFRJTEVfSEVJR0hUKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN2Z0ltZy5zcmMgPSAnZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsJyArIGVuY29kZVVSSUNvbXBvbmVudCh0aWxlLnN2Zyk7XG4gICAgICAgIH0pO1xuICAgICAgICAvL2ZyZWUgdGlsZSByb3cgbm93IVxuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnQ7XG4iLCJsZXQgdGVtcGxhdGUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gXCI8Y2FudmFzIGlkPSdkZXN0aW5hdGlvbic+PC9jYW52YXM+XCI7XG59XG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZTtcbiIsImltcG9ydCB0ZW1wbGF0ZSBmcm9tICcuL3RlbXBsYXRlJztcbmltcG9ydCBTdG9yZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9zdG9yZSc7XG5jbGFzcyBJbWFnZVVwbG9hZENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW1hZ2UtdXBsb2FkXCIpLmlubmVySFRNTCA9IHRlbXBsYXRlKCk7XG4gICAgfVxuICAgIC8vV2hlbiB0aGUgc3VibWl0IGJ1dHRvbiBpcyBjbGlja2VkLCB0aGUgZmlsZShpZiB1cGxvYWRlZCksIGlzIHVwbG9hZGVkIGluIHNvdXJjZSBpbWFnZSBjYW52YXMuXG4gICAgYWRkRXZlbnRzKCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVwbG9hZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5sb2FkSW1hZ2UpO1xuICAgIH1cblxuICAgIGxvYWRJbWFnZSgpIHtcbiAgICAgICAgdmFyIG1vc2FpY0ltYWdlID0gU3RvcmUuZ2V0UmVjb3JkKCdtb3NhaWNJbWFnZScpO1xuICAgICAgICB2YXIgZmlsZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlXCIpLmZpbGVzO1xuICAgICAgICBpZiAoRmlsZVJlYWRlciAmJiBmaWxlcyAmJiBmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBmciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICBmci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBtb3NhaWNJbWFnZS5ub2RlLnNyYyA9IGZyLnJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZyLm9uZXJyb3IgPSBmdW5jdGlvbihzdHVmZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3JcIiwgc3R1ZmYpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3R1ZmYuZ2V0TWVzc2FnZSgpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnIucmVhZEFzRGF0YVVSTChmaWxlc1swXSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBJbWFnZVVwbG9hZENvbXBvbmVudDtcbiIsInZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBcIjxkaXY+PGxhYmVsIGZvcj0naW1hZ2UnPkNob29zZSBpbWFnZSB0byB1cGxvYWQ8L2xhYmVsPjxpbnB1dCB0eXBlPSdmaWxlJyBpZD0naW1hZ2UnIG5hbWU9J2ltYWdlJyBhY2NlcHQ9J2ltYWdlLyonPjwvZGl2PjxkaXY+PGJ1dHRvbiBpZD0ndXBsb2FkJz5VcGxvYWQ8L2J1dHRvbj48L2Rpdj5cIlxufVxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGU7XG4iLCJpbXBvcnQgRGVzdGluYXRpb25JbWFnZUNvbXBvbmVudCBmcm9tICcuL2Rlc3RpbmF0aW9uLWltYWdlL2NvbXBvbmVudCc7XG5pbXBvcnQgU291cmNlSW1hZ2VDb21wb25lbnQgZnJvbSAnLi9zb3VyY2UtaW1hZ2UvY29tcG9uZW50JztcbmltcG9ydCBJbWFnZVVwbG9hZENvbXBvbmVudCBmcm9tICcuL2ltYWdlLXVwbG9hZC9jb21wb25lbnQnO1xubGV0IGNvbXBvbmVudHMgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gW0ltYWdlVXBsb2FkQ29tcG9uZW50LCBTb3VyY2VJbWFnZUNvbXBvbmVudCwgRGVzdGluYXRpb25JbWFnZUNvbXBvbmVudF07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudHM7XG4iLCJpbXBvcnQgdGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZSc7XG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vLi4vc2VydmljZXMvc3RvcmUnO1xuaW1wb3J0IE9ic2VydmVyT2JqIGZyb20gJy4uLy4uL3NlcnZpY2VzL29ic2VydmVyJztcblxuY2xhc3MgU291cmNlSW1hZ2VDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNvdXJjZS1pbWFnZVwiKS5pbm5lckhUTUwgPSB0ZW1wbGF0ZSgpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50cygpO1xuICAgIH1cbiAgICBhZGRFdmVudHMoKSB7XG4gICAgICAgIGxldCBpbWFnZSA9IFN0b3JlLmdldFJlY29yZCgnbW9zYWljSW1hZ2UnKTtcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICBpbWFnZS5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLmltYWdlTG9hZGVkLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICBpbWFnZUxvYWRlZCgpIHtcbiAgICAgICAgdGhpcy5pbml0aWF0ZUNhbnZhcygpO1xuICAgICAgICB0aGlzLnNsaWNlSW1hZ2UoKTtcbiAgICB9XG4gICAgaW5pdGlhdGVDYW52YXMoKSB7XG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc291cmNlJyk7XG4gICAgICAgIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgbGV0IGltYWdlID0gdGhpcy5pbWFnZTtcbiAgICAgICAgbGV0IGltYWdlV2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICAgICAgbGV0IGltYWdlSGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuICAgICAgICBjdHguY2FudmFzLndpZHRoID0gaW1hZ2VXaWR0aDtcbiAgICAgICAgY3R4LmNhbnZhcy5oZWlnaHQgPSBpbWFnZUhlaWdodDtcbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZS5ub2RlLCAwLCAwKTtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICAgIHRoaXMuY2FudmFzQ29udGV4dCA9IGN0eDtcbiAgICB9XG4gICAgLy9JbWFnZSBpcyBkaXZpZGVkIGludG8gdGlsZXMuIFIsRyxCIHZhbHVlcyBhcmUgY2FsY3VsYXRlZCBmcm9tIHRpbGVzLiBUaWxlIHJlY29yZCBhbmQgdGlsZVJvdyByZWNvcmQgaXMgY3JlYXRlZC4gVGhlIG9ic2VydmVyIGlzIGJpbmRlZCB3aXRoIHJlZmVyZW5jZSB0byB0aWxlUm93IGNyZWF0aW9uIHdoaWNoIHdpbGwgaGludCBEZXN0aW5hdGlvbkltYWdlQ29tcG9uZW50IHRvIHByb2NlZWQgd2l0aCBmdXJ0aGVyIHByb2Nlc3NpbmcuXG4gICAgc2xpY2VJbWFnZSgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmltYWdlLnZlcnRpY2FsVGlsZXM7IGkrKykge1xuICAgICAgICAgICAgbGV0IHRpbGVSb3cgPSBTdG9yZS5jcmVhdGVSZWNvcmQoJ3RpbGVSb3cnLCB7XG4gICAgICAgICAgICAgICAgaW1hZ2VJZDogaW1hZ2UuaWQsXG4gICAgICAgICAgICAgICAgcm93OiBpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuaW1hZ2UuaG9yaXpvbnRhbFRpbGVzOyBqKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgciA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGcgPSAwLFxuICAgICAgICAgICAgICAgICAgICBiID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgaW1nRGF0YSA9IHRoaXMuY2FudmFzQ29udGV4dC5nZXRJbWFnZURhdGEoaiAqIFRJTEVfV0lEVEgsIGkgKiBUSUxFX0hFSUdIVCwgVElMRV9XSURUSCwgVElMRV9IRUlHSFQpO1xuICAgICAgICAgICAgICAgIGxldCBwaXggPSBpbWdEYXRhLmRhdGE7XG4gICAgICAgICAgICAgICAgciA9IHBpeFswXTtcbiAgICAgICAgICAgICAgICBnID0gcGl4WzFdO1xuICAgICAgICAgICAgICAgIGIgPSBwaXhbMl07XG4gICAgICAgICAgICAgICAgbGV0IHRpbGUgPSBTdG9yZS5jcmVhdGVSZWNvcmQoJ3RpbGUnLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpbGVSb3dJZDogdGlsZVJvdy5pZCxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBqLFxuICAgICAgICAgICAgICAgICAgICByOiByLFxuICAgICAgICAgICAgICAgICAgICBnOiBnLFxuICAgICAgICAgICAgICAgICAgICBiOiBiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aWxlUm93LnByb2Nlc3NUaWxlcygpO1xuICAgICAgICB9XG4gICAgICAgIE9ic2VydmVyT2JqLmRlcGVuZGFibGVLZXkgPSAndGlsZVJvd3NDcmVhdGVkJztcbiAgICAgICAgT2JzZXJ2ZXJPYmoudG9nZ2xlVmFsdWUgPSAhT2JzZXJ2ZXJPYmoudG9nZ2xlVmFsdWU7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgU291cmNlSW1hZ2VDb21wb25lbnQ7XG4iLCJsZXQgdGVtcGxhdGUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gXCI8Y2FudmFzIGlkPSdzb3VyY2UnPjwvY2FudmFzPlwiO1xufVxuZXhwb3J0IGRlZmF1bHQgdGVtcGxhdGU7XG4iLCJpbXBvcnQgTW9zYWljSW1hZ2UgZnJvbSAnLi9tb3NhaWNJbWFnZSc7XG5pbXBvcnQgVGlsZSBmcm9tICcuL3RpbGUnO1xuaW1wb3J0IFRpbGVSb3cgZnJvbSAnLi90aWxlUm93JztcbmxldCBtb2RlbHMgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gW01vc2FpY0ltYWdlLCBUaWxlLCBUaWxlUm93XTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbW9kZWxzO1xuIiwiLy9maWxlZHM6IGlkLCBub2RlLCB3aWR0aCwgaGVpZ2h0LCBob3Jpem9udGFsVGlsZXMsIHZlcnRpY2FsVGlsZXNcbmxldCBpZCA9IDE7XG5jbGFzcyBNb3NhaWNJbWFnZXtcbiAgY29uc3RydWN0b3IoKXtcbiAgICB0aGlzLl9tb2RlbE5hbWUgPSBcIm1vc2FpY0ltYWdlXCI7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMubm9kZSA9IG5ldyBJbWFnZSgpO1xuICAgIGlkKys7XG4gIH1cbiAgZ2V0TW9kZWxOYW1lKCl7XG4gICAgcmV0dXJuIHRoaXMuX21vZGVsTmFtZTtcbiAgfVxuICBnZXQgd2lkdGgoKXtcbiAgICByZXR1cm4gdGhpcy5ub2RlLndpZHRoO1xuICB9XG4gIGdldCBoZWlnaHQoKXtcbiAgICByZXR1cm4gdGhpcy5ub2RlLmhlaWdodDtcbiAgfVxuICBnZXQgaG9yaXpvbnRhbFRpbGVzKCl7XG4gICAgbGV0IHdpZHRoID0gdGhpcy53aWR0aDtcbiAgICBsZXQgdGlsZVdpZHRoID0gVElMRV9XSURUSDtcbiAgICByZXR1cm4gTWF0aC5jZWlsKHdpZHRoL3RpbGVXaWR0aCk7XG4gIH1cbiAgZ2V0IHZlcnRpY2FsVGlsZXMoKXtcbiAgICBsZXQgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgbGV0IHRpbGVIZWlnaHQgPSBUSUxFX0hFSUdIVDtcbiAgICByZXR1cm4gTWF0aC5jZWlsKGhlaWdodC90aWxlSGVpZ2h0KTtcbiAgfVxufVxuTW9zYWljSW1hZ2UubW9kZWxOYW1lID0gXCJtb3NhaWNJbWFnZVwiO1xuZXhwb3J0IGRlZmF1bHQgTW9zYWljSW1hZ2U7XG4iLCIvL2ZpZWxkczogaWQsIHRpbGVSb3csIGltYWdlLCByb3csIGNvbHVtbiwgciwgZywgYiwgaGV4Q29kZSwgc3ZnU3RyaW5nXG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vc2VydmljZXMvc3RvcmUnO1xuaW1wb3J0IHJnYlRvSGV4IGZyb20gJy4uL3V0aWxzL3JnYlRvSGV4JztcbmltcG9ydCBQb29sIGZyb20gJy4uL3NlcnZpY2VzL3Bvb2wnO1xuXG5sZXQgaWQgPSAxXG5jbGFzcyBUaWxlIHtcbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5fbW9kZWxOYW1lID0gXCJ0aWxlXCI7XG4gICAgICAgIC8vdGlsZVJvd0lkLCBjb2x1bW4sIHIsIGcsIGJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgaWQrKztcbiAgICB9XG4gICAgZ2V0TW9kZWxOYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kZWxOYW1lO1xuICAgIH1cbiAgICBnZXQgdGlsZVJvdygpIHtcbiAgICAgICAgcmV0dXJuIFN0b3JlLmJlbG9uZ3NUbygndGlsZScsIHRoaXMudGlsZVJvd0lkLCAndGlsZVJvdycpO1xuICAgIH1cbiAgICBnZXQgaW1hZ2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVSb3cuaW1hZ2U7XG4gICAgfVxuICAgIGdldCByb3coKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVSb3cucm93O1xuICAgIH1cbiAgICBnZXQgaGV4Q29kZSgpIHtcbiAgICAgICAgcmV0dXJuIHJnYlRvSGV4KHRoaXMuciwgdGhpcy5nLCB0aGlzLmIpO1xuICAgIH1cbn1cblRpbGUubW9kZWxOYW1lID0gXCJ0aWxlXCI7XG5leHBvcnQgZGVmYXVsdCBUaWxlO1xuIiwiLy9wcm9wZXJ0aWVzOiBpZCwgY29sdW1uLCBpbWFnZSwgdGlsZXNcbmltcG9ydCBPYnNlcnZlck9iaiBmcm9tICcuLi9zZXJ2aWNlcy9vYnNlcnZlcic7XG5pbXBvcnQgU3RvcmUgZnJvbSAnLi4vc2VydmljZXMvc3RvcmUnO1xuaW1wb3J0IFBvb2wgZnJvbSAnLi4vc2VydmljZXMvcG9vbCc7XG5cbmxldCBpZCA9IDE7XG5jbGFzcyBUaWxlUm93IHtcbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRoaXMuX21vZGVsTmFtZSA9IFwidGlsZVwiO1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMucmVsYXRpb25zaGlwcyA9IHtcbiAgICAgICAgICAgIGJlbG9uZ3NUbzogWydpbWFnZSddLFxuICAgICAgICAgICAgaGFzTWFueTogWyd0aWxlJ11cbiAgICAgICAgfVxuICAgICAgICAvL2NvbHVtbiwgaW1hZ2VJZFxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIGF0dHJpYnV0ZXMpO1xuICAgICAgICBpZCsrO1xuICAgIH1cbiAgICBnZXRNb2RlbE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RlbE5hbWU7XG4gICAgfVxuICAgIGdldCB0aWxlcygpIHtcbiAgICAgICAgcmV0dXJuIFN0b3JlLmhhc01hbnkoJ3RpbGVSb3cnLCB0aGlzLmlkLCAndGlsZScpO1xuICAgIH1cbiAgICBnZXQgaW1hZ2UoKSB7XG4gICAgICAgIHJldHVybiBTdG9yZS5iZWxvbmdzVG8oJ3RpbGVSb3cnLCB0aGlzLmltYWdlSWQsICdpbWFnZScpO1xuICAgIH1cbiAgICAvL3RoaXMgZmlyZXMgb2JzZXJ2ZXIgd2hlbiBhbGwgdGhlIHRpbGVzIGdldCBzdmcgZnJvbSBzZXJ2ZXIuKHJvdyB3aXNlKVxuICAgIGFkZFRpbGVMb2FkT2JzZXJ2ZXIoKSB7XG4gICAgICAgIHRoaXMucm93TG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZUtleSA9ICd0aWxlUm93TG9hZGVkJyArIHRoaXMucm93O1xuICAgICAgICBPYnNlcnZlck9iai50b2dnbGVWYWx1ZSA9ICFPYnNlcnZlck9iai50b2dnbGVWYWx1ZTtcbiAgICB9XG4gICAgc2V0VGlsZVN2Zyh0aWxlc0Fycikge1xuICAgICAgICB0aWxlc0Fyci5mb3JFYWNoKCh0aWxlSGFzaCkgPT4ge1xuICAgICAgICAgICAgbGV0IGlkID0gT2JqZWN0LmtleXModGlsZUhhc2gpWzBdO1xuICAgICAgICAgICAgbGV0IHN2ZyA9IHRpbGVIYXNoW2lkXTtcbiAgICAgICAgICAgIFN0b3JlLmZpbmQoJ3RpbGUnLCBpZCkuc3ZnID0gc3ZnO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJvY2Vzc1RpbGVzQ2FsbGJhY2soZXZlbnQpIHtcbiAgICAgICAgbGV0IHRpbGVzQXJyID0gZXZlbnQuZGF0YTtcbiAgICAgICAgdGhpcy5zZXRUaWxlU3ZnKHRpbGVzQXJyKTtcbiAgICAgICAgdGhpcy5hZGRUaWxlTG9hZE9ic2VydmVyKCk7XG4gICAgfVxuICAgIHByb2Nlc3NUaWxlcygpIHtcbiAgICAgICAgbGV0IHRpbGVBcnIgPSBbXTtcbiAgICAgICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgICAgICBsZXQgdGlsZUhhc2ggPSB7fTtcbiAgICAgICAgICAgIHRpbGVIYXNoW3RpbGUuaWRdID0gdGlsZS5oZXhDb2RlO1xuICAgICAgICAgICAgdGlsZUFyci5wdXNoKHRpbGVIYXNoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFBvb2wuYWRkV29ya2VyVGFzaygnLi4vanMvd29ya2Vycy9sb2FkQ29udGVudC5qcycsIHRoaXMucHJvY2Vzc1RpbGVzQ2FsbGJhY2suYmluZCh0aGlzKSwgSlNPTi5zdHJpbmdpZnkodGlsZUFycikpO1xuICAgIH1cbn1cblRpbGVSb3cubW9kZWxOYW1lID0gXCJ0aWxlUm93XCI7XG5leHBvcnQgZGVmYXVsdCBUaWxlUm93O1xuIiwiLy9UaGlzIGlzIG9ic2VydmVyIGltcGxlbWVudGF0aW9uLlxuLy9PYnNlcnZlciBpcyBmaXJlZCB3aGVuIHRvZ2dsZVZhbHVlIGlzIHNldFxuLy93aGVuZXZlciB0b2dnbGVWYWx1ZSBpcyBzZXQsIGl0IGNoZWNrcyBmb3IgdGhlIHZhbHVlIGluc2lkZSBkZXBlbmRhYmxlS2V5LlxuLy9kZXBlbmRhYmxlT2JqIGNvbnNpc3RzIG9mIGtleXMgYW5kIHZhbHVlcyB3aGVyZSBrZXlzIGFyZSBkZXBlbmRhYmxlS2V5cyB3aGljaCBndWlkZXMgd2hpY2ggb2JzZXJ2ZXIgdG8gZmlyZSBhbmQgdmFsdWUgaXMgYW4gYXJyYXkuIEVhY2ggZWxlbWVudCBvZiBhcnJheSBpcyBhbiBvYmplY3Qgd2hpY2ggaGF2ZSB0aHJlZSB2YWx1ZXM6IGNhbGxiYWNrIGZ1bmN0aW9uLCBjb250ZXh0LCBhcmd1bWVudHMuXG5sZXQgT2JzZXJ2ZXJPYmogPSBuZXcgUHJveHkoe1xuICB0b2dnbGVWYWx1ZTogZmFsc2UsXG4gIGRlcGVuZGFibGVLZXk6IG51bGwsXG4gIGRlcGVuZGFibGVPYmo6IHt9LFxuICB0b2dnbGVQcm9wZXJ0eSgpe1xuICAgIHRoaXMudG9nZ2xlVmFsdWUgPSAhdGhpcy50b2dnbGVWYWx1ZTtcbiAgfVxufSwge1xuICBzZXQodGFyZ2V0LCBrZXksIHZhbHVlKXtcbiAgICB0YXJnZXRba2V5XSA9IHZhbHVlO1xuICAgIGlmKGtleT09XCJ0b2dnbGVWYWx1ZVwiKXtcbiAgICAgIGZvcih2YXIgayBpbiB0YXJnZXQuZGVwZW5kYWJsZU9iail7XG4gICAgICAgIGlmKGs9PXRhcmdldC5kZXBlbmRhYmxlS2V5KXtcbiAgICAgICAgICBsZXQgZGVwZW5kYWJsZXMgPSB0YXJnZXQuZGVwZW5kYWJsZU9ialtrXTtcbiAgICAgICAgICBkZXBlbmRhYmxlcy5mb3JFYWNoKChkZXBlbmRhYmxlKSA9PiB7XG4gICAgICAgICAgICBkZXBlbmRhYmxlLmNhbGxiYWNrLmNhbGwoZGVwZW5kYWJsZS5jb250ZXh0LCBkZXBlbmRhYmxlLmFyZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59KTtcbmV4cG9ydCBkZWZhdWx0IE9ic2VydmVyT2JqO1xuIiwiaW1wb3J0IFdvcmtlclRocmVhZCBmcm9tICcuL3dvcmtlclRocmVhZCc7XG5pbXBvcnQgV29ya2VyVGFzayBmcm9tICcuL3dvcmtlclRhc2snO1xuXG5sZXQgaW5zdGFuY2UgPSBudWxsO1xuY2xhc3MgUG9vbCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGluc3RhbmNlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMudGFza1F1ZXVlID0gW107IC8vdGFza3MgcXVldWVcbiAgICAgICAgICAgIHRoaXMud29ya2VyUXVldWUgPSBbXTsgLy93b3JrZXJzIHF1ZXVlXG4gICAgICAgICAgICB0aGlzLnBvb2xTaXplID0gbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgfHwgNDsgLy9zZXQgcG9vbCBzaXplIGVxdWFsIHRvIG5vIG9mIGNvcmVzLCBpZiBuYXZpZ2F0b3Igb2JqZWN0IGF2YWlsYWJsZSBvciA0LlxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9XG4gICAgY3JlYXRlV29ya2VyVGFzayhzY3JpcHQsIGNhbGxiYWNrLCBtc2cpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBXb3JrZXJUYXNrKHNjcmlwdCwgY2FsbGJhY2ssIG1zZyk7XG4gICAgfVxuICAgIGFkZFdvcmtlclRhc2soc2NyaXB0LCBjYWxsYmFjaywgbXNnKSB7XG4gICAgICAgIGxldCB3b3JrZXJUYXNrID0gdGhpcy5jcmVhdGVXb3JrZXJUYXNrKHNjcmlwdCwgY2FsbGJhY2ssIG1zZyk7XG4gICAgICAgIGlmICh0aGlzLndvcmtlclF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciB3b3JrZXJUaHJlYWQgPSB0aGlzLndvcmtlclF1ZXVlLnNoaWZ0KCk7IC8vIGdldCB0aGUgd29ya2VyIGZyb20gdGhlIGZyb250IG9mIHRoZSBxdWV1ZVxuICAgICAgICAgICAgd29ya2VyVGhyZWFkLnJ1bih3b3JrZXJUYXNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGFza1F1ZXVlLnB1c2god29ya2VyVGFzayk7IC8vIG5vIGZyZWUgd29ya2Vyc1xuICAgICAgICB9XG4gICAgfVxuICAgIGluaXQoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wb29sU2l6ZTsgaSsrKSB7IC8vIGNyZWF0ZSAncG9vbFNpemUnIG51bWJlciBvZiB3b3JrZXIgdGhyZWFkc1xuICAgICAgICAgICAgdGhpcy53b3JrZXJRdWV1ZS5wdXNoKG5ldyBXb3JrZXJUaHJlYWQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBmcmVlV29ya2VyVGhyZWFkKHdvcmtlclRocmVhZCkge1xuICAgICAgICBpZiAodGhpcy50YXNrUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIHdvcmtlclRhc2sgPSB0aGlzLnRhc2tRdWV1ZS5zaGlmdCgpOyAvLyBkb24ndCBwdXQgYmFjayBpbiBxdWV1ZSwgYnV0IGV4ZWN1dGUgbmV4dCB0YXNrXG4gICAgICAgICAgICB3b3JrZXJUaHJlYWQucnVuKHdvcmtlclRhc2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd29ya2VyVGhyZWFkLndvcmtlci50ZXJtaW5hdGUoKTsgLy90ZXJtaW5hdGUgd29ya2VyIGlmIG5vIHRhc2sgYXQgaGFuZFxuICAgICAgICAgICAgdGhpcy53b3JrZXJRdWV1ZS51bnNoaWZ0KHdvcmtlclRocmVhZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmxldCBwb29sID0gKG5ldyBQb29sKCkpLmluaXQoKTtcbmV4cG9ydCBkZWZhdWx0IHBvb2w7XG4iLCIvL3RoaXMgaXMgZGF0YSBzdG9yZSBpbXBsZW1lbnRhdGlvbi4gU3RvcmUgaXMgYSBzaW5nbGV0b24gY2xhc3Ncbi8vdGhlIHZhbHVlcyBhcmUgc3RvcmVkIGluIGRhdGEuIGFuZCBpdCBoYXMgY29tbW9uIGZ1bmN0aW9ucyBsaWtlIGNyZWF0ZVJlY29yZCwgZmluZEFsbCwgZmluZEJ5LCBmaW5kLCBnZXRSZWNvcmQsIHJlbGF0aW9uc2hpcHMoaGFzTWFueSwgYmVsb25nc1RvKVxuaW1wb3J0IG1vZGVscyBmcm9tICcuLi9tb2RlbHMnO1xuXG5sZXQgZ2V0TW9kZWwgPSBmdW5jdGlvbihtb2RlbE5hbWUpIHtcbiAgICBsZXQgcmVmZXJyZWRNb2RlbDtcbiAgICBtb2RlbHMoKS5mb3JFYWNoKChtb2RlbCkgPT4ge1xuICAgICAgICBpZiAobW9kZWwubW9kZWxOYW1lID09IG1vZGVsTmFtZSkge1xuICAgICAgICAgICAgcmVmZXJyZWRNb2RlbCA9IG1vZGVsO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHJlZmVycmVkTW9kZWwpIHtcbiAgICAgICAgcmV0dXJuIHJlZmVycmVkTW9kZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy90aHJvdyBlcnJvciBzYXlpbmcgd3JvbmcgbW9kZWwgbmFtZSBwYXNzZWRcbiAgICB9XG59XG5sZXQgaW5zdGFuY2UgPSBudWxsO1xuY2xhc3MgU3RvcmUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfVxuICAgIGNyZWF0ZVJlY29yZChtb2RlbE5hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGhpcy5kYXRhW21vZGVsTmFtZV0gPSB0aGlzLmRhdGFbbW9kZWxOYW1lXSB8fCB7fTtcbiAgICAgICAgbGV0IG1vZGVsID0gZ2V0TW9kZWwobW9kZWxOYW1lKTtcbiAgICAgICAgbGV0IHJlY29yZCA9IG5ldyBtb2RlbChhdHRyaWJ1dGVzKTtcbiAgICAgICAgdGhpcy5kYXRhW21vZGVsTmFtZV1bcmVjb3JkLmlkXSA9IHJlY29yZDtcbiAgICAgICAgcmV0dXJuIHJlY29yZDtcbiAgICB9XG4gICAgZ2V0UmVjb3JkKG1vZGVsTmFtZSkge1xuICAgICAgICBpZiAodGhpcy5kYXRhW21vZGVsTmFtZV0gJiYgT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbbW9kZWxOYW1lXSlbMF0pIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVttb2RlbE5hbWVdKVswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVJlY29yZChtb2RlbE5hbWUsIHt9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmaW5kQWxsKG1vZGVsTmFtZSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbbW9kZWxOYW1lXSk7XG4gICAgfVxuICAgIGZpbmQobW9kZWxOYW1lLCBpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhW21vZGVsTmFtZV1baWRdO1xuICAgIH1cbiAgICBmaW5kQnkobW9kZWxOYW1lLCBoYXNoKSB7XG4gICAgICAgIGxldCByZWNvcmRzID0gT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbbW9kZWxOYW1lXSkuZmlsdGVyKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGsgaW4gaGFzaCkge1xuICAgICAgICAgICAgICAgIGlmIChoYXNoW2tdICE9IHJlY29yZFtrXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVjb3Jkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiByZWNvcmRzWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBmaWx0ZXIobW9kZWxOYW1lLCBoYXNoKSB7XG4gICAgICAgIE9iamVjdC52YWx1ZXModGhpcy5kYXRhW21vZGVsTmFtZV0pLm1hcCgocmVjb3JkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVjb3JkLmhhc0F0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBiZWxvbmdzVG8obW9kZWxOYW1lLCBpZCwgcmVsYXRpb25Nb2RlbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbcmVsYXRpb25Nb2RlbF0pLmZpbHRlcigocmVjb3JkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVjb3JkLmlkID09IGlkO1xuICAgICAgICB9KVswXTtcbiAgICB9XG4gICAgaGFzTWFueShtb2RlbE5hbWUsIGlkLCByZWxhdGlvbk1vZGVsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVtyZWxhdGlvbk1vZGVsXSkuZmlsdGVyKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZWNvcmRbbW9kZWxOYW1lICsgXCJJZFwiXSA9PSBpZDtcbiAgICAgICAgfSk7XG4gICAgfVxufVxubGV0IHN0b3JlID0gbmV3IFN0b3JlKCk7XG5leHBvcnQgZGVmYXVsdCBzdG9yZTtcbiIsIi8vIHRhc2sgdG8gcnVuXG5jbGFzcyBXb3JrZXJUYXNrIHtcbiAgICBjb25zdHJ1Y3RvcihzY3JpcHQsIGNhbGxiYWNrLCBtc2cpe1xuICAgIHRoaXMuc2NyaXB0ID0gc2NyaXB0O1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLnN0YXJ0TWVzc2FnZSA9IG1zZztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXb3JrZXJUYXNrO1xuIiwiLy8gcnVubmVyIHdvcmsgdGFza3MgaW4gdGhlIHBvb2xcbmNsYXNzIFdvcmtlclRocmVhZCB7XG4gICAgY29uc3RydWN0b3IocGFyZW50UG9vbCkge1xuICAgICAgICB0aGlzLnBhcmVudFBvb2wgPSBwYXJlbnRQb29sO1xuICAgICAgICB0aGlzLndvcmtlclRhc2sgPSBudWxsO1xuICAgICAgICB0aGlzLndvcmtlciA9IG51bGw7XG4gICAgfVxuICAgIHJ1bih3b3JrZXJUYXNrKSB7XG4gICAgICAgIGlmKHRoaXMud29ya2VyKXtcbiAgICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndvcmtlclRhc2sgPSB3b3JrZXJUYXNrO1xuICAgICAgICBpZiAodGhpcy53b3JrZXJUYXNrLnNjcmlwdCAhPSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgd29ya2VyID0gbmV3IFdvcmtlcih3b3JrZXJUYXNrLnNjcmlwdCk7IC8vIGNyZWF0ZSBhIG5ldyB3ZWIgd29ya2VyXG4gICAgICAgICAgICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuZHVtbXlDYWxsYmFjay5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2Uod29ya2VyVGFzay5zdGFydE1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXIgPSB3b3JrZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gZm9yIG5vdyBhc3N1bWUgd2Ugb25seSBnZXQgYSBzaW5nbGUgY2FsbGJhY2sgZnJvbSBhIHdvcmtlclxuICAgIC8vIHdoaWNoIGFsc28gaW5kaWNhdGVzIHRoZSBlbmQgb2YgdGhpcyB3b3JrZXIuXG4gICAgZHVtbXlDYWxsYmFjayhldmVudCkge1xuICAgICAgICB0aGlzLndvcmtlclRhc2suY2FsbGJhY2soZXZlbnQpOyAvLyBwYXNzIHRvIG9yaWdpbmFsIGNhbGxiYWNrXG4gICAgICAgIHRoaXMucGFyZW50UG9vbC5mcmVlV29ya2VyVGhyZWFkKHRoaXMpOyAvLyB3ZSBzaG91bGQgdXNlIGEgc2VwZXJhdGUgdGhyZWFkIHRvIGFkZCB0aGUgd29ya2VyXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXb3JrZXJUaHJlYWQ7XG4iLCIvL3RoaXMgdGFrZXMgciwgZyBhbmQgYiB2YWx1ZXMgYW5kIGdlbmVyYXRlIGhleGFkZWNpbWFsIGNvbG9yIGNvZGUuXG5mdW5jdGlvbiBjb21wb25lbnRUb0hleChjKSB7XG4gICAgdmFyIGhleCA9IE1hdGgucm91bmQoYykudG9TdHJpbmcoMTYpO1xuICAgIHJldHVybiBoZXgubGVuZ3RoID09IDEgPyBcIjBcIiArIGhleCA6IGhleDtcbn1cblxuZnVuY3Rpb24gcmdiVG9IZXgociwgZywgYikge1xuICAgIHJldHVybiBcIlwiICsgY29tcG9uZW50VG9IZXgocikgKyBjb21wb25lbnRUb0hleChnKSArIGNvbXBvbmVudFRvSGV4KGIpO1xufVxuXG5leHBvcnQgZGVmYXVsdCByZ2JUb0hleDtcbiJdfQ==
