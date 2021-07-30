// make fake function to start with
const selfies_mod = { selfies2smiles: s => { return '[C]' } };

const promise = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/dev/full/" });

promise.then((pyodide) => {
    pyodide.loadPackage('micropip').then(() => {
        pyodide.runPythonAsync(`
        import micropip
        await micropip.install('selfies')
        from selfies import decoder
    `).then(() => {
            const decoder = pyodide.globals.get('decoder');
            selfies_mod.selfies2smiles = (selfies) => {
                console.log('Converting', selfies);
                //let result = pyodide.runPython(`decoder(r'${selfies}')`);
                let result = decoder(selfies);
                console.log('result', result);
                return result;
            };
        });
    })

});

export default selfies_mod;