/* Module defines the different parts of the user console
 * This includes the viewport, toolbars (top, side), etc. */

var jstained = jstained || {};
jstained.ui = jstained.ui || {};

/* ActionButton */

jstained.ui.ActionButton = function(settings, context) {
    this.parent = null;
    this.context = context || {};
    this.callback = settings.callback || context.callback || null;

    this.button = new jstained.ui.controls.Button({
        text: settings.text || '',
        image: settings.image || null,
        size: settings.size || null,
        tooltip: settings.tooltip || ''
    });
    this.button.setCssClass(settings.cssClass || null);

    // bind it to click event
    var self = this;
    this.button.el.addEventListener('click', function () {
        self.doAction();
    });
};

jstained.ui.ActionButton.prototype.attach = function(parent) {
    this.parent = parent;
    this.button.attach(this.parent);
    return this;
};

jstained.ui.ActionButton.prototype.detach = function() {
    this.button.detach();
    this.parent = null;
    return this;
};

jstained.ui.ActionButton.prototype.remove = function() {
    delete this.button;
    return this;
};

jstained.ui.ActionButton.prototype.doAction = function() {
    if (this.callback) {
        this.callback(this.context);
    }
};

jstained.ui.ActionButton.prototype.click = function() {
    this.button.el.click();
};


/* Toolbar */

jstained.ui.Toolbar = function(settings, context) {
    this.parent = null;
    this.context = context || {};
    this.orientation = settings.orientation || jstained.ui.constants.horizontal;
    this.buttonConfiguration = settings.buttons || {};
    this.separatorCssClass = settings.separatorCssClass || null;
    this.buttonSettings = settings.buttonSettings || {};

    this.buttons = {};
    this.container = new jstained.ui.controls.Block();
    this.container.setCssClass(settings.cssClass || null);
    this.overlay = new jstained.ui.controls.Block().attach(this.container);
    this.overlay.setCssClass(settings.overlayCssClass || null);
    this.grid = null;

    if (this.orientation == jstained.ui.constants.vertical) {
        this.grid = new jstained.ui.controls.VerticalGrid().attach(this.container);
    } else if (this.orientation == jstained.ui.constants.horizontal) {
        this.grid = new jstained.ui.controls.HorizontalGrid().attach(this.container);
    }

    for (var actionKey in this.buttonConfiguration) {
        if (this.buttonConfiguration.hasOwnProperty(actionKey)) {
            if (this.buttonConfiguration[actionKey].show) {
                this.addButtonByKey(actionKey, {});
            }
        }
    }
};

jstained.ui.Toolbar.prototype.attach = function(parent) {
    this.parent = parent;
    this.container.attach(this.parent);
    return this;
};

jstained.ui.Toolbar.prototype.detach = function() {
    this.container.detach();
    this.parent = null;
    return this;
};

jstained.ui.Toolbar.prototype.addButton = function(actionKey, buttonSettings, buttonContext) {
    buttonContext = buttonContext || {};
    buttonContext = jstained.tools.combineObjects([this.context, buttonContext]);
    buttonContext.actionKey = actionKey;
    buttonSettings = jstained.tools.combineObjects([this.buttonSettings, buttonSettings]);
    this.buttons[actionKey] =
        new jstained.ui.ActionButton(buttonSettings, buttonContext).attach(this.grid.addCell(actionKey));
};

jstained.ui.Toolbar.prototype.addButtonByKey = function(actionKey, buttonContext) {
    this.addButton(actionKey, this.buttonConfiguration[actionKey], buttonContext);
};

jstained.ui.Toolbar.prototype.addSeparator = function(separatorKey) {
    var sep = new jstained.ui.controls.Block().attach(this.grid.addCell(separatorKey));
    sep.setCssClass(this.separatorCssClass);
};

jstained.ui.Toolbar.prototype.addButtonsByKeys = function(actionKeyArr, buttonContext) {
    var actionKey;
    for (var i = 0; i < actionKeyArr.length; i++) {
        if (Array.isArray(actionKeyArr[i])) {
            // got a group of buttons (do this recursively)
            this.addButtonsByKeys(actionKeyArr[i], buttonContext);
            if (i < actionKeyArr.length-1) {
                // not the last element, so add a separator after this button group
                this.addSeparator();
            }
        } else {
            // single button
            actionKey = actionKeyArr[i];
            this.addButton(actionKey, this.buttonConfiguration[actionKey], buttonContext);
        }
    }
};

jstained.ui.Toolbar.prototype.removeButton = function(actionKey) {
    this.buttons[actionKey].remove();
    delete this.buttons[actionKey];
    this.grid.removeCell(actionKey);
};

jstained.ui.Toolbar.prototype.removeSeparator = function(separatorKey) {
    this.grid.removeCell(separatorKey);
};

jstained.ui.Toolbar.prototype.remove = function() {
    for (var actionKey in this.buttons) {
        if (this.buttons.hasOwnProperty(actionKey)) {
            this.removeButton(actionKey);
        }
    }
    return this;
};

jstained.ui.Toolbar.prototype.disable = function() {
    this.overlay.copySize(this.container);
};

jstained.ui.Toolbar.prototype.enable = function() {
    this.overlay.setZeroSize();
};


/* Console */

jstained.ui.Console = function(settings, context) {
    this.null;
    this.context = context || {};
    settings = settings || {};

    this.toolbarConfiguration = settings.toolbars || {};
    this.toolbarSettings = settings.toolbarSettings || {};
    this.toolbarCssClass = settings.toolbarCssClass || null;

    this.toolbarBlock = new jstained.ui.controls.Block();
    this.toolbarBlock.setCssClass(settings.toolbarBlockCssClass || null);
    this.toolbarGrid = new jstained.ui.controls.VerticalGrid().attach(this.toolbarBlock);
    this.viewport = new jstained.ui.controls.Block();
    this.viewport.setCssClass(settings.viewportCssClass || null);

    this.toolbars = {};

    for (var toolbarKey in this.toolbarConfiguration) {
        if (this.toolbarConfiguration.hasOwnProperty(toolbarKey)) {
            if (this.toolbarConfiguration[toolbarKey].show) {
                this.addToolbarByKey(toolbarKey, {});
            }
        }
    }
};

jstained.ui.Console.prototype.attach = function(parent) {
    this.parent = parent || document.querySelector('body');
    this.toolbarBlock.attach(this.parent);
    this.viewport.attach(this.parent);
    return this;
};

jstained.ui.Console.prototype.detach = function() {
    this.toolbarBlock.detach();
    this.viewport.detach();
    this.parent = null;
    return this;
};

jstained.ui.Console.prototype.addToolbar = function(toolbarKey, toolbarSettings, toolbarContext) {
    var toolbar;
    if (this.toolbars[toolbarKey]) {
        return this.toolbars[toolbarKey];
    }
    toolbarContext = jstained.tools.combineObjects([this.context, toolbarContext]);
    toolbarSettings = jstained.tools.combineObjects([this.toolbarSettings, toolbarSettings]);
    toolbar = new jstained.ui.Toolbar(toolbarSettings, toolbarContext);
    toolbar.attach(this.toolbarGrid.addCell(toolbarKey));
    this.toolbars[toolbarKey] = toolbar;
    return toolbar;
};

jstained.ui.Console.prototype.addToolbarByKey = function(toolbarKey, toolbarContext) {
    return this.addToolbar(toolbarKey, this.toolbarConfiguration[toolbarKey], toolbarContext);
};

jstained.ui.Console.prototype.removeToolbar = function(toolbarKey) {
    this.toolbars[toolbarKey].remove();
    delete this.toolbars[toolbarKey];
    this.toolbarGrid.removeCell(toolbarKey);
};

jstained.ui.Console.prototype.disableToolbars = function() {
    for (var toolbarKey in this.toolbars) {
        if (this.toolbars.hasOwnProperty(toolbarKey)) {
            this.toolbars[toolbarKey].disable();
        }
    }
};

jstained.ui.Console.prototype.enableToolbars = function() {
    for (var toolbarKey in this.toolbars) {
        if (this.toolbars.hasOwnProperty(toolbarKey)) {
            this.toolbars[toolbarKey].enable();
        }
    }
};
