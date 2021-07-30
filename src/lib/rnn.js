import * as tf from '@tensorflow/tfjs';
import config from './model_info.json'

const rnn_mod = {
    model: (x, s) => {
        console.log('FAKE!!');
        return [tf.randomNormal([config.vocab_size]), s]
    }
};

const model_load = tf.loadLayersModel('https://raw.githubusercontent.com/whitead/molecule-dream/main/model/model.json');

model_load.then((model) => {
    console.log('LOADED!!');
    rnn_mod.model = model;
});

rnn_mod.init_s = () => {
    return tf.zeros([1, config.rnn_size]);
}

rnn_mod.sample = (x, seed, k = 1) => {
    // return tf.multinomial(
    //     x, k, seed
    // );
    return tf.argMax(x, -1);
}

rnn_mod.selfie2vec = (s) => {
    const vec = tf.tensor(s.split('[').slice(1).map((e, i) => {
        if (e)
            parseInt(config.stoi['[' + e]);
    }));
    return vec;
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
