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
