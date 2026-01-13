// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockERC20.sol";

contract MockAAPL is MockERC20 {
    constructor() MockERC20("Apple Stock", "AAPLx", 18) {}
}
