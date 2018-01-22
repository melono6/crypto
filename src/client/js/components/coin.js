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
                price: 0
            },
            addTransaction: null
        };
    }

    componentDidMount() {

    }
    
    openAdd() {
        this.setState({addTransaction: true});
    }
    
    transactionTable () {
        if (this.props.coinPortfolio) {
            return (
                <div className="coins">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        Amount
                                    </th>
                                    <th>
                                        Price per
                                    </th>
                                    <th>
                                        Cost
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.coinPortfolio.transactions.map(function (transaction, i) {
                                    return (
                                        <tr key={i}>
                                            <td>
                                                {transaction.quantity}
                                            </td>
                                            <td>
                                                {transaction.price}
                                            </td>
                                            <td>
                                               {transaction.quantity * transaction.price} 
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
            );
        }
        return '';
    }
    
    addTransaction () {
        return (
            <form>
                <input type="number" placeholder="Quantity" onChange={this.quantityChange.bind(this)} />
                <input type="number" placeholder="price" step="0.00000001" onChange={this.priceChange.bind(this)} />
                <button type="button" onClick={this.addTransactionHandler.bind(this)}>
                    Add
                </button>
            </form>
        );
    }
    
    priceChange (e) {
        let form = Object.assign({}, this.state.form);
        
        form.price = parseFloat(e.target.value);
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
           type: 'BUY',
            price: this.state.form.price,
            quantity: this.state.form.quantity
        });
        this.props.updateCoin(this.props.selectedCoin, coinPortfolio);
        this.setState({addTransaction: null});
    }

    coinClose() {
        this.setState({addTransaction: null});
        this.props.coinClose();
    }

    render() {
        let self = this,
            view = self.state.addTransaction ? self.addTransaction() : self.transactionTable();

        return (
            <div className="coin">
                <nav>
                    <div className="title" onClick={this.coinClose.bind(this)}>
                       ← {this.props.selectedCoin}
                    </div>
                    <ul>
                        <li>Delete</li>
                        <li onClick={self.openAdd.bind(self)}>Add Transaction</li>
                    </ul>
                </nav>
                {view}
            </div>
        );
    }
}

module.exports = Coin;
