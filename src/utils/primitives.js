// Cryptographic functions
const fs = require('fs')
const crypto = require('crypto')
const args = require('../parameter/args.json');

const IV = args.initial_vector;
function encrypt(inputPath, key, outputPath) {
    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);
    const cipher = crypto.createCipheriv('aes-256-ctr', key, IV);
    return new Promise(resolve => {
        readStream.on('end', ()=>{
            resolve(true);
        }).pipe(cipher).pipe(writeStream);
    })
}

function encryptSync(data, key) {
    const cipher = crypto.createCipheriv('aes-256-ctr', key, IV);
    let result = cipher.update(data, 'utf8', 'hex');
    result += cipher.final('hex');
    return result;
}

function decrypt(inputPath, key, outputPath) {
    const readStream = fs.createReadStream(inputPath);
    const saveStream = fs.createWriteStream(outputPath);
    const decipher = crypto.createDecipheriv('aes-256-ctr', key, IV);
    return new Promise(resolve => {
        readStream.on('end', () => {
            resolve(true);
        }).pipe(decipher).pipe(saveStream);
    })
}

function decryptSync(data, key) {
    const decipher = crypto.createDecipheriv('aes-256-ctr', key, IV);
    let result = decipher.update(data, 'hex', 'hex');
    result += decipher.final('hex');
    return Buffer.from(result,'hex');
}

function hash(filePath, extraBits) {
    const hash = crypto.createHash('sha256');
    const readStream = fs.createReadStream(filePath);
    return new Promise((resolve, reject) => {
        readStream.on('end', () => {
            if(extraBits !== undefined){
                hash.update(extraBits);
            }
            resolve(hash.digest());
        }).pipe(hash)
    })
}

function hashSync(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest();
}


function ConvergentEncryption(filePath) {
    return new Promise((resolve) => {
        hash(filePath).then(fileKay => {
            const cipherPath = filePath + '.enc';
            encrypt(filePath, fileKay, cipherPath).then(() => {
                hash(cipherPath).then(fileTag => {
                    resolve({
                        fileTag: fileTag,
                        fileKey: fileKay,
                        cipherPath: cipherPath,
                    })
                })
            })
        })
    })
}


module.exports = {
    encrypt,
    encryptSync,
    decrypt,
    decryptSync,
    hash,
    hashSync,
    ConvergentEncryption,
}