// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AuthentiX {
    
    // 1. DATA STRUCTURES
    struct Product {
        uint256 id;
        string name;
        string batchNumber;
        string description;
        address currentOwner;
        bool exists; 
    }

    // 2. STATE VARIABLES
    uint256 public productCounter;
    mapping(uint256 => Product) public products;
    
    // --- NEW: THE OWNERSHIP HISTORY LEDGER ---
    // Maps a Product ID to a chronological list of every wallet that has owned it
    mapping(uint256 => address[]) public ownershipHistory; 

    // 3. EVENTS (For History Tracking)
    event ProductMinted(uint256 indexed id, string name, address indexed owner);
    event OwnershipTransferred(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 timestamp);

    // 4. MINTING FUNCTION 
    function mintProduct(string memory _name, string memory _batch, string memory _desc) public {
        productCounter++; 
        uint256 newId = productCounter;

        products[newId] = Product({
            id: newId,
            name: _name,
            batchNumber: _batch,
            description: _desc,
            currentOwner: msg.sender, 
            exists: true
        });

        // --- NEW: LOG THE MANUFACTURER ---
        // Adds the creator as the very first owner in the timeline
        ownershipHistory[newId].push(msg.sender);

        emit ProductMinted(newId, _name, msg.sender);
    }

    // 5. TRANSFER FUNCTION 
    function transferProduct(uint256 _id, address _newOwner) public {
        require(products[_id].exists, "Product does not exist");
        require(products[_id].currentOwner == msg.sender, "You are not the owner");
        require(_newOwner != address(0), "Invalid address");

        address oldOwner = products[_id].currentOwner;
        products[_id].currentOwner = _newOwner;

        // --- NEW: LOG THE NEW OWNER ---
        // Adds the receiver to the timeline
        ownershipHistory[_id].push(_newOwner);

        emit OwnershipTransferred(_id, oldOwner, _newOwner, block.timestamp);
    }

    // 6. HELPER FUNCTIONS
    function getProduct(uint256 _id) public view returns (Product memory) {
        require(products[_id].exists, "Product not found");
        return products[_id];
    }

    // --- NEW: FETCH THE TIMELINE ---
    // Allows the React Native frontend to instantly download the array of owners
    function getOwnershipHistory(uint256 _id) public view returns (address[] memory) {
        require(products[_id].exists, "Product not found");
        return ownershipHistory[_id];
    }
}