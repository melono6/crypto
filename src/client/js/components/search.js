/*jslint node:true, browser:true, esnext:true */
'use strict';

const React = require('react'),
      xhrRequest = require('../actions/xhr');

class SearchComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            results: [],
            visible: false
        };
    }

    search (e) {
        let searchString = e.target.value;
        if (searchString.length > 1) {
            xhrRequest(this.props.api + '?textSearch=' + searchString, 'get', (data) => {
                this.setState({
                    results: data,
                    visible: data.length > 0 ? true : false
                });
            });
        } else {
            this.setState({
                results: [],
                visible: false
            });
        }
    }

    hide () {
        this.setState({
            visible: false
        });
    }

    focus () {
        if (this.state.results.length > 0) {
            this.setState({
                visible: true
            });
        }
    }

    render() {
        return (
            <div>
                <input onFocus={this.focus.bind(this)} onBlur={this.hide.bind(this)} onKeyUp={this.search.bind(this)} type="text" className="form-control" placeholder="Search..."/>
                <div className="searchResults" data-visible={this.state.visible ? "true" : "false"}>
                    {this.state.results.map(function (row, index) {
                    return (
                        <div key={index}>
                            {row.supplier}: {row.product}
                        </div>
                    )
                  })}
                </div>
            </div>
        );
    }
};

module.exports = SearchComponent;
