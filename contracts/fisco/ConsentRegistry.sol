// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConsentRegistry {
    struct ConsentReceipt {
        bytes32 payloadHash;
        string status;
        uint256 timestamp;
    }

    address public owner;
    mapping(string => ConsentReceipt) private receipts;
    mapping(string => bool) private exists;

    event ConsentRecorded(string indexed businessId, bytes32 payloadHash, string status, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function recordConsent(string calldata businessId, bytes32 payloadHash, string calldata status) external onlyOwner {
        receipts[businessId] = ConsentReceipt(payloadHash, status, block.timestamp);
        exists[businessId] = true;
        emit ConsentRecorded(businessId, payloadHash, status, block.timestamp);
    }

    function getConsent(string calldata businessId) external view returns (bytes32 payloadHash, string memory status, uint256 timestamp) {
        require(exists[businessId], "NOT_FOUND");
        ConsentReceipt memory receipt = receipts[businessId];
        return (receipt.payloadHash, receipt.status, receipt.timestamp);
    }
}
