/*jslint node:true, browser:true, esnext:true */
'use strict';

module.exports = (path, method, callback, type, data) => {
    let xhr = new XMLHttpRequest();

    xhr.open(method, path);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            if (type === 'RAW') {
                callback(xhr.responseText);
            } else {
                callback(JSON.parse(xhr.responseText));
            }
        }
    };

    if (data) {
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));
    } else {
        xhr.send();
    }
    
};
