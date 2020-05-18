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
}



