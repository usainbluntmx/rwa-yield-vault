// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VaultManager {
    mapping(address => address) public vaults;

    event VaultRegistered(address token, address vault);

    function setVault(address token, address vault) external {
        require(vaults[token] == address(0), "Vault already exists");
        vaults[token] = vault;
        emit VaultRegistered(token, vault);
    }

    function getVault(address token) external view returns (address) {
        return vaults[token];
    }
}
