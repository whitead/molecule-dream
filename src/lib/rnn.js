import * as tf from '@tensorflow/tfjs';

const config  = {
    rnn_size: 128
};

const rnn_mod = { model: (x,s) => { return null } };

const model_load = tf.loadLayersModel('https://raw.githubusercontent.com/whitead/molecule-dream/main/model/model.json?token=AAG5YZMLREC3MQI2PEKC3OTBAMEYI');

model_load.then((model) => {
    rnn_mod.model = model;
});

rnn_mod.init_s = () => {
    return tf.zeros([1,config.rnn_size]);
}

rnn_mod.sample = (x, seed, k=1) => {
    return tf.multinomial(
        x, k, seed
    );
}

export default rnn_mod;
