const crypto = require('crypto');
const {User} = require("../../src/utils/user");
const primitives = require('../../src/utils/primitives');

async function storeFile(filePath, uploadType,systemAccounts) {
    const start = new Date().getTime();
    if(uploadType === 'IU'){
        return new Promise(async resolve => {
            const fileKey = crypto.randomBytes(32);
            const promise1 = primitives.encrypt(filePath,fileKey,filePath + '.enc');
            const promise2 = primitives.hash(filePath).then(hashValues => {
                return primitives.hashSync(hashValues);
            });
            Promise.all([promise1, promise2]).then(results =>{
                primitives.encryptSync(fileKey, fileKey);
                primitives.encryptSync(fileKey, fileKey);
                primitives.encryptSync(fileKey, fileKey);
                primitives.encryptSync(fileKey, fileKey);
                resolve({
                    fileTag: results[1],
                    fileKey: fileKey,
                    filePath: filePath,
                    timeCost: new Date().getTime() - start,
                    // systemAccounts: systemAccounts,
                });
            })
        })
    }else{
        return new Promise(async resolve => {
            const fileKey = crypto.randomBytes(32);
            const promise1 = primitives.encrypt(filePath,fileKey,filePath + '.enc');
            const promise2 = primitives.hash(filePath).then(hashValues => {
                return primitives.hashSync(hashValues);
            });
            Promise.all([promise1, promise2]).then(results =>{
                primitives.encryptSync(fileKey, fileKey);
                primitives.encryptSync(fileKey, fileKey);
                primitives.encryptSync(fileKey, fileKey);
                primitives.encryptSync(fileKey, fileKey);
                resolve({
                    fileTag: results[1],
                    fileKey: fileKey,
                    filePath: filePath,
                    timeCost: new Date().getTime() - start,
                    // systemAccounts: systemAccounts,
                });
            })
        })
    }

}

async function retrieveFile(stInfo) {
    const filePath = stInfo.filePath;
    const start = new Date().getTime();
    // const user = new User(stInfo.systemAccounts[0]);
    // const fileInfo = {};
    // fileInfo.filePath = filePath;
    // fileInfo.currentAccount = user.address;
    return new Promise(resolve => {
        primitives.decrypt(filePath, stInfo.fileKey,filePath + '.enc').then(()=>{
            resolve({
                timeCost: new Date().getTime() - start,
            })
        })
    })
}


module.exports = {
    storeFile,
    retrieveFile
}