import { AbstractContract } from "./contract";

// *** Contracts without linking dependencies ***
export const StaticCall = AbstractContract.loadArtifact("StaticCall");
export const Signatures = AbstractContract.loadArtifact("Signatures");
export const Transfer = AbstractContract.loadArtifact("Transfer");
export const MultiSend = AbstractContract.loadArtifact("MultiSend");
export const NonceRegistry = AbstractContract.loadArtifact("NonceRegistry");
export const ProxyFactory = AbstractContract.loadArtifact("ProxyFactory");
export const Registry = AbstractContract.loadArtifact("Registry");
export const VirtualAppAgreement = AbstractContract.loadArtifact(
  "VirtualAppAgreement"
);
// *** END ***

// *** Contracts with linking dependencies ***
export const Conditional = AbstractContract.loadArtifact("Conditional", [
  StaticCall
]);
export const ConditionalTransfer = AbstractContract.loadArtifact(
  "ConditionalTransfer",
  [Conditional, StaticCall]
);
export const StateChannel = AbstractContract.loadArtifact("StateChannel", [
  StaticCall,
  Signatures,
  Transfer
]);
export const MinimumViableMultisig = AbstractContract.loadArtifact(
  "MinimumViableMultisig",
  [Signatures]
);
// *** END ***

export default {
  ConditionalTransfer,
  NonceRegistry,
  Registry,
  StaticCall,
  MinimumViableMultisig,
  Signatures,
  Transfer,
  MultiSend,
  VirtualAppAgreement,
  StateChannel
};
