/*jslint node:true, browser:true, esnext:true */
'use strict';

const ReactDOM = require('react-dom'),
    React = require('react');

class DashboardComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            portfolio: {
                DGB: {
                    transactions: [{
                        type: 'BUY',
                        price: 0.00000575,
                        quantity: 140
                    }],
                    exchange: "poloniex"
                },
                XRP: {
                    transactions: [],
                    exchange: "poloniex"
                }
            },
            rates: {},
            pairing: 'GBP',
            myCurrency: 'GBP',
            symbols: {
                GBP: "£",
                USD: "$",
                BTC: "@"
            },
            portfolioValues: {
                total: {
                    GBP: 3185.17,
                    USD: 3185.17,
                    BTC: 0.37598139
                },
                coins: [{
                    coin: 'DGB',
                    holdings: {
                        GBP: 507.54,
                        USD: 507.54,
                        BTC: 0.60165,
                        amount: 10500
                    },
                    price: {
                        GBP: 0.4890659,
                        USD: 0.4890659,
                        BTC: 0.00000573
                    }
                }, {
                    coin: 'XRP',
                    holdings: {
                        GBP: 1098.43,
                        USD: 1098.43,
                        BTC: 0.13021063,
                        amount: 984
                    },
                    price: {
                        GBP: 1.12,
                        USD: 1.12,
                        BTC: 0.00013170
                    }
                }]
            }
        };
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        
    }
    
    calculateValues() {
        
    }
    
    togglePairing() {
        if (this.state.pairing === 'BTC') {
            this.setState({
                pairing: this.state.myCurrency
            });
        } else {
            this.setState({
                pairing: 'BTC'
            });
        }
    }

    render() {
        let self = this;
        
        return (
            <React.Fragment>
                <nav>
                    <ul>
                        <li>Graph</li>
                        <li>Add Coin</li>
                    </ul>
                </nav>
            
                <div className="overview">
                    <div className="total" onClick={self.togglePairing.bind(self)}>
                        <h3>Total Portfolio Value <span>{self.state.symbols[self.state.pairing]}{self.state.portfolioValues.total[self.state.pairing]}</span></h3>
                    </div>
                    <div className="change">
                        <h3>24hr Change <span>+37.55%</span></h3>
                    </div>
                </div>
                <div className="coins">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    Coin
                                </th>
                                <th>
                                    Holdings
                                </th>
                                <th>
                                    Price
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {self.state.portfolioValues.coins.map(function (coin, i) {
                                return (
                                    <tr key={i}>
                                        <td>
                                            <img src={"/images/coins/" + coin.coin + ".png"}/>
                                            <h4>{coin.coin}</h4>
                                        </td>
                                        <td>
                                            <p>{coin.holdings[self.state.pairing]}</p>
                                            {coin.holdings.amount}
                                        </td>
                                        <td>
                                            {self.state.symbols[self.state.pairing]}{coin.price[self.state.pairing]}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            
            
            </React.Fragment>
        );
    }
}

module.exports = DashboardComponent;
