const utils = require('../../src/utils/primitives');
const nodeRSA = require('node-rsa');
const rsaKey = new nodeRSA({b:512});
const service = require('../../src/utils/service');
const crypto = require('crypto');
// const userAccount = "0xc81F4b041c636D58cc91482B7023f29195aF835C";


async function storeFile(filePath, uploadType) {
    const start = new Date().getTime();
    const fileKey = await utils.hash(filePath);
    const cipherPath = filePath + '.enc';
    await utils.encrypt(filePath, fileKey, cipherPath);
    const fileTag_1 = await crypto.randomBytes(32);
    const encryptedTag = rsaKey.encrypt(fileKey);
    if(uploadType === 'IU'){
        utils.hashSync(fileTag_1);
        // const rttStart = new Date().getTime();
        // const fileID = await service.IPFSAdd(cipherPath);
        // const rttIPFS = new Date().getTime() - rttStart;
        return {
            filePath: filePath,
            fileTag: encryptedTag,
            // fileID: fileID,
            timeCost: new Date().getTime() - start
        }
    }else{
    //     // const rttStart = new Date().getTime();
    //     // const metadata = await service.FIndexGet(fileTag);
    //     // const rttBlk = new Date().getTime() - rttStart;
    //     const addressKey = await utils.hash(cipherPath, crypto.randomBytes(16));
    //     const fileID = await utils.decryptSync(crypto.randomBytes(34), addressKey);
        await utils.hash(filePath);
        utils.hashSync(fileKey);
        // const tmp = Date.now();
        // const fileID = await service.IPFSAdd(cipherPath);
        // const tmpTime = Date.now() - tmp;
        return {
            filePath: filePath,
            // flag: true,
            // fileID: fileID,
            fileTag: encryptedTag,
            timeCost: new Date().getTime() - start
        }
    }
}

async function retrieveFile(stInfo) {
    const start = new Date().getTime();
    // const savePath = stInfo.filePath + '.enc';
    // const rttStart = new Date().getTime();
    // await service.IPFSCat(savePath, stInfo.fileID);
    // const rttIPFS = new Date().getTime() - rttStart;
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