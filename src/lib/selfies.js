// make fake function to start with
const selfiesMod = { selfies2smiles: s => { return '[C]' }, pyodideLoaded: 'waiting', selfiesLoaded: 'waiting' };

selfiesMod.startLoad = (fxn1, fxn2) => {
    if(selfiesMod.pyodideLoaded !== 'waiting')
        return
    selfiesMod.pyodideLoaded = 'loading'
    selfiesMod.selfiesLoaded = 'loading'
    const promise = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/dev/full/" });
    return promise.then((pyodide) => {
        selfiesMod.pyodideLoaded = 'loaded';
        fxn1('loaded')
        pyodide.loadPackage('micropip').then(() => {
            pyodide.runPythonAsync(`
            import micropip
            await micropip.install('selfies')
            from selfies import decoder
        `, (err) => {
            selfiesMod.pyodideLoaded = 'failed';
            fxn1('failed')
            selfiesMod.selfiesLoaded = 'failed';
        }).then(() => {
                selfiesMod.selfiesLoaded = 'loaded'
                fxn2('loaded')
                const decoder = pyodide.globals.get('decoder');
                selfiesMod.selfies2smiles = (selfies) => {
                    //let result = pyodide.runPython(`decoder(r'${selfies}')`);
                    let result = decoder(selfies);
                    return result;
                };
            });
        }, (err) => {
            selfiesMod.selfiesLoaded = 'failed';
            fxn2('loaded')
        })

    });
}


export default selfiesMod;