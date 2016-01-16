/* Module defines what toolbars and buttons the console consists of */

var jstained = jstained || {};

jstained.consoleSettings = {
    viewportCssClass: 'viewport',
    toolbarBlockCssClass: 'console-toolbar-block',
    toolbarSettings: {
        cssClass: 'toolbar',
        overlayCssClass: 'toolbar-overlay',
        separatorCssClass: 'separator',
        buttonSettings: {
            cssClass: 'action-button',
            size: 25
        }
    },
    toolbars: {
        editPane: {
            show: false,
            buttons: {
                up: {image: 'selection-up', tooltip: 'Go up one level'},
                deselect: {image: 'deselect', tooltip: 'Deselect'},
                splitV: {image: 'split-vertically', tooltip: 'Split current box into two forming a vertical column'},
                splitH: {image: 'split-horizontally', tooltip: 'Split current box into two forming a horizontal row'},
                insertBefore: {image: 'insert-before', tooltip: 'Insert a box before the current one'},
                insertAfter: {image: 'insert-after', tooltip: 'Insert a box after the current one'},
                rotateCW: {image: 'rotate-cw', tooltip: 'Rotate box clockwise'},
                rotateCCW: {image: 'rotate-ccw', tooltip: 'Rotate box counterclockwise'},
                remove: {image: 'remove-cell', tooltip: 'Remove current box'},
                chooseImage: {image: 'choose-image', tooltip: 'Upload an image to the box'}
            }
        }
    }
};
