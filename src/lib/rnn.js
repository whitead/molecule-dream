import * as tf from '@tensorflow/tfjs';
import config from './model_info.json';

const rnn_mod = {
    startLoad: (fxn) => {
        const loader = tf.loadLayersModel('https://raw.githubusercontent.com/whitead/molecule-dream/main/static/model/model.json');
        loader.then((model) => {
            rnn_mod.model = (t) => {
                return model.predict(t);
            }
            rnn_mod.model_loaded = 'loaded';
            fxn('loaded')
            rnn_mod.resetStates = () => {
                model.resetStates();
            }
        }, () => {
            rnn_mod.model_loaded = 'failed';
            fxn('failed')
        });
    }
};



rnn_mod.resetStates = () => {
    // placeholder, overwritten on load
}


rnn_mod.sample = (x, seed, T = 0.5, k = 1) => {
    return tf.multinomial(
        tf.mul(tf.scalar(1 / (T + 0.00001)), x), k, seed
    );
}

rnn_mod.selfie2vec = (s) => {
    const vec = tf.tensor(s.split('[').slice(1).map((e, i) => {
        if (e)
            parseInt(config.stoi['[' + e]);
    }));
    return vec;
}

rnn_mod.initVec = () => {
    return tf.tensor([0]);
}

rnn_mod.vec2selfie = (v) => {
    const out = v.array().then((x) => {
        if (Array.isArray(x)) {
            return x.map((e, i) => {
                return config.vocab[parseInt(e)];
            });
        } else {
            return [config.vocab[parseInt(x)]];
        }
    });

    return out;
}

export default rnn_mod;
