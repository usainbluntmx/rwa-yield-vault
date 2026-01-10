// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BaseVault is ERC4626, Ownable {
    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) ERC4626(asset_) Ownable(msg.sender) {}

    // 🔒 Hook futuro para yield
    function _afterDeposit(uint256 assets, uint256 shares) internal virtual {}

    function _beforeWithdraw(uint256 assets, uint256 shares) internal virtual {}
}
