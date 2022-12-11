const fs = require('fs');
const crypto = require('crypto');
const basePath = "../../../Datasets/randData/";
const service = require('../src/utils/service');
const primitives = require('../src/utils/primitives');
const {file} = require("truffle/build/2478.bundled");
const args = require('minimist')(process.argv.slice(2));
const reps = 10;
const nameSets = [
    '1MB.bin',
    '2MB.bin', '3MB.bin', '4MB.bin', '5MB.bin',
    '6MB.bin', '7MB.bin', '8MB.bin', '9MB.bin', '10MB.bin',
    // '11MB.bin', '12MB.bin', '13MB.bin','14MB.bin', '15MB.bin',
    // '16MB.bin'
]
const storePath = './eval/store.csv';
const retrievePath = './eval/retrieve.csv';
const otherPath = './eval/other.csv';
const speedPath = './eval/speed.csv';

async function evaluate(){
    let scheme;
    const uploadType = args['type'];
    let systemAccounts;
    switch (args['mode']) {
        case 'mle' : scheme = require('./baselines/mle');break;
        case 'enhanced' : {
            scheme = require('./baselines/enhanced');
            await service.initialSystem('ganache');
            break;
        }
        case 'hur' : {
            scheme = require('./baselines/hur');
            systemAccounts = await service.initialSystem('ganache');
            console.log('test');
            break;
        }
        case 'dynamic' : {
            scheme = require('./baselines/dynamic');
            systemAccounts = await service.initialSystem('ganache');
            break;
        }
        case 'other' : {
            // systemAccounts = await service.initialSystem('ganache');
            await testOther();
        }
    }
    if(args['mode'] === 'other'){
        return;
    }
    await warmUp();
    fs.writeFileSync(storePath, '\n'+args['mode']+ args['type']+',',{flag:'a'});
    fs.writeFileSync(retrievePath, '\n'+args['mode']+args['type']+',',{flag:'a'});

    for(const filename of nameSets){
        console.log('Testing ' + filename + ' ...');
        const filePath = basePath + filename;
        let storeTime = 0, retTime = 0, gasUsed = 0;
        for(let rep = 0; rep < reps; rep ++){
            await scheme.storeFile(filePath,uploadType,systemAccounts).then(async stInfo => {
                retInfo = await scheme.retrieveFile(stInfo);
                storeTime += stInfo.timeCost;
                retTime += retInfo.timeCost;

            })
        }
        fs.writeFileSync(storePath, storeTime/reps+',',{flag:'a'})
        fs.writeFileSync(retrievePath, retTime/reps+',',{flag:'a'})
    }
}

async function testOther(account){
    systemAccounts = await service.initialSystem('ganache');
    // let fGetPromises = [],fPutPromises = [],uGetPromises = [],uPutPromises = [];
    // for(let i = 0; i < reps; i ++){
    //     fGetPromises.push(new Promise(resolve => {
    //         const start = new Date().getTime();
    //         service.FIndexGetRTT().then(res => {
    //             resolve({
    //                 timeCost: new Date().getTime() - start,
    //             })
    //         })
    //     }));
    //     uGetPromises.push(new Promise(resolve => {
    //         const start = new Date().getTime();
    //         service.UIndexGetRTT().then(res => {
    //             resolve({
    //                 timeCost: new Date().getTime() - start,
    //             })
    //         })
    //     }));
    //     fPutPromises.push(new Promise(resolve => {
    //         const start = new Date().getTime();
    //         service.FIndexPutRTT(account).then(res => {
    //             resolve({
    //                 timeCost: new Date().getTime() - start,
    //                 gasCost: res.gasUsed,
    //             })
    //         })
    //     }));
    //     uPutPromises.push(new Promise(resolve => {
    //         const start = new Date().getTime();
    //         service.UIndexPutRTT(account).then(res => {
    //             resolve({
    //                 timeCost: new Date().getTime() - start,
    //                 gasCost: res.gasUsed,
    //             })
    //         })
    //     }));
    // }
    // await Promise.all(fGetPromises).then(values => {
    //     let timeCost = 0, gasCost = 0;
    //     for (let value of values) {
    //         timeCost += value.timeCost;
    //     }
    //     fs.writeFileSync(otherPath, '\n'+timeCost/reps+', ',{flag:'a'})
    // })
    // await Promise.all(fPutPromises).then(values => {
    //     let timeCost = 0, gasCost = 0;
    //     for (let value of values) {
    //         timeCost += value.timeCost;
    //         gasCost += value.gasCost;
    //     }
    //     fs.writeFileSync(otherPath, ''+timeCost/reps+', ',{flag:'a'})
    //     fs.writeFileSync(otherPath, ''+gasCost/reps+', ',{flag:'a'})
    // })
    // await Promise.all(uGetPromises).then(values => {
    //     let timeCost = 0, gasCost = 0;
    //     for (let value of values) {
    //         timeCost += value.timeCost;
    //     }
    //     fs.writeFileSync(otherPath, ''+timeCost/reps+', ',{flag:'a'})
    // })
    // await Promise.all(uPutPromises).then(values => {
    //     let timeCost = 0, gasCost = 0;
    //     for (let value of values) {
    //         timeCost += value.timeCost;
    //         gasCost += value.gasCost;
    //     }
    //     fs.writeFileSync(otherPath, ''+timeCost/reps+', ',{flag:'a'})
    //     fs.writeFileSync(otherPath, ''+gasCost/reps+', ',{flag:'a'})
    // })
    const filePath = basePath + '100MB.bin';

    let timeCost1=0,timeCost2=0,timeCost3=0,timeCost4=0,timeCost5=0;
    for(let i=0;i<reps;i++){
        let start = new Date().getTime();
        await primitives.hash(filePath)
        timeCost1 += new Date().getTime() - start;

        const start2 = new Date().getTime();
        await primitives.encrypt(filePath, crypto.randomBytes(32),filePath + '.enc')
        timeCost2 += new Date().getTime() - start2;

        const start3 = new Date().getTime();
        await primitives.decrypt(filePath, crypto.randomBytes(32),filePath + '.enc')
        timeCost3 += new Date().getTime() - start3;

        const start4 = new Date().getTime();
        const address = await service.IPFSAdd(filePath);
        console.log('Round: ' + i);
        timeCost4 += new Date().getTime() - start4;

        const start5 = new Date().getTime();
        await service.IPFSCat(filePath+'.enc', address);
        timeCost5 += new Date().getTime() - start5;
    }



    fs.writeFileSync(speedPath, '\n'+100*1024*1.024/timeCost1*reps+', ',{flag:'a'});
    fs.writeFileSync(speedPath, 100*1024*1.024/timeCost2*reps+', ',{flag:'a'});
    fs.writeFileSync(speedPath, 100*1024*1.024/timeCost3*reps+', ',{flag:'a'});
    fs.writeFileSync(speedPath, 100*1024*1.024/timeCost4*reps+', ',{flag:'a'});
    fs.writeFileSync(speedPath, 100*1024*1.024/timeCost5*reps+'',{flag:'a'});

}

async function warmUp(){
    const filePath = basePath + nameSets[5];
    for(let i = 0; i< 10;i++){
        const scheme = require('./baselines/mle');
        await scheme.storeFile(filePath);


    }
}

evaluate();