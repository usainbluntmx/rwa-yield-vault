// src/abi/erc4626VaultAbi.ts

export const erc4626VaultAbi = [
    "event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)",
    "event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
] as const
