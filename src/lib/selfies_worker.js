

// make fake function to start with
const selfiesMod = {
    selfies2smiles: s => { return '' },
    pyodideLoaded: 'loading',
    selfiesLoaded: 'loading'
};

console.log('SELFIE WORKER: Started')
importScripts('https://cdn.jsdelivr.net/pyodide/v0.18.1/full/pyodide.js')

loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/" }).then((pyodide) => {
    selfiesMod.pyodideLoaded = 'loaded';
    pyodide.loadPackage('micropip').then(() => {
        pyodide.runPythonAsync(`
            import micropip
            await micropip.install('selfies==1.0.4')
            from selfies import decoder
        `, (err) => {
            selfiesMod.pyodideLoaded = 'failed';
            selfiesMod.selfiesLoaded = 'failed';
        }).then(() => {
            selfiesMod.selfiesLoaded = 'loaded'
            const decoder = pyodide.globals.get('decoder');
            selfiesMod.selfies2smiles = (selfies) => {
                let result = decoder(selfies);
                return result;
            };
        });
    }, (err) => {
        selfiesMod.selfiesLoaded = 'failed';
    })
});


onmessage = (e) => {
    const data = e.data;
    const mtype = data[0];
    const mid = data[1];
    let result = '';
    if (mtype === 'loading-status') {
        result = { pyodide: selfiesMod.pyodideLoaded, selfies: selfiesMod.selfiesLoaded };
    } else {
        result = selfiesMod.selfies2smiles(data[2]);
    }
    postMessage([mtype, mid, result]);
}
