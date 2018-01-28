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
            _id: "",
            portfolio: {},
            rates: {},
            pairing: 'USD',
            myCurrency: 'USD',
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
            addCoin: null,
            editId: null,
            coins: null,
            inputId: ""
        };
    }

    componentDidMount() {
        this.getAllLocalData().then(() => {
            return this.getCoins();
        }).then(() => {
            return this.getCoinData();
        }).then(() => {
            this.refs.newCoin.filterCoins(false);
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
    
    getCoins (force) {
        return new Promise((resolve) => {
            console.log(this.state.coins, force);
            if (this.state.coins && !force) {
                resolve();
            } else {
                let url = "https://min-api.cryptocompare.com/data/all/coinlist";

                xhr(url, 'GET', (data) => {
                    this.setState({
                        coins: data.Data
                    }, () => {
                        resolve();
                    });
                });
            }
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
            if (key !== 'BTC') {
                exchanges[exchange].push(key);
            }
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
            Object.keys(exchanges).forEach((key) => {
                rates.BTC[key] = {
                    BTC: 1
                };
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
            this.setRate(message);
        });
    }
    
    setRate(message) {
        let rate = message.split('~'),
            ratesCopy = Object.assign({}, this.state.rates);
        
        if (rate.length > 3 && parseFloat(rate[5]) > 0 && parseFloat(rate[5]) < 100000) {
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
                if (transaction.type === 'BUY') {
                    quantity += transaction.quantity;
                } else {
                    quantity -= transaction.quantity;
                }
                 
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
        }, () => {
            self.setAllLocalData();
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
        document.querySelector('.search-container input').focus();
        this.setState({addCoin: true});  
    }
    
    newClose() {
        this.setState({addCoin: null});
    }
    
    updateCoin(coin, value) {
        let portfolioCopy = Object.assign({}, this.state.portfolio);
        
        if (value) {
            portfolioCopy[coin] = value;
        } else {
            delete portfolioCopy[coin];  
        }

        this.setState({
            portfolio: portfolioCopy
        }, () => {
            this.saveCoinData();
        });
    }

    getCoinData() {
        return new Promise((resolve) => {
            if (this.state._id) {
                xhr(`/api/v1/portfolios/${ this.state._id }`, 'get', (data) => {
                    this.setState({
                        _id: data._id,
                        portfolio: data.portfolio
                    }, () => {
                        resolve();
                    });
                });
            } else {
                resolve();
            }
        });
    }
    
    saveCoinData() {
        if(this.state._id) {
            xhr(`/api/v1/portfolios/${ this.state._id }`, 'PUT', () => {
                
            }, 'json', { "id_": this.state._id, "portfolio": this.state.portfolio });  
        } else {
            xhr('/api/v1/portfolios', 'POST', (res) => {
                this.setState({
                    _id: res._id
                });
            }, 'json', { "portfolio": this.state.portfolio });     
        }    
    }

    setLocalData(key, data) {
      localStorage.setItem(key, JSON.stringify(data));   
    }
    
    setAllLocalData() {
        this.setLocalData('coins', this.state.coins);
        this.setLocalData('_id', this.state._id);
        this.setLocalData('portfolio', this.state.portfolio);
        this.setLocalData('rates', this.state.rates);
        this.setLocalData('portfolioValues', this.state.portfolioValues);
        this.setLocalData('fiatRates', this.state.fiatRates);
    }

    getLocalData(key) {
        return new Promise((resolve) => {
            const value = localStorage.getItem(key);
            if (value) {
                this.setState({
                    [key]: JSON.parse(value) 
                }, () => {
                    resolve();
                });
                return;
            } else {
                resolve();
            }
        })
    }
    
    getAllLocalData() {
        return Promise.all([
            this.getLocalData('coins'),
            this.getLocalData('_id'),
            this.getLocalData('portfolio'),
            this.getLocalData('rates'),
            this.getLocalData('portfolioValues'),
            this.getLocalData('fiatRates')
        ]);
    }
    
    addCoin (coin, init) {
        let portfolio = Object.assign({}, this.state.portfolio);
        
        portfolio[coin] = init;
        
        this.setState({
            portfolio: portfolio
        }, () => {
            this.getRates().then(() => {
                this.calculateValues();
            });
            this.saveCoinData();
        });
    }
    
    closeOthers() {
        this.setState({
            selectedCoin: null,
            addCoin: null
        });
    }
    
    loadFromIdhandler () {
        this.setState({
            editId: true
        });
    }
    
    updateIdhandler () {
        this.setState({
            _id: this.state.inputId,
            editId: null
        }, () => {
            this.getCoinData().then(() => {
                this.getRates().then(() => {
                    this.calculateValues();
                });
            });
        });
    }
    
    changeInputIdHandler (e) {
        this.setState({
            inputId: e.target.value
        }); 
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
                <div className="dash">
                    <nav>
                        <div className="title">
                            My Coin Portfolio
                        </div>
                        <ul>
                            <li onClick={self.refreshData.bind(self)}>Refresh</li>
                            <li onClick={self.newOpen.bind(self)}>Add Coin</li>
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
                                                <img src={"https://www.cryptocompare.com" + self.state.coins[coin.coin].ImageUrl}/>
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
                    <div className={self.state.selectedCoin || self.state.addCoin ? 'show overlay' : 'overlay'} onClick={self.closeOthers.bind(self)}>
                        
                    </div>
                </div>
                <div className={self.state.selectedCoin ? 'show coin-container' : 'coin-container'}>
                    <Coin selectedCoin={self.state.selectedCoin} coinPortfolio={self.state.portfolio[self.state.selectedCoin]} coinClose={self.coinClose.bind(self)} updateCoin={self.updateCoin.bind(self)} />
                </div>
                
                <div className={self.state.addCoin ? 'show add-container' : 'add-container'}>
                    <New ref="newCoin" newClose={self.newClose.bind(self)} updateCoin={self.updateCoin.bind(self)} coins={self.state.coins} addCoin={self.addCoin.bind(self)} />
                </div>
                
                <div className="footer">
                    <div className="code">
                        Portfolio ID: {this.state._id} 
                        {self.state.editId ? (
                            <React.Fragment>
                                <input type="text" value={self.state.inputId} onChange={self.changeInputIdHandler.bind(self)}/>
                                <button onClick={self.updateIdhandler.bind(self)}>Update ID</button>
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                                {this.state._id} 
                                <button onClick={self.loadFromIdhandler.bind(self)}>Load from ID</button>
                            </React.Fragment>
                          )}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = DashboardComponent;
