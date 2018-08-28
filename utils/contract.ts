import { HIGH_GAS_LIMIT } from "@counterfactual/test-utils";
import * as ethers from "ethers";
import { TruffleContract } from "truffle";
import { loadBuildArtifact, loadContractAddress } from "./artifacts";

const { solidityKeccak256 } = ethers.utils;

/**
 * Simple wrapper around ethers.Contract to include information about Counterfactual instantiation.
 */
export class Contract extends ethers.Contract {
  public salt?: string;
  public cfAddress?: string;
  public registry?: Contract;
}

/**
 * Convenience class for an undeployed contract i.e. only the ABI and bytecode.
 */
export class AbstractContract {
  /**
   * Load build artifact by name into an abstract contract
   * @example
   *  const CountingApp = AbstractContract.loadBuildArtifact("CountingApp", {StaticCall});
   * @param artifactName The name of the artifact to load
   * @param links Optional AbstractContract libraries to link.
   * @returns Truffle artifact wrapped in an AbstractContract.
   */
  public static loadArtifact(
    artifactName: string,
    links?: AbstractContract[]
  ): AbstractContract {
    const artifact = loadBuildArtifact(artifactName);
    return new AbstractContract(artifact, links);
  }

  private readonly deployedAddresses: { [networkId: number]: string } = {};

  /**
   * @param artifact
   * @param links
   */
  constructor(
    readonly artifact: BuildArtifact,
    readonly links?: AbstractContract[]
  ) {}

  public async migrate(deployer: TruffleDeployer) {
    const { abi, contractName } = this.artifact;

    const networkId = deployer.network_id;
    const bytecode = this.generateLinkedBytecode(networkId);
    const truffleContract = new TruffleContract({
      abi,
      contractName,
      bytecode
    });
    await deployer.deploy(truffleContract);
    this.deployedAddresses[networkId] = truffleContract.address;
  }

  /**
   * Get the deployed singleton instance of this abstract contract, if it exists
   * @param signer Signer (with provider) to use for contract calls
   * @throws Error if AbstractContract has no deployed address
   */
  public async getDeployed(signer: ethers.types.Signer): Promise<Contract> {
    if (!signer.provider) {
      throw new Error("Signer requires provider");
    }
    const networkId = (await signer.provider.getNetwork()).chainId;
    const address = this.getDeployedAddress(networkId);
    return new Contract(address, this.artifact.abi, signer);
  }

  /**
   * Deploy new instance of contract
   * @param signer Signer (with provider) to use for contract calls
   * @param args Optional arguments to pass to contract constructor
   * @returns New contract instance
   */
  public async deploy(
    signer: ethers.types.Signer,
    args?: any[]
  ): Promise<Contract> {
    if (!signer.provider) {
      throw new Error("Signer requires provider");
    }

    const networkId = (await signer.provider.getNetwork()).chainId;
    const bytecode = this.generateLinkedBytecode(networkId);
    const contract = new Contract("", this.artifact.abi, signer);
    return contract.deploy(bytecode, ...(args || []));
  }

  /**
   * Connect to a deployed instance of this abstract contract
   * @param signer Signer (with provider) to use for contract calls
   * @param address Address of deployed instance to connect to
   * @returns Contract instance
   */
  public async connect(
    signer: ethers.types.Signer,
    address: string
  ): Promise<Contract> {
    return new Contract(address, this.artifact.abi, signer);
  }

  /**
   * Deploys new contract instance through a Counterfactual Registry
   * @param signer Signer (with provider) to use for contract calls
   * @param registry Counterfactual Registry instance to use
   * @param args Optional arguments to pass to contract constructor
   * @param salt Optional salt for Counterfactual deployment
   * @returns Contract instance
   */
  public async deployViaRegistry(
    signer: ethers.types.Signer,
    registry: ethers.Contract,
    args?: any[],
    salt?: string
  ): Promise<Contract> {
    if (!signer.provider) {
      throw new Error("Signer requires provider");
    }

    if (salt === undefined) {
      salt = solidityKeccak256(
        ["uint256"],
        [Math.round(Math.random() * 4294967296)]
      );
    }
    const networkId = (await signer.provider.getNetwork()).chainId;
    const bytecode = this.generateLinkedBytecode(networkId);
    const initcode = new ethers.Interface(
      this.artifact.abi
    ).deployFunction.encode(bytecode, args || []);
    await registry.functions.deploy(initcode, salt, HIGH_GAS_LIMIT);
    const cfAddress = solidityKeccak256(
      ["bytes1", "bytes", "uint256"],
      ["0x19", initcode, salt]
    );

    const address = await registry.functions.resolver(cfAddress);
    const contract = new Contract(address, this.artifact.abi, signer);
    contract.cfAddress = cfAddress;
    contract.salt = salt;
    contract.registry = registry;
    return contract;
  }

  private generateLinkedBytecode(networkId: number): string {
    let { bytecode } = this.artifact;
    if (this.links) {
      for (const library of this.links) {
        const regex = new RegExp(`__${library.artifact.contractName}_+`, "g");
        const address = library.getDeployedAddress(networkId);
        const addressHex = address.replace("0x", "");
        bytecode = bytecode.replace(regex, addressHex);
      }
    }
    return bytecode;
  }

  private getDeployedAddress(networkId: number): string {
    if (!this.deployedAddresses[networkId]) {
      const address = loadContractAddress(
        networkId,
        this.artifact.contractName
      );
      if (!address) {
        throw new Error(
          `Abstract contract not deployed on network ${networkId}`
        );
      }
      this.deployedAddresses[networkId] = address;
    }
    return this.deployedAddresses[networkId];
  }
}
