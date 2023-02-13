const Web3 = require("web3");
const truffleConfig = require("../contract/truffle-config");
const args = require("../src/parameter/args.json");
const userAccount = "0xc81F4b041c636D58cc91482B7023f29195aF835C";

async function test() {
    console.log("----------------------");
    console.log("System initializing ...");

    web3 = new Web3(new Web3.providers.HttpProvider(
        'http://' + truffleConfig.networks.development.host
        + ':' + truffleConfig.networks.development.port
    ));

    let test_contract = new web3.eth.Contract(
        args.test_abi,
        args.test_address
    );

    const start = Date.now();
    console.log(start);

    test_contract.events.record({
        filter:{},
        fromBlock: 'latest'
    }, (error, event) => {
        let cost = Date.now() - start;
        console.log('Event time: ' + cost);
        console.log(event);
    })

    test_contract.methods.add_pure(100, 100).send({
            from: userAccount,
        }
    ).then(res => {
        let cost = Date.now() - start;
        console.log('Then time: ' + cost);
        console.log('Send');
        console.log(res.gasUsed);

    })


}

test();