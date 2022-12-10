const service = require('../src/utils/service');
const {UserBTree} =  require('../src/utils/userBTree');
const {User} = require('../src/utils/user');
const fs = require("fs");
const primitive = require('../src/utils/primitives');

async function test() {
    // process.removeAllListeners('warning');
    // await service.initialSystem('ganache');
    // const Web3 = require('web3');
    // const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    // web3.eth.getAccounts().then(userList => {
    //     // const userBTree = new UserBTree(userList);
    //     // const userGroup = userList;
    //     // userBTree.getGroupKeys(userGroup).then(async res => {
    //     //     console.log(res);
    //     //     await userBTree.printTree()
    //     //     console.log(await userBTree.getUsedKey(userGroup[2], userGroup));
    //     // })
    //     const userAddress = userList[0];
    //     const user = new User(userAddress);
    //     user.addFile('E:\\TestData\\randData\\test.txt', {
    //         fileTag: 'tag', fileKey: 'key', addressKey: 'addrKey'
    //     });
    //     user.addFile('E:\\TestData\\randData\\test1.txt', {
    //         fileTag: 'tag', fileKey: 'key', addressKey: 'addrKey'
    //     });
    //     user.toJson('E:\\TestData\\randData\\users\\'+userAddress+'.json');
    //     const user_ = new User(userAddress);
    //     console.log(user_);
    // })
    // const str = '';
    // console.log(str);
    const saveStream = fs.createWriteStream('E:/TestData/randData/')
}

test();