pragma solidity >=0.4.22 <0.9.0;

contract Voting{

	// Model an option
	struct Option {
		uint id;
		string content;
		uint voteCount;
	}

	// Model a voter
	/*struct Voter {
		uint id;
		uint voiceCreds;
		bool voted;
		bool valid;
	}*/

	/*struct poll {
		uint id;
		uint voiceCredits;
		mapping(uint => Option) public options;
	}*/

	event votedEvent (
        uint indexed _votersCount
    );


	// Record accounts
	//mapping(address => Voter) public voters;
	mapping(address => bool) public voters;

	// Store options
	// Fetch options
	mapping(uint => Option) public options;

	// Store options count
	uint public optionsCount;

	// Store voters count
	uint public votersCount;

	// sotre voice creds
	uint public voiceCredits;

	// Voted event
	//event votedEvent(
		//uint indexed _optionId
	//);

	constructor() public {
		addOption("Option 1");
		addOption("Option 2");
		addOption("Option 3");
		voiceCredits = 100;
	}

	/*function addVoter(address _useraddress) public{
		require(!voters[_useraddress].valid);
		votersCount++;
		voters[_useraddress] = Voter(votersCount, 100, false, true);
	}*/


	// Add and initialize option with 0 votes
	function addOption(string memory _content) private{
		optionsCount++;
		options[optionsCount] = Option(optionsCount, _content, 0);
	}

	function vote(uint[] memory _voteCounts) public {
		// Require adderss that hasn't voted
		require(!voters[msg.sender]);

		// Require that option id is valid
		//require(_optionId > 0 && _optionId <= optionsCount);
		for(uint i = 0; i < optionsCount; i++){
			options[i+1].voteCount += _voteCounts[i];
		}
		//require(_optionId > 0 && _optionId <= optionsCount);
		//options[_optionId].voteCount += _voteCounts;
		

		// Record user voted
		voters[msg.sender] = true;

		// Update vote counts
		votersCount += 1; 

		//emit votedEvent(votersCount);

	}

	function updateVoted() public{
		voters[msg.sender] = true;
	}
}