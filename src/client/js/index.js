/*jslint node:true, browser:true, esnext:true */
'use strict';

const ReactDOM = require('react-dom'),
    React = require('react'),
    App = require('./components/app');

ReactDOM.render(
  <DashboardComponent />,
  document.querySelector('.app')
);
