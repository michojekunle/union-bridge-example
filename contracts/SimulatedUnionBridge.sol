// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract SimulatedUnionBridge {
    mapping(address => uint256) public balances;

    event MintRBTC(address indexed user, uint256 amount);
    event BurnRBTC(address indexed user, uint256 amount);

    // Simulate minting RBTC after BTC is locked (using Ether as a placeholder)
    function mintRBTC() external payable {
        require(msg.value > 0, "No Ether sent");
        uint256 amount = msg.value;
        balances[msg.sender] += amount;
        emit MintRBTC(msg.sender, amount);
    }

    // Simulate burning RBTC to release BTC
    function burnRBTC(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit BurnRBTC(msg.sender, amount);
    }

    receive() external payable {}
}
