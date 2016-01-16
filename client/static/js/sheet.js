var jstained = jstained || {};


/* PaneBase base class */

jstained.PaneBase = function(sheet, parentPane) {
    this.id = null;
    this.sheet = sheet;
    this.parentPane = parentPane;
    this.container = null;
    this.paneBox = null;
    this.text = null;
    this.direction = null;
    this.children = null;
    this.selectionEnabled = false;
    this.editingEnabled = false;
    this.selected = false;
    this.selectionBox = null;
    this.rendered = false;
    this.height = 0;
};

jstained.PaneBase.prototype.setContainer = function(container) {
    this.container = container;
};

jstained.PaneBase.prototype.setData = function(data) {};

jstained.PaneBase.prototype.render = function() {
    this.rendered = true;
};

jstained.PaneBase.prototype.enableSelection = function() {
    this.selectionEnabled = true;
};

jstained.PaneBase.prototype.disableSelection = function() {
    this.selectionEnabled = false;
};

jstained.PaneBase.prototype.enableEditing = function() {
    this.editingEnabled = true;
};

jstained.PaneBase.prototype.disableEditing = function() {
    this.editingEnabled = false;
};

jstained.PaneBase.prototype.select = function() {
    if (!this.selectionEnabled) {
        return;
    }
    if (this.selected) {
        return;
    }
    this.selectionBox = new jstained.ui.controls.Block().attach(this.paneBox);
    this.selectionBox.setCssClass('pane-selection-box');
    this.selectionBox.copySize(this.paneBox);
    this.selected = true;
    this.sheet.changeSelection(this);
};

jstained.PaneBase.prototype.selectParent = function() {
    if (!this.selectionEnabled) {
        return;
    }
    if (this.parentPane) {
        this.parentPane.select();
    }
};

jstained.PaneBase.prototype.deselect = function() {
    if (!this.selectionEnabled) {
        return;
    }
    if (!this.selected) {
        return;
    }
    this.selectionBox.remove();
    this.selected = false;
    this.selectionBox = null;
};

jstained.PaneBase.prototype.remove = function() {
    if (this.parentPane) {
        this.parentPane.removeChild(this);
        if (this.selected) {
            this.selectParent();
        }
    }
};

jstained.PaneBase.prototype.getNaturalHeight = function() {
    return 0;
};

jstained.PaneBase.prototype.setHeight = function(height) {
    this.height = height;
};

jstained.PaneBase.prototype.adjustHeight = function() {
    this.setHeight(this.getNaturalHeight());
};

jstained.PaneBase.prototype.adjustParentHeight = function() {
    if (this.parentPane) {
        this.parentPane.adjustParentHeight();
    } else {
        this.adjustHeight();
    }
};


/* FilledPane */

jstained.FilledPane = function(sheet, parentPane) {
    jstained.PaneBase.call(this, sheet, parentPane);
    this.grid = null;
};
jstained.FilledPane.prototype = Object.create(jstained.PaneBase.prototype);
jstained.FilledPane.constructor = jstained.FilledPane;


jstained.FilledPane.prototype.setData = function(data) {
    for (var attr in data) {
        if (data.hasOwnProperty(attr)) {
            if (attr != 'children') {
                this[attr] = data[attr];
            }
        }
    }
    if (data.hasOwnProperty('children')) {
        this.loadChildren(data['children'])
    }
};

jstained.FilledPane.prototype.createChild = function(childData, index) {
    var child;
    if (index == undefined) {
        index = this.children.length;
    }
    if (childData.children.length > 0) {
        child = new jstained.FilledPane(this.sheet, this);
    } else {
        child = new jstained.EmptyPane(this.sheet, this);
    }
    child.setData(childData);
    this.children.splice(index, 0, child);
    return child;
};

jstained.FilledPane.prototype.loadChildren = function(childrenData) {
    this.children = [];
    for (var i = 0; i < childrenData.length; i++) {
        this.createChild(childrenData[i]);
    }
};

jstained.FilledPane.prototype.isReversed = function() {
    return (this.direction == 'left' || this.direction == 'up');
};

jstained.FilledPane.prototype.isVertical = function() {
    return (this.direction == 'left' || this.direction == 'right');
};

jstained.FilledPane.prototype.isHorizontal = function() {
    return (this.direction == 'up' || this.direction == 'down');
};

jstained.FilledPane.prototype.renderChild = function(child) {
    var index = this.children.indexOf(child);
    child.setContainer(this.grid.insertCell(index, child.id));
    child.render();
    if (this.selectionEnabled) {
        child.enableSelection();
    }
    if (this.editingEnabled) {
        child.enableEditing();
    }
};

jstained.FilledPane.prototype.render = function() {
    this.paneBox = new jstained.ui.controls.Block().attach(this.container);
    this.paneBox.setCssClass('pane-filled');

    if (this.isVertical()) {
        this.grid = new jstained.ui.controls.HorizontalGrid(this.isReversed()).attach(this.paneBox);
    } else if (this.isHorizontal()) {
        this.grid = new jstained.ui.controls.VerticalGrid(this.isReversed()).attach(this.paneBox);
    }
    this.grid.setCssClass('pane-grid-table');

    var self = this;
    this.applyToChildren(function(child) { self.renderChild(child); });
    this.rendered = true;
};

jstained.FilledPane.prototype.removeChild = function(child) {
    var childIndex = this.children.indexOf(child);
    this.children.splice(childIndex, 1);
    if (this.rendered) {
        this.grid.removeCell(child.id);
        this.adjustParentHeight();
    }
};

jstained.FilledPane.prototype.indexOf = function(child) {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].id == child.id) {
            return i;
        }
    }
};

jstained.FilledPane.prototype.insertChild = function(index, childData) {
    var child = this.createChild(childData, index);
    if (this.rendered) {
        this.renderChild(child);
        this.adjustParentHeight();
    }
    return child;
};

jstained.FilledPane.prototype.applyToChildren = function(func) {
    for (var i = 0; i < this.children.length; i++) {
        func(this.children[i], i);
    }
};

jstained.FilledPane.prototype.enableSelection = function() {
    this.applyToChildren(function(child) { child.enableSelection(); });
    jstained.PaneBase.prototype.enableSelection.call(this);
};

jstained.FilledPane.prototype.disableSelection = function() {
    jstained.PaneBase.prototype.disableSelection.call(this);
    this.applyToChildren(function(child) { child.disableSelection(); });
};

jstained.FilledPane.prototype.enableEditing = function() {
    this.applyToChildren(function(child) { child.enableEditing(); });
    jstained.PaneBase.prototype.enableEditing.call(this);
};

jstained.FilledPane.prototype.disableEditing = function() {
    jstained.PaneBase.prototype.disableEditing.call(this);
    this.applyToChildren(function(child) { child.disableEditing(); });
};

jstained.FilledPane.prototype.remove = function() {
    while (this.children.length > 0) {
        this.children[0].remove();
    }
    jstained.PaneBase.prototype.remove.call(this);
};

jstained.FilledPane.prototype.getNaturalHeight = function() {
    var height = 0;
    if (this.isVertical()) {
        var heightArr = [];
        this.applyToChildren(function(child) { heightArr.push(child.getNaturalHeight()); });
        height = Math.max.apply(null, heightArr);
    } else if (this.isHorizontal()) {
        this.applyToChildren(function(child) { height += child.getNaturalHeight(); });
    }
    return height;
};

jstained.FilledPane.prototype.setHeight = function(height) {
    if (this.isVertical()) {
        this.applyToChildren(function(child) { child.setHeight(height); });
    } else if (this.isHorizontal()) {
        var naturalHeightArr = [];
        var totalNaturalHeight = 0;
        this.applyToChildren(function(child) {
            var childNaturalHeight = child.getNaturalHeight();
            naturalHeightArr.push(childNaturalHeight);
            totalNaturalHeight += childNaturalHeight;
        });

        coeff = height / totalNaturalHeight;
        var err = 0;
        var realHeight = 0;
        this.applyToChildren(function(child, childIndex) {
            var rawChildHeight = coeff*naturalHeightArr[childIndex] + err;
            var roundedChildHeight = Math.round(rawChildHeight);
            realHeight += roundedChildHeight;
            err = (rawChildHeight - roundedChildHeight);
            child.setHeight(roundedChildHeight);
        });
    }
    this.height = height;
};


/* EmptyPane */

jstained.EmptyPane = function(sheet, parentPane) {
    jstained.PaneBase.call(this, sheet, parentPane);
    this.uploadInput = null;
    this.selectEventListener = null;
    this.uploadImageEventListener = null;
    this.innerBox = null;
    this.defaultHeight = 100;
};
jstained.EmptyPane.prototype = Object.create(jstained.PaneBase.prototype);
jstained.EmptyPane.constructor = jstained.EmptyPane;

jstained.EmptyPane.prototype.setData = function(data) {
    for (var attr in data) {
        if (data.hasOwnProperty(attr)) {
            this[attr] = data[attr];
        }
    }
};

jstained.EmptyPane.prototype.render = function() {
    this.paneBox = new jstained.ui.controls.Block().attach(this.container);
    this.paneBox.setCssClass('pane-empty');

    // set content
    if (this.image) {
        var paneImageBox = new jstained.ui.controls.Block().attach(this.paneBox);
        paneImageBox.setCssClass('pane-image-block');
        paneImageBox.el.style.backgroundImage = 'url('+this.image+')';
    } else if (this.text) {
        var paneTextBox = new jstained.ui.controls.Block().attach(this.paneBox);
        paneTextBox.setCssClass('pane-text-block');
        paneTextBox.setContent(this.text);
    }
    this.rendered = true;
};

jstained.EmptyPane.prototype.enableSelection = function() {
    if (this.selectionEnabled) {
        return;
    }
    var self = this;
    this.selectEventListener = this.paneBox.el.addEventListener('click', function () {
        self.select();
    });
    jstained.PaneBase.prototype.enableSelection.call(this);
};

jstained.EmptyPane.prototype.disableSelection = function() {
    jstained.PaneBase.prototype.disableSelection.call(this);
    this.paneBox.el.removeEventListener('click', this.selectEventListener);
};

jstained.EmptyPane.prototype.enableEditing = function() {
    if (this.editingEnabled) {
        return;
    }
    this.uploadInput = new jstained.ui.controls.FileUploader().attach(this.paneBox);
    var self = this;
    this.uploadImageEventListener = this.uploadInput.el.addEventListener('change', function () {
        self.sheet.uploadPaneImage(self, self.uploadInput.getFiles()[0]);
    });
    jstained.PaneBase.prototype.enableEditing.call(this);
};

jstained.EmptyPane.prototype.disableEditing = function() {
    jstained.PaneBase.prototype.disableEditing.call(this);
    this.uploadInput.el.removeEventListener('change', this.uploadImageEventListener);
    this.uploadInput.remove();
};

jstained.EmptyPane.prototype.promptImage = function() {
    this.uploadInput.promptFiles();
};

jstained.EmptyPane.prototype.getNaturalHeight = function() {
    return this.defaultHeight;
};

jstained.EmptyPane.prototype.setHeight = function(height) {
    this.height = height;
    this.paneBox.setSize({height: this.height});
};


/* Sheet */

jstained.Sheet = function() {
    this.sheetData = {};
    this.container = null;
    this.sheetBox = null;
    this.pane = null;
    this.selectedPane = null;
    this.onSelectionChanged = null;
    this.onPaneImageUpload = null;
};

jstained.Sheet.prototype.setData = function(data) {
    var paneReceived = false;
    for (var attr in data) {
        if (data.hasOwnProperty(attr)) {
            this.sheetData[attr] = data[attr];
            if (attr == 'pane') {
                paneReceived = true;
            }
        }
    }
    if (paneReceived) {
        this.pane = new jstained.FilledPane(this, null);
        this.pane.setData(this.sheetData['pane']);
        if (this.container) {
            this.pane.setContainer(this.sheetBox);
        }
    }
};

jstained.Sheet.prototype.setContainer = function(container) {
    this.container = container;
    this.sheetBox = new jstained.ui.controls.Block().attach(this.container);
    this.sheetBox.setCssClass('pane-filled');
    if (this.pane) {
        this.pane.setContainer(this.sheetBox);
    }
};

jstained.Sheet.prototype.render = function() {
    this.pane.render();
    this.pane.adjustHeight();
};

jstained.Sheet.prototype.removePane = function() {
    this.pane.remove();
    this.sheetBox.setContent('');
    this.pane = null;
};

jstained.Sheet.prototype.enableSelection = function() {
    this.pane.enableSelection();
};

jstained.Sheet.prototype.disableSelection = function() {
    this.pane.disableSelection();
};

jstained.Sheet.prototype.enableEditing = function() {
    this.pane.enableEditing();
};

jstained.Sheet.prototype.disableEditing = function() {
    this.pane.disableEditing();
};

jstained.Sheet.prototype.changeSelection = function(selectedPane) {
    selectedPane = selectedPane || null;
    // this method does not select anything - it only deselects and manipulates toolbars
    if (this.selectedPane) {
        // deselect currently selected
        this.selectedPane.deselect();
    }

    this.selectedPane = selectedPane;

    if (this.onSelectionChanged) {
        this.onSelectionChanged();
    }
};

jstained.Sheet.prototype.uploadPaneImage = function(pane, imageFile) {
    if (this.onPaneImageUpload) {
        this.onPaneImageUpload(pane, imageFile);
    }
};


/* SheetEditor */

jstained.SheetEditor = function(sheet, apiClient, console) {
    this.apiClient = apiClient;
    this.sheet = sheet;
    this.console = console;
    this.selectedPane = null;

    this.defaultPaneData = this.apiClient.getDefaultPane();

    var self = this;
    this.sheet.onSelectionChanged = function() { self.selectionChanged(); };
    this.sheet.onPaneImageUpload = function(pane, imageFile) { self.uploadPaneImage(pane, imageFile); };
};

jstained.SheetEditor.prototype.enable = function() {
    this.sheet.enableSelection();
    this.sheet.enableEditing();
};

jstained.SheetEditor.prototype.disable = function() {
    this.sheet.disableSelection();
    this.sheet.disableEditing();
};

jstained.SheetEditor.prototype.selectParentOfSelected = function() {
    if (this.selectedPane && this.selectedPane.parentPane) {
        this.selectedPane.selectParent();
    }
};

jstained.SheetEditor.prototype.deselect = function() {
    if (this.selectedPane) {
        this.sheet.changeSelection(null);
    }
};

jstained.SheetEditor.prototype.insertPaneNearSelected = function(indexIncrement) {
    var selectedPane = this.selectedPane;
    var parentPane = selectedPane.parentPane;

    if (!selectedPane || !parentPane) {
        return;
    }

    var ind = parentPane.indexOf(this.selectedPane);
    var newInd = ind + indexIncrement;
    var self = this;

    this.console.disableToolbars();
    this.deselect();

    this.apiClient.createPane(
        jstained.tools.combineObjects([
            this.defaultPaneData,
            {parent: parentPane.id}
        ]),
        function(paneData) {
            parentPane.insertChild(newInd, paneData).select();
            self.console.enableToolbars();
        }
    );
};

jstained.SheetEditor.prototype.rotateSelectedPane = function(rotateDir) {
    var selectedPane = this.selectedPane;
    if (!selectedPane) {
        return;
    }

    var parentPane = selectedPane.parentPane;
    var ind = null;
    var self = this;
    if (parentPane) {
        ind = parentPane.indexOf(selectedPane);
    }

    this.console.disableToolbars();

    var apiFunc;
    if (rotateDir == 'cw') {
        apiFunc = function(paneId, callback) { self.apiClient.rotatePaneCw(paneId, callback); }
    } else if (rotateDir== 'ccw') {
        apiFunc = function(paneId, callback) { self.apiClient.rotatePaneCcw(paneId, callback); }
    }

    if (selectedPane) {
        apiFunc(
            selectedPane.id,
            function(updatedPaneData) {
                selectedPane.remove();
                if (parentPane) {
                    parentPane.insertChild(ind, updatedPaneData).select();
                } else {
                    self.removePane();
                    self.setData({pane: updatedPaneData});
                    self.pane.render();
                    self.pane.select();
                }
                self.console.enableToolbars();
            }
        );
    }
};

jstained.SheetEditor.prototype.removeSelectedPane = function() {
    var selectedPane = this.selectedPane;
    var self = this;
    if (!selectedPane || !selectedPane.parentPane) {
        return;
    }

    this.console.disableToolbars();
    this.apiClient.deletePane(
        selectedPane.id,
        function() {
            selectedPane.remove();
            self.console.enableToolbars();
        }
    );
};

jstained.SheetEditor.prototype.splitSelectedPane = function(orientation) {
    var selectedPane = this.selectedPane;
    var parentPane = selectedPane.parentPane;
    if (!selectedPane || !parentPane) {
        return;
    }

    var apiFunc;
    var self = this;
    if (orientation == 'v') {
        apiFunc = function(paneId, callback) { self.apiClient.splitVertically(paneId, callback); }
    } else if (orientation == 'h') {
        apiFunc = function(paneId, callback) { self.apiClient.splitHorizontally(paneId, callback); }
    }
    var ind = parentPane.indexOf(selectedPane);
    this.console.disableToolbars();
    apiFunc(
        selectedPane.id,
        function(newPaneData) {
            selectedPane.remove();
            parentPane.insertChild(ind, newPaneData).select();
            self.console.enableToolbars();
        }
    );
};

jstained.SheetEditor.prototype.promptImageForSelectedPane = function() {
    var selectedPane = this.selectedPane;
    if (selectedPane && selectedPane.children.length == 0) {
        selectedPane.promptImage();
    }
};

jstained.SheetEditor.prototype.uploadPaneImage = function(pane, imageFile) {
    var parentPane = pane.parentPane;
    var ind = parentPane.indexOf(pane);
    var self = this;
    this.console.disableToolbars();
    this.apiClient.setPaneImage(
        pane.id,
        imageFile,
        function(newPaneData) {
            pane.remove();
            parentPane.insertChild(ind, newPaneData).select();
            self.console.enableToolbars();
        }
    );
};

jstained.SheetEditor.prototype.doAction = function(context) {
    if (context.actionKey == 'up') {
        this.selectParentOfSelected();
    } else if (context.actionKey == 'deselect') {
        this.deselect();
    } else if (context.actionKey == 'insertBefore') {
        this.insertPaneNearSelected(0);
    } else if (context.actionKey == 'insertAfter') {
        this.insertPaneNearSelected(1);
    } else if (context.actionKey == 'splitH') {
        this.splitSelectedPane('h');
    } else if (context.actionKey == 'splitV') {
        this.splitSelectedPane('v');
    } else if (context.actionKey == 'rotateCW') {
        this.rotateSelectedPane('cw');
    } else if (context.actionKey == 'rotateCCW') {
        this.rotateSelectedPane('ccw');
    } else if (context.actionKey == 'chooseImage') {
        this.promptImageForSelectedPane();
    } else if (context.actionKey == 'remove') {
        this.removeSelectedPane();
    }
};

jstained.SheetEditor.prototype.selectionChanged = function() {
    if (this.selectedPane) {
        this.console.removeToolbar('editPane');
    }

    //update local selection
    this.selectedPane = this.sheet.selectedPane;
    if (!this.selectedPane) {
        return;
    }

    // update toolbars
    var self = this;
    var editPaneToolbar = this.console.addToolbarByKey('editPane', {
        callback: function(context) { self.doAction(context); }
    });
    if (this.selectedPane.children.length) {
        // filled pane
        if (!this.selectedPane.parentPane) {
            // root pane
            editPaneToolbar.addButtonsByKeys([
                ['deselect'],
                ['rotateCCW', 'rotateCW']
            ]);
        } else {
            // regular filled pane
            editPaneToolbar.addButtonsByKeys([
                ['up', 'deselect'],
                ['insertBefore', 'insertAfter'],
                ['rotateCCW', 'rotateCW'],
                ['remove']
            ]);
        }
    } else {
        // empty pane
        editPaneToolbar.addButtonsByKeys([
            ['up', 'deselect'],
            ['splitV', 'splitH', 'insertBefore', 'insertAfter'],
            ['rotateCCW', 'rotateCW'],
            ['chooseImage'],
            ['remove']
        ]);
    }
};


/* SheetThumbnail */

jstained.SheetThumbnail = function() {

};

jstained.SheetThumbnail.prototype.setContainer = function(container) {
    this.container = container;
    this.sheetThumbBox = new jstained.ui.controls.Block().attach(this.container);
    this.sheetThumbBox.setCssClass('sheet-thumb-box');
};

jstained.SheetThumbnail.prototype.setData = function(sheetData) {

};


/* SheetList */

jstained.SheetList = function(apiClient, console) {
    this.apiClient = apiClient;
    this.console = console;
    this.sheets = [];

    this.container = null;
};

jstained.SheetList.prototype.setData = function(data) {
    var sheets = data.sheets || [];
    for (var i = 0; i < sheets.length; i++) {
        this.addSheet(sheets[i]);
    }
};

jstained.SheetList.prototype.setContainer = function(container) {
    this.container = container;
    this.sheetListView = new jstained.ui.controls.ListView(jstained.SheetThumbnail).attach(this.container);
    this.sheetListView.setCssClass('sheet-listview');
    for (var i = 0; i < sheets.length; i++) {
        this.addSheet(sheets[i]);
    }
};

jstained.SheetList.prototype.addSheet = function(sheetData) {
    var sheetThumb = this.sheetListView.addItemData(sheetData.id, sheetData);
    this.sheets.push(sheetThumb);
};

jstained.SheetList.prototype.applyToItems = function(func) {
    for (var i = 0; i < this.sheets.length; i++) {
        func(this.children[i], i);
    }
};


