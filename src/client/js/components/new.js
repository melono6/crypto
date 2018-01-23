/*jslint node:true, browser:true, esnext:true */
'use strict';

const ReactDOM = require('react-dom'),
      React = require('react'),
      xhr = require('../actions/xhr');

class New extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filteredCoins: [],
            selectedCoin: null
        };
    }

    componentDidMount() {
        
    }
    
    getExchanges(coin) {
        return new Promise((resolve) => {
            let url = "https://www.cryptocompare.com/api/data/coinsnapshot/?fsym=" + coin.Symbol + "&tsym=BTC";
            
            xhr(url, 'GET', (data) => {
                this.setState({
                    selectedCoin: {
                        coin: coin,
                        exchanges: data.Data.exchanges
                    }
                });
                resolve();
            });
        });
    }
    
    onSearch (e) {
        if (e.target.value.length > 1) {
            this.filterCoins(e.target.value);
        }
    }
    
    filterCoins (value) {
        let filtered = [];
        
        value = value.toLowerCase();
        
        Object.keys(this.props.coins).forEach((key) => {
            if (this.props.coins[key].FullName.toLowerCase().indexOf(value) !== -1) {
                filtered.push(this.props.coins[key]);
            }
        });
        
        this.setState({
            filteredCoins: filtered
        });
    }
    
    addCoin (coin) {
        this.props.addCoin(coin.Symbol, {
            transactions: [],
            exchange: 'Poloniex'
        });
    }

    render() {
        let self = this;
        
        return (
            <div className="coin">
                <nav>
                    <div className="title" onClick={this.props.newClose}>
                       ← Add Coin
                    </div>
                    <ul>

                    </ul>
                </nav>
                <div>
                    <input type="text" onChange={self.onSearch.bind(self)} />
                </div>
                <div className="coins">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    Coin
                                </th>
                                <th>
                                    Name
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                             {self.state.filteredCoins.map(function (coin, i) {
                                return (
                                    <tr key={i} onClick={self.addCoin.bind(self, coin)}>
                                        <td>
                                            <h4>{coin.Name}</h4>
                                        </td>
                                        <td>
                                            {coin.FullName}
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

module.exports = New;
