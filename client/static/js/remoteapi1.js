var jstained = jstained || {};


/* urls */

jstained.url = jstained.url || {};

jstained.url.imgRoot = '/static/img';

jstained.url.join = function(parts) {
    var url = '';
    for (var i = 0; i < parts.length; i++) {
        url += parts[i] + '/';
    }
    return url;
};

jstained.url.getImg = function(imgName) {
    return jstained.url.join([jstained.url.imgRoot, imgName+'.png']);
};


/* RemoteApiClient */

jstained.RemoteApiClient = function(clientSettings) {
    this.token = clientSettings.token;
    this.apiRoot = clientSettings.url;
    this.successStatuses = [200, 201, 204];
};

jstained.RemoteApiClient.prototype.send = function(url, method, data, success, error) {
    var xhr = new XMLHttpRequest();
    var self = this;
    xhr.onreadystatechange=function() {
        if (xhr.readyState==4) {
            var response = xhr.responseText || null;
            console.log('Status: '+xhr.status+';   Response: '+ response);
            if (response) {
                response = JSON.parse(response);
            }
            if (self.successStatuses.indexOf(xhr.status) >= 0) {
                if (success) {
                    success(response);
                }
            } else {
                if (error) {
                    error(response);
                }
            }
        }
    };
    xhr.open(method, url, true);
    xhr.setRequestHeader('Accept', 'application/json,*/*');
    xhr.setRequestHeader('X-CSRFToken', this.token);
    if (data) {
        console.log(method + ' ' + url);
        if (data instanceof FormData) {
            console.log('    => form data');
        } else {
            xhr.setRequestHeader('Content-Type', 'application/json');
            console.log('    => ' + JSON.stringify(data));
            data = JSON.stringify(data);
        }
        xhr.send(data);
    } else {
        xhr.send();
    }
};

jstained.RemoteApiClient.prototype.getSheet = function(sheetId, callback) {
    this.send(jstained.url.join([this.apiRoot, 'sheets', sheetId]), 'GET', {}, callback);
};

jstained.RemoteApiClient.prototype.getDefaultPane = function() {
    return {
        parent: null,
        border: null,
        direction: 'right',
        text: '',
        image: null
    };
};

jstained.RemoteApiClient.prototype.getPane = function(paneId, callback) {
    this.send(jstained.url.join([this.apiRoot, 'panes', paneId]), 'GET', {}, callback);
};

jstained.RemoteApiClient.prototype.deletePane = function(paneId, callback) {
    this.send(jstained.url.join([this.apiRoot, 'panes', paneId]), 'DELETE', {}, callback);
};

jstained.RemoteApiClient.prototype.createPane = function(paneData, callback) {
    this.send(jstained.url.join([this.apiRoot, 'panes']), 'POST', paneData, callback);
};

jstained.RemoteApiClient.prototype.updatePane = function(paneId, paneData, callback) {
    this.send(jstained.url.join([this.apiRoot, 'panes', paneId, 'expanded']), 'PUT', paneData, callback);
};

jstained.RemoteApiClient.prototype.rotatePaneCw = function(paneId, callback) {
    this.send(jstained.url.join([this.apiRoot, 'panes', paneId, 'rotatecw']), 'PUT', {}, callback);
};

jstained.RemoteApiClient.prototype.rotatePaneCcw = function(paneId, callback) {
    this.send(jstained.url.join([this.apiRoot, 'panes', paneId, 'rotateccw']), 'PUT', {}, callback);
};

jstained.RemoteApiClient.prototype.splitVertically = function(paneId, callback) {
    this.send(jstained.url.join([this.apiRoot, 'panes', paneId, 'vsplit']), 'POST', {}, callback);
};

jstained.RemoteApiClient.prototype.splitHorizontally = function(paneId, callback) {
    this.send(jstained.url.join([this.apiRoot, 'panes', paneId, 'hsplit']), 'POST', {}, callback);
};

jstained.RemoteApiClient.prototype.setPaneImage = function(paneId, file, callback) {
    var data = new FormData();
    data.append('image', file, file.name);
    this.send(jstained.url.join([this.apiRoot, 'panes', paneId, 'image']), 'PUT', data, callback);
};
