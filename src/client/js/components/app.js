/*jslint node:true, browser:true, esnext:true */
'use strict';

const ReactDOM = require('react-dom'),
    React = require('react'),
      xhr = require('../actions/xhr');

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
                    }, {
                        type: 'BUY',
                        price: 0.00000132,
                        quantity: 860
                    }, {
                        type: 'BUY',
                        price: 0.00000233,
                        quantity: 1000
                    }, {
                        type: 'BUY',
                        price: 0.00000253,
                        quantity: 2000
                    }, {
                        type: 'BUY',
                        price: 0.00000255,
                        quantity: 2000
                    }, {
                        type: 'BUY',
                        price: 0.00000388,
                        quantity: 4000
                    }, {
                        type: 'BUY',
                        price: 0.00000365,
                        quantity: 500
                    }],
                    exchange: "poloniex"
                },
                XRP: {
                    transactions: [{
                        type: 'BUY',
                        price: 0.00011600,
                        quantity: 329.5
                    }, {
                        type: 'BUY',
                        price: 0.00017270,
                        quantity: 315
                    }, {
                        type: 'BUY',
                        price: 0.00017782,
                        quantity: 340
                    }],
                    exchange: "poloniex"
                }
            },
            rates: {},
            pairing: 'GBP',
            myCurrency: 'GBP',
            symbols: {
                GBP: "£",
                USD: "$",
                BTC: "฿"
            },
            portfolioValues: {
                total: {
                    GBP: 0,
                    USD: 0,
                    BTC: 0
                },
                coins: []
            }, 
            fiatRates: {}
        };
    }

    componentDidMount() {
        //this.calculateValues();
        this.getFiatRates().then(() => {
            return this.getRates();
        }).then(() => {
            this.calculateValues();
        });
    }

    getData() {
    
    }
    
    getRates() {
        let self = this,
            exchanges = {},
            promises = [self.rateApi(['BTC'], ['USD', 'GBP', 'BTC'])],
            rates = {};
        
        Object.keys(this.state.portfolio).forEach((key) => {
            let exchange = this.state.portfolio[key].exchange;
            
            if (!exchanges.hasOwnProperty(exchange)) {
                exchanges[exchange] = [];
            }
            exchanges[exchange].push(key);
        });
        
        Object.keys(exchanges).forEach((key) => {
             promises.push(self.rateApi(exchanges[key], ['BTC'], key));
        });
        
        return Promise.all(promises).then((data) => {
            data.forEach((rate) => {
                Object.keys(rate).forEach((coin) => {
                    if (!rates.hasOwnProperty(coin)) {
                        rates[coin] = {};
                    }
                    rates[coin][rate[coin].exchange] = rate[coin][rate[coin].exchange];
                    
                    if(coin !== 'BTC') {
                        rates[coin][rate[coin].exchange].GBP = rates[coin][rate[coin].exchange].BTC * rates.BTC.default.GBP;
                        rates[coin][rate[coin].exchange].USD = rates[coin][rate[coin].exchange].BTC * rates.BTC.default.USD;
                    }
                });
            });
            self.setState({
                rates: rates
            });
            return;
        });
    }
    
    rateApi(from, to, exchange) {
        return new Promise((resolve) => {
            let url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + from.join(',') + "&tsyms=" + to.join(','),
                ret = {};
            
            if (exchange) {
                url += "&e=" + exchange;
            }
            
            xhr(url, 'GET', (data) => {
                Object.keys(data).forEach((key) => {
                    ret[key] = {
                        exchange: exchange || 'default'
                    };
                    ret[key][exchange || 'default'] = data[key];
                });
                resolve(ret);
            });
        });
    }
    
    getFiatRates() {
        let self = this;
        
        return new Promise((resolve) => {
            let url = "https://api.fixer.io/latest?symbols=GBP&base=USD";
            
            xhr(url, 'GET', (data) => {
                self.setState({
                    fiatRates: {
                        USD: 1,
                        GBP: data.rates.GBP
                    }
                });
                resolve();
            });
        });
    }
    
    calculateValues() {
        let self = this,
            values = {
                total: {
                    GBP: 0, 
                    USD: 0, 
                    BTC: 0 
                },
                coins: []
            };
            
        Object.keys(this.state.portfolio).forEach((key) => {
            let rate = self.state.rates[key][this.state.portfolio[key].exchange],
                coin = this.state.portfolio[key],
                quantity = 0;
            
            coin.transactions.forEach((transaction) => {
                 quantity += transaction.quantity;
            });
            
            values.coins.push({
                coin: key,
                holdings: {
                    GBP: quantity * rate.GBP,
                    USD: quantity * rate.USD,
                    BTC: quantity * rate.BTC,
                    amount: quantity
                },
                price: {
                    GBP: rate.GBP,
                    USD: rate.USD,
                    BTC: rate.BTC
                }
            });
            
           values.total.GBP += quantity * rate.GBP;
           values.total.USD += quantity * rate.USD;
           values.total.BTC += quantity * rate.BTC;
        });

        self.setState({
            portfolioValues: values
        });
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
                                    Exchange
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
                                            {coin.exchange}
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
