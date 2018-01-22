/*jslint node:true, browser:true, esnext:true */
'use strict';

const ReactDOM = require('react-dom'),
    React = require('react'),
      xhr = require('../actions/xhr'),
      io = require('socket.io-client'),
      Coin = require('./coin'),
      New = require('./new');

class DashboardComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "_id": "",
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
                    exchange: "Poloniex"
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
                    exchange: "Poloniex"
                },
                SC: {
                    transactions: [{
                        type: 'BUY',
                        price: 0.00000157,
                        quantity: 10000
                    }, {
                        type: 'BUY',
                        price: 0.00000152,
                        quantity: 4775
                    }, {
                        type: 'BUY',
                        price: 0,
                        quantity: 1600
                    }, {
                        type: 'BUY',
                        price: 0.00000370,
                        quantity: 220
                    }],
                    exchange: "Poloniex"
                }
            },
            rates: {},
            pairing: 'USD',
            myCurrency: 'GBP',
            symbols: {
                GBP: "£",
                USD: "$",
                BTC: "฿ "
            },
            portfolioValues: {
                total: {
                    GBP: 0,
                    USD: 0,
                    BTC: 0
                },
                coins: []
            }, 
            fiatRates: {},
            selectedCoin: null,
            addCoin: null
        };
    }

    componentDidMount() {

        // Load local data
        this.getLocalData('_id')
        this.getLocalData('portfolio');

        this.getFiatRates().then(() => {
            return this.getRates();
        }).then(() => {
            this.calculateValues();
            setTimeout(() => {
                this.initSockets();
            }, 5000);
            
            setInterval(() => {
                this.calculateValues();
            }, 5000);
        });
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
    
    initSockets() {
        let socket = io.connect('https://streamer.cryptocompare.com/'),
            subscription = ['5~CCCAGG~BTC~USD', '5~CCCAGG~BTC~GBP'];
        Object.keys(this.state.portfolio).forEach((coin) => {
            subscription.push('2~' + this.state.portfolio[coin].exchange + '~' + coin + '~BTC');
        });

        socket.emit('SubAdd', { subs: subscription });
        socket.on("m", (message) =>  {
            console.log(message);
            this.setRate(message);
        });
    }
    
    setRate(message) {
        let rate = message.split('~'),
            ratesCopy = Object.assign({}, this.state.rates);
        
        if (rate.length > 3 && parseFloat(rate[5]) > 0) {
            if (rate[2] !== 'BTC') {
                ratesCopy[rate[2]][rate[1]] = {
                    BTC: parseFloat(rate[5])
                };
            } else {
                ratesCopy.BTC.default[rate[3]] = parseFloat(rate[5]);
            }
            
            this.setState({
                rates: ratesCopy
            });
        }
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
                    GBP: quantity * (rate.BTC * self.state.rates.BTC.default.GBP),
                    USD: quantity * (rate.BTC * self.state.rates.BTC.default.USD),
                    BTC: quantity * rate.BTC,
                    amount: quantity
                },
                exchange: this.state.portfolio[key].exchange,
                price: {
                    GBP: rate.BTC * self.state.rates.BTC.default.GBP,
                    USD: rate.BTC * self.state.rates.BTC.default.USD,
                    BTC: rate.BTC
                }
            });
            
           values.total.GBP += quantity * (rate.BTC * self.state.rates.BTC.default.GBP);
           values.total.USD += quantity * (rate.BTC * self.state.rates.BTC.default.USD);
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
    
    refreshData() {
        this.getRates().then(() => {
            this.calculateValues();
        });
    }
    
    coinClickHandler(coin) {
        this.setState({selectedCoin: coin});
    }
    
    coinClose() {
        this.setState({selectedCoin: null});  
    }
    
    newOpen() {
        this.setState({addCoin: true});  
    }
    
    newClose() {
        this.setState({addCoin: null});  
    }
    
    updateCoin(coin, value) {
        let portfolioCopy = Object.assign({}, this.state.porfolio);
        
        portfolioCopy[coin] = value;
        
        this.setState({porfolio: portfolioCopy});
    }

    getCoinData() {
        xhr(`/api/v1/portfolios/${ this.state._id }`, 'get', (data) => {
            this.setState({
                _id: data._id,
                portfolio: data.portfolio
            }, () => {
                this.getRates().then(() => {
                    this.calculateValues()
                });
                this.setLocalData('_id', data._id);
                this.setLocalData('portfolio', data.portfolio);
            });
        });
    }

    setLocalData(key, data) {
      localStorage.setItem(key, JSON.stringify(data));   
    }    

    getLocalData(key) {
        const value = localStorage.getItem(key);
        if (value) {
            this.setState({ [key]: JSON.parse(value) });
            return;
        }  
    }

    saveCoinData() {
        if(this.state._id != "") {
            xhr(`/api/v1/portfolios/${ this.state._id }`, 'PUT', (res) => {
                //console.log(res);
            }, 'json', { "id_": this.state._id, "portfolio": this.state.portfolio });  
        } else {
            xhr('/api/v1/portfolios', 'POST', (res) => {
                this.setState({
                    _id: res._id
                });
            }, 'json', { "portfolio": this.state.portfolio });     
        }    
    }

    onChange(e) {
        this.setState({_id: e.target.value});
    }

    render() {
        let self = this,
            round = function (value) {
                if (self.state.pairing === 'BTC') {
                    return parseFloat(value).toFixed(8);
                }
                return value.toFixed(2);
            };
        
        return (
            <React.Fragment>
                <nav>
                    <div className="title">
                        My Coin Portfolio
                    </div>
                    <ul>
                        <li onClick={self.refreshData.bind(self)}>Refresh</li>
                        <li onClick={self.newOpen.bind(self)}>Add Coin</li>
                        <li><input type="text" className="form-control" onChange={this.onChange.bind(self)} value={this.state._id} /></li>
                        <li onClick={self.getCoinData.bind(self)}>Load Coins</li>
                        <li onClick={self.saveCoinData.bind(self)}>Save Coins</li>
                    </ul>
                </nav>
            
                <div className="overview">
                    <div className="total" onClick={self.togglePairing.bind(self)}>
                        <h3>Total Portfolio Value <span>{self.state.symbols[self.state.pairing]}{round(self.state.portfolioValues.total[self.state.pairing])}</span></h3>
                    </div>
                    <div className="change">
                        <h3>24hr Change <span>+00.00%</span></h3>
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
                                    <tr key={i} onClick={self.coinClickHandler.bind(self, coin.coin)}>
                                        <td>
                                            <img src={"/img/logos/" + coin.coin + "-alt.svg"}/>
                                            <h4>{coin.coin}</h4>
                                        </td>
                                        <td>
                                            {coin.exchange}
                                        </td>
                                        <td>
                                            <p>{self.state.symbols[self.state.pairing]}{round(coin.holdings[self.state.pairing])}</p>
                                            {coin.holdings.amount} coins
                                        </td>
                                        <td>
                                            {self.state.symbols[self.state.pairing]}{round(coin.price[self.state.pairing])}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className={self.state.selectedCoin ? 'show coin-container' : 'coin-container'}>
                    <Coin selectedCoin={self.state.selectedCoin} coinPortfolio={self.state.portfolio[self.state.selectedCoin]} coinClose={self.coinClose.bind(self)} updateCoin={self.updateCoin.bind(self)} />
                </div>
                
                <div className={self.state.addCoin ? 'show add-container' : 'add-container'}>
                    <New newClose={self.newClose.bind(self)} updateCoin={self.updateCoin.bind(self)} />
                </div>
            </React.Fragment>
        );
    }
}

module.exports = DashboardComponent;
