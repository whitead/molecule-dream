import * as tf from '@tensorflow/tfjs';
import config from './model_info.json'

const rnn_mod = {
    model: (x, s) => {
        return [tf.randomNormal([config.vocab_size]), s]
    }
};

const model_load = tf.loadLayersModel('https://raw.githubusercontent.com/whitead/molecule-dream/main/model/model.json?token=AAG5YZMLREC3MQI2PEKC3OTBAMEYI');

model_load.then((model) => {
    rnn_mod.model = model;
}, () => { });

rnn_mod.init_s = () => {
    return tf.zeros([1, config.rnn_size]);
}

rnn_mod.sample = (x, seed, k = 1) => {
    return tf.multinomial(
        x, k, seed
    );
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
        return x.map((e, i) => {
            return config.vocab[parseInt(e)];
        });
    });

    return out;
}

export default rnn_mod;
