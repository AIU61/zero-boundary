// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BenefitCredentialRegistry {
    struct Credential {
        bytes32 payloadHash;
        string status;
        bool transferable;
        bool cashable;
        uint256 timestamp;
    }

    address public owner;
    mapping(string => Credential) private credentials;
    mapping(string => bool) private exists;

    event BenefitCredentialRecorded(
        string indexed businessId,
        bytes32 payloadHash,
        string status,
        bool transferable,
        bool cashable,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function recordCredential(
        string calldata businessId,
        bytes32 payloadHash,
        string calldata status,
        bool transferable,
        bool cashable
    ) external onlyOwner {
        require(!transferable, "TRANSFER_DISABLED_IN_MVP");
        require(!cashable, "CASHOUT_DISABLED_IN_MVP");
        require(!exists[businessId], "BUSINESS_ID_EXISTS");

        credentials[businessId] = Credential(payloadHash, status, transferable, cashable, block.timestamp);
        exists[businessId] = true;
        emit BenefitCredentialRecorded(businessId, payloadHash, status, transferable, cashable, block.timestamp);
    }

    function getCredential(string calldata businessId)
        external
        view
        returns (bytes32 payloadHash, string memory status, bool transferable, bool cashable, uint256 timestamp)
    {
        require(exists[businessId], "NOT_FOUND");
        Credential memory credential = credentials[businessId];
        return (credential.payloadHash, credential.status, credential.transferable, credential.cashable, credential.timestamp);
    }
}
