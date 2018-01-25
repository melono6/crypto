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
            let url = "/api/v1/coinsnapshot/?fsym=" + coin.Symbol + "&tsym=BTC";
            
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
        if (e.target.value.length > 0) {
            this.filterCoins(e.target.value);
        } else {
            this.filterCoins(false);
        }
    }
    
    filterCoins (value) {
        let filtered = [];
        
        if (value) {
            value = value.toLowerCase();
        }
        
        Object.keys(this.props.coins).forEach((key) => {
            if (!value || this.props.coins[key].FullName.toLowerCase().indexOf(value) !== -1) {
                filtered.push(this.props.coins[key]);
            }
        });
        
        filtered = filtered.sort((a, b) => {
            return parseInt(a.SortOrder) - parseInt(b.SortOrder);
        });
        
        filtered = filtered.slice(0, 10);
        
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
                <div className="search-container">
                    <input type="text" placeholder="Search coins" onChange={self.onSearch.bind(self)} onFocus={self.filterCoins.bind(self, false)} />
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
