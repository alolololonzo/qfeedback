App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',


  init: function(){
    return App.initWeb3();
  },

  initWeb3: function(){
    //TODO: refactor conditional
      if(window.ethereum) {
        //If a web3 instance is already provided by Metamask
        App.web3Provider = window.ethereum;
        web3 = new Web3(window.ethereum);
      } else {
        // Specify default instanced if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
        web3 = new Web3(App.web3Provider);
      }
      return App.initContract();
  },

  initContract: function() {
      $.getJSON("Voting.json", function(voting){
        // Instantiate a new truffle contract from the artifact
        App.contracts.Voting = TruffleContract(voting);
        // Connect provider to interact with contract
        App.contracts.Voting.setProvider(App.web3Provider);
        var lastBlock;

        //App.listenForEvents()
        App.chainChange();

        return App.render();
    });
  },

  chainChange: function(){
    if (window.ethereum) {
      /*ethereum.on("chainChanged", () => {
        console.log('here');
      });*/
      window.ethereum.on("accountsChanged", () =>{
        window.location.reload();
      });
    }
  },

   /*listenForEvents: function(lastBlock) {
    App.contracts.Voting.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393    
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        window.location.reload();
      });
    });

  },*/



  render: function(){
    var votingInstance;
    var loader = $('#loader');
    var results = $('#results');
    var pollTable = $('#poll');
    var resultsLoader = $('#resultsLoader');
    var postVote = $('#postVote');

    loader.show();
    results.hide();
    pollTable.hide();
    resultsLoader.hide();
    postVote.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account){
      if(err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Voting.deployed().then(function(instance){
      votingInstance = instance;

      return votingInstance.votersCount();
    }).then(function(votersCount){
      $("#voterCount").html("Number of voters:" + votersCount);
      return votingInstance.voiceCredits();
    }).then(function(vc){
      accountVC = parseInt(vc);
      return votingInstance.optionsCount();
    }).then(function(optionsCount){
      var pollResults = $("#pollResults");
      pollResults.empty();

      var pollOptions = $("#pollOptions");
      pollOptions.empty();

      for(var i = 1; i <= optionsCount; i++){
        votingInstance.options(i).then(function(option){
          var id = option[0];
          var content = option[1];
          var voteCount = option[2];

          // Render result
          var optionsTemplate = "<tr><td>" + content + "</td><td>" + voteCount + "</td></tr>";
          pollResults.append(optionsTemplate);

          // Render poll
          $("#voiceCredits").html("Voice Credits: " + accountVC);
          //var pollTemplate = "<tr><td>" + content + "</td><td>" + voteCount + "</td></tr>";
          var pollTemplate = "<tr><td>" + content + "</td><td><button onclick='App.decrement(" + id + ");'>-</button><input type='text' name='" + id + "' value='0' class='qty' READONLY><button onclick='App.increment(" + id + ");'>+</button></td></tr>";
          pollOptions.append(pollTemplate);
        });
      }
      return votingInstance.voters(App.account);
    }).then(function(hasVoted){
      if(!hasVoted){
        loader.hide();
        pollTable.show();
      }else{
        loader.hide();
        results.show();
      }
      loader.hide();
    }).catch(function(error){
      console.warn(error);
    });
  },

  castVote: async function(){
    const voteCounts = [];

    $("#poll").hide();
    $("#resultsLoader").show();

    App.contracts.Voting.deployed().then(function(instance){
      votingInstance = instance;

      return votingInstance.optionsCount();
    }).then(function(optionsCount){
      for(var i = 1; i <= optionsCount; i++){
        voteCounts[i-1] = parseInt($('input[name='+i+']').val());
      }
      return votingInstance.vote(voteCounts, {from: App.account});

    }).then(function(postVote){
      //await App.sleep(2000);
      $("#resultsLoader").hide();
      $("#postVote").show();
    });
  },


  sleep: function(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  },


  increment: function(id){
    var currentVal = parseInt($('input[name='+id+']').val());
    if((accountVC - ((currentVal+1)*2 - 1)) >= 0){
      currentVal = currentVal + 1;
      $('input[name='+id+']').val(currentVal);
      accountVC = accountVC - (currentVal*2 - 1);
    }
    $("#voiceCredits").html("Voice Credits: " + accountVC);
  },

  decrement: function(id){
    var currentVal = parseInt($('input[name='+id+']').val());
    if(currentVal > 0){
      currentVal = currentVal - 1;
      $('input[name='+id+']').val(currentVal);
      if(accountVC + ((currentVal+1)*2 - 1) <= 100){
        accountVC = accountVC + ((currentVal+1)*2 - 1);
      }else{
        accountVC = 100;
      }
    }
    $("#voiceCredits").html("Voice Credits: " + accountVC);
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
