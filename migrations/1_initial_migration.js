
module.exports = (deployer) => {
  const Migrations = artifacts.require('./Migrations')
  return deployer.deploy(Migrations)
}
