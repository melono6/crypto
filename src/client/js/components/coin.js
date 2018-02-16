/*jslint node:true, browser:true, esnext:true */
'use strict';

const ReactDOM = require('react-dom'),
    React = require('react'),
      xhr = require('../actions/xhr'),
      io = require('socket.io-client');

class Coin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            form: {
                quantity: 0,
                price: 0,
                type: 'BUY'
            }
        };
    }

    componentDidMount() {

    }
    
    openAdd() {
        this.setState({addTransaction: true});
    }
    
    priceChange (e) {
        let form = Object.assign({}, this.state.form);
        
        form.price = parseFloat(e.target.value);
        this.setState({form: form});
    }
    
    typeChange (e) {
        let form = Object.assign({}, this.state.form);
        
        form.type = e.target.value;
        this.setState({form: form});
    }

    quantityChange (e) {
        let form = Object.assign({}, this.state.form);
        
        form.quantity = parseFloat(e.target.value);
        this.setState({form: form});
    }
    
    addTransactionHandler () {
        let coinPortfolio = Object.assign({}, this.props.coinPortfolio);
        
        coinPortfolio.transactions.push({
            type: this.state.form.type,
            price: this.state.form.price,
            quantity: this.state.form.quantity
        });
        this.props.updateCoin(this.props.selectedCoin, coinPortfolio);
        this.setState({addTransaction: null});
    }
    
    removeTransactionHandler (index) {
        let coinPortfolio = Object.assign({}, this.props.coinPortfolio);
        
        coinPortfolio.transactions.splice(index, 1);
        
        this.props.updateCoin(this.props.selectedCoin, coinPortfolio);
    }
    
    removeCoinHandler () {
        this.props.updateCoin(this.props.selectedCoin, null);
    }

    coinClose() {
        this.setState({addTransaction: null});
        this.props.coinClose();
    }

    render() {
        let self = this,
            coinPortfolio = self.props.coinPortfolio || {transactions: []};

        return (
            <div className="coin">
                <nav>
                    <div className="title" onClick={this.props.back}>
                       ← {this.props.selectedCoin}
                    </div>
                    <ul>
                        <li onClick={self.removeCoinHandler.bind(self)}>Delete</li>
                    </ul>
                </nav>
                <form>
                    <select defaultValue={this.state.form.type} onChange={this.typeChange.bind(this)}>
                        <option>BUY</option>
                        <option>SELL</option>
                    </select>
                    <input type="number" placeholder="Quantity" onChange={this.quantityChange.bind(this)} />
                    <input type="number" placeholder="price" step="0.00000001" onChange={this.priceChange.bind(this)} />
                    <button type="button" onClick={this.addTransactionHandler.bind(this)}>
                        Add
                    </button>
                </form>
                <div className="coins">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    Type
                                </th>
                                <th>
                                    Amount
                                </th>
                                <th>
                                    Price per
                                </th>
                                <th>
                                    Cost
                                </th>
                                <th>
                                    
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {coinPortfolio.transactions.map(function (transaction, i) {
                                return (
                                    <tr key={i}>
                                        <td>
                                            {transaction.type}
                                        </td>
                                        <td>
                                            {transaction.quantity}
                                        </td>
                                        <td>
                                            {transaction.price}
                                        </td>
                                        <td>
                                           {transaction.quantity * transaction.price} 
                                        </td>
                                        <td onClick={self.removeTransactionHandler.bind(self, i)}>
                                           remove
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

module.exports = Coin;
