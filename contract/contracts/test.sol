pragma solidity ^0.8.0;

contract test {
    mapping(uint => address) int2addr;
    event record(uint);

    function add(uint a, uint b) public returns(uint c) {
        c = a + b;
        int2addr[c] = msg.sender;
        emit record(c);
    }

    function add_pure(uint a, uint b) public returns(uint c) {
        c = a + b;
        address d = int2addr[c];
        emit record(c);
    }
}
