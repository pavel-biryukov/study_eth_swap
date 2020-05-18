pragma solidity ^0.5.0;


import "./Token.sol";


/**
 * The EthSwap contract does this and that...
 */
contract EthSwap {

	string public name  = "EthSwap Instant Exchange";
	Token public token;
	uint public rate = 100;

	event TokenPurchased(
    	address account,
    	address token,
    	uint amount,
    	uint rate
	    );

	event TokenSold(
    	address account,
    	address token,
    	uint amount,
    	uint rate
	    );

	constructor(Token _token) public {
		token = _token;
	}

	function buyTokens() public payable {
		// Calculate the number of tokens to buy
		uint tokenAmount = msg.value * rate;

		require (token.balanceOf(address(this)) >= tokenAmount);

		// Transfers tokens to the user
		token.transfer(msg.sender, tokenAmount);

		// Emit on event
		emit TokenPurchased(msg.sender, address(token),
		                    tokenAmount, rate );

	}
	function sellTokens(uint _amount) public {
		// User cann't sell more than they have
		require (token.balanceOf(msg.sender) >= _amount);


		// Calculate the amount of ether to redeem
		uint etherAmount = _amount / rate;
		require(address(this).balance >= etherAmount);

		// Perform sale
		token.transferFrom(msg.sender, address(this), _amount);

		msg.sender.transfer(etherAmount);

		// Emit on event
		emit TokenSold(msg.sender, address(token),
		               _amount, rate);

	}

}



