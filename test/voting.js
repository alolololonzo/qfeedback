var Voting = artifacts.require("./Voting.sol");

contract("Voting", function(accounts){
	var votingInstance;

	it("initializes with 3 options", function(){
		return Voting.deployed().then(function(instance){
			return instance.optionsCount();
		}).then(function(count){
			assert.equal(count, 3);
		});
	});

	it("initializes the options with correct values", function(){
		return Voting.deployed().then(function(instance){
			votingInstance = instance;
			return votingInstance.options(1);
		}).then(function(option){
			assert.equal(option[0], 1, "correct id");
			assert.equal(option[1], "Option 1", "correct content");
			assert.equal(option[2], 0, "correct count");
			return votingInstance.options(2);
		}).then(function(option){
			assert.equal(option[0], 2, "correct id");
			assert.equal(option[1], "Option 2", "correct content");
			assert.equal(option[2], 0, "correct count");
			return votingInstance.options(3);
		}).then(function(option){
			assert.equal(option[0], 3, "correct id");
			assert.equal(option[1], "Option 3", "correct content");
			assert.equal(option[2], 0, "correct count");
		});
	});

	it("allows a voter to cast a vote", function(){
		return Voting.deployed().then(function(instance){
			votingInstance = instance;
			let voteCounts = [5, 3, 2];
			return votingInstance.vote(voteCounts, {from: accounts[1]});
		}).then(function(receipt){
			return votingInstance.voters(accounts[1]);
		}).then(function(voted){
			assert(voted, "the voter was marked as voted");
			return votingInstance.options(1);
		}).then(function(option){
			var voteCount = option[2];
			assert.equal(voteCount, 5, "increments the count correctly");
			return votingInstance.options(2);
		}).then(function(option){
			var voteCount = option[2];
			assert.equal(voteCount, 3, "increments the count correctly");
			return votingInstance.options(3);
		}).then(function(option){
			var voteCount = option[2];
			assert.equal(voteCount, 2, "increments the count correctly");
			return votingInstance.options(2);
		})

	});

	/*it("allows a voter to cast a vote", function(){
		return Voting.deployed().then(function(instance){
			votingInstance = instance;
			return votingInstance.vote(1, 5, {from: accounts[1]});
		}).then(function(vote){
			return votingInstance.options(1);
		}).then(function(result){
			var voteCount = result[2];
			assert.equal(voteCount, 5, "increments the count correctly")
		});

	});

	it("adds voter with correct values", function(){
		return Voting.deployed().then(function(instance){
			votingInstance = instance;
			return votingInstance.addVoter(accounts[1]);
		}).then(function(addVoter){
			return votingInstance.votersCount();
		}).then(function(votersCount){
			assert.equal(votersCount, 1);
			return votingInstance.voters(accounts[1]);
		}).then(function(voter){
			assert.equal(voter[0], 1, "correct id");
			assert.equal(voter[1], 100,"correct voice creds");
			assert.equal(voter[2], false, "havent voted");
		})
	});*/
})