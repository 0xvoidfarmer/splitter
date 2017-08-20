pragma solidity ^0.4.5;

contract Split{
	
	bool public isRunning;
	address public owner;

	struct claimStruct{
		uint amountDue;
		uint amountClaimed;
	}

	mapping (address => claimStruct) public claimStructs;

	event LogDepositSplit(address sender, address receiver1, address receiver2, uint deposit, uint splitAmount);
	event LogClaimedOwedSuccess(address claimant, uint amount);
	event LogClaimedOwedFail(address claimant, uint amount);

	function Split() {
		owner = msg.sender;
		isRunning = true;
	}

	function split(address _receiver1, address _receiver2 )
		public 
		payable
		returns (bool success)
	{
		if(!isRunning) throw;
		if(_receiver1 == address(0) || _receiver2 == address(0)) throw;
		if(msg.value < 2) throw;

		var splitAmount = msg.value / 2; 

		if (2 * splitAmount > msg.value) {
			claimStructs[msg.sender].amountDue += 1;
		}

		claimStructs[_receiver1].amountDue += splitAmount;
		claimStructs[_receiver2].amountDue += splitAmount;

		LogDepositSplit(msg.sender, _receiver1,_receiver2, msg.value, splitAmount);

		return true;
	}

	function fetchOwedAmount(address claimant)
		public
		constant
		returns(uint dueAmount)
	{
		if(!isRunning) throw;
		return claimStructs[claimant].amountDue;
	}

	function fetchClaimedAmount(address claimant)
		public
		constant
		returns(uint claimedAmount)
	{
		if(!isRunning) throw;
		return claimStructs[claimant].amountClaimed;
	}
	

	function claim()
		public 
		returns (bool success)
	{	
		if(!isRunning) throw;
		if(claimStructs[msg.sender].amountDue == 0) throw;

		var amountToClaim = claimStructs[msg.sender].amountDue;
		if(amountToClaim == 0) throw;
		
		//Optimistic accounting
		claimStructs[msg.sender].amountDue -= amountToClaim;
	    claimStructs[msg.sender].amountClaimed += amountToClaim;
	    
		if(!msg.sender.send(amountToClaim)) throw;
	
		LogClaimedOwedSuccess(msg.sender,amountToClaim);

		return true;
	}

	function switchRunning (bool onOff)
		public 
		returns( bool sucess){
		if(msg.sender != owner) throw;
	    isRunning = onOff;
	}

	function killContract (){
		if(msg.sender != owner) throw;
	    suicide(owner);
	}

	function (){}

}
