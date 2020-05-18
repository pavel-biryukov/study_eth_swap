const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {
  // Deploy Token contract
  await deployer.deploy(Token);
  token = await Token.deployed();

  // Deploy EthSwap contract
  await deployer.deploy(EthSwap);
  ethSwap = await EthSwap.deployed();

  //Transfer all token to EthSwap (1 million)
  await token.transfer(ethSwap.address, '1000000000000000000000000');
};

