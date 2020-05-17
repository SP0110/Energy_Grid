pragma solidity >=0.4.21 <0.7.0;

contract DataStorageContract {
    string consumptionHash = " ";

    function setConsumptionHash(string memory hashValue) public {
        consumptionHash = hashValue;
    }

    function getConsumptionHash() public view returns (string memory) {
        return consumptionHash;
    }

}