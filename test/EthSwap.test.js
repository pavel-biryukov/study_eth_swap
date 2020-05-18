const Token = artifacts.require('Token')
const EthSwap = artifacts.require('EthSwap')

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('EthSwap', ([deployer, investor]) => {
	let token, ethSwap

	function tokens(n) {
		return web3.utils.toWei(n, 'ether');
	}

	before(async () => {
		token = await Token.new()
		ethSwap = await EthSwap.new(token.address)
		//Transfer all token to EthSwap (1 million)
		await token.transfer(ethSwap.address, tokens('1000000'));
	})
	describe('Token deployment', async() =>{
		it ('contract has name', async() => {
			const name = await token.name()
			assert.equal(name, 'PAV Token')
		})
	})

	describe('EthSwap deployment', async() =>{
		it ('contract has token instance', async() => {
	 		const tokenAddress = await ethSwap.token()
			assert.equal(tokenAddress, token.address)
		})

		it ('contract has name', async() => {
			const name = await ethSwap.name()
			assert.equal(name, 'EthSwap Instant Exchange')
		})


		it ('contract has tokens', async() => {
			let balance = await token.balanceOf(ethSwap.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})

	describe('Buy tokens', async() => {
		let result

		before(async () =>{
			result = await ethSwap.buyTokens({
				from: investor,
				value: web3.utils.toWei('1', 'ether')
			})
		})

		it ('Allow users to buy tokens from ethSwap for a fixed price', async() => {
			let investorBalance = await token.balanceOf(investor)
			let rate = await ethSwap.rate()
			investorBalance = investorBalance / rate
			assert.equal(investorBalance.toString(), tokens('1'))

			let etherSwapBalance = await token.balanceOf(ethSwap.address)
			assert.equal(etherSwapBalance.toString(), tokens('999900'))
			etherSwapBalance = await web3.eth.getBalance(ethSwap.address)
			assert.equal(etherSwapBalance.toString(), web3.utils.toWei('1', 'ether'))

			assert.equal(result.logs[0].event, 'TokenPurchased')
			const event = result.logs[0].args
			assert.equal(event.account, investor )
			assert.equal(event.token, token.address)
			assert.equal(event.amount.toString(), tokens('100'))
			assert.equal(event.rate.toString(), '100')
		})
	})
	describe('Sell tokens', async() => {
		let result

		before(async () =>{
			// Investor must approve tokens before the purchase
			await token.approve(ethSwap.address, tokens('100'), {from:investor})
			// Investor sell tokens
			result = await ethSwap.sellTokens( tokens('50'),{from: investor})
		})

		it ('Allow users to sell tokens to ethSwap for a fixed price', async() => {
			let etherSwapBalance = await token.balanceOf(ethSwap.address)
			assert.equal(etherSwapBalance.toString(), tokens('999950'))
			etherSwapBalance = await web3.eth.getBalance(ethSwap.address)
			assert.equal(etherSwapBalance.toString(), web3.utils.toWei('0.5', 'ether'))

			assert.equal(result.logs[0].event, 'TokenSold')
			const event = result.logs[0].args
			assert.equal(event.account, investor )
			assert.equal(event.token, token.address)
			assert.equal(event.amount.toString(), tokens('50'))
			assert.equal(event.rate.toString(), '100')

			//FAILURE: sell more tokens than than they have
			await ethSwap.sellTokens(tokens('51'), {from: investor}).should.be.rejected;
		})
	})
})