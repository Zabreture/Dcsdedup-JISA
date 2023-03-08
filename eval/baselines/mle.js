const primitives = require('../../src/utils/primitives');
const service = require('../../src/utils/service');
const fs = require('fs');
// TODO:  IU and SU
async function storeFile(filePath,uploadType) {
    const cipherPath = filePath + '.enc';
    const start = new Date().getTime();
    const fileKey = await primitives.hash(filePath);
    await primitives.encrypt(filePath, fileKey, filePath + '.enc');
    const fileTag = await primitives.hash(cipherPath);
    if (uploadType === "IU"){
        return new Promise(async resolve => {
<<<<<<< HEAD
            resolve({
                filePath: filePath,
=======
            // const rttStart = new Date().getTime();
            // const fileID = await service.IPFSAdd(cipherPath);
            // const rttIPFS = new Date().getTime() - rttStart;
            resolve({
                filePath: filePath,
                // fileID: fileID,
>>>>>>> 6d704e795ba223f61ca9290f7bfe8771164896a0
                fileKey: fileKey,
                fileTag: fileTag,
                timeCost: new Date().getTime() - start
            })
        })
    }else{
        return new Promise(async resolve => {
<<<<<<< HEAD
            resolve({
                filePath: filePath,
=======
            // const rttStart = new Date().getTime();
            // const fileID = await service.IPFSAdd(cipherPath);
            // const rttIPFS = new Date().getTime() - rttStart;
            resolve({
                filePath: filePath,
                // fileID: fileID,
>>>>>>> 6d704e795ba223f61ca9290f7bfe8771164896a0
                fileKey: fileKey,
                fileTag: fileTag,
                timeCost: new Date().getTime() - start
            })
        })
    }
}

async function retrieveFile(stInfo) {
    const start = new Date().getTime();
    const savePath = stInfo.filePath + '.enc';
<<<<<<< HEAD
=======
    // const rttStart = new Date().getTime();
    // await service.IPFSCat(savePath, stInfo.fileID);
    // const rttIPFS = new Date().getTime() - rttStart;
>>>>>>> 6d704e795ba223f61ca9290f7bfe8771164896a0
    const retPath = await primitives.decrypt(
        savePath,
        stInfo.fileKey,
        stInfo.filePath + '.ret.bin'
    );
    const timeCost = new Date().getTime() - start;
    return {
        retPath: retPath,
        timeCost: timeCost
    }
}

module.exports = {
    storeFile,
    retrieveFile,
}