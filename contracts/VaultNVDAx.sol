// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseVault.sol";

contract VaultNVDAx is BaseVault {
    constructor(
        address nvdax
    ) BaseVault(IERC20(nvdax), "NVIDIA Stock Vault", "vNVDAx") {}
}
