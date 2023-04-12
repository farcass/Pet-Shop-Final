pragma solidity ^0.5.0;

contract Adoption {
    address[16] public adopters;
    uint[16] public breedAdoptionCounts;
    mapping (address => uint) public petReturnFees;

    // Adopting a pet
    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);

        adopters[petId] = msg.sender;
        breedAdoptionCounts[petId]++;

        return petId;
    }

    // Return an adopted pet
    function returnAdoptedPet(uint petId) public payable returns (uint) {
        require(petId >= 0 && petId <= 15);
        require(adopters[petId] == msg.sender);
        require(msg.value == 0.5 ether);

        adopters[petId] = address(0);
        breedAdoptionCounts[petId]--;
        petReturnFees[msg.sender] += msg.value;

        return petId;
    }


    // Retrieving the adopters
    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }

    // Retrieving breed adoption counts
    function getBreedAdoptionCounts() public view returns (uint[16] memory) {
        return breedAdoptionCounts;
    }  
}

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    // Store accounts that have voted
    mapping(address => bool) public voters;

    // Read/write candidates
    mapping(uint => Candidate) public candidates;

    // Store Candidates Count
    uint public candidatesCount;

    constructor() public {
        addCandidate("Boxer");
        addCandidate("French Bulldog");
        addCandidate("Golden Retriever");
        addCandidate("Scottish Terrier");
    }

    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

     function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;
    }
}
    contract Donations {
    address payable public owner;
    uint public donationAmount;

    constructor() public {
        owner = msg.sender;
    }

    function donate() public payable {
        donationAmount += msg.value;
    }

    function withdraw() public {
        require(msg.sender == owner, "Only the petshop owner can withdraw ether");
        uint amount = donationAmount;
        donationAmount = 0;
        owner.transfer(amount);
    }
}