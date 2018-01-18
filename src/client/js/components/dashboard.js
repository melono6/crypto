/*jslint node:true, browser:true, esnext:true */
'use strict';

const ReactDOM = require('react-dom'),
    React = require('react'),
    xhrRequest = require('../actions/xhr'),
    OptionComponent = require('./option'),
    TableComponent = require('./table');

class DashboardComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],
            supplier: "",
            product: "",
            sort: "price",
            dir: 1
        };
    }

    onProductChange(e) {
        this.setState({
            product: e.target.value
        }, () => {
            this.getData();
        });
    }

    onSupplierChange(e) {
        this.setState({
            supplier: e.target.value
        }, () => {
            this.getData();
        });
    }

    tableHeadClick(e) {
        let sort = e.target.dataset.sort,
            dir = sort === this.state.sort ? -this.state.dir : 1;

        this.setState({
            sort: sort,
            dir: dir
        }, () => {
            this.getData();
        });
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        let self = this,
            api = 'api/v1/supplier-products?sort=' + this.state.sort + '&dir=' + this.state.dir;

        if (this.state.product) {
            api += '&product=' + this.state.product;
        }
        if (this.state.supplier) {
            api += '&supplier=' + this.state.supplier;
        }

        xhrRequest(api, 'get', (data) => {
            self.setState({
                tableData: data
            });
        });
    }

    render() {
        return (
            <div>
                <h1 className="page-header">Product pricing</h1>
                <form>
                    <div className="row option-container">
                        <OptionComponent id="selSelect" change={this.onSupplierChange.bind(this)} api="api/v1/suppliers" field="clientName" header="Supplier" />
                        <OptionComponent id="prodSelect" change={this.onProductChange.bind(this)} api="api/v1/products" field="productName" header="Product" />
                    </div>
                </form>
                <h2 className="sub-header">Product details</h2>
                <div className="table-responsive table-container">
                    <TableComponent sort={this.state.sort} dir={this.state.dir} tableHeadClick={this.tableHeadClick.bind(this)} tableData={this.state.tableData} fields={['supplier', 'product', 'price']}/>
                </div>
            </div>
        );
    }
};

module.exports = DashboardComponent;
