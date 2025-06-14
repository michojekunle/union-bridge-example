// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface ISimulatedUnionBridge {
    function mintRBTC() external payable;

    function burnRBTC(uint256 amount) external;
}

contract CharityDApp {
    address public immutable bridgeAddress;
    mapping(address => uint256) public donations;

    event DonationMade(address indexed donor, uint256 amount);

    constructor(address _bridgeAddress) {
        require(_bridgeAddress != address(0), "Invalid bridge address");
        bridgeAddress = _bridgeAddress;
    }

    // Donate RBTC by minting through the bridge and recording the donation
    function donate() external payable {
        require(msg.value > 0, "No Ether sent");
        uint256 amount = msg.value;
        ISimulatedUnionBridge(bridgeAddress).mintRBTC{value: amount}();
        donations[msg.sender] += amount;
        emit DonationMade(msg.sender, amount);
    }

    // Withdraw RBTC by burning it through the bridge
    function withdraw(uint256 amount) external {
        require(
            donations[msg.sender] >= amount,
            "Insufficient donation balance"
        );
        donations[msg.sender] -= amount;
        ISimulatedUnionBridge(bridgeAddress).burnRBTC(amount);
        payable(msg.sender).transfer(amount);
    }

    receive() external payable {}
}
