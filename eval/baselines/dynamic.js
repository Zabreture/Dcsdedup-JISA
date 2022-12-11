const {User} = require("../../src/utils/user");
const service = require('../../src/utils/service');
const crypto = require("crypto");
const primitives = require("../../src/utils/primitives");
const args = require("../../src/parameter/args.json");
const fs = require("fs");
const basePath = '../../../Datasets/randData/users/'

async function storeFile(filePath, uploadType,systemAccounts) {
    const start = new Date().getTime();
    return new Promise(resolve => {
        service.localEncryption(filePath).then(async fileInfo => {
            fileInfo.systemAccounts = systemAccounts;
            if (uploadType === 'IU') {
                // if(fileInfo.isInitial){
                fileInfo.currentAccount = systemAccounts[0];
                const user = new User(fileInfo.currentAccount);
                const random = crypto.randomBytes(16);
                await primitives.hash(filePath + '.enc', random);
                primitives.encryptSync(crypto.randomBytes(34), crypto.randomBytes(32));
                resolve({
                    timeCost: new Date().getTime() - start,
                    filePath: filePath,
                    systemAccounts: systemAccounts,
                })
            } else {
                fileInfo.currentAccount = systemAccounts[1];
                const user = new User(fileInfo.currentAccount);
                await primitives.hash(filePath + '.enc', crypto.randomBytes(16));
                primitives.decryptSync(crypto.randomBytes(34), crypto.randomBytes(32));
                const cipherPath = filePath + '.re';
                const reEncKey = crypto.randomBytes(32);
                const reCipherPath = cipherPath + '.enc';
                await primitives.encrypt(filePath, reEncKey, reCipherPath);
                primitives.encryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
                primitives.encryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
                primitives.encryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
                primitives.encryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
                primitives.encryptSync(crypto.randomBytes(34), crypto.randomBytes(32));
                user.toJson(basePath + user.address + '.json');
                resolve({
                    timeCost: new Date().getTime() - start,
                    filePath: filePath,
                    systemAccounts: systemAccounts,
                })

            }
        })
    })
}

async function retrieveFile(stInfo) {
    const filePath = stInfo.filePath;
    const start = new Date().getTime();
    const user = new User(stInfo.systemAccounts[0]);
    const fileInfo = {};
    fileInfo.filePath = filePath;
    fileInfo.currentAccount = user.address;
    fileInfo.fileTag = crypto.randomBytes(32);
    fileInfo.fileKey = crypto.randomBytes(32);
    fileInfo.addressKey = crypto.randomBytes(34);
    return new Promise(async resolve => {
        const encAddress = crypto.randomBytes(34);
        const reEncKey = crypto.randomBytes(32);
        Buffer.from(primitives.decryptSync(encAddress, crypto.randomBytes(32)));
        primitives.decryptSync(crypto.randomBytes(32), crypto.randomBytes(32));
        await primitives.decrypt(filePath, reEncKey,filePath + '.dec');
        await primitives.decrypt(filePath, reEncKey,filePath + '.dec');
        resolve({
            timeCost: new Date().getTime() - start,
        })
    })
}


module.exports = {
    storeFile,
    retrieveFile
}