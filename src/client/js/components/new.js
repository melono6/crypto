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
            let url = "/api/v1/coinsnapshotfullbyid/?id=" + coin.Id;
            
            xhr(url, 'GET', (data) => {
                this.setState({
                    selectedCoin: {
                        coin: coin,
                        subs: data.Data.Subs,
                        form: {
                            pairing: "",
                            exchange: ""
                        }
                    }
                });
                resolve();
            });
        });
    }
    
    formChange(field, e) {
        let selectedCopy = Object.assign({}, this.state.selectedCoin);
        
        selectedCopy.form[field] = e.target.value;
        
        this.setState({selectedCoin: selectedCopy});
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
    
    addCoin () {
        this.props.addCoin(this.state.selectedCoin.coin.Symbol, {
            transactions: [],
            exchange: this.state.selectedCoin.form.exchange,
            pairing: this.state.selectedCoin.form.pairing
        });
        
        this.setState({
            selectedCoin: null
        });
    }
    
    exchangeView () {
        let exchanges = [],
            pairings = [];
        
        this.state.selectedCoin.subs.forEach((sub) => {
            sub = sub.split('~');

            if ((!this.state.selectedCoin.form.exchange || this.state.selectedCoin.form.exchange === sub[1]) && pairings.indexOf(sub[3]) < 0) {
                pairings.push(sub[3]);
            }
            
            if ((!this.state.selectedCoin.form.pairing || this.state.selectedCoin.form.pairing === sub[3]) && exchanges.indexOf(sub[1]) < 0) {
                exchanges.push(sub[1]);
            }
        });
        
        return (
            <React.Fragment>
                <form>
                    <select value={this.state.selectedCoin.form.exchange} onChange={this.formChange.bind(this, 'exchange')}>
                        <option value="">- Exchange - </option>
                        {exchanges.map(function (exchange, i) {
                            return <option key={i} value={exchange}>{exchange}</option>;
                        })}
                    </select>
                    <select value={this.state.selectedCoin.form.pairing} onChange={this.formChange.bind(this, 'pairing')}>
                        <option value="">- Pairings - </option>
                         {pairings.map(function (pairing, i) {
                            return <option key={i} value={pairing}>{pairing}</option>;
                         })}    
                    </select>
                    <button disabled={!this.state.selectedCoin.form.pairing || !this.state.selectedCoin.form.exchange} onClick={this.addCoin.bind(this)}>Add Coin</button>
                </form>
            </React.Fragment>
        );
    }
    
    coinView () {
        let self = this;

        return (
            <React.Fragment>
                <div className="search-container">
                    <input type="text" placeholder="Search coins" onChange={self.onSearch.bind(self)} />
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
                                    <tr key={i} onClick={self.getExchanges.bind(self, coin)}>
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
            </React.Fragment>
        );
    }

    render() {
        let self = this,
            body = this.state.selectedCoin ? this.exchangeView() : this.coinView();
        
        return (
            <div className="coin">
                <nav>
                    <div className="title" onClick={this.props.newClose}>
                       ← Add Coin
                    </div>
                    <ul>
                        <li onClick={self.props.syncCoins}>Sync Coins</li>
                    </ul>
                </nav>
                {body}
            </div>
        );
    }
}

module.exports = New;
