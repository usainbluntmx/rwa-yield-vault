// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockERC20.sol";

contract MockNVDA is MockERC20 {
    constructor() MockERC20("NVIDIA Stock", "NVDAx", 18) {}
}
