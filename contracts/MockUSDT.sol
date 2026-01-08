// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockERC20.sol";

contract MockUSDT is MockERC20 {
    constructor() MockERC20("Mock Tether USD", "USDT", 6) {}
}
