const primitives = require('./primitives');
const {UserBTree} = require('./userBTree');

// Smart Contract
const Web3 = require('web3');
const truffleConfig = require('../../contract/truffle-config');
let contract, systemAccounts, web3, userBTree;

async function initialSystem(mode) {
    console.log("----------------------");
    console.log("System initializing ...");
    if (mode === 'ganache') {
        web3 = new Web3(new Web3.providers.HttpProvider(
            'http://' + truffleConfig.networks.development.host
            + ':' + truffleConfig.networks.development.port
        ));
        systemAccounts = await web3.eth.getAccounts();
        userBTree = new UserBTree(systemAccounts, args.userBTreeSavePath);
    } else if (mode === 'rinkeby') {
        web3.setProvider(new Web3.providers.HttpProvider(args.rinkeby_url));
        const signer = web3.eth.accounts.privateKeyToAccount(
            args.rinkeby_private_key
        );
        web3.eth.accounts.wallet.add(signer);
    }

    contract = new web3.eth.Contract(
        args.contract_abi,
        args.contract_address
    );
    console.log("  Successfully initialized\n----------------------");
    return systemAccounts;
}

function initialFile(){
    const bytes = crypto.randomBytes(32);
    fs.writeFileSync('E:/TestData/randData/1MB.bin', bytes,'binary');
}

// Deduplication service
function dedupCheck(fileTag) {
    const promise1 = contract.methods.FIndexGet('0x' + fileTag.toString('hex')).call();
    const promise2 = contract.methods.UListGet('0x' + fileTag.toString('hex')).call();
    return Promise.all([promise1, promise2]).then(result => {
        result.isInitial = (result[0].head === "0x0000000000000000000000000000000000000000000000000000000000000000");
        return result;
    });
}

function localEncryption(filePath) {
    return new Promise((resolve) => {
        primitives.ConvergentEncryption(filePath).then(encRes => {
            dedupCheck(encRes.fileTag).then((fIndexRes)=> {
                resolve({
                    filePath: filePath,
                    fileKey: encRes.fileKey,
                    fileTag: encRes.fileTag,
                    isInitial: fIndexRes.isInitial,
                })
            })
        });
    })
}

function initialUpload(info){
    const filePath = info.filePath;
    const random = crypto.randomBytes(16);
    const promise1 = IPFSAdd(filePath + '.enc');
    const promise2 = primitives.hash(filePath + '.enc', random);
    return Promise.all([promise1, promise2]).then(value => {
        const encAddress = primitives.encryptSync(value[0], value[1]);
        const promise3 = FIndexPut(info.fileTag, random, encAddress, info.currentAccount);
        const promise4 = UIndexPut(info.fileTag, info.currentAccount);
        return Promise.all([promise3, promise4]).then(res => {
            info.addressKey = value[1].toString('hex');
            info.fIndexGasUsed = res[0].gasUsed;
            info.uIndexGasUsed = res[1].gasUsed;
            fs.unlinkSync(filePath + '.enc');
            return info;
        })
    })
}

function subsequentUpdate(info){
    return new Promise(async resolve => {
        FIndexGet(info.fileTag).then(metaData => {
            primitives.hash(info.filePath + '.enc', metaData.random).then(addressKey => {
                info.fileID = primitives.decryptSync(metaData.encAddress, addressKey);
                _reEncryption(info, userBTree).then(reCipherPath => {
                    IPFSAdd(reCipherPath).then(reFileID => {
                        const reEncAddress = primitives.encryptSync(reFileID, addressKey);
                        FIndexPut(info.fileTag, metaData.random, reEncAddress, info.currentAccount).then(gasUsed => {
                            info.gasUsed = gasUsed;
                            info.refileID = reFileID;
                            info.oldMetadata = metaData;
                            info.addressKey = addressKey;
                            info.reEncAddress = reEncAddress;
                            info.reCipherPath = reCipherPath;
                            userBTree.toJson(args.userBTreeSavePath);
                            fs.unlinkSync(info.filePath + '.enc');
                            fs.unlinkSync(info.filePath + '.re.enc');
                            fs.unlinkSync(info.filePath + '.re');
                            resolve(info);
                        })
                    })
                })
            })
        })
    })
}

function retrieve(fileInfo) {
    const promise1 = UIndexGet(fileInfo.fileTag);
    const promise2 = FIndexGet(fileInfo.fileTag);
    return Promise.all([promise1, promise2]).then(async value => {
        const reEncKEK = await userBTree.getUsedKey(fileInfo.currentAccount, value[0]);
        const encAddress = value[1].encAddress;
        const fileID = Buffer.from(primitives.decryptSync(encAddress, fileInfo.addressKey));
        const retPath = fileInfo.filePath + '.ret.bin';
        const promise3 = IPFSCat(retPath, fileID);
        const promise4 = UIndexGet(fileInfo.fileTag);
        Promise.all([promise3,promise4]).then(async _value => {
            const keyGroup = await userBTree.getGroupKeys(_value[1]);
            _getKeyCipher(retPath, keyGroup.length).then(keyCipherGroup => {
                const index = keyGroup.indexOf(reEncKEK);
                const reEncKey = primitives.decryptSync(
                    keyCipherGroup[index], Buffer.from(reEncKEK,'hex'));
                primitives.decrypt(retPath, reEncKey,retPath + '.dec').then(() => {
                    primitives.decrypt(retPath + '.dec', fileInfo.fileKey, retPath).then(() => {
                        fs.unlinkSync(fileInfo.filePath + '.ret.bin.dec');
                    });
                });
            })
        });
    })

}

function _getKeyCipher(filePath, keyNum){
    return new Promise(resolve => {
        fs.open(filePath, "r+", async (err, fd) => {
            const fileLen = fs.statSync(filePath).size;
            let buffer = Buffer.alloc(32 * keyNum);
            fs.read(fd, buffer, 0, 32 * keyNum, fileLen - 32 * keyNum,
                (err, bytesRead, buffer) => {
                const keyCipherGroup = [];
                for(let i = 0; i < keyNum; i ++){
                    keyCipherGroup.push(buffer.slice(i * 32, i * 32 + 32));
                }
                fs.ftruncate(fd, fileLen - keyNum * 32 - 32,()=>{});
                fs.close(fd);
                resolve(keyCipherGroup);
            })

        })
    })
}

function _reEncryption(info, userBTree) {
    return new Promise(resolve => {
        const cipherPath = info.filePath + '.re';
        const reEncKey = crypto.randomBytes(32);
        const reCipherPath = cipherPath + '.enc';
        IPFSCat(cipherPath, info.fileID).then(() => {
            primitives.encrypt(cipherPath, reEncKey, reCipherPath).then(() => {
                UIndexGet(info.fileTag).then(ownerList => {
                    userBTree.getGroupKeys(ownerList).then(keyGroup => {
                        let keyCiphers = '0000000000000000000000000000000000000000000000000000000000000000';
                        for(let key of keyGroup){
                            const tmp = primitives.encryptSync(reEncKey, Buffer.from(key, 'hex'));
                            keyCiphers += tmp;
                        }
                        fs.appendFile(reCipherPath, Buffer.from(keyCiphers,'hex'),() => {
                            resolve(reCipherPath)
                        })
                    })
                })
            })
        })
    })
}

function FIndexGet(fileTag){
    fileTag = '0x' + fileTag.toString('hex');
    return new Promise(resolve => {
        contract.methods.FIndexGet(fileTag).call().then(res => {
            const all = res.head.substr(2) + res.tail.substr(2);
            resolve ({
                random: Buffer.from(all.substr(0, 32),'hex'),
                encAddress: Buffer.from(all.substr(32, 68),'hex'),
            })
        })
    })
}

function FIndexPut(fileTag, random, encAddress, currentAccount){
    fileTag = '0x' + fileTag.toString('hex');
    random = random.toString('hex');
    encAddress = encAddress.toString('hex');

    const head = '0x' + random + encAddress.substr(0, 32);
    const tail = '0x' + encAddress.substr(32,encAddress.length) + '0000000000000000000000000000'
    return new Promise(resolve => {
        contract.methods.FIndexPut(fileTag, head, tail).send({
            gasLimit: 800000,
            from: currentAccount,
        }).then(res => {
            resolve(res);
        });
    })
}

function UIndexGet(fileTag){
    fileTag = '0x' + fileTag.toString('hex');
    return contract.methods.UListGet(fileTag).call();
}

function UIndexPut(fileTag, currentAccount){
    fileTag = '0x' + fileTag.toString('hex');
    return contract.methods.UListPut(fileTag, currentAccount).send({
        from: currentAccount,
        gasLimit: 800000,
    });
}


// Evaluation
const caller = require('axios');
const OPRF = require('oprf');
const base58 = require("bs58");
const crypto = require("crypto");
const args = require("../parameter/args.json");
const baseUrl = args.base_url;

async function blindSign(fileKey) {
    while(true){
        const oprf = new OPRF();
        await oprf.ready;
        const masked = oprf.maskInput(fileKey);
        const sendData = oprf.encodePoint(masked.point, 'UTF-8');
        const salted = await caller.post(baseUrl + '/keyServer', {
            maskedPoint: sendData
        }).then(response => {
            return oprf.decodePoint(response.data.salted, 'UTF-8');
        })
        if(oprf.isValidPoint(salted)){
            return oprf.unmaskPoint(salted, masked.mask)
        }else{
            console.log('Error when signing key, start resign ...');
        }
    }
}

async function roundTrip(reqSize, resSize){
    const start = new Date().getTime();
    return await caller.post(baseUrl + '/roundTrip', {
        data: crypto.randomBytes(reqSize),
        resSize: resSize,
    }).then(()=>{
        return new Date().getTime() - start;
    })
}

async function FIndexGetRTT(){
    fileTag = '0x' + crypto.randomBytes(32).toString('hex');
    return contract.methods.FIndexGet(fileTag).call();
}

async function FIndexPutRTT(currentAccount){
    const fileTag = '0x0000000000000000000000000000000000000000000000000000000000000001';
    return contract.methods.FIndexPut(fileTag, fileTag, fileTag).send({
        gasLimit: 500000,
        from: currentAccount,
    });
}

async function UIndexGetRTT(){
    fileTag = '0x' + crypto.randomBytes(32).toString('hex');
    return contract.methods.UListGet(fileTag).call();
}

async function UIndexPutRTT(currentAccount){
    const fileTag = '0x0000000000000000000000000000000000000000000000000000000000000001';
    return contract.methods.UListPut(fileTag, currentAccount).send({
        gasLimit: 500000,
        from: currentAccount,
    });
}

async function UIndexRmRTT(currentAccount){
    const fileTag = '0x0000000000000000000000000000000000000000000000000000000000000001';
    return contract.methods.UListRm(fileTag, currentAccount).send({
        gasLimit: 500000,
        from: currentAccount,
    });
}

// IPFS
const ipfsClient = require('ipfs-http-client');
const fs = require("fs");
const ipfs = ipfsClient.create(args.IPFS_api);

function IPFSAdd(filePath) {
    const readStream = fs.createReadStream(filePath);
    return ipfs.add(readStream).then(result => {
        return Buffer.from(base58.decode(result.path));
        // return result.path;
    });
}

function _IPFSAddSync(data) {
    return ipfs.add(data).then(result => {
        return Buffer.from(base58.decode(result.path));
    });
}

async function IPFSCat(filePath, CID) {
    CID = base58.encode(CID);
    const writeStream = fs.createWriteStream(filePath);
    for await (const chunk of ipfs.cat(CID)) {
        writeStream.write(chunk);
    }
}

async function _IPFSCatSync(CID) {
    let data = ''
    CID = base58.encode(CID);
    for await (const chunk of ipfs.cat(CID)){
        data += Buffer.from(chunk).toString('hex');
    }
    return Buffer.from(data, 'hex');
}

module.exports = {
    initialSystem,
    IPFSCat,
    IPFSAdd,
    dedupCheck,
    initialFile,
    FIndexPut,
    FIndexGet,
    localEncryption,
    initialUpload,
    subsequentUpdate,
    FIndexPutRTT,
    FIndexGetRTT,
    UIndexPutRTT,
    UIndexGetRTT,
    UIndexRmRTT,
    retrieve,
}