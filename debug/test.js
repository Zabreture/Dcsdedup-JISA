const crypto = require('crypto');
const reps = 10;
const service = require('../src/utils/service');
const userAccount = "0xc81F4b041c636D58cc91482B7023f29195aF835C";

async function test() {
    await service.initialSystem('ganache');
    let time = 0;
    for(let i=0;i<reps;i++){
        const start = Date.now();
        await service.FIndexGetRTT();
        time += Date.now() - start;
    }
    console.log('FIndexGet: ' + time / reps);

    time = 0;
    for(let i=0;i<reps;i++){
        const start = Date.now();
        await service.FIndexPutRTT(userAccount);
        time += Date.now() - start;
    }
    console.log('FIndexPut: ' + time / reps);

    time = 0;
    for(let i=0;i<reps;i++){
        const start = Date.now();
        await service.UIndexGetRTT();
        time += Date.now() - start;
    }
    console.log('UIndexGet: ' + time / reps);

    time = 0;
    for(let i=0;i<reps;i++){
        const start = Date.now();
        await service.UIndexPutRTT(userAccount);
        time += Date.now() - start;
    }
    console.log('UIndexPut: ' + time / reps);

}

test();