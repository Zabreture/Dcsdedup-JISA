const {User} = require("../../src/utils/user");
const service = require('../../src/utils/service');
const crypto = require("crypto");
const primitives = require("../../src/utils/primitives");
const args = require("../../src/parameter/args.json");
const fs = require("fs");
const basePath = 'E:\\TestData\\randData\\users\\'
const userAccount = "0xc81F4b041c636D58cc91482B7023f29195aF835C";

const reEncKey = Buffer.from('66378d4b03e7da1da2309ca9c759e3ed79352b2230ed022ee917f53f310691fc', 'hex');
const random = Buffer.from('79352b2230ed022ee917f53f310691fc', 'hex');

async function storeFile(filePath, uploadType,systemAccounts) {
    const start = new Date().getTime();
    const fileKey = await primitives.hash(filePath);
    await primitives.encrypt(filePath, fileKey, filePath + '.enc');
    const fileTag = await primitives.hash(filePath + '.enc');
    // const fileInfo = await service.localEncryption(filePath);
    // fileInfo.systemAccounts = systemAccounts;
    // await service.FIndexGet(fileInfo.fileTag);
    if (uploadType === 'IU') {
        // if(fileInfo.isInitial){
        // fileInfo.currentAccount = systemAccounts[0];
        const promise1 = primitives.encrypt(filePath + '.enc', reEncKey, filePath + '.re');
        const promise2 = primitives.hash(filePath + '.enc', random);
        // await primitives.encrypt(filePath + '.enc', reEncKey, filePath + '.re');
        // const addressKey = await primitives.hash(filePath + '.enc', random);
        // service.initialUpload(fileInfo).then(retInfo => {
        //     user.addFile(filePath, resInfo);
        //     user.toJson(basePath + user.address + '.json');
        // })
        const results = await Promise.all([promise1, promise2]);
        const addressKey = results[1];
        primitives.encryptSync(crypto.randomBytes(32), addressKey);
        return ({
            timeCost: new Date().getTime() - start,
            filePath: filePath,
            reEncKey: reEncKey,
            uploadType: uploadType,
            fileKey: fileKey,
            // systemAccounts: systemAccounts,
        })
    } else {
        // fileInfo.currentAccount = systemAccounts[1];
        const promise1 = primitives.decrypt(
            filePath + '.re',
            reEncKey,
            filePath + '.re.dec').then(async () => {
            const testTag = await primitives.hash(filePath + '.re.dec');
            // console.log(testTag.toString('hex') === fileInfo.fileTag.toString('hex'));
        })
        const promise2 = primitives.encrypt(filePath + '.enc', reEncKey, filePath + '.re2')
        const results = await Promise.all([promise1, promise2]);
        await primitives.hash(filePath + '.enc', crypto.randomBytes(16));
        primitives.decryptSync(crypto.randomBytes(34), crypto.randomBytes(32));
        primitives.encryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
        primitives.encryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
        primitives.encryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
        primitives.encryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
        primitives.encryptSync(crypto.randomBytes(34), crypto.randomBytes(32));
        return ({
            timeCost: new Date().getTime() - start,
            filePath: filePath,
            reEncKey: reEncKey,
            fileKey: fileKey,
            uploadType: uploadType,
            systemAccounts: systemAccounts,
        })
    }

}

async function retrieveFile(stInfo) {
    const start = new Date().getTime();
    const filePath = stInfo.filePath;
    const reEncKey = stInfo.reEncKey;
    const fileKey = stInfo.fileKey;
    primitives.encryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
    primitives.encryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
    primitives.encryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
    return new Promise(async resolve => {
        const encAddress = crypto.randomBytes(34);
        Buffer.from(primitives.decryptSync(encAddress, crypto.randomBytes(32)));
        primitives.decryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
        if(stInfo.uploadType === 'IU'){
            await primitives.decrypt(filePath + '.re', reEncKey,filePath + '.enc');
            await primitives.decrypt(filePath + '.enc', fileKey,filePath + '.ret.bin');
        }else{
            await primitives.decrypt(filePath + '.re2', reEncKey,filePath + '.enc');
            await primitives.decrypt(filePath + '.enc', fileKey,filePath + '.ret.bin');
        }
        resolve({
            timeCost: new Date().getTime() - start,
        })
    })
}


module.exports = {
    storeFile,
    retrieveFile
}