import React from 'react';
import Table from './Table/table';
import './App.css';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
          <div>
            <div className="table_container">
            <Table {...this.props}/>
            </div>
          </div>
        );
    }
}

