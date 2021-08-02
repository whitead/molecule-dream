let selfieWorker = null;
const resolvers = {};
let id = 0;
const MAX_ID = 2 ** 10

export const startSelfiesWorker = () => {
    if (selfieWorker !== null)
        return;
    selfieWorker = new Worker('./selfies_worker.js');
    selfieWorker.onmessage = (e) => {
        const data = e.data;
        const mid = data[1];
        const result = data[2];
        resolvers[mid](result);
        delete resolvers[mid];
    }
}

export const selfiesLoadStatus = () => {
    if (selfieWorker === null) {
        return new Promise(resolve =>
            resolve({
                pyodide: 'waiting',
                selfies: 'waiting'
            }));
    }
    id = (id + 1) % MAX_ID;
    selfieWorker.postMessage(['loading-status', id, null]);
    return new Promise(resolve => resolvers[id] = resolve);
}

export const selfies2smiles = (s) => {
    if (selfieWorker === null) {
        return new Promise(resolve => resolve(''));
    }
    id = (id + 1) % MAX_ID;
    selfieWorker.postMessage(['s2s', id, s]);
    return new Promise(resolve => resolvers[id] = resolve);
}