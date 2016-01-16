var jstained = jstained || {};


/* LocalDatabase */

jstained.LocalDatabase = function() {
    this.data = {};
};

jstained.LocalDatabase.prototype.addTable = function(tableName, tableSchema) {
    this.data[tableName] = {
        schema: tableSchema,
        entries: [],
        counter: 1
    };
};

jstained.LocalDatabase.prototype.matchEntry = function(entry, filterData) {
    for (var field in filterData) {
        if (filterData.hasOwnProperty(field)) {
            if (entry[field] != filterData[field]) {
                return false;
            }
        }
    }
    return true;
};

jstained.LocalDatabase.prototype.addItem = function(tableName, itemData) {
    var table = this.data[tableName];
    var patchedItemData = {};
    for (var field in table.schema) {
        if (table.schema.hasOwnProperty(field)) {
            if (table.schema[field].type == 'auto') {
                patchedItemData[field] = table.counter;
            } else if (itemData[field] != undefined) {
                patchedItemData[field] = itemData[field];
            } else {
                patchedItemData[field] = table.schema[field].default;
            }
        }
    }
    table.entries.push(patchedItemData);
//    console.log('Created "'+tableName+'" item: '+JSON.stringify(patchedItemData));
    return table.counter++;
};

jstained.LocalDatabase.prototype.getItem = function(tableName, filterData) {
    var entries = this.data[tableName].entries;
    var entry;
    for (var i = 0; i < entries.length; i++) {
        if (this.matchEntry(entries[i], filterData)) {
            entry = jstained.tools.shallowCopy(entries[i]);
            break;
        }
    }
//    console.log('Fetched "'+tableName+'" item: '+JSON.stringify(entry));
    return entry;
};

jstained.LocalDatabase.prototype.filterItems = function(tableName, filterData) {
    var results = [];
    var entries = this.data[tableName].entries;
    for (var i = 0; i < entries.length; i++) {
        if (this.matchEntry(entries[i], filterData)) {
            results.push(jstained.tools.shallowCopy(entries[i]));
        }
    }
//    console.log('Fetched "'+tableName+'" item list: '+JSON.stringify(results));
    return results;
};

jstained.LocalDatabase.prototype.deleteItems = function(tableName, filterData) {
    var entries = this.data[tableName].entries;
    for (var i = 0; i < entries.length; null) {
        if (this.matchEntry(entries[i], filterData)) {
            entries.splice(i, 1);
        } else {
            i++;
        }
    }
};

jstained.LocalDatabase.prototype.updateItems = function(tableName, filterData, newData) {
    var table = this.data[tableName];
    var entries = table.entries;
    for (var i = 0; i < entries.length; i++) {
        if (this.matchEntry(entries[i], filterData)) {
            for (var field in newData) {
                if (newData.hasOwnProperty(field)) {
                    if (table.schema[field].type != undefined) {
                        entries[i][field] = newData[field];
                    }
                }
            }
        }
    }
};


/* LocalModelManager */

jstained.LocalModelManager = function(db) {
    this.db = db;
    if (!this.db) {
        this.createDb();
    }
};

jstained.LocalModelManager.prototype.createDb = function() {
    this.db = new jstained.LocalDatabase();
    this.db.addTable('panes', {
        id: {type: 'auto'},
        parent: {type: 'int', default: null},
        border: {type: 'int', default: null},
        next_pane: {type: 'int', default: null},
        direction: {type: 'string', default: null},
        text: {type: 'string', default: null},
        image: {type: 'string', default: null}
    });
    this.db.addTable('sheets', {
        id: {type: 'auto'},
        pane: {type: 'int'},
        alias: {type: 'int', default: null},
        title: {type: 'string', default: null},
        description: {type: 'string', default: null}
    });
};

jstained.LocalModelManager.prototype.createNewSheet = function() {
    var mainPane = this.createPane({parent: null, direction: 'left'});
    this.createPane({parent: mainPane.id, direction: 'left'});
    this.createPane({parent: mainPane.id, direction: 'left'});
    return this.createSheet({pane: mainPane.id});
};

jstained.LocalModelManager.prototype.expandSheet = function(sheet) {
    sheet.pane = this.getExpandedPane(sheet.id);
    return sheet;
};

jstained.LocalModelManager.prototype.createSheet = function(sheetData) {
    return this.getSheet(this.db.addItem('sheets', sheetData));
};

jstained.LocalModelManager.prototype.getPaneChildren = function(paneId) {
    return this.db.filterItems('panes', {parent: paneId});
};

jstained.LocalModelManager.prototype.expandPane = function(pane) {
    var children = this.getPaneChildren(pane.id);
    pane.children = [];
    for (var i = 0; i < children.length; i++) {
        pane.children.push(this.expandPane(children[i]));
    }
    return pane;
};

jstained.LocalModelManager.prototype.getPane = function(paneId) {
    return this.db.getItem('panes', {id: paneId});
};

jstained.LocalModelManager.prototype.getExpandedPane = function(paneId) {
    return this.expandPane(this.getPane(paneId));
};

jstained.LocalModelManager.prototype.getSheet = function(sheetId) {
    return this.expandSheet(this.db.getItem('sheets', {id: sheetId}));
};

jstained.LocalModelManager.prototype.createPane = function(paneData) {
    return this.getExpandedPane(this.db.addItem('panes', paneData));
};

jstained.LocalModelManager.prototype.updatePane = function(paneId, paneData) {
    this.db.updateItems('panes', {id: paneId}, paneData);
    return this.getPane(paneId);
};

jstained.LocalModelManager.prototype.deletePane = function(paneId) {
    this.db.deleteItems('panes', {id: paneId});
};


jstained.LocalModelManager.prototype.splitPane = function(paneId, orientation) {
    var originalPane = this.getPane(paneId);
    var newParent = this.createPane({parent: originalPane.parent, direction: orientation});
    this.updatePane(paneId, {parent: newParent.id});
    this.createPane({parent: newParent.id, direction: orientation});
    return this.expandPane(newParent);
};

jstained.LocalModelManager.prototype.rotatePane = function(paneId, rotateDir) {
    var dirs = ['up', 'right', 'down', 'left'];
    var pane = this.getPane(paneId);
    var newDirection = dirs[(dirs.indexOf(pane.direction) + rotateDir + dirs.length) % dirs.length];
    var children = this.getPaneChildren(pane.id);
    this.updatePane(paneId, {direction: newDirection});
    for (var i = 0; i < children.length; i++) {
        this.rotatePane(children[i].id, rotateDir)
    }
    return this.getExpandedPane(paneId);
};


/* LocalApiClient */

jstained.LocalApiClient = function(clientSettings) {
    clientSettings = clientSettings || {};
    this.model = new jstained.LocalModelManager(clientSettings.db);
};

jstained.LocalApiClient.prototype.getSheet = function(sheetId, callback) {
    callback(this.model.getSheet(sheetId));
};

jstained.LocalApiClient.prototype.getDefaultPane = function() {
    return {
        parent: null,
        border: null,
        direction: 'right',
        text: '',
        image: null
    };
};

jstained.LocalApiClient.prototype.getPane = function(paneId, callback) {
    callback(this.model.getExpandedPane(paneId));
};

jstained.LocalApiClient.prototype.deletePane = function(paneId, callback) {
    callback(this.model.deletePane(paneId));
};

jstained.LocalApiClient.prototype.createPane = function(paneData, callback) {
    callback(this.model.createPane(paneData));
};

jstained.LocalApiClient.prototype.updatePane = function(paneId, paneData, callback) {
    callback(this.model.expandPane(this.model.updatePane(paneId, paneData)));
};

jstained.LocalApiClient.prototype.rotatePaneCw = function(paneId, callback) {
    callback(this.model.rotatePane(paneId, 1));
};

jstained.LocalApiClient.prototype.rotatePaneCcw = function(paneId, callback) {
    callback(this.model.rotatePane(paneId, -1));
};

jstained.LocalApiClient.prototype.splitVertically = function(paneId, callback) {
    callback(this.model.splitPane(paneId, 'down'));
};

jstained.LocalApiClient.prototype.splitHorizontally = function(paneId, callback) {
    callback(this.model.splitPane(paneId, 'right'));
};

jstained.LocalApiClient.prototype.setPaneImage = function(paneId, file, callback) {
    var reader  = new FileReader();
    var self = this;
    reader.onloadend = function () {
        callback(self.model.expandPane(self.model.updatePane(paneId, {image: reader.result})));
    };
    reader.readAsDataURL(file);
};

