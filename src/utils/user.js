// User object
const fs = require("fs");

const basePath = 'E:\\TestData\\randData\\users\\';
class User {
    constructor(userAddress) {
        const infoFilePath = basePath + userAddress.toString('hex') + '.json';
        try {
            const infoJson = JSON.parse(fs.readFileSync(infoFilePath));
            this._parseUserJson(infoJson);
        } catch (e){
            this.address = userAddress;
            this.fileList = {};
        }
    }

    _parseUserJson(infoJson){
        this.fileList = infoJson.fileList;
        this.address = infoJson.address;
    }

    addFile(filePath, fileInfo){
        this.fileList[filePath] = {
            fileTag: fileInfo.fileTag.toString('hex'),
            fileKey: fileInfo.fileKey.toString('hex'),
            addressKey: fileInfo.addressKey.toString('hex')
        };
    }

    removeFile(filePath){
        this.fileList[filePath] = undefined;
    }

    toJson(savePath){
        const saveJson = {};
        saveJson.address = this.address;
        saveJson.fileList = this.fileList;
        fs.writeFileSync(savePath, JSON.stringify(saveJson));
    }
}

module.exports = {
    User
}