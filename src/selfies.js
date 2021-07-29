const selfies_mod = { selfies2smiles: s => { return s } };

const promise = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.17.0/full/" });

promise.then(() => {
    pyodide.runPythonAsync(`
        import micropip
        await micropip.install('selfies')
        import selfies
    `).then(() => {
        ;
        selfies_mod.selfies2smiles = (selfies) => {
            console.log(pyodide.runPython(`
            import sys
            sys.version
        `));
            return selfies;
        }
    });
});

export default selfies_mod;