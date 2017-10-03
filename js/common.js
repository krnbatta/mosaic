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
    new component();
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
        this.addEvents();
    }
    //When the submit button is clicked, the file(if uploaded), is uploaded in source image canvas.


    _createClass(ImageUploadComponent, [{
        key: 'addEvents',
        value: function addEvents() {
            document.getElementById("upload").addEventListener("click", function (evt) {
                var image = _store2.default.getRecord('mosaicImage');
                var files = document.getElementById("image").files;
                if (FileReader && files && files.length) {
                    var fr = new FileReader();
                    fr.onload = function () {
                        image.node.src = fr.result;
                    };
                    fr.onerror = function (stuff) {
                        console.log("error", stuff);
                        console.log(stuff.getMessage());
                    };
                    fr.readAsDataURL(files[0]);
                }
            });
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
  return "<div><label for='image'>Choose image to upload</label><input type='file' id='image' name='image'accept='image/*'></div><div><button id='upload'>Upload</button></div>";
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
                this.taskQueue.push(workerThread);
            }
        }
    }]);

    return Pool;
}();

var pool = new Pool().init();
window.pool = pool;
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
        this.workerTask = {};
    }

    _createClass(WorkerThread, [{
        key: 'run',
        value: function run(workerTask) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcHBsaWNhdGlvbi5qcyIsImpzL2NvbXBvbmVudHMvZGVzdGluYXRpb24taW1hZ2UvY29tcG9uZW50LmpzIiwianMvY29tcG9uZW50cy9kZXN0aW5hdGlvbi1pbWFnZS90ZW1wbGF0ZS5qcyIsImpzL2NvbXBvbmVudHMvaW1hZ2UtdXBsb2FkL2NvbXBvbmVudC5qcyIsImpzL2NvbXBvbmVudHMvaW1hZ2UtdXBsb2FkL3RlbXBsYXRlLmpzIiwianMvY29tcG9uZW50cy9pbmRleC5qcyIsImpzL2NvbXBvbmVudHMvc291cmNlLWltYWdlL2NvbXBvbmVudC5qcyIsImpzL2NvbXBvbmVudHMvc291cmNlLWltYWdlL3RlbXBsYXRlLmpzIiwianMvbW9kZWxzL2luZGV4LmpzIiwianMvbW9kZWxzL21vc2FpY0ltYWdlLmpzIiwianMvbW9kZWxzL3RpbGUuanMiLCJqcy9tb2RlbHMvdGlsZVJvdy5qcyIsImpzL3NlcnZpY2VzL29ic2VydmVyLmpzIiwianMvc2VydmljZXMvcG9vbC5qcyIsImpzL3NlcnZpY2VzL3N0b3JlLmpzIiwianMvc2VydmljZXMvd29ya2VyVGFzay5qcyIsImpzL3NlcnZpY2VzL3dvcmtlclRocmVhZC5qcyIsImpzL3V0aWxzL3JnYlRvSGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNHQTs7Ozs7O0FBQ0EsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsSUFBOUMsRUFBb0QsS0FBcEQsRSxDQUpBO0FBQ0E7QUFDQTs7QUFHQSxTQUFTLElBQVQsR0FBZTtBQUNiLDhCQUFhLE9BQWIsQ0FBcUIsVUFBQyxTQUFELEVBQWU7QUFDbEMsUUFBSSxTQUFKO0FBQ0QsR0FGRDtBQUdEOzs7Ozs7Ozs7OztBQ1REOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7SUFFTSx5Qjs7OzRCQUNjO0FBQ1osbUJBQU8sS0FBSyxRQUFMLENBQWMsTUFBckI7QUFD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LENBQWIsQ0FEZ0MsQ0FDWTtBQUM1Qyx1QkFBTyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxLQUFLLGFBQUwsQ0FBbUIsSUFBbkIsQ0FBd0IsSUFBeEIsQ0FBbkMsRUFBa0UsS0FBbEU7QUFDQSx1QkFBTyxXQUFQLENBQW1CLFdBQVcsWUFBOUI7QUFDQSxxQkFBSyxNQUFMLEdBQWMsTUFBZDtBQUNIO0FBQ0o7QUFDRDtBQUNBOzs7O3NDQUNjLEssRUFBTztBQUNqQixpQkFBSyxVQUFMLENBQWdCLFFBQWhCLENBQXlCLEtBQXpCLEVBRGlCLENBQ2dCO0FBQ2pDLGlCQUFLLFVBQUwsQ0FBZ0IsZ0JBQWhCLENBQWlDLElBQWpDLEVBRmlCLENBRXVCO0FBQzNDOzs7Ozs7a0JBR1UsWTs7Ozs7Ozs7QUN2QmY7QUFDQSxTQUFTLGNBQVQsQ0FBd0IsQ0FBeEIsRUFBMkI7QUFDdkIsUUFBSSxNQUFNLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxRQUFkLENBQXVCLEVBQXZCLENBQVY7QUFDQSxXQUFPLElBQUksTUFBSixJQUFjLENBQWQsR0FBa0IsTUFBTSxHQUF4QixHQUE4QixHQUFyQztBQUNIOztBQUVELFNBQVMsUUFBVCxDQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixDQUF4QixFQUEyQjtBQUN2QixXQUFPLEtBQUssZUFBZSxDQUFmLENBQUwsR0FBeUIsZUFBZSxDQUFmLENBQXpCLEdBQTZDLGVBQWUsQ0FBZixDQUFwRDtBQUNIOztrQkFFYyxRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vQ29tcG9uZW50cyBhcmUgaW5pdGlhdGVkIGFzIHNvb24gYXMgdGhlIGRvbSBpcyBsb2FkZWQuXG4vL0VhY2ggZWxlbWVudCB3aGljaCBoYXMgYSBjb21wb25lbnQgc2hhbGwgaGF2ZSBzYW1lIGlkIGFzIGNvbXBvbmVudCBuYW1lLlxuLy9UaGUgY29tcG9uZW50IGhhdmUgdGVtcGxhdGUgYW5kIGNvbXBvbmVudC4gV2hlbiBpbml0aWF0ZWQsIGV2ZW50cyBhcmUgYmluZGVkIGFjY29yZGluZyB0byB0aGUgY29tcG9uZW50LlxuaW1wb3J0IGNvbXBvbmVudHMgZnJvbSAnLi9jb21wb25lbnRzJztcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0LCBmYWxzZSk7XG5mdW5jdGlvbiBpbml0KCl7XG4gIGNvbXBvbmVudHMoKS5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcbiAgICBuZXcgY29tcG9uZW50KCk7XG4gIH0pXG59O1xuIiwiaW1wb3J0IHRlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGUnO1xuaW1wb3J0IFN0b3JlIGZyb20gJy4uLy4uL3NlcnZpY2VzL3N0b3JlJztcbmltcG9ydCBPYnNlcnZlck9iaiBmcm9tICcuLi8uLi9zZXJ2aWNlcy9vYnNlcnZlcic7XG5cbmNsYXNzIERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnQge1xuICAgIGdldCB0b3RhbFJvd3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVSb3dzLmxlbmd0aDtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzdGluYXRpb24taW1hZ2VcIikuaW5uZXJIVE1MID0gdGVtcGxhdGUoKTtcbiAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZU9ialsndGlsZVJvd3NDcmVhdGVkJ10gPSBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93c0NyZWF0ZWQnXSB8fCBbXTtcbiAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZU9ialsndGlsZVJvd3NDcmVhdGVkJ10ucHVzaCh7XG4gICAgICAgICAgICBjYWxsYmFjazogdGhpcy5zZXRUaWxlUm93cyxcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY3VycmVudFJvdyA9IDA7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRzKCk7XG4gICAgfVxuICAgIGFkZEV2ZW50cygpIHtcbiAgICAgICAgbGV0IGltYWdlID0gU3RvcmUuZ2V0UmVjb3JkKCdtb3NhaWNJbWFnZScpO1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIGltYWdlLm5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuaW5pdGlhdGVDYW52YXMuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuc2V0VGlsZVJvd3M7XG4gICAgfVxuICAgIGluaXRpYXRlQ2FudmFzKCkge1xuICAgICAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rlc3RpbmF0aW9uJyk7XG4gICAgICAgIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY3R4LmNhbnZhcy53aWR0aCA9IHRoaXMuaW1hZ2Uubm9kZS53aWR0aDtcbiAgICAgICAgY3R4LmNhbnZhcy5oZWlnaHQgPSB0aGlzLmltYWdlLm5vZGUuaGVpZ2h0O1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgdGhpcy5jYW52YXNDb250ZXh0ID0gY3R4O1xuICAgIH1cbiAgICAvL29ic2VydmVyIGFyZSBiaW5kZWQgdG8gd2hlbiB0aGUgdGlsZVJvdyB3aWxsIGhhdmUgbG9hZGVkIHJvd3Mgd2l0aCBzdmcgY29udGVudCBmcm9tIHNlcnZlclxuICAgIHNldFRpbGVSb3dzKCkge1xuICAgICAgICB0aGlzLnRpbGVSb3dzID0gU3RvcmUuZmluZEFsbCgndGlsZVJvdycpO1xuICAgICAgICB0aGlzLnRpbGVSb3dzLmZvckVhY2goKHRpbGVSb3cpID0+IHtcbiAgICAgICAgICAgIE9ic2VydmVyT2JqLmRlcGVuZGFibGVPYmpbJ3RpbGVSb3dMb2FkZWQnICsgdGlsZVJvdy5yb3ddID0gT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZU9ialsndGlsZVJvd0xvYWRlZCcgKyB0aWxlUm93LnJvd10gfHwgW107XG4gICAgICAgICAgICBPYnNlcnZlck9iai5kZXBlbmRhYmxlT2JqWyd0aWxlUm93TG9hZGVkJyArIHRpbGVSb3cucm93XS5wdXNoKHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogdGhpcy5sb2FkSW1hZ2UsXG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgICAgICAgICAgICBhcmdzOiB0aWxlUm93LnJvd1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvL2ZpcmVkIHdoZW4gcm93IGlzIGxvYWRlZFxuICAgIC8vdGhpcyBmdW5jdGlvbiBvbmx5IHByb2NlZWVkcyBpZiB0aGUgcm93IHRoYXQgaXMgY29tcGxldGVkIGlzIGVxdWFsIHRvIGN1cnJlbnQgcm93LlxuICAgIC8vY3VycmVudCByb3cgaW5jcmVtZW50cyBzdGVwIHdpc2Ugd2hlbmV2ZXIgdGhlIHRoZSB0aWxlUm93KHdpdGggc2FtZSByb3cgbnVtYmVyKSBpcyByZWNlaXZlZC5cbiAgICAvL2lmIGFueSBvdGhlcihpLmUuIGZ1dHVyZSkgdGlsZVJvdyBpcyByZWNlaXZlZCwgaXQgaXMgaWdub3JlZC5cbiAgICAvL3doZW4gdGlsZVJvdyBpcyByZWNlaXZlZCBtYXRjaGVkIHdpdGggY3VycmVudCB0aWxlIHJvdywgaXQgY2hlY2tzIGZvciB0aGUgc3Vic2VxdWVudCBuZXh0IHJvd3NcbiAgICBsb2FkSW1hZ2Uocm93KSB7XG4gICAgICAgIGlmIChyb3cgPT0gdGhpcy5pbWFnZS52ZXJ0aWNhbFRpbGVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJvdyA9PSB0aGlzLmN1cnJlbnRSb3cpIHtcbiAgICAgICAgICAgIGxldCB0aWxlUm93ID0gU3RvcmUuZmluZEJ5KCd0aWxlUm93Jywge1xuICAgICAgICAgICAgICAgIHJvd1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZighdGlsZVJvdy5yb3dMb2FkZWQpe1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZpbGxJbWFnZSh0aWxlUm93KVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Um93ICs9IDE7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZShyb3cgKyAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL2NhbnZhcyBpbWFnZSBpcyBmaWxsZWQgd2l0aCB0aWxlUm93XG4gICAgZmlsbEltYWdlKHRpbGVSb3cpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aWxlUm93LnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgICAgIHZhciBzdmdJbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIHN2Z0ltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbnZhc0NvbnRleHQuZHJhd0ltYWdlKHN2Z0ltZywgdGlsZS5jb2x1bW4gKiBUSUxFX1dJRFRILCB0aWxlUm93LnJvdyAqIFRJTEVfSEVJR0hUKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN2Z0ltZy5zcmMgPSAnZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsJyArIGVuY29kZVVSSUNvbXBvbmVudCh0aWxlLnN2Zyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnQ7XG4iLCJsZXQgdGVtcGxhdGUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gXCI8Y2FudmFzIGlkPSdkZXN0aW5hdGlvbic+PC9jYW52YXM+XCI7XG59XG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZTtcbiIsImltcG9ydCB0ZW1wbGF0ZSBmcm9tICcuL3RlbXBsYXRlJztcbmltcG9ydCBTdG9yZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9zdG9yZSc7XG5jbGFzcyBJbWFnZVVwbG9hZENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW1hZ2UtdXBsb2FkXCIpLmlubmVySFRNTCA9IHRlbXBsYXRlKCk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRzKCk7XG4gICAgfVxuICAgIC8vV2hlbiB0aGUgc3VibWl0IGJ1dHRvbiBpcyBjbGlja2VkLCB0aGUgZmlsZShpZiB1cGxvYWRlZCksIGlzIHVwbG9hZGVkIGluIHNvdXJjZSBpbWFnZSBjYW52YXMuXG4gICAgYWRkRXZlbnRzKCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVwbG9hZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICB2YXIgaW1hZ2UgPSBTdG9yZS5nZXRSZWNvcmQoJ21vc2FpY0ltYWdlJyk7XG4gICAgICAgICAgICB2YXIgZmlsZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlXCIpLmZpbGVzO1xuICAgICAgICAgICAgaWYgKEZpbGVSZWFkZXIgJiYgZmlsZXMgJiYgZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgICAgICBmci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2Uubm9kZS5zcmMgPSBmci5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZyLm9uZXJyb3IgPSBmdW5jdGlvbihzdHVmZikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIsIHN0dWZmKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzdHVmZi5nZXRNZXNzYWdlKCkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZyLnJlYWRBc0RhdGFVUkwoZmlsZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBJbWFnZVVwbG9hZENvbXBvbmVudDtcbiIsInZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBcIjxkaXY+PGxhYmVsIGZvcj0naW1hZ2UnPkNob29zZSBpbWFnZSB0byB1cGxvYWQ8L2xhYmVsPjxpbnB1dCB0eXBlPSdmaWxlJyBpZD0naW1hZ2UnIG5hbWU9J2ltYWdlJ2FjY2VwdD0naW1hZ2UvKic+PC9kaXY+PGRpdj48YnV0dG9uIGlkPSd1cGxvYWQnPlVwbG9hZDwvYnV0dG9uPjwvZGl2PlwiXG59XG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZTtcbiIsImltcG9ydCBEZXN0aW5hdGlvbkltYWdlQ29tcG9uZW50IGZyb20gJy4vZGVzdGluYXRpb24taW1hZ2UvY29tcG9uZW50JztcbmltcG9ydCBTb3VyY2VJbWFnZUNvbXBvbmVudCBmcm9tICcuL3NvdXJjZS1pbWFnZS9jb21wb25lbnQnO1xuaW1wb3J0IEltYWdlVXBsb2FkQ29tcG9uZW50IGZyb20gJy4vaW1hZ2UtdXBsb2FkL2NvbXBvbmVudCc7XG5sZXQgY29tcG9uZW50cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBbSW1hZ2VVcGxvYWRDb21wb25lbnQsIFNvdXJjZUltYWdlQ29tcG9uZW50LCBEZXN0aW5hdGlvbkltYWdlQ29tcG9uZW50XTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29tcG9uZW50cztcbiIsImltcG9ydCB0ZW1wbGF0ZSBmcm9tICcuL3RlbXBsYXRlJztcbmltcG9ydCBTdG9yZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9zdG9yZSc7XG5pbXBvcnQgT2JzZXJ2ZXJPYmogZnJvbSAnLi4vLi4vc2VydmljZXMvb2JzZXJ2ZXInO1xuXG5jbGFzcyBTb3VyY2VJbWFnZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic291cmNlLWltYWdlXCIpLmlubmVySFRNTCA9IHRlbXBsYXRlKCk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRzKCk7XG4gICAgfVxuICAgIGFkZEV2ZW50cygpIHtcbiAgICAgICAgbGV0IGltYWdlID0gU3RvcmUuZ2V0UmVjb3JkKCdtb3NhaWNJbWFnZScpO1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIGltYWdlLm5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuaW1hZ2VMb2FkZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIGltYWdlTG9hZGVkKCkge1xuICAgICAgICB0aGlzLmluaXRpYXRlQ2FudmFzKCk7XG4gICAgICAgIHRoaXMuc2xpY2VJbWFnZSgpO1xuICAgIH1cbiAgICBpbml0aWF0ZUNhbnZhcygpIHtcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb3VyY2UnKTtcbiAgICAgICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBsZXQgaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgICAgICBsZXQgaW1hZ2VXaWR0aCA9IGltYWdlLndpZHRoO1xuICAgICAgICBsZXQgaW1hZ2VIZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgICAgIGN0eC5jYW52YXMud2lkdGggPSBpbWFnZVdpZHRoO1xuICAgICAgICBjdHguY2FudmFzLmhlaWdodCA9IGltYWdlSGVpZ2h0O1xuICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLm5vZGUsIDAsIDApO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgdGhpcy5jYW52YXNDb250ZXh0ID0gY3R4O1xuICAgIH1cbiAgICAvL0ltYWdlIGlzIGRpdmlkZWQgaW50byB0aWxlcy4gUixHLEIgdmFsdWVzIGFyZSBjYWxjdWxhdGVkIGZyb20gdGlsZXMuIFRpbGUgcmVjb3JkIGFuZCB0aWxlUm93IHJlY29yZCBpcyBjcmVhdGVkLiBUaGUgb2JzZXJ2ZXIgaXMgYmluZGVkIHdpdGggcmVmZXJlbmNlIHRvIHRpbGVSb3cgY3JlYXRpb24gd2hpY2ggd2lsbCBoaW50IERlc3RpbmF0aW9uSW1hZ2VDb21wb25lbnQgdG8gcHJvY2VlZCB3aXRoIGZ1cnRoZXIgcHJvY2Vzc2luZy5cbiAgICBzbGljZUltYWdlKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW1hZ2UudmVydGljYWxUaWxlczsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgdGlsZVJvdyA9IFN0b3JlLmNyZWF0ZVJlY29yZCgndGlsZVJvdycsIHtcbiAgICAgICAgICAgICAgICBpbWFnZUlkOiBpbWFnZS5pZCxcbiAgICAgICAgICAgICAgICByb3c6IGksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5pbWFnZS5ob3Jpem9udGFsVGlsZXM7IGorKykge1xuICAgICAgICAgICAgICAgIGxldCByID0gMCxcbiAgICAgICAgICAgICAgICAgICAgZyA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGIgPSAwO1xuICAgICAgICAgICAgICAgIGxldCBpbWdEYXRhID0gdGhpcy5jYW52YXNDb250ZXh0LmdldEltYWdlRGF0YShqICogVElMRV9XSURUSCwgaSAqIFRJTEVfSEVJR0hULCBUSUxFX1dJRFRILCBUSUxFX0hFSUdIVCk7XG4gICAgICAgICAgICAgICAgbGV0IHBpeCA9IGltZ0RhdGEuZGF0YTtcbiAgICAgICAgICAgICAgICByID0gcGl4WzBdO1xuICAgICAgICAgICAgICAgIGcgPSBwaXhbMV07XG4gICAgICAgICAgICAgICAgYiA9IHBpeFsyXTtcbiAgICAgICAgICAgICAgICBsZXQgdGlsZSA9IFN0b3JlLmNyZWF0ZVJlY29yZCgndGlsZScsIHtcbiAgICAgICAgICAgICAgICAgICAgdGlsZVJvd0lkOiB0aWxlUm93LmlkLFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW46IGosXG4gICAgICAgICAgICAgICAgICAgIHI6IHIsXG4gICAgICAgICAgICAgICAgICAgIGc6IGcsXG4gICAgICAgICAgICAgICAgICAgIGI6IGJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRpbGVSb3cucHJvY2Vzc1RpbGVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgT2JzZXJ2ZXJPYmouZGVwZW5kYWJsZUtleSA9ICd0aWxlUm93c0NyZWF0ZWQnO1xuICAgICAgICBPYnNlcnZlck9iai50b2dnbGVWYWx1ZSA9ICFPYnNlcnZlck9iai50b2dnbGVWYWx1ZTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBTb3VyY2VJbWFnZUNvbXBvbmVudDtcbiIsImxldCB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBcIjxjYW52YXMgaWQ9J3NvdXJjZSc+PC9jYW52YXM+XCI7XG59XG5leHBvcnQgZGVmYXVsdCB0ZW1wbGF0ZTtcbiIsImltcG9ydCBNb3NhaWNJbWFnZSBmcm9tICcuL21vc2FpY0ltYWdlJztcbmltcG9ydCBUaWxlIGZyb20gJy4vdGlsZSc7XG5pbXBvcnQgVGlsZVJvdyBmcm9tICcuL3RpbGVSb3cnO1xubGV0IG1vZGVscyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBbTW9zYWljSW1hZ2UsIFRpbGUsIFRpbGVSb3ddO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtb2RlbHM7XG4iLCIvL2ZpbGVkczogaWQsIG5vZGUsIHdpZHRoLCBoZWlnaHQsIGhvcml6b250YWxUaWxlcywgdmVydGljYWxUaWxlc1xubGV0IGlkID0gMTtcbmNsYXNzIE1vc2FpY0ltYWdle1xuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHRoaXMuX21vZGVsTmFtZSA9IFwibW9zYWljSW1hZ2VcIjtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5ub2RlID0gbmV3IEltYWdlKCk7XG4gICAgaWQrKztcbiAgfVxuICBnZXRNb2RlbE5hbWUoKXtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWxOYW1lO1xuICB9XG4gIGdldCB3aWR0aCgpe1xuICAgIHJldHVybiB0aGlzLm5vZGUud2lkdGg7XG4gIH1cbiAgZ2V0IGhlaWdodCgpe1xuICAgIHJldHVybiB0aGlzLm5vZGUuaGVpZ2h0O1xuICB9XG4gIGdldCBob3Jpem9udGFsVGlsZXMoKXtcbiAgICBsZXQgd2lkdGggPSB0aGlzLndpZHRoO1xuICAgIGxldCB0aWxlV2lkdGggPSBUSUxFX1dJRFRIO1xuICAgIHJldHVybiBNYXRoLmNlaWwod2lkdGgvdGlsZVdpZHRoKTtcbiAgfVxuICBnZXQgdmVydGljYWxUaWxlcygpe1xuICAgIGxldCBoZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICBsZXQgdGlsZUhlaWdodCA9IFRJTEVfSEVJR0hUO1xuICAgIHJldHVybiBNYXRoLmNlaWwoaGVpZ2h0L3RpbGVIZWlnaHQpO1xuICB9XG59XG5Nb3NhaWNJbWFnZS5tb2RlbE5hbWUgPSBcIm1vc2FpY0ltYWdlXCI7XG5leHBvcnQgZGVmYXVsdCBNb3NhaWNJbWFnZTtcbiIsIi8vZmllbGRzOiBpZCwgdGlsZVJvdywgaW1hZ2UsIHJvdywgY29sdW1uLCByLCBnLCBiLCBoZXhDb2RlLCBzdmdTdHJpbmdcbmltcG9ydCBTdG9yZSBmcm9tICcuLi9zZXJ2aWNlcy9zdG9yZSc7XG5pbXBvcnQgcmdiVG9IZXggZnJvbSAnLi4vdXRpbHMvcmdiVG9IZXgnO1xuaW1wb3J0IFBvb2wgZnJvbSAnLi4vc2VydmljZXMvcG9vbCc7XG5cbmxldCBpZCA9IDFcbmNsYXNzIFRpbGUge1xuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLl9tb2RlbE5hbWUgPSBcInRpbGVcIjtcbiAgICAgICAgLy90aWxlUm93SWQsIGNvbHVtbiwgciwgZywgYlxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIGF0dHJpYnV0ZXMpO1xuICAgICAgICBpZCsrO1xuICAgIH1cbiAgICBnZXRNb2RlbE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RlbE5hbWU7XG4gICAgfVxuICAgIGdldCB0aWxlUm93KCkge1xuICAgICAgICByZXR1cm4gU3RvcmUuYmVsb25nc1RvKCd0aWxlJywgdGhpcy50aWxlUm93SWQsICd0aWxlUm93Jyk7XG4gICAgfVxuICAgIGdldCBpbWFnZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZVJvdy5pbWFnZTtcbiAgICB9XG4gICAgZ2V0IHJvdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZVJvdy5yb3c7XG4gICAgfVxuICAgIGdldCBoZXhDb2RlKCkge1xuICAgICAgICByZXR1cm4gcmdiVG9IZXgodGhpcy5yLCB0aGlzLmcsIHRoaXMuYik7XG4gICAgfVxufVxuVGlsZS5tb2RlbE5hbWUgPSBcInRpbGVcIjtcbmV4cG9ydCBkZWZhdWx0IFRpbGU7XG4iLCIvL3Byb3BlcnRpZXM6IGlkLCBjb2x1bW4sIGltYWdlLCB0aWxlc1xuaW1wb3J0IE9ic2VydmVyT2JqIGZyb20gJy4uL3NlcnZpY2VzL29ic2VydmVyJztcbmltcG9ydCBTdG9yZSBmcm9tICcuLi9zZXJ2aWNlcy9zdG9yZSc7XG5pbXBvcnQgUG9vbCBmcm9tICcuLi9zZXJ2aWNlcy9wb29sJztcblxubGV0IGlkID0gMTtcbmNsYXNzIFRpbGVSb3cge1xuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGhpcy5fbW9kZWxOYW1lID0gXCJ0aWxlXCI7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNoaXBzID0ge1xuICAgICAgICAgICAgYmVsb25nc1RvOiBbJ2ltYWdlJ10sXG4gICAgICAgICAgICBoYXNNYW55OiBbJ3RpbGUnXVxuICAgICAgICB9XG4gICAgICAgIC8vY29sdW1uLCBpbWFnZUlkXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgYXR0cmlidXRlcyk7XG4gICAgICAgIGlkKys7XG4gICAgfVxuICAgIGdldE1vZGVsTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGVsTmFtZTtcbiAgICB9XG4gICAgZ2V0IHRpbGVzKCkge1xuICAgICAgICByZXR1cm4gU3RvcmUuaGFzTWFueSgndGlsZVJvdycsIHRoaXMuaWQsICd0aWxlJyk7XG4gICAgfVxuICAgIGdldCBpbWFnZSgpIHtcbiAgICAgICAgcmV0dXJuIFN0b3JlLmJlbG9uZ3NUbygndGlsZVJvdycsIHRoaXMuaW1hZ2VJZCwgJ2ltYWdlJyk7XG4gICAgfVxuICAgIC8vdGhpcyBmaXJlcyBvYnNlcnZlciB3aGVuIGFsbCB0aGUgdGlsZXMgZ2V0IHN2ZyBmcm9tIHNlcnZlci4ocm93IHdpc2UpXG4gICAgYWRkVGlsZUxvYWRPYnNlcnZlcigpIHtcbiAgICAgICAgdGhpcy5yb3dMb2FkZWQgPSB0cnVlO1xuICAgICAgICBPYnNlcnZlck9iai5kZXBlbmRhYmxlS2V5ID0gJ3RpbGVSb3dMb2FkZWQnICsgdGhpcy5yb3c7XG4gICAgICAgIE9ic2VydmVyT2JqLnRvZ2dsZVZhbHVlID0gIU9ic2VydmVyT2JqLnRvZ2dsZVZhbHVlO1xuICAgIH1cbiAgICBzZXRUaWxlU3ZnKHRpbGVzQXJyKSB7XG4gICAgICAgIHRpbGVzQXJyLmZvckVhY2goKHRpbGVIYXNoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaWQgPSBPYmplY3Qua2V5cyh0aWxlSGFzaClbMF07XG4gICAgICAgICAgICBsZXQgc3ZnID0gdGlsZUhhc2hbaWRdO1xuICAgICAgICAgICAgU3RvcmUuZmluZCgndGlsZScsIGlkKS5zdmcgPSBzdmc7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcm9jZXNzVGlsZXNDYWxsYmFjayhldmVudCkge1xuICAgICAgICBsZXQgdGlsZXNBcnIgPSBldmVudC5kYXRhO1xuICAgICAgICB0aGlzLnNldFRpbGVTdmcodGlsZXNBcnIpO1xuICAgICAgICB0aGlzLmFkZFRpbGVMb2FkT2JzZXJ2ZXIoKTtcbiAgICB9XG4gICAgcHJvY2Vzc1RpbGVzKCkge1xuICAgICAgICBsZXQgdGlsZUFyciA9IFtdO1xuICAgICAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgICAgIGxldCB0aWxlSGFzaCA9IHt9O1xuICAgICAgICAgICAgdGlsZUhhc2hbdGlsZS5pZF0gPSB0aWxlLmhleENvZGU7XG4gICAgICAgICAgICB0aWxlQXJyLnB1c2godGlsZUhhc2gpO1xuICAgICAgICB9KTtcbiAgICAgICAgUG9vbC5hZGRXb3JrZXJUYXNrKCcuLi9qcy93b3JrZXJzL2xvYWRDb250ZW50LmpzJywgdGhpcy5wcm9jZXNzVGlsZXNDYWxsYmFjay5iaW5kKHRoaXMpLCBKU09OLnN0cmluZ2lmeSh0aWxlQXJyKSk7XG4gICAgfVxufVxuVGlsZVJvdy5tb2RlbE5hbWUgPSBcInRpbGVSb3dcIjtcbmV4cG9ydCBkZWZhdWx0IFRpbGVSb3c7XG4iLCIvL1RoaXMgaXMgb2JzZXJ2ZXIgaW1wbGVtZW50YXRpb24uXG4vL09ic2VydmVyIGlzIGZpcmVkIHdoZW4gdG9nZ2xlVmFsdWUgaXMgc2V0XG4vL3doZW5ldmVyIHRvZ2dsZVZhbHVlIGlzIHNldCwgaXQgY2hlY2tzIGZvciB0aGUgdmFsdWUgaW5zaWRlIGRlcGVuZGFibGVLZXkuXG4vL2RlcGVuZGFibGVPYmogY29uc2lzdHMgb2Yga2V5cyBhbmQgdmFsdWVzIHdoZXJlIGtleXMgYXJlIGRlcGVuZGFibGVLZXlzIHdoaWNoIGd1aWRlcyB3aGljaCBvYnNlcnZlciB0byBmaXJlIGFuZCB2YWx1ZSBpcyBhbiBhcnJheS4gRWFjaCBlbGVtZW50IG9mIGFycmF5IGlzIGFuIG9iamVjdCB3aGljaCBoYXZlIHRocmVlIHZhbHVlczogY2FsbGJhY2sgZnVuY3Rpb24sIGNvbnRleHQsIGFyZ3VtZW50cy5cbmxldCBPYnNlcnZlck9iaiA9IG5ldyBQcm94eSh7XG4gIHRvZ2dsZVZhbHVlOiBmYWxzZSxcbiAgZGVwZW5kYWJsZUtleTogbnVsbCxcbiAgZGVwZW5kYWJsZU9iajoge30sXG4gIHRvZ2dsZVByb3BlcnR5KCl7XG4gICAgdGhpcy50b2dnbGVWYWx1ZSA9ICF0aGlzLnRvZ2dsZVZhbHVlO1xuICB9XG59LCB7XG4gIHNldCh0YXJnZXQsIGtleSwgdmFsdWUpe1xuICAgIHRhcmdldFtrZXldID0gdmFsdWU7XG4gICAgaWYoa2V5PT1cInRvZ2dsZVZhbHVlXCIpe1xuICAgICAgZm9yKHZhciBrIGluIHRhcmdldC5kZXBlbmRhYmxlT2JqKXtcbiAgICAgICAgaWYoaz09dGFyZ2V0LmRlcGVuZGFibGVLZXkpe1xuICAgICAgICAgIGxldCBkZXBlbmRhYmxlcyA9IHRhcmdldC5kZXBlbmRhYmxlT2JqW2tdO1xuICAgICAgICAgIGRlcGVuZGFibGVzLmZvckVhY2goKGRlcGVuZGFibGUpID0+IHtcbiAgICAgICAgICAgIGRlcGVuZGFibGUuY2FsbGJhY2suY2FsbChkZXBlbmRhYmxlLmNvbnRleHQsIGRlcGVuZGFibGUuYXJncyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn0pO1xuZXhwb3J0IGRlZmF1bHQgT2JzZXJ2ZXJPYmo7XG4iLCJpbXBvcnQgV29ya2VyVGhyZWFkIGZyb20gJy4vd29ya2VyVGhyZWFkJztcbmltcG9ydCBXb3JrZXJUYXNrIGZyb20gJy4vd29ya2VyVGFzayc7XG5cbmxldCBpbnN0YW5jZSA9IG51bGw7XG5jbGFzcyBQb29sIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy50YXNrUXVldWUgPSBbXTsgLy90YXNrcyBxdWV1ZVxuICAgICAgICAgICAgdGhpcy53b3JrZXJRdWV1ZSA9IFtdOyAvL3dvcmtlcnMgcXVldWVcbiAgICAgICAgICAgIHRoaXMucG9vbFNpemUgPSBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSB8fCA0OyAvL3NldCBwb29sIHNpemUgZXF1YWwgdG8gbm8gb2YgY29yZXMsIGlmIG5hdmlnYXRvciBvYmplY3QgYXZhaWxhYmxlIG9yIDQuXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH1cbiAgICBjcmVhdGVXb3JrZXJUYXNrKHNjcmlwdCwgY2FsbGJhY2ssIG1zZykge1xuICAgICAgICByZXR1cm4gbmV3IFdvcmtlclRhc2soc2NyaXB0LCBjYWxsYmFjaywgbXNnKTtcbiAgICB9XG4gICAgYWRkV29ya2VyVGFzayhzY3JpcHQsIGNhbGxiYWNrLCBtc2cpIHtcbiAgICAgICAgbGV0IHdvcmtlclRhc2sgPSB0aGlzLmNyZWF0ZVdvcmtlclRhc2soc2NyaXB0LCBjYWxsYmFjaywgbXNnKTtcbiAgICAgICAgaWYgKHRoaXMud29ya2VyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIHdvcmtlclRocmVhZCA9IHRoaXMud29ya2VyUXVldWUuc2hpZnQoKTsgLy8gZ2V0IHRoZSB3b3JrZXIgZnJvbSB0aGUgZnJvbnQgb2YgdGhlIHF1ZXVlXG4gICAgICAgICAgICB3b3JrZXJUaHJlYWQucnVuKHdvcmtlclRhc2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50YXNrUXVldWUucHVzaCh3b3JrZXJUYXNrKTsgLy8gbm8gZnJlZSB3b3JrZXJzXG4gICAgICAgIH1cbiAgICB9XG4gICAgaW5pdCgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBvb2xTaXplOyBpKyspIHsgLy8gY3JlYXRlICdwb29sU2l6ZScgbnVtYmVyIG9mIHdvcmtlciB0aHJlYWRzXG4gICAgICAgICAgICB0aGlzLndvcmtlclF1ZXVlLnB1c2gobmV3IFdvcmtlclRocmVhZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGZyZWVXb3JrZXJUaHJlYWQod29ya2VyVGhyZWFkKSB7XG4gICAgICAgIGlmICh0aGlzLnRhc2tRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgd29ya2VyVGFzayA9IHRoaXMudGFza1F1ZXVlLnNoaWZ0KCk7IC8vIGRvbid0IHB1dCBiYWNrIGluIHF1ZXVlLCBidXQgZXhlY3V0ZSBuZXh0IHRhc2tcbiAgICAgICAgICAgIHdvcmtlclRocmVhZC5ydW4od29ya2VyVGFzayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3b3JrZXJUaHJlYWQud29ya2VyLnRlcm1pbmF0ZSgpOyAvL3Rlcm1pbmF0ZSB3b3JrZXIgaWYgbm8gdGFzayBhdCBoYW5kXG4gICAgICAgICAgICB0aGlzLnRhc2tRdWV1ZS5wdXNoKHdvcmtlclRocmVhZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmxldCBwb29sID0gKG5ldyBQb29sKS5pbml0KCk7XG53aW5kb3cucG9vbD1wb29sO1xuZXhwb3J0IGRlZmF1bHQgcG9vbDtcbiIsIi8vdGhpcyBpcyBkYXRhIHN0b3JlIGltcGxlbWVudGF0aW9uLiBTdG9yZSBpcyBhIHNpbmdsZXRvbiBjbGFzc1xuLy90aGUgdmFsdWVzIGFyZSBzdG9yZWQgaW4gZGF0YS4gYW5kIGl0IGhhcyBjb21tb24gZnVuY3Rpb25zIGxpa2UgY3JlYXRlUmVjb3JkLCBmaW5kQWxsLCBmaW5kQnksIGZpbmQsIGdldFJlY29yZCwgcmVsYXRpb25zaGlwcyhoYXNNYW55LCBiZWxvbmdzVG8pXG5pbXBvcnQgbW9kZWxzIGZyb20gJy4uL21vZGVscyc7XG5cbmxldCBnZXRNb2RlbCA9IGZ1bmN0aW9uKG1vZGVsTmFtZSkge1xuICAgIGxldCByZWZlcnJlZE1vZGVsO1xuICAgIG1vZGVscygpLmZvckVhY2goKG1vZGVsKSA9PiB7XG4gICAgICAgIGlmIChtb2RlbC5tb2RlbE5hbWUgPT0gbW9kZWxOYW1lKSB7XG4gICAgICAgICAgICByZWZlcnJlZE1vZGVsID0gbW9kZWw7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAocmVmZXJyZWRNb2RlbCkge1xuICAgICAgICByZXR1cm4gcmVmZXJyZWRNb2RlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvL3Rocm93IGVycm9yIHNheWluZyB3cm9uZyBtb2RlbCBuYW1lIHBhc3NlZFxuICAgIH1cbn1cbmxldCBpbnN0YW5jZSA9IG51bGw7XG5jbGFzcyBTdG9yZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGluc3RhbmNlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9XG4gICAgY3JlYXRlUmVjb3JkKG1vZGVsTmFtZSwgYXR0cmlidXRlcykge1xuICAgICAgICB0aGlzLmRhdGFbbW9kZWxOYW1lXSA9IHRoaXMuZGF0YVttb2RlbE5hbWVdIHx8IHt9O1xuICAgICAgICBsZXQgbW9kZWwgPSBnZXRNb2RlbChtb2RlbE5hbWUpO1xuICAgICAgICBsZXQgcmVjb3JkID0gbmV3IG1vZGVsKGF0dHJpYnV0ZXMpO1xuICAgICAgICB0aGlzLmRhdGFbbW9kZWxOYW1lXVtyZWNvcmQuaWRdID0gcmVjb3JkO1xuICAgICAgICByZXR1cm4gcmVjb3JkO1xuICAgIH1cbiAgICBnZXRSZWNvcmQobW9kZWxOYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFbbW9kZWxOYW1lXSAmJiBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVttb2RlbE5hbWVdKVswXSkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5kYXRhW21vZGVsTmFtZV0pWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlUmVjb3JkKG1vZGVsTmFtZSwge30pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZpbmRBbGwobW9kZWxOYW1lKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVttb2RlbE5hbWVdKTtcbiAgICB9XG4gICAgZmluZChtb2RlbE5hbWUsIGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbbW9kZWxOYW1lXVtpZF07XG4gICAgfVxuICAgIGZpbmRCeShtb2RlbE5hbWUsIGhhc2gpIHtcbiAgICAgICAgbGV0IHJlY29yZHMgPSBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVttb2RlbE5hbWVdKS5maWx0ZXIoKHJlY29yZCkgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgayBpbiBoYXNoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc2hba10gIT0gcmVjb3JkW2tdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZWNvcmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlY29yZHNbMF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGZpbHRlcihtb2RlbE5hbWUsIGhhc2gpIHtcbiAgICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGFbbW9kZWxOYW1lXSkubWFwKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZWNvcmQuaGFzQXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGJlbG9uZ3NUbyhtb2RlbE5hbWUsIGlkLCByZWxhdGlvbk1vZGVsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuZGF0YVtyZWxhdGlvbk1vZGVsXSkuZmlsdGVyKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZWNvcmQuaWQgPT0gaWQ7XG4gICAgICAgIH0pWzBdO1xuICAgIH1cbiAgICBoYXNNYW55KG1vZGVsTmFtZSwgaWQsIHJlbGF0aW9uTW9kZWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5kYXRhW3JlbGF0aW9uTW9kZWxdKS5maWx0ZXIoKHJlY29yZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlY29yZFttb2RlbE5hbWUgKyBcIklkXCJdID09IGlkO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5sZXQgc3RvcmUgPSBuZXcgU3RvcmUoKTtcbmV4cG9ydCBkZWZhdWx0IHN0b3JlO1xuIiwiLy8gdGFzayB0byBydW5cbmNsYXNzIFdvcmtlclRhc2sge1xuICAgIGNvbnN0cnVjdG9yKHNjcmlwdCwgY2FsbGJhY2ssIG1zZyl7XG4gICAgdGhpcy5zY3JpcHQgPSBzY3JpcHQ7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuc3RhcnRNZXNzYWdlID0gbXNnO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdvcmtlclRhc2s7XG4iLCIvLyBydW5uZXIgd29yayB0YXNrcyBpbiB0aGUgcG9vbFxuY2xhc3MgV29ya2VyVGhyZWFkIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnRQb29sKSB7XG4gICAgICAgIHRoaXMucGFyZW50UG9vbCA9IHBhcmVudFBvb2w7XG4gICAgICAgIHRoaXMud29ya2VyVGFzayA9IHt9O1xuICAgIH1cbiAgICBydW4od29ya2VyVGFzaykge1xuICAgICAgICB0aGlzLndvcmtlclRhc2sgPSB3b3JrZXJUYXNrO1xuICAgICAgICBpZiAodGhpcy53b3JrZXJUYXNrLnNjcmlwdCAhPSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgd29ya2VyID0gbmV3IFdvcmtlcih3b3JrZXJUYXNrLnNjcmlwdCk7IC8vIGNyZWF0ZSBhIG5ldyB3ZWIgd29ya2VyXG4gICAgICAgICAgICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuZHVtbXlDYWxsYmFjay5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2Uod29ya2VyVGFzay5zdGFydE1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXIgPSB3b3JrZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gZm9yIG5vdyBhc3N1bWUgd2Ugb25seSBnZXQgYSBzaW5nbGUgY2FsbGJhY2sgZnJvbSBhIHdvcmtlclxuICAgIC8vIHdoaWNoIGFsc28gaW5kaWNhdGVzIHRoZSBlbmQgb2YgdGhpcyB3b3JrZXIuXG4gICAgZHVtbXlDYWxsYmFjayhldmVudCkge1xuICAgICAgICB0aGlzLndvcmtlclRhc2suY2FsbGJhY2soZXZlbnQpOyAvLyBwYXNzIHRvIG9yaWdpbmFsIGNhbGxiYWNrXG4gICAgICAgIHRoaXMucGFyZW50UG9vbC5mcmVlV29ya2VyVGhyZWFkKHRoaXMpOyAvLyB3ZSBzaG91bGQgdXNlIGEgc2VwZXJhdGUgdGhyZWFkIHRvIGFkZCB0aGUgd29ya2VyXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXb3JrZXJUaHJlYWQ7XG4iLCIvL3RoaXMgdGFrZXMgciwgZyBhbmQgYiB2YWx1ZXMgYW5kIGdlbmVyYXRlIGhleGFkZWNpbWFsIGNvbG9yIGNvZGUuXG5mdW5jdGlvbiBjb21wb25lbnRUb0hleChjKSB7XG4gICAgdmFyIGhleCA9IE1hdGgucm91bmQoYykudG9TdHJpbmcoMTYpO1xuICAgIHJldHVybiBoZXgubGVuZ3RoID09IDEgPyBcIjBcIiArIGhleCA6IGhleDtcbn1cblxuZnVuY3Rpb24gcmdiVG9IZXgociwgZywgYikge1xuICAgIHJldHVybiBcIlwiICsgY29tcG9uZW50VG9IZXgocikgKyBjb21wb25lbnRUb0hleChnKSArIGNvbXBvbmVudFRvSGV4KGIpO1xufVxuXG5leHBvcnQgZGVmYXVsdCByZ2JUb0hleDtcbiJdfQ==
