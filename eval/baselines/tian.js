const utils = require('../../src/utils/primitives');
const nodeRSA = require('node-rsa');
const rsaKey = new nodeRSA({b:512});
const crypto = require('crypto');


async function storeFile(filePath, uploadType) {
    const start = new Date().getTime();
    const fileKey = await utils.hash(filePath);
    const cipherPath = filePath + '.enc';
    await utils.encrypt(filePath, fileKey, cipherPath);
    const fileTag_1 = await crypto.randomBytes(32);
    const encryptedTag = rsaKey.encrypt(fileKey);
    if(uploadType === 'IU'){
        utils.hashSync(fileTag_1);
        return {
            filePath: filePath,
            fileTag: encryptedTag,
            // fileID: fileID,
            timeCost: new Date().getTime() - start
        }
    }else{
        await utils.hash(filePath);
        utils.hashSync(fileKey);
        return {
            filePath: filePath,
            fileTag: encryptedTag,
            timeCost: new Date().getTime() - start
        }
    }
}

async function retrieveFile(stInfo) {
    const start = new Date().getTime();
    const retPath = stInfo.filePath + '.ret.bin';
    const fileKey = rsaKey.decrypt(stInfo.fileTag)
    await utils.decrypt(stInfo.filePath + '.enc', fileKey, retPath);
    return {
        retPath: retPath,
        timeCost: new Date().getTime() - start
    }
}

module.exports = {
    storeFile,
    retrieveFile,
}