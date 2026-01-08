// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMintableERC20 {
    function mint(address to, uint256 amount) external;
    function decimals() external view returns (uint8);
}

contract Faucet {
    uint256 public constant COOLDOWN = 24 hours;

    mapping(address => mapping(address => uint256)) public lastRequest;
    mapping(address => uint256) public faucetAmount;

    constructor() {}

    function setFaucetAmount(address token, uint256 amount) external {
        faucetAmount[token] = amount;
    }

    function requestTokens(address token) external {
        require(
            block.timestamp - lastRequest[token][msg.sender] >= COOLDOWN,
            "Faucet: cooldown active"
        );

        uint256 amount = faucetAmount[token];
        require(amount > 0, "Faucet: token not supported");

        lastRequest[token][msg.sender] = block.timestamp;
        IMintableERC20(token).mint(msg.sender, amount);
    }
}
