// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseVault.sol";

contract VaultDAI is BaseVault {
    constructor(address dai) BaseVault(IERC20(dai), "DAI Vault", "vDAI") {}
}
