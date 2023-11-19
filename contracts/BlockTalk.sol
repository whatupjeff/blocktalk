// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract BlockTalk is ERC721Upgradeable, OwnableUpgradeable {
    uint256 public constant MAX_SUPPLY = 20000;
    uint256 public mintPrice = 0.005 ether;
    uint256 public transferFee = 0.001 ether;  // Minimal transfer fee
    address payable public feeRecipient;  // Address to receive the transfer fees
    uint256 public totalSupply;

    struct TokenMetadata {
        string username;
    }
    mapping(uint256 => TokenMetadata) private _tokenMetadata;
    mapping(address => uint256) private _ownedTokens;

    function initialize() public initializer {
        __ERC721_init("BlockTalk", "BTALK");
        __Ownable_init(msg.sender);
        feeRecipient = payable(msg.sender);  // Set fee recipient to the deployer
    }

    function mint(string memory username) public payable {
        require(totalSupply < MAX_SUPPLY, "Max supply reached");
        require(_ownedTokens[msg.sender] == 0, "One NFT per wallet allowed");
        require(msg.value >= mintPrice, "Insufficient ETH sent");
        require(bytes(username).length <= 20, "Username too long");  // Limit username size

        totalSupply++;
        _mint(msg.sender, totalSupply);
        _setTokenMetadata(totalSupply, username);
        _ownedTokens[msg.sender] = totalSupply;

        payable(owner()).transfer(msg.value); // Sending mint fees to owner
    }

    function changeUsername(uint256 tokenId, string memory newUsername) public {
        require(ownerOf(tokenId) == msg.sender, "Not the token owner");
        require(bytes(newUsername).length <= 20, "Username too long");
        _setTokenMetadata(tokenId, newUsername);
    }

    function _setTokenMetadata(uint256 tokenId, string memory username) internal {
        _tokenMetadata[tokenId] = TokenMetadata(username);
    }

    function getUsername(uint256 tokenId) public view returns (string memory) {
        ownerOf(tokenId); //will revert if token does not exist
        return _tokenMetadata[tokenId].username;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal  
    {
        // super._beforeTokenTransfer(from, to, tokenId);
        if (from != address(0) && to != address(0) && msg.value >= transferFee) {
            feeRecipient.transfer(transferFee);
        }

        if (from != address(0)) {
            _ownedTokens[from] = 0;
        }
        if (to != address(0)) {
            require(_ownedTokens[to] == 0, "One NFT per wallet allowed");
            _ownedTokens[to] = tokenId;
        }
    }

    function setFeeRecipient(address payable newRecipient) public onlyOwner {
        feeRecipient = newRecipient;
    }

    function setTransferFee(uint256 newFee) public onlyOwner {
        transferFee = newFee;
    }
}
