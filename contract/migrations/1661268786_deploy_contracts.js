let dcsdedup = artifacts.require("dcsdedup");



module.exports = async function(_deployer) {
  // Use deployer to state migration tasks.
    _deployer.deploy(dcsdedup,{overwrite: false});
    const fs = require("fs");
    const path = '../src/parameter/args.json';
    const args = JSON.parse(fs.readFileSync(path));
    args.contract_abi = dcsdedup.abi;
    args.contract_address = dcsdedup.address;
    fs.writeFileSync(path, JSON.stringify(args));
};
