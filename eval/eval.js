const fs = require('fs');
const utils = require('../src/utils/primitives');
const service = require('../src/utils/service');
const args = require('minimist')(process.argv.slice(2));
const basePath = "E:/TestData/randData/";
const reps = 1;
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
            break;
        }
        case 'dynamic' : {
            scheme = require('./baselines/dynamic');
            systemAccounts = await service.initialSystem('ganache');
            break;
        }
        case 'tian' : {
            scheme = require('./baselines/tian');
            systemAccounts = await service.initialSystem('ganache');
            break;
        }
        case 'other' : {
            systemAccounts = await service.initialSystem('ganache');
            testOther(systemAccounts[0]);
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
    let fGetPromises = [],fPutPromises = [],uGetPromises = [],uPutPromises = [],uRmPromises = [];
    for(let i = 0; i < reps; i ++){
        fGetPromises.push(new Promise(resolve => {
            const start = new Date().getTime();
            service.FIndexGetRTT().then(res => {
                resolve({
                    timeCost: new Date().getTime() - start,
                })
            })
        }));
        uGetPromises.push(new Promise(resolve => {
            const start = new Date().getTime();
            service.UIndexGetRTT().then(res => {
                resolve({
                    timeCost: new Date().getTime() - start,
                })
            })
        }));
        fPutPromises.push(new Promise(resolve => {
            const start = new Date().getTime();
            service.FIndexPutRTT(account).then(res => {
                // console.log(new Date().getTime() - start);
                resolve({
                    timeCost: new Date().getTime() - start,
                    gasCost: res.gasUsed,
                })
            })
        }));
        uPutPromises.push(new Promise(resolve => {
            const start = new Date().getTime();
            service.UIndexPutRTT(account).then(res => {
                const timeCost = new Date().getTime() - start;
                uRmPromises.push(new Promise(resolve1 => {
                    const start1 = new Date().getTime();
                    service.UIndexRmRTT(account).then(res=>{
                        resolve1({
                            timeCost: new Date().getTime() - start1,
                            gasCost: res.gasUsed,
                        })
                    })
                }))
                resolve({
                    timeCost: timeCost,
                    gasCost: res.gasUsed,
                })
            })
        }));
    }
    await Promise.all(fGetPromises).then(values => {
        let timeCost = 0, gasCost = 0;
        for (let value of values) {
            timeCost += value.timeCost;
        }
        fs.writeFileSync(otherPath, '\n'+timeCost/reps+', ',{flag:'a'})
    })
    await Promise.all(fPutPromises).then(values => {
        let timeCost = 0, gasCost = 0;
        for (let value of values) {
            timeCost += value.timeCost;
            gasCost += value.gasCost;
        }
        fs.writeFileSync(otherPath, ''+timeCost/reps+', ',{flag:'a'})
        fs.writeFileSync(otherPath, ''+gasCost/reps+', ',{flag:'a'})
    })
    await Promise.all(uGetPromises).then(values => {
        let timeCost = 0, gasCost = 0;
        for (let value of values) {
            timeCost += value.timeCost;
        }
        fs.writeFileSync(otherPath, ''+timeCost/reps+', ',{flag:'a'})
    })
    await Promise.all(uPutPromises).then(values => {
        let timeCost = 0, gasCost = 0;
        for (let value of values) {
            timeCost += value.timeCost;
            gasCost += value.gasCost;
        }
        fs.writeFileSync(otherPath, ''+timeCost/reps+', ',{flag:'a'})
        fs.writeFileSync(otherPath, ''+gasCost/reps+', ',{flag:'a'})
    })
    await Promise.all(uRmPromises).then(values => {
        let timeCost = 0, gasCost = 0;
        for(let value of values){
            timeCost += value.timeCost;
            gasCost += value.gasCost;
        }
        fs.writeFileSync(otherPath, ''+timeCost/reps+', ',{flag:'a'})
        fs.writeFileSync(otherPath, ''+gasCost/reps+', ',{flag:'a'})
    })
}

async function warmUp(){
    const filePath = basePath + nameSets[0];
    for(let i = 0; i< 50;i++){
        const scheme = require('./baselines/mle');
        await scheme.storeFile(filePath);


    }
}

evaluate();