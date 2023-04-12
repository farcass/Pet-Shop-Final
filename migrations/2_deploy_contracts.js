var Adoption = artifacts.require("Adoption");
var Election = artifacts.require("Election");
var Donations = artifacts.require("Donations");


module.exports = function(deployer) {
  deployer.deploy(Adoption);
  deployer.deploy(Election);
  deployer.deploy(Donations);
};
