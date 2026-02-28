export const CONTRACT_ADDRESS = "0x35A8fc6016f5635DCcA0813775395Db4d925Ca9A";

export const CONTRACT_ABI = [
  "event ProductMinted(uint256 indexed id, string name, address indexed owner)",
  "event OwnershipTransferred(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 timestamp)",
  "function mintProduct(string memory _name, string memory _batch, string memory _desc) public",
  "function transferProduct(uint256 _id, address _newOwner) public",
  "function getProduct(uint256 _id) public view returns (tuple(uint256 id, string name, string batchNumber, string description, address currentOwner, bool exists))",
  "function productCounter() public view returns (uint256)"
];
