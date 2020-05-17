const DataStorageContract = artifacts.require("DataStorageContract");

module.exports = function(deployer) {
  deployer.deploy(DataStorageContract);
};
