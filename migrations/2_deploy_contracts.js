const {
  Conditional,
  ConditionalTransfer, MultiSend, NonceRegistry, ProxyFactory, Registry,
  Signatures,
  StaticCall,
  Transfer,
} = require("../lib/utils/cfContracts");


module.exports = deployer => {
  Transfer.migrate(deployer);
  StaticCall.migrate(deployer);
  Signatures.migrate(deployer);
  Conditional.migrate(deployer);
  NonceRegistry.migrate(deployer);
  Registry.migrate(deployer);

  MultiSend.migrate(deployer);
  ProxyFactory.migrate(deployer);
  ConditionalTransfer.migrate(deployer);
}
