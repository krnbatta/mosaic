//this is data store implementation. Store is a singleton class
//the values are stored in data. and it has common functions like createRecord, findAll, findBy, find, getRecord, relationships(hasMany, belongsTo)
import models from '../models';

let getModel = function(modelName) {
    let referredModel;
    models().forEach((model) => {
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
}
let instance = null;
class Store {
    constructor() {
        if (!instance) {
            instance = this;
            this.data = {};
        }
        return instance;
    }
    createRecord(modelName, attributes) {
        this.data[modelName] = this.data[modelName] || {};
        let model = getModel(modelName);
        let record = new model(attributes);
        this.data[modelName][record.id] = record;
        return record;
    }
    getRecord(modelName) {
        if (this.data[modelName] && Object.values(this.data[modelName])[0]) {
            return Object.values(this.data[modelName])[0];
        } else {
            return this.createRecord(modelName, {});
        }
    }
    findAll(modelName) {
        return Object.values(this.data[modelName]);
    }
    find(modelName, id) {
        return this.data[modelName][id];
    }
    findBy(modelName, hash) {
        let records = Object.values(this.data[modelName]).filter((record) => {
            for (let k in hash) {
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
    filter(modelName, hash) {
        Object.values(this.data[modelName]).map((record) => {
            return record.hasAttributes(attributes);
        });
    }
    belongsTo(modelName, id, relationModel) {
        return Object.values(this.data[relationModel]).filter((record) => {
            return record.id == id;
        })[0];
    }
    hasMany(modelName, id, relationModel) {
        return Object.values(this.data[relationModel]).filter((record) => {
            return record[modelName + "Id"] == id;
        });
    }
}
let store = new Store();
export default store;
