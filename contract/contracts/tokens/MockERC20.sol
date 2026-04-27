// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("EmelToken", "EML") {}

    /// @notice Mint tokens (mock, no restriction)
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /// @notice Burn tokens from caller
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}