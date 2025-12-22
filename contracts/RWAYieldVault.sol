// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RWAYieldVault {
    uint256 public constant APY = 5; // 5% anual
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public lastUpdate;

    function deposit() external payable {
        require(msg.value > 0, "Deposit must be > 0");

        _updateYield(msg.sender);
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        _updateYield(msg.sender);
        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    function claimYield() external {
        uint256 yield = pendingYield(msg.sender);
        require(yield > 0, "No yield available");

        lastUpdate[msg.sender] = block.timestamp;

        (bool success, ) = msg.sender.call{value: yield}("");
        require(success, "Yield transfer failed");
    }

    function pendingYield(address user) public view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastUpdate[user];
        return (balances[user] * APY * timeElapsed) / (100 * SECONDS_PER_YEAR);
    }

    function _updateYield(address user) internal {
        if (lastUpdate[user] == 0) {
            lastUpdate[user] = block.timestamp;
        }
    }

    receive() external payable {}
}
