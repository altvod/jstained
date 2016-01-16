var jstained = jstained || {};
jstained.ui = jstained.ui || {};
jstained.ui.controls = jstained.ui.controls || {};


/* constants */

jstained.ui.constants = {
    table: 'table',
    vertical: 'vertical',
    horizontal: 'horizontal'
};


/* Element base class */

jstained.ui.controls.Element = function(attributes) {
    this.parent = null;
    this.el = this.createElement();
    this.parent = null;

    this.onAttaching = null;
    this.onAttach = null;
    this.onDetaching = null;
    this.onDetach = null;

    this.loadAttributes(attributes);
};

jstained.ui.controls.Element.prototype.createElement = function() {
    return null;
};

jstained.ui.controls.Element.prototype.attach = function(parent) {
    if (this.onAttaching) {
        this.onAttaching();
    }
    if (parent instanceof jstained.ui.controls.Element) {
        parent = parent.el;
    }
    this.parent = parent;
    this.parent.appendChild(this.el);
    if (this.onAttach) {
        this.onAttach();
    }
    return this;
};

jstained.ui.controls.Element.prototype.detach = function() {
    if (this.onDetaching) {
        this.onDetaching();
    }
    this.parent.removeChild(this.el);
    this.parent = null;
    if (this.onDetach) {
        this.onDetach();
    }
    return this;
};

jstained.ui.controls.Element.prototype.loadAttributes = function(attributes) {
    for (var attr in attributes) {
        if (attributes.hasOwnProperty(attr)) {
            this.el.setAttribute(attr, attributes[attr]);
        }
    }
    return this;
};

jstained.ui.controls.Element.prototype.setCssClass = function(cssClass) {
    this.el.className = cssClass;
};

jstained.ui.controls.Element.prototype.setCssClass = function(cssClass) {
    this.el.className = cssClass;
};

jstained.ui.controls.Element.prototype.setContent = function(content) {
    this.el.innerHTML = content;
};

jstained.ui.controls.Element.prototype.remove = function() {
    this.el.remove();
};

jstained.ui.controls.Element.prototype.setSize = function(size) {
    if (size.width != undefined && size.width != null) {
        this.el.style.width = size.width + 'px';
    }
    if (size.height != undefined && size.height != null) {
        this.el.style.height = size.height + 'px';
    }
};

jstained.ui.controls.Element.prototype.setZeroSize = function() {
    this.setSize({width: 0, height: 0});
};

jstained.ui.controls.Element.prototype.copySize = function(fromElement) {
    if (fromElement instanceof jstained.ui.controls.Element) {
        fromElement = fromElement.el;
    }
    this.setSize({
        width: fromElement.offsetWidth,
        height: fromElement.offsetHeight
    });
};



/* Block */

jstained.ui.controls.Block = function(attributes) {
    jstained.ui.controls.Element.call(this, attributes);
};
jstained.ui.controls.Block.prototype = Object.create(jstained.ui.controls.Element.prototype);
jstained.ui.controls.Block.constructor = jstained.ui.controls.Block;

jstained.ui.controls.Block.prototype.createElement = function() {
    return document.createElement('DIV');
};


/* FileUploader */

jstained.ui.controls.FileUploader = function(attributes) {
    jstained.ui.controls.Element.call(this, attributes);
};
jstained.ui.controls.FileUploader.prototype = Object.create(jstained.ui.controls.Element.prototype);
jstained.ui.controls.FileUploader.constructor = jstained.ui.controls.FileUploader;

jstained.ui.controls.FileUploader.prototype.createElement = function() {
    var el = document.createElement('INPUT');
    el.setAttribute('type', 'file');
    el.style.display = 'none';
    return el;
};

jstained.ui.controls.FileUploader.prototype.getFiles = function() {
    return this.el.files;
};

jstained.ui.controls.FileUploader.prototype.promptFiles = function() {
    this.el.click();
};


/* Table */

jstained.ui.controls.Table = function(attributes) {
    jstained.ui.controls.Element.call(this, attributes);
};
jstained.ui.controls.Table.prototype = Object.create(jstained.ui.controls.Element.prototype);
jstained.ui.controls.Table.constructor = jstained.ui.controls.Table;

jstained.ui.controls.Table.prototype.createElement = function() {
    var table = document.createElement('TABLE');
    table.setAttribute('cellpadding', '0');
    table.setAttribute('cellspacing', '0');
    return table;
};

jstained.ui.controls.Table.prototype.getRowCount = function() {
    return this.el.childNodes.length;
};

jstained.ui.controls.Table.prototype.getColumnCount = function(rowInd) {
    return this.el.childNodes[rowInd].childNodes.length;
};

jstained.ui.controls.Table.prototype.getRow = function(rowInd) {
    return this.el.childNodes[rowInd];
};

jstained.ui.controls.Table.prototype.getRowIndex = function(row) {
    return jstained.tools.getElementIndex(row);
};

jstained.ui.controls.Table.prototype.getCell = function(rowInd, colInd) {
    return this.getRow(rowInd).childNodes[colInd];
};

jstained.ui.controls.Table.prototype.getCellIndex = function(rowInd, cell) {
    return jstained.tools.getElementIndex(cell);
};

jstained.ui.controls.Table.prototype.insertRow = function(beforeInd) {
    var row = document.createElement('TR');
    if (beforeInd < this.getRowCount()) {
        this.el.insertBefore(row, this.getRow(beforeInd));
    } else {
        this.el.appendChild(row);
    }
    return row;
};

jstained.ui.controls.Table.prototype.addRow = function() {
    return this.insertRow(this.getRowCount());
};

jstained.ui.controls.Table.prototype.insertCell = function(rowInd, beforeInd, cell) {
    if (rowInd == this.getRowCount()) {
        this.addRow();
    }
    var row = this.getRow(rowInd);
    cell = cell || document.createElement('TD');
    if (beforeInd < this.getColumnCount(rowInd)) {
        row.insertBefore(cell, this.getCell(rowInd, beforeInd));
    } else {
        row.appendChild(cell);
    }
    return cell;
};

jstained.ui.controls.Table.prototype.addCell = function(rowInd) {
    if (rowInd == undefined) {
        rowInd = this.getRowCount() - 1;
    }
    return this.insertCell(rowInd, this.getColumnCount(rowInd));
};

jstained.ui.controls.Table.prototype.removeRow = function(rowInd) {
    var row = this.getRow(rowInd);
    row.remove();
    return row;
};

jstained.ui.controls.Table.prototype.removeCell = function(rowInd, colInd) {
    var cell = this.getCell(rowInd, colInd);
    cell.remove();
    return cell;
};


/* Grid base class */

jstained.ui.controls.Grid = function(reversed) {
    this.reversed = reversed || false;
    this.table = new jstained.ui.controls.Table();
    this.cellMap = {};
};

jstained.ui.controls.Grid.prototype.attach = function(parent) {
    this.table.attach(parent);
    return this;
};

jstained.ui.controls.Grid.prototype.detach = function() {
    this.table.detach();
    return this;
};

jstained.ui.controls.Grid.prototype.setCssClass = function(cssClass) {
    if (cssClass) {
        this.table.setCssClass(cssClass);
    }
};

jstained.ui.controls.Grid.prototype.indexOf = function(name) {
    return null;
};

jstained.ui.controls.Grid.prototype.insertCell = function(index, name) {
    return null;
};

jstained.ui.controls.Grid.prototype.addCell = function() {
    return null;
};

jstained.ui.controls.Grid.prototype.removeCell = function(name) {};


/* VerticalGrid base class */

jstained.ui.controls.VerticalGrid = function(reversed) {
    jstained.ui.controls.Grid.call(this, reversed);
};
jstained.ui.controls.VerticalGrid.prototype = Object.create(jstained.ui.controls.Grid.prototype);
jstained.ui.controls.VerticalGrid.constructor = jstained.ui.controls.VerticalGrid;

jstained.ui.controls.VerticalGrid.prototype.indexOf = function(name) {
    return this.table.getRowIndex(this.cellMap[name]);
};

jstained.ui.controls.VerticalGrid.prototype.insertCell = function(index, name) {
    if (this.reversed) {
        index = this.table.getRowCount() - index;
    }
    var row = this.table.insertRow(index);
    var cell = this.table.addCell(index);
    if (name) {
        this.cellMap[name] = row;
    }
    return cell;
};

jstained.ui.controls.VerticalGrid.prototype.addCell = function(name) {
    var row;
    if (!this.reversed) {
        row = this.table.addRow();
    } else {
        row = this.table.insertRow(0);
    }
    var rowInd = this.table.getRowIndex(row);
    var cell = this.table.addCell(rowInd);
    if (name) {
        this.cellMap[name] = row;
    }
    return cell;
};

jstained.ui.controls.VerticalGrid.prototype.removeCell = function(name) {
    var row = this.cellMap[name];
    delete this.cellMap[name];
    row.remove();
};


/* HorizontalGrid base class */

jstained.ui.controls.HorizontalGrid = function(reversed) {
    jstained.ui.controls.Grid.call(this, reversed);
    this.table.addRow();
};
jstained.ui.controls.HorizontalGrid.prototype = Object.create(jstained.ui.controls.Grid.prototype);
jstained.ui.controls.HorizontalGrid.constructor = jstained.ui.controls.HorizontalGrid;

jstained.ui.controls.HorizontalGrid.prototype.indexOf = function(name) {
    return this.table.getCellIndex(0, this.cellMap[name]);
};

jstained.ui.controls.HorizontalGrid.prototype.insertCell = function(index, name) {
    if (this.reversed) {
        index = this.table.getColumnCount(0) - index;
    }
    var cell = this.table.insertCell(0, index);
    if (name) {
        this.cellMap[name] = cell;
    }
    return cell;
};

jstained.ui.controls.HorizontalGrid.prototype.addCell = function(name) {
    var cell;
    if (!this.reversed) {
        cell = this.table.addCell();
    } else {
        cell = this.table.insertCell(0, 0);
    }
    if (name) {
        this.cellMap[name] = cell;
    }
    return cell;
};

jstained.ui.controls.HorizontalGrid.prototype.removeCell = function(name) {
    var cell = this.cellMap[name];
    delete this.cellMap[name];
    cell.remove();
};


/* TableGrid base class */

jstained.ui.controls.TableGrid = function(reversed, size) {
    jstained.ui.controls.Grid.call(this, reversed);
    size = size || {};
    this.width = size.width || null;
    this.height = size.height || null;
    this.cells = 0;
};
jstained.ui.controls.TableGrid.prototype = Object.create(jstained.ui.controls.Grid.prototype);
jstained.ui.controls.TableGrid.constructor = jstained.ui.controls.TableGrid;

jstained.ui.controls.TableGrid.prototype.indexToCoords = function(index) {
    if (this.width) {
        return {row: Math.floor(index / this.width), col: index % this.width}
    } else {
        return {row: index % this.height, col: Math.floor(index / this.height)}
    }
};

jstained.ui.controls.TableGrid.prototype.coordsToIndex = function(coords) {
    if (this.width) {
        return coords.row * this.width + coords.col;
    } else {
        return coords.col * this.height + coords.row;
    }
};

jstained.ui.controls.TableGrid.prototype.indexOf = function(name) {
    return this.cellMap[name];
};

jstained.ui.controls.TableGrid.prototype.reloadTable = function() {
    var coords;
    while (this.table.getRowCount()) {
        this.table.removeRow()
    }
    for (var index = 0; index < this.cells.length; index++) {
        coords = this.indexToCoords(index);
        this.table.addCell(coords.row, coords.col, this.cells[index]);
    }
};

jstained.ui.controls.TableGrid.prototype.insertCell = function(index, name) {
    var cell = this.table.addCell();
    this.cells.splice(index, 0, cell);
    this.cellMap[name] = index;
    this.reloadTable();
    return cell;
};

jstained.ui.controls.TableGrid.prototype.addCell = function(name) {
    var index = this.cells.length;
    var coords = this.indexToCoords(index);
    var cell = this.table.addCell(coords.row, coords.col);
    this.cells.push(cell);
    this.cellMap[name] = index;
    return cell;
};

jstained.ui.controls.TableGrid.prototype.removeCell = function(name) {
    var index = this.cellMap[name];
    delete this.cellMap[name];
    this.cells.splice(index, 1);
    this.reloadTable();
};


/* Button */

jstained.ui.controls.Button = function(attributes) {
    this.img = null;
    this.text = '';
    this.tooltip = '';
    this.size = null;
    jstained.ui.controls.Block.call(this, attributes);
};
jstained.ui.controls.Button.prototype = Object.create(jstained.ui.controls.Block.prototype);
jstained.ui.controls.Button.constructor = jstained.ui.controls.Button;

jstained.ui.controls.Button.prototype.createElement = function() {
    var el = jstained.ui.controls.Block.prototype.createElement.call(this);
    this.imgBox = new jstained.ui.controls.Block().attach(el);
    this.textBox = new jstained.ui.controls.Block().attach(el);
    return el;
};

jstained.ui.controls.Button.prototype.loadAttributes = function(attributes) {
    this.setText(attributes.text);
    this.setImage(attributes.image);
    this.setImageSize(attributes.size);
    this.setTooltip(attributes.tooltip);
};

jstained.ui.controls.Button.prototype.setContent = function(content) {};

jstained.ui.controls.Button.prototype.setText = function(text) {
    this.text = text || '';
    this.textBox.setContent(this.text);
};

jstained.ui.controls.Button.prototype.setTooltip = function(tooltip) {
    this.tooltip = tooltip || '';
    if (this.img) {
        this.img.setAttribute('title', this.tooltip);
    }
};

jstained.ui.controls.Button.prototype.setImage = function(imgName) {
    if (!imgName) {
        return;
    }
    this.img = document.createElement('IMG');
    this.img.setAttribute('alt', this.text);
    this.img.setAttribute('title', this.text);
    this.img.setAttribute('src', jstained.url.getImg(imgName));
    this.imgBox.el.appendChild(this.img);
    if (this.size) {
        this.img.setAttribute('height', this.size);
    }
    this.img.setAttribute('title', this.tooltip);
};

jstained.ui.controls.Button.prototype.setImageSize = function(size) {
    if (!size) {
        return;
    }
    this.size = size;
    if (this.img) {
        this.img.setAttribute('height', size);
    }
};


/* SelectableButton */

jstained.ui.controls.SelectableButton = function(attributes) {
    jstained.ui.controls.Button.call(this, attributes);
    this.deselect();
};
jstained.ui.controls.SelectableButton.prototype = Object.create(jstained.ui.controls.Button.prototype);
jstained.ui.controls.SelectableButton.constructor = jstained.ui.controls.SelectableButton;

jstained.ui.controls.SelectableButton.prototype.loadAttributes = function(attributes) {
    jstained.ui.controls.Button.prototype.loadAttributes.call(this, attributes);
    this.selectedCssClass = attributes.selectedCssClass || null;
    this.deselectedCssClass = attributes.deselectedCssClass || null;
};

jstained.ui.controls.SelectableButton.prototype.select = function() {
    this.setCssClass(this.selectedCssClass);
};

jstained.ui.controls.SelectableButton.prototype.deselect = function() {
    this.setCssClass(this.deselectedCssClass);
};


/* ListView */

jstained.ui.controls.ListView = function(attributes) {
    this.itemClass = null;
    this.grid = null;
    this.itemOrder = [];
    this.item = {};
    jstained.ui.controls.Block.call(this, attributes);
    this.setDisplayType(attributes.display);
};
jstained.ui.controls.ListView.prototype = Object.create(jstained.ui.controls.Block.prototype);
jstained.ui.controls.ListView.constructor = jstained.ui.controls.ListView;

jstained.ui.controls.ListView.prototype.loadAttributes = function(attributes) {
    jstained.ui.controls.Element.prototype.loadAttributes.call(this, attributes);
    this.itemClass = attributes.itemClass || null;
};

jstained.ui.controls.ListView.prototype.setDisplayType = function(displayType, size) {
    if (this.grid) {
        this.grid.remove();
    }
    displayType = displayType || jstained.ui.constants.vertical;
    if (displayType == jstained.ui.constants.vertical) {
        this.grid = new jstained.ui.controls.VerticalGrid(false);
    } else if (displayType == jstained.ui.constants.horizontal) {
        this.grid = new jstained.ui.controls.VerticalGrid(false);
    } else if (displayType == jstained.ui.constants.table) {
        this.grid = new jstained.ui.controls.TableGrid(false, size);
    }
    for (var i = 0; i < this.itemOrder.length; i++) {
        this.items[this.itemOrder[i]].setContainer(this.grid.addCell());
    }
};

jstained.ui.controls.ListView.prototype.createItem = function(itemData) {
    var item = new this.itemClass();
    item.setData(itemData);
    return item;
};

jstained.ui.controls.ListView.prototype.addItem = function(name, item) {
    this.items[name] = item;
    this.itemOrder.push(name);
    item.setContainer(this.grid.addCell(name));
    return item;
};

jstained.ui.controls.ListView.prototype.addItemData = function(name, itemData) {
    return this.addItem(name, this.createItem(itemData));
};
