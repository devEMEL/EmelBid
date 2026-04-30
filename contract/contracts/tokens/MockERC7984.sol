// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";
import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract MockERC7984 is ERC7984, ZamaEthereumConfig {
    constructor() ERC7984("Emel Confidential Token", "eCT", "") {}

    /// @notice Mint encrypted tokens (mock, unrestricted)
    function mint(address to, uint64 amount) public {
        euint64 encAmount = FHE.asEuint64(amount);

        _mint(to, encAmount);

        // Allow recipient to use their balance
        FHE.allow(encAmount, to);
        FHE.allow(encAmount, address(this));
    }

    /// @notice Burn encrypted tokens from sender
    function burn(uint64 amount) public {
        euint64 encAmount = FHE.asEuint64(amount);

        _burn(msg.sender, encAmount);
    }

    /// @notice Transfer using encrypted amount
    function transferEncrypted(address to, euint64 amount) public {
        require(FHE.isSenderAllowed(amount), "Not allowed");

        _transfer(msg.sender, to, amount);

        // Allow both parties to access updated balances
        FHE.allow(amount, msg.sender);
        FHE.allow(amount, to);
        FHE.allow(amount, address(this));
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}