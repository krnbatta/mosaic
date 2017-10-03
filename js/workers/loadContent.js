this.addEventListener('message', (event) => {
    let tilesArr = JSON.parse(event.data);
    let promisesArr = [];
    tilesArr.forEach((tileHash) => {
        let svgPromise = fetchSvg(tileHash);
        promisesArr.push(svgPromise);
    })
    Promise.all(promisesArr).then((resolvedPromises) => {
        this.postMessage(resolvedPromises);
    });
});

function fetchSvg(hexCodeHash) {
    let id = Object.keys(hexCodeHash)[0];
    let hexCode = hexCodeHash[id];
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        var url = "/color/" + hexCode;
        xhr.open('GET', url);
        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                let hash = {};
                hash[id] = xhr.response;
                resolve(hash);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function() {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}
