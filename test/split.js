var Split = artifacts.require("./Split.sol");

contract("Splitter", function(accounts) {
	var splitContract;
	var owner = accounts[0];
	var sender = accounts[1];
	var receiver1 = accounts[2];
	var receiver2 = accounts[3];
	var notInvited = accounts[4];

	beforeEach(function(){
		return Split.new({from: owner})
		.then(function(instance){
			splitContract = instance;
		});
	});

	//constructor 
	it("should be owned by owner", function(){
		return splitContract.owner()
		.then(function(_actualOwner){
			assert.strictEqual(_actualOwner, owner,"contract is not owned by owner"); 		
		});
	});

	it("should have a running state of true on construction", function(){
		return splitContract.isRunning()
		.then(function(_actualState){
			assert.strictEqual(_actualState, true,"contract initial state is not set to true"); 		
		});
	});


	//split 	

	it("should split sender's deposit equally between receiver 1 and 2 ", function(){
		var depositToSplit = 42;	
		
		return splitContract.split(receiver1,receiver2, {from:sender, value: depositToSplit })
		.then(function(txn){
			return splitContract.fetchOwedAmount(receiver1);
		})
		.then(function(_receiver1Amount) {	
			assert.equal(_receiver1Amount,21 , "receiver1's owed amount is not correct");
			return splitContract.fetchOwedAmount(receiver2);
		}).then(function(_receiver2Amount) {	
			assert.equal(_receiver2Amount, 21 , "receiver2's owed amount is not correct");
			return splitContract.fetchOwedAmount(notInvited);
		}).then(function(_notInvitedOwed) {	
			assert.equal(_notInvitedOwed, 0, "NotInvited's owed amount is not correct");
		});		
		
	});

	it("should emit  LogDepositSplit event",function(){
		var depositToSplit = 42;
		return splitContract.split(receiver1,receiver2, {from:sender, value: depositToSplit })				
			.then( function(events){
				 assert.equal(events.logs[0].event, "LogDepositSplit", "LogDepositSplit event was expcted");				
			});		
	});

	it("should split sender's odd number deposit and add remainder to sender ", function(){
		var depositToSplit = 43;	
		
		return splitContract.split(receiver1,receiver2, {from:sender, value: depositToSplit })
		.then(function(txn){
			return splitContract.fetchOwedAmount(receiver1);
		})
		.then(function(_receiver1Amount) {	
			assert.equal(_receiver1Amount,21 , "receiver1's owed amount is not correct");
			return splitContract.fetchOwedAmount(receiver2);
		}).then(function(_receiver2Amount) {	
			assert.equal(_receiver2Amount, 21 , "receiver2's owed amount is not correct");
			return splitContract.fetchOwedAmount(sender);
		}).then(function(_senderRemainder) {	
			assert.equal(_senderRemainder, 0, "Sender's remiander amount is not correct");
		});				
	});

	//claim
	it("should allow receiver to claim what is due", function(){
		var depositToSplit = 42;
		return splitContract.split(receiver1,receiver2, {from:sender, value: depositToSplit })
		.then(function(txn){
			return splitContract.claim({from: receiver1})
			.then(function(){
				return splitContract.fetchClaimedAmount(receiver1);
			}).then(function(_claimedAmount) {	
				assert.equal(_claimedAmount, 21 , "receiver1's claimed amount is not correct");
				return splitContract.fetchOwedAmount(receiver1);
			}).then(function(_owedAmount){
				assert.equal(_owedAmount, 0 , "receiver1's owed amount is not correct");
			});
		});
	});

	it("should emit  LogClaimedOwedSuccess event",function(){
		var depositToSplit = 42;
		return splitContract.split(receiver1,receiver2, {from:sender, value: depositToSplit })
		.then(function(txn){
			return splitContract.claim({from: receiver1})			
			.then( function(events){
				 assert.equal(events.logs[0].event, "LogClaimedOwedSuccess", "LogClaimedOwedSuccess event was expcted");				
			});
		});
	});

	//pause
	it("should not allow non-owner to switch running state", function(){
			return splitContract.switchRunning(false, {from: notInvited})
			.catch(function(err){
				assert(err.message.length > 0, 'non-owner is not  allowed to execute this function');
			})
	});

	it("should render all functions unusable", function(){
		return splitContract.switchRunning(false, {from:owner})
		.then(function(txn){
			return splitContract.split(receiver1,receiver2, {from:sender, value: 42 })
			//.then(function(_splitTxn){})
			.catch(function(err){
			 	assert(err.message.length > 0, 'function execution during contract not runing state is not correct');
			});
		});
   		
	});

	//kill
	it("should not allow non-owner to kill contract",function(){
		return splitContract.killContract({from: notInvited})
		.catch(function(err){
			assert(err.message.length > 0, 'non-owner is not  allowed to kill contract');			
		});
	});

	it("should kill contract",function(){
		return splitContract.killContract({from: owner})
		.then( function(txn){
			return splitContract.split(receiver1,receiver2, {from:sender, value: 42 })			
			.catch(function(err){
			 	assert(err.message.length > 0, 'contract is suppoised to be dead / sucided');
			});
		});
	});


	


}); //</contract>
