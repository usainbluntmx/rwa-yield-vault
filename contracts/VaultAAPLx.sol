// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseVault.sol";

contract VaultAAPLx is BaseVault {
    constructor(
        address aaplx
    ) BaseVault(IERC20(aaplx), "Apple Stock Vault", "vAAPLx") {}
}
