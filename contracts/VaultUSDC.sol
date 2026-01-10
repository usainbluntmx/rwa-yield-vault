// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseVault.sol";

contract VaultUSDC is BaseVault {
    constructor(address usdc) BaseVault(IERC20(usdc), "USDC Vault", "vUSDC") {}
}
