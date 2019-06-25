const Tender = artifacts.require("Tender");

module.exports = function(deployer) {
  deployer.deploy(Tender, Math.round(Date.now() / 1000)+60*60*24); // one day
};
