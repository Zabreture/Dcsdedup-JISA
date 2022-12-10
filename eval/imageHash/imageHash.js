// let exec = require('child_process').exec;
const util = require('util');
const imgHash = require('imghash');
let exec = util.promisify(require('child_process').exec);


// Define file paths
const prefix = './NeuralHash/'
const modelPath = prefix + 'model.onnx ';
const seedPath = prefix + 'neuralhash_128x96_seed1.dat ';
const nnHashPth = prefix + 'nnhash.py ';

// CSAM Apple Neural Hash
function imageHash_apple(imgPath) {
    const cmd = 'python ' + nnHashPth + modelPath + seedPath + imgPath;
    return exec(cmd)
}

// Image hash form GitHub
function imageHash_git(imgPath){
    return imgHash.hash(imgPath);
}


async function test() {
    let start, res;
    start = Date.now();
    res = await imageHash_apple('./testImages/test0.jpg');
    console.log(res.stdout.trim());
    console.log(`Time cost: ${Date.now() - start}\n\n`);

    start = Date.now();
    res = await imageHash_apple('./testImages/test1.jpg');
    console.log(res.stdout.trim());
    console.log(`Time cost: ${Date.now() - start}\n\n`);

    start = Date.now();
    res = await imageHash_git('./testImages/test0.jpg');
    console.log(res);
    console.log(`Time cost: ${Date.now() - start}\n\n`);

    start = Date.now();
    res = await imageHash_git('./testImages/test1.jpg');
    console.log(res);
    console.log(`Time cost: ${Date.now() - start}\n\n`);
}

test();

module.exports = {
    imageHash_apple,
    imageHash_git
}