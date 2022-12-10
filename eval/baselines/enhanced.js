const utils = require('../../src/utils/primitives');
const service = require('../../src/utils/service');
const crypto = require('crypto');
const userAccount = "0xc81F4b041c636D58cc91482B7023f29195aF835C";


async function storeFile(filePath, uploadType) {
    const start = new Date().getTime();
    const fileKey = await utils.hash(filePath);
    const cipherPath = filePath + '.enc';
    await utils.encrypt(filePath, fileKey, cipherPath);
    const fileTag = await utils.hash(cipherPath);
    if(uploadType === 'IU'){
        // const rttStart = new Date().getTime();
        // await service.FIndexGet(fileTag);
        const fileID = crypto.randomBytes(34);
        // const rttIPFS = new Date().getTime() - rttStart;
        const random = crypto.randomBytes(16);
        const addressKey = await utils.hash(cipherPath, random);
        const encAddress = utils.encryptSync(fileID, addressKey);
        // const rttBlk = new Date().getTime();
        // const res = await service.FIndexPut(fileTag, random, encAddress,userAccount);
        // const rttBlk_ = new Date().getTime() - rttBlk;
        return {
            filePath: filePath,
            // flag: res.flag,
            fileID: fileID,
            fileKey: fileKey,
            timeCost: new Date().getTime() - start
        }
    }else{
        // const rttStart = new Date().getTime();
        // const metadata = await service.FIndexGet(fileTag);
        // const rttBlk = new Date().getTime() - rttStart;
        const addressKey = await utils.hash(cipherPath, crypto.randomBytes(16));
        const fileID = await utils.decryptSync(crypto.randomBytes(34), addressKey);
        return {
            filePath: filePath,
            // flag: true,
            fileID: fileID,
            fileKey: fileKey,
            timeCost: new Date().getTime() - start
        }
    }
}

async function retrieveFile(stInfo) {
    const start = new Date().getTime();
    const savePath = stInfo.filePath + '.enc';
    // const rttStart = new Date().getTime();
    // await service.IPFSCat(savePath, stInfo.fileID);
    // const rttIPFS = new Date().getTime() - rttStart;
    const retPath = stInfo.filePath + '.ret.bin';
    await utils.decrypt(stInfo.filePath, stInfo.fileKey, retPath);
    return {
        retPath: retPath,
        timeCost: new Date().getTime() - start
    }
}

module.exports = {
    storeFile,
    retrieveFile,
}