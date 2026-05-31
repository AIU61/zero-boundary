// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaskReceiptRegistry {
    struct Receipt {
        bytes32 payloadHash;
        string status;
        uint256 timestamp;
    }

    address public owner;
    mapping(string => Receipt) private receipts;
    mapping(string => bool) private exists;

    event TaskReceiptRecorded(string indexed businessId, bytes32 payloadHash, string status, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function recordReceipt(string calldata businessId, bytes32 payloadHash, string calldata status) external onlyOwner {
        require(!exists[businessId], "BUSINESS_ID_EXISTS");
        receipts[businessId] = Receipt(payloadHash, status, block.timestamp);
        exists[businessId] = true;
        emit TaskReceiptRecorded(businessId, payloadHash, status, block.timestamp);
    }

    function getReceipt(string calldata businessId) external view returns (bytes32 payloadHash, string memory status, uint256 timestamp) {
        require(exists[businessId], "NOT_FOUND");
        Receipt memory receipt = receipts[businessId];
        return (receipt.payloadHash, receipt.status, receipt.timestamp);
    }
}
