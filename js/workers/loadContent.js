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
    return new Promise(async function(resolve, reject) {
        let url = "/color/" + hexCode;
        let response = await fetch(url);
        if(!response.ok){
          console.log(response);
          reject(response.url);
        }
        let text = await response.text(),
            hash = {};
            hash[id] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text);
            resolve(hash);
    });
}
