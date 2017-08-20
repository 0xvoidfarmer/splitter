var Split = artifacts.require("./Split.sol");

module.exports = function(deployer) {
  deployer.deploy(Split,{ gas: 1000000 });
};
