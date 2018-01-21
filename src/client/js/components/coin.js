/*jslint node:true, browser:true, esnext:true */
'use strict';

const ReactDOM = require('react-dom'),
    React = require('react'),
      xhr = require('../actions/xhr'),
      io = require('socket.io-client');

class DashboardComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    componentDidMount() {

    }

    render() {
        let self = this;
        
        return (
            <div className="coin">
                <nav>
                    <div className="title" onClick={this.props.coinClose}>
                       ← {this.props.selectedCoin}
                    </div>
                    <ul>
                        <li>Delete</li>
                        <li>Add Transaction</li>
                    </ul>
                </nav>
            </div>
        );
    }
}

module.exports = DashboardComponent;
