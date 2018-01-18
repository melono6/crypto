/*jslint node:true, browser:true, esnext:true */
'use strict';

const React = require('react');

class TableComponent extends React.Component {
  render() {
    let self = this,
        sort = this.props.dir === 1 ? 'sortDesc' : 'sortAsc';
    return (
      <table className="table table-striped">
          <thead>
              <tr>
                  <th>#</th>
                  {self.props.fields.map(function(field, index){
                      return (
                          <th className={field === self.props.sort ? sort : ''}
                              key={index}
                              onClick={self.props.tableHeadClick}
                              data-sort={field}>
                              {field.charAt(0).toUpperCase() + field.slice(1)}
                          </th>
                      )
                  })}
              </tr>
          </thead>
          <tbody>
              {self.props.tableData.map(function (row, index) {
                    return (<tr key={index}>
                          <td>{index + 1}</td>
                          {self.props.fields.map(function(field, index){
                              return (
                                  <td key={index}>{row[field]}</td>
                              )
                          })}
                      </tr>
                    )
                  })}
          </tbody>
      </table>
    );
  }
};

module.exports = TableComponent;
