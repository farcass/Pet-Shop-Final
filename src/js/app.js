App = {
  web3Provider: null,
  contracts: {},
  breedNames: [
    "Boxer",
    "French Bulldog",
    "Golden Retriever",
    "Scottish Terrier"
  ],
  
  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });
    
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
        console.error("User denied account access")
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

  initContract: async function() {
    try {
      const adoptionData = await $.getJSON('Adoption.json');
      var AdoptionArtifact = adoptionData;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      App.contracts.Adoption.setProvider(App.web3Provider);
      App.markAdopted();
  
      const donationsData = await $.getJSON('Donations.json');
      var DonationsArtifact = donationsData;
      App.contracts.Donations = TruffleContract(DonationsArtifact);
      App.contracts.Donations.setProvider(App.web3Provider);
  
      App.bindEvents();
      App.getBreedAdoptionCounts();
    } catch (err) {
      console.error("Error initializing contracts:", err);
    }
  },
  

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-donate', App.handleDonate);
    $(document).off('click', '.btn-return').on('click', '.btn-return', App.handleReturn);
    console.log('Event listeners bound.');
  },

  markAdopted: function() {
    var adoptionInstance;
  
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('.btn-adopt').hide();
          $('.panel-pet').eq(i).find('.btn-return').show();
        } else {
          $('.panel-pet').eq(i).find('.btn-adopt').show();
          $('.panel-pet').eq(i).find('.btn-return').hide();
        }        
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));
    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
     console.log(error);
    }

    var account = accounts[0];

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

    // Execute adopt as a transaction by sending account
    return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
    return App.markAdopted();
      }).catch(function(err) {
    console.log(err.message);
      });
    });

  },

  handleReturn: function(event) {
    event.preventDefault();
  
    var petId = parseInt($(event.target).data('id'));
  
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
  
      var account = accounts[0];
  
      App.contracts.Adoption.deployed().then(function(instance) {
        return instance.returnAdoptedPet(petId, {from: account, value: web3.utils.toWei('0.5', 'ether') });
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  
  getBreedAdoptionCounts: function() {
    App.contracts.Adoption.deployed().then(function(instance) {
      return instance.getBreedAdoptionCounts.call();
    }).then(function(breedAdoptionCounts) {
      var breedsList = $('#breedsList');
      for (i = 0; i < App.breedNames.length; i++) {
        var breedCount = parseInt(breedAdoptionCounts[i]);
        var breedName = App.breedNames[i] || `Breed ${i + 1}`;
        var listItem = $('<a>')
          .addClass('list-group-item')
          .text(`${breedName}: ${breedCount} adoption(s)`);
        breedsList.append(listItem);
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  }  
    

};

$(function() {
  $(window).on('load', function () {
    App.init();
  });
});
