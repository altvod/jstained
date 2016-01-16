var jstained = jstained || {};


/* tools */
jstained.tools = {};

jstained.tools.combineObjects = function(objectArr) {
    var newObject = {};
    for (var i = 0; i < objectArr.length; i++) {
        for (var attr in objectArr[i]) {
            if (objectArr[i].hasOwnProperty(attr)) {
                newObject[attr] = objectArr[i][attr];
            }
        }
    }
    return newObject;
};

jstained.tools.shallowCopy = function(obj) {
    return jstained.tools.combineObjects([obj]);
};

jstained.tools.getElementIndex = function(child) {
    var i = 0;
    while ((child = child.previousSibling) != null) {
        i++;
    }
    return i;
};


/* main */

jstained.loadSite = function(settings) {
    var console = new jstained.ui.Console(jstained.consoleSettings).attach();
    var apiClient;

    // prepare client
    if (settings.client.mode == 'remote') {
        apiClient = new jstained.RemoteApiClient(settings.client.remote);
    } else {
        apiClient = new jstained.LocalApiClient();
    }

    // prepare content
    if (settings.content.what == 'sheet') {
        var sheet = new jstained.Sheet();

        if (settings.client.mode == 'local') {
            sheet.setData(apiClient.model.createNewSheet());
        } else {
            sheet.setData(settings.content.sheet);
        }

        sheet.setContainer(console.viewport);
        sheet.render();
        new jstained.SheetEditor(sheet, apiClient, console).enable();
    } else if (settings.content.what == 'sheetList') {
        var sheetList = new jstained.SheetList();

        if (settings.client.mode == 'local') {
            sheetList.setData({sheets: apiClient.model.createNewSheet()});
        } else {
            sheetList.setData(settings.content.sheetList);
        }

        sheetList.setContainer(console.viewport);
        sheetList.render();
    }

};

window.addEventListener('load', function() {jstained.loadSite(jstained.sourceData)}, false);
