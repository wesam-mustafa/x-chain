const ChainUtils = require('../chain-util');
const { MINING_REWARD } = require('../config');
class Transaction {
  constructor() {
    this.id = ChainUtils.id();
    this.input = null;
    this.outputs = [];
  }

  update(senderWallet, recipient, amount) {
    const senderOutPut = this.outputs.find(output => output.address === senderWallet.publicKey);

    if (amount > senderOutPut.amount) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return;
    }

    senderOutPut.amount = senderOutPut.amount - amount;
    this.outputs.push({ amount, address: recipient });
    Transaction.signTransaction(this, senderWallet);

    return this;
  }

  static transactionsWithOutputs(senderWallet, outputs) {
    const transaction = new this();
    transaction.outputs.push(...outputs);
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }
  static newTransaction(senderWallet, recipient, amount) {
    if (amount > senderWallet.balance) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return;
    }

    return Transaction.transactionsWithOutputs(senderWallet, [
      { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
      { amount, address: recipient }
    ]);
  }

  static rewardTransaction(minerWallet, blockchainWallet) {
    return Transaction.transactionsWithOutputs(blockchainWallet, [{
      amount: MINING_REWARD, address: minerWallet.publicKey
    }]);
  }

  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(ChainUtils.hash(transaction.outputs))
    }
  }

  static verifyTransaction(transaction) {
    return ChainUtils.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      ChainUtils.hash(transaction.outputs)
    );
  }

}

module.exports = Transaction;