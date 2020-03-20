import React from 'react'
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap'

import './react-table-gel.module.css';

export default class PageSize extends React.Component {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    getOptions() {
        const { listName, pageSizeOptions } = this.props;
        return pageSizeOptions.map((pageSize, index) => {
            return <option key={`${listName}option-${index}`}>{pageSize}</option>
        })
    }

    onChange(e) {
        const { setPageSizeOption } = this.props;
        const selectedOption = parseInt(e.target.value);
        setPageSizeOption(selectedOption);
    }

    render() {
        const { pageSize } = this.props;
        return (
            <div>
            <FormGroup >
                <FormControl componentClass="select" value={pageSize} onChange={this.onChange} id="paginationSize">
                    {this.getOptions() }
                </FormControl>
                <ControlLabel className="pagetext">per page</ControlLabel>
            </FormGroup>
            </div>
        )
    }
}