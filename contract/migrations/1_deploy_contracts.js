let dcsdedup = artifacts.require("dcsdedup");
let test = artifacts.require("test");



module.exports = async function(_deployer) {
  // Use deployer to state migration tasks.
    _deployer.deploy(dcsdedup,{overwrite: false}).then(()=>{
        return _deployer.deploy(test,{overwrite: true}, dcsdedup.address).then(()=>{
            const fs = require("fs");
            const path = '../src/parameter/args.json';
            const args = JSON.parse(fs.readFileSync(path));

            args.test_abi = test.abi;
            args.test_address = test.address;

            args.contract_abi = dcsdedup.abi;
            args.contract_address = dcsdedup.address;

            fs.writeFileSync(path, JSON.stringify(args));
        });

    });
};
