const args = require('minimist')(process.argv.slice(2));
const {User} = require("./utils/user");
const service = require('./utils/service');
const basePath = 'E:\\TestData\\randData\\users\\'

async function main() {
    process.removeAllListeners('warning');
    const filePath = args['path'];
    const systemAccounts = await service.initialSystem('ganache');

    switch (args['mode']) {
        case 'upload': {
            // await service.initialFile();
            service.localEncryption(filePath).then(fileInfo => {
                console.log('Local encryption finished.');
                fileInfo.systemAccounts = systemAccounts;
                if(fileInfo.isInitial){
                    console.log('Initial upload request.');
                    fileInfo.currentAccount = systemAccounts[0];
                    const user = new User(fileInfo.currentAccount);
                    service.initialUpload(fileInfo).then(resInfo => {
                        console.log(resInfo);
                        user.addFile(filePath, resInfo);
                        user.toJson(basePath + user.address + '.json');
                    });

                }else{
                    console.log('Subsequent update request.');
                    fileInfo.currentAccount = systemAccounts[1];
                    const user = new User(fileInfo.currentAccount);
                    service.subsequentUpdate(fileInfo).then(resInfo => {
                        console.log(resInfo);
                        user.addFile(filePath, resInfo);
                        user.toJson(basePath + user.address + '.json');
                    });
                }
            })
            break;
        }
        case 'retrieve': {
            console.log('Retrieve request.');
            const user = new User(systemAccounts[0]);
            const fileInfo = {};
            fileInfo.filePath = filePath;
            fileInfo.currentAccount = user.address;
            fileInfo.fileTag = Buffer.from(user.fileList[filePath].fileTag,'hex');
            fileInfo.fileKey = Buffer.from(user.fileList[filePath].fileKey,'hex');
            fileInfo.addressKey = Buffer.from(user.fileList[filePath].addressKey,'hex');
            await service.retrieve(fileInfo);
            break;
        }
        case 'eval': {

            break;
        }
    }
}

main();