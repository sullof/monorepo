import * as fs from "fs";
import * as path from "path";

const ARTIFACTS_DIR = "../contracts";
const NETWORKS_DIR = "../networks";

const artifactPath = (contractName: string) =>
  path.resolve(__dirname, ARTIFACTS_DIR, `${contractName}.json`);
const networkPath = (networkId: number) =>
  path.resolve(__dirname, NETWORKS_DIR, `${networkId}.json`);

const contractAddresses: {
  [networkId: number]: { [contractName: string]: string };
} = {};

function loadJson(filepath: string): object {
  const source = fs.readFileSync(filepath).toString();
  return JSON.parse(source);
}

export function loadBuildArtifact(name: string): BuildArtifact {
  return loadJson(artifactPath(name)) as BuildArtifact;
}

export function loadContractAddress(
  networkId: number,
  contractName: string
): string {
  if (!contractAddresses[networkId]) {
    const networkMapping = loadJson(networkPath(name)) as NetworkMapping;
    contractAddresses[networkId] = {};
    for (const contract of networkMapping.contracts) {
      contractAddresses[networkId][contract.contractName] = contract.address;
    }
  }
  return contractAddresses[networkId][contractName];
}
