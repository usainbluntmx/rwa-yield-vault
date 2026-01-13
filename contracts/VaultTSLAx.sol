// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseVault.sol";

contract VaultTSLAx is BaseVault {
    constructor(
        address tslax
    ) BaseVault(IERC20(tslax), "Tesla Stock Vault", "vTSLAx") {}
}
