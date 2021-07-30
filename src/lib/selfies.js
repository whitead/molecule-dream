// make fake function to start with
const selfies_mod = { selfies2smiles: s => { return '[C]' }, pyoded_loaded: 'loading', selfies_loaded: 'loading' };

selfies_mod.startLoad = (fxn1, fxn2) => {
    const promise = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/dev/full/" });
    return promise.then((pyodide) => {
        selfies_mod.pyoded_loaded = 'loaded';
        fxn1('loaded')
        pyodide.loadPackage('micropip').then(() => {
            pyodide.runPythonAsync(`
            import micropip
            await micropip.install('selfies')
            from selfies import decoder
        `, (err) => {
            selfies_mod.pyoded_loaded = 'failed';
            fxn1('failed')
            selfies_mod.selfies_loaded = 'failed';
        }).then(() => {
                selfies_mod.selfies_loaded = 'loaded'
                fxn2('loaded')
                const decoder = pyodide.globals.get('decoder');
                selfies_mod.selfies2smiles = (selfies) => {
                    //let result = pyodide.runPython(`decoder(r'${selfies}')`);
                    let result = decoder(selfies);
                    return result;
                };
            });
        }, (err) => {
            selfies_mod.selfies_loaded = 'failed';
            fxn2('loaded')
        })

    });
}


export default selfies_mod;