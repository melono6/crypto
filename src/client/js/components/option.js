/*jslint node:true, browser:true, esnext:true */
'use strict';

const React = require('react'),
    xhrRequest = require('../actions/xhr');

class OptionComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options: []
        };
    }

    componentDidMount(e) {
        xhrRequest(this.props.api, 'get', (data) => {
            data = data.map((item) => {
                return item[this.props.field];
            });
            this.setState({
                options: data
            });
        });
    }

    render() {
        return (
          <div className="form-group col-md-6">
              <label htmlFor={this.props.id}>{this.props.header}</label>
              <select className="form-control" id={this.props.id} onChange={this.props.change}>
                    <option value="">- Select -</option>
                    {this.state.options.map(function (option, index) {
                    return (
                        <option key={index}>{option}</option>
                    )
                  })}
              </select>
          </div>
        );
    }
};

module.exports = OptionComponent;
