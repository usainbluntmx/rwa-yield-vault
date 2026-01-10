// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseVault.sol";
contract VaultUSDT is BaseVault {
    constructor(address usdt) BaseVault(IERC20(usdt), "USDT Vault", "vUSDT") {}
}
