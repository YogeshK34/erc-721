// SPDX-License-Identifier:MIT 
pragma solidity ^0.8.0; 

    interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

contract ERC721 {
    string public name; 
    string public symbol;
    address public owner; 

    uint256 private _tokenIdCounter;

    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);


    mapping (uint256 => address) private _owners;
    mapping (address => uint256) private _balances;
    mapping (uint256 => address) private _approved; 
    mapping (address => mapping (address => bool)) private _approvedForAll;

    constructor(string memory _name, string memory _symbol) {
        name = _name; 
        symbol = _symbol;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can mint NFTs");
        _;
    }

    // mint
    function mint(address _to) public onlyOwner returns (uint256) { 
        require(_to != address(0), "Mint to zero address!");  
        _tokenIdCounter++; 
        uint256 tokenId = _tokenIdCounter; 
        _owners[tokenId] = _to;
        _balances[_to]++;
        return tokenId;  
    }


    // balanceOf 
    function balanceOf(address _owner) public view returns (uint256) {
        return _balances[_owner];
    }

    // ownerOf 
    function ownerOf(uint256 _tokenId) public view returns (address) {
        return _owners[_tokenId];
    }

    // tranfer  
    function _transfer(address _from, address _to, uint256 _tokenId) internal {
        require(_owners[_tokenId] == _from, "Only NFT owner can tranfer"); 
        require(
            msg.sender == _from ||
            _approved[_tokenId] == msg.sender ||
            _approvedForAll[_from][msg.sender]
        , "Caller not authorized!");
        require(_to != address(0), "Transfer to zero address!"); 
        _balances[_from] -= 1;
        _balances[_to] += 1; 
        _owners[_tokenId] = _to; 
        delete _approved[_tokenId];

        emit Transfer(_from, _to, _tokenId);
    }

    // this will run on _to 
    function _checkOnERC721Received(address from, address to, uint256 tokenId) private {
    if (to.code.length > 0) {  // to.code.length > 0 means it's a contract
        // call onERC721Received on the receiving contract
        bytes4 retval = IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, "");
        require(retval == 0x150b7a02, "Recipient cannot handle NFTs");
        // 0x150b7a02 is the magic value = bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))
    }
    }

    // safeTransferFrom function
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) public payable {
        _transfer(_from, _to, _tokenId);
        _checkOnERC721Received(_from, _to, _tokenId);
    }

    // transerFrom function
    function transferFrom(address _from, address _to, uint256 _tokenId) public payable {
    _transfer(_from, _to, _tokenId);
    }

    // approve function
    function approve(address _address, uint256 _tokenId) public {
        require(msg.sender == _owners[_tokenId], "Only owner can approve!");
        _approved[_tokenId] = _address;

        emit Approval(msg.sender, _address, _tokenId);
    }

    // setApprovalForAll function
    function setApprovalForAll(address _operator, bool _approvedPermission) public {
        _approvedForAll[msg.sender][_operator] = _approvedPermission;

        emit ApprovalForAll(msg.sender, _operator, _approvedPermission);
    }
    
    // getApproved function
    function getApproved(uint256 _tokenId) public view returns (address) {
        return _approved[_tokenId];
    }

    // isApprovedForAll function
    function isApprovedForAll(address _owner, address _operator) public view returns (bool) {
        return _approvedForAll[_owner][_operator];
    }
}
