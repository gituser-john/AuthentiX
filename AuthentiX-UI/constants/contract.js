export const CONTRACT_ADDRESS = "0x4a6D05Fcf43e83C9232520787ad90208043a740c";

export const CONTRACT_ABI = [
  "event ProductMinted(uint256 indexed id, string name, address indexed owner)",
  "event OwnershipTransferred(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 timestamp)",
  "function mintProduct(string memory _name, string memory _batch, string memory _desc) public",
  "function transferProduct(uint256 _id, address _newOwner) public",
  "function getProduct(uint256 _id) public view returns (tuple(uint256 id, string name, string batchNumber, string description, address currentOwner, bool exists))",
  "function productCounter() public view returns (uint256)",
  "function getOwnershipHistory(uint256 _id) public view returns (address[])"
];