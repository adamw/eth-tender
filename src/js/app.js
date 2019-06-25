App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    $("#submitOfferForm").submit(App.submitOffer);
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Tender.json", function(tender) {
      App.contracts.Tender = TruffleContract(tender);
      App.contracts.Tender.setProvider(App.web3Provider);
      App.initAlreadySubmitted();
    });
  },

  initAlreadySubmitted: function() {
    App.contracts.Tender.deployed().then(function(instance) {
      web3.eth.getAccounts(function(error, accounts) {
        var account = accounts[0];
        instance.bidderToIndex.call(account).then(function(indexResult) {
          if (indexResult.toString(10) != "0") {
            instance.submittedOffers.call(indexResult).then(function(offerResult) {
              App.appendLog("Already submitted offer with hash: " + offerResult[1]);
            });
          }
        });
      });
    });
  },

  submitOffer: function(event) {
    event.preventDefault();

    var reader = new FileReader();
    var file = $("#fileInput")[0].files[0];

    reader.onload = function() {
      var hash = web3.sha3(reader.result);
      App.appendLog("File hash: " + hash);

      web3.eth.getAccounts(function(error, accounts) {
        var account = accounts[0];
        App.appendLog("Sending using account: " + account);
        return App.contracts.Tender.deployed().then(function(instance) {
          return instance.submitOffer(hash, { from: account });
        }).then(function(result) {
          App.appendLog("Success! Transaction hash: " + result.tx);
        });
      });
    };

    reader.readAsBinaryString(file);
  },

  appendLog: function(msg) {
    $("#actionLog").append("<li>" + msg + "</li>");
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
