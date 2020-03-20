import React from 'react';

import ReactTable from '@bretkikehara/react-table';
import withFixedColumns from './hoc-fixed-col/';
import PaginationList from './Pagination'
import { Button, FormGroup } from 'react-bootstrap' //remove after 
import './react-table.module.css'
import './react-table-gel.module.css';
import './hoc-fixed-col/styles.module.css';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const ReactTableFixedColumns = withFixedColumns(ReactTable);
const getItemStyle = ({ isDragging, isDropAnimating }, draggableStyle) => ({
  ...draggableStyle,
  // some basic styles to make the items look a bit nicer
  userSelect: "none",

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  ...(!isDragging && { transform: "translate(0,0)" }),
  ...(isDropAnimating && { transitionDuration: "0.001s" })

  // styles we need to apply on draggables
});

class DragTrComponent extends React.Component {
  render() {
    const { children = null, rowInfo } = this.props;

    if (rowInfo) {
      const { original, index } = rowInfo;
      const { name } = original;
      return (
        <Draggable key={name} index={index} draggableId={name}>
          {(draggableProvided, draggableSnapshot) => (
            <div
              ref={draggableProvided.innerRef}
              {...draggableProvided.draggableProps}
            >
              <ReactTable.defaultProps.TrComponent>
                <div
                  {...draggableProvided.dragHandleProps}
                  className="draggable-row"
                // style={{ width: '30', height: '30' }}
                // style={{ width: 30, height: 30, background: "#000" }}
                />
                {children}
              </ReactTable.defaultProps.TrComponent>
            </div>
          )}
        </Draggable>
      );
    } else {
      return (
        <ReactTable.defaultProps.TrComponent>
          {children}
        </ReactTable.defaultProps.TrComponent>
      );
    }
  }
}

class DropTbodyComponent extends React.Component {
  render() {
    const { children = null } = this.props;

    return (
      <Droppable droppableId="droppable">
        {(droppableProvided, droppableSnapshot) => (
          <div ref={droppableProvided.innerRef}>
            <ReactTable.defaultProps.TbodyComponent>
              {children}
            </ReactTable.defaultProps.TbodyComponent>
          </div>
        )}
      </Droppable>
    );
  }
}

const rowReorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default class Table extends React.Component {
  constructor(props) {
    super(props);
    this.dragged = null;
    this.state = {
      selected: {}, selectAll: 0, pageSize: 25, screenWidth: null, data: [],
      trigger: 0, reorder: [], columns: [], leftFixed: [], rightFixed: []
    };
    this.toggleRow = this.toggleRow.bind(this);
    this.setPageSizeOption = this.setPageSizeOption.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.renderEditable = this.renderEditable.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.getTrProps = this.getTrProps.bind(this);
    this.mountEvents = this.mountEvents.bind(this);
  }

  renderEditable(original, column) {
    return (
      <div
        style={{ backgroundColor: "#fafafa" }}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          original[column.accessor] = e.target.innerHTML;
        }}
        dangerouslySetInnerHTML={{
          // __html: this.props.data[cellInfo.index][cellInfo.column.id]
          __html: original[column.accessor]
        }}
      />
    );
  }
  mountEvents() {
    const headers = Array.prototype.slice.call(
      // document.querySelectorAll(".draggable-header")
      document.querySelectorAll(".thheader")
    );

    headers.forEach((header, i) => {
      if (header.className.includes('draggable-header')) {
        header.setAttribute("draggable", true);
        //the dragged header
        header.ondragstart = e => {
          e.stopPropagation();
          this.dragged = i;
        };

        header.ondrag = e => e.stopPropagation;

        header.ondragend = e => {
          e.stopPropagation();
          setTimeout(() => (this.dragged = null), 1000);
        };

        //the dropped header
        header.ondragover = e => {
          e.preventDefault();
        };

        header.ondrop = e => {
          e.preventDefault();
          // const { target, dataTransfer } = e;
          const reorder = this.state.reorder;
          reorder.push({ a: i, b: this.dragged });
          this.setState({ trigger: Math.random(), reorder });
        };
      }
    });
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateWindowDimensions());
    const columns = [];
    // columns.map()
    const leftFixed = this.props.columns.filter(itm => itm.fixed === 'left')
    const rightFixed = this.props.columns.filter(itm => itm.fixed === 'right')
    columns.push(...leftFixed);
    columns.push(...this.props.columns.filter(itm => !itm.fixed));
    columns.push(...rightFixed)
    this.setState({ data: this.props.data, columns, rightFixed, leftFixed })
    this.mountEvents()
  }
  componentWillReceiveProps(props) {
    this.setState({ data: props.data })
  }
  componentDidUpdate() {
    this.mountEvents()
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions)
  }

  updateWindowDimensions() {
    this.setState({ screenWidth: window.innerWidth });
  }

  setPageSizeOption(pageSize) {
    this.setState({ pageSize: pageSize })

  }

  toggleRow(uniqueId) {
    const newSelected = Object.assign({}, this.state.selected);
    newSelected[uniqueId] = !this.state.selected[uniqueId];
    this.setState({
      selected: newSelected,
      selectAll: 2
    });
  }

  toggleSelectAll() {
    let newSelected = {};

    if (this.state.selectAll === 0) {
      this.state.data.forEach(x => {
        newSelected[x.uniqueId] = true;
      });
    }

    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  handleDragEnd(result) {
    if (!result.destination) {
      return;
    }

    const data = rowReorder(
      this.state.data,
      result.source.index,
      result.destination.index
    );

    this.setState({ data });
  };


  onRowClick(record) {
    console.log("entro");
    if (record) {
      this.setState({
        selectedRecord: record,
        deleteItem: record.creditReportingId
      });
    }
  };
  getTrProps(state, rowInfo) {
    //  console.log(rowInfo);
    return {
      onClick: () => this.onRowClick(rowInfo.original),
      rowInfo
    };
  };

  render() {
    const { pageSize } = this.state;
    const updateColumns = this.state.columns;
    let resHeadersSm = [];
    let resHeadersMd = [];
    let resCellsSm = [];
    let resCellsMd = [];
    updateColumns && updateColumns.map((column, i) => {
      if (column.headerClassName && column.headerClassName.indexOf('res-not-sm') != -1) {
        resHeadersSm.push(<div key={`res-not-sm-${i}`} className={'resCellDiv'} title={column.Header}>{column.Header}</div>);
        resCellsSm.push(column.accessor);
      }

      if (column.headerClassName && column.headerClassName.indexOf('res-not-md') != -1) {
        resHeadersMd.push(<div key={`res-not-md-${i}`} className={'resCellDiv'} title={column.Header}>{column.Header}</div>);
        resCellsMd.push(column.accessor);
      }
      // });

      // this.props.columns && this.props.columns.map((column, i) => {

      if (i === 1 && typeof (column['Cell']) != 'function' && (resHeadersSm.length !== 0 || resHeadersMd.length !== 0)) {
        column['Cell'] = ({ value, original }) => (
          <div>
            <span title={original[column.accessor]}>
              {original[column.accessor]}
            </span>
            <div className='res-sm'>
              {resHeadersSm}
            </div>
            <div className='res-md'>
              {resHeadersMd}
            </div>
          </div>
        );
      }
      if (i === 2 && typeof (column['Cell']) != 'function' && (resCellsSm.length !== 0 || resCellsMd.length !== 0)) {
        column['Cell'] = ({ value, original }) => (
          <div>
            <span title={original[column.accessor]}>
              {original[column.accessor]}
            </span>
            <div className='res-sm'>
              {resCellsSm.map((value, index) => {
                return <div key={`res-sm-${index}`} className='resCellDiv' title={original[value]}>{original[value]}</div>
              })}
            </div>
            <div className='res-md'>
              {resCellsMd.map((value, index) => {
                return <div key={`res-md-${index}`} className='resCellDiv' title={original[value]}>{original[value]}</div>
              })}
            </div>
          </div>
        );
      }
      if (i !== 1 && i !== 2 && typeof (column['Cell']) != 'function') {
        column['Cell'] = ({ value, original }) => (
          <span title={original[column.accessor]}>
            {original[column.accessor]}
          </span>
        );

        if (column.headerClassName && (column.headerClassName.indexOf('res-not-sm') != -1 || column.headerClassName.indexOf('res-not-md') != -1)) {
          if (this.state.screenWidth <= 1024 && column.headerClassName.indexOf('res-not-md') != -1) {
            column.show = false;
          }
          if (this.state.screenWidth <= 768 && column.headerClassName.indexOf('res-not-sm') != -1) {
            column.show = false;
          }
        }
      }


      if (column.id === 'checkbox') {
        const checkBoxCell = {
          id: "checkbox",
          accessor: "",
          Cell: ({ original }) => {
            return (
              <input
                type="checkbox"
                className="checkbox"
                checked={this.state.selected[original.uniqueId] === true}
                onChange={() => this.toggleRow(original.uniqueId)}
              />
            );
          },
          Header: x => {
            return (
              <input
                type="checkbox"
                className="checkbox"
                checked={this.state.selectAll === 1}
                ref={input => {
                  if (input) {
                    input.indeterminate = this.state.selectAll === 2;
                  }
                }}
                onChange={() => this.toggleSelectAll()}
              />
            );
          },
          sortable: true,
          width: 45
        }
        // updateColumns.push(checkBoxCell);
      }
      if (column.sortable === undefined || column.sortable) {
        column['sortable'] = true;
      } else {
        column['sortable'] = false;
      }
      if (!column.resizable) {
        column['resizable'] = false;
      }
      if (!column.minWidth) {
        column['minWidth'] = 80;
      }
      if (!column.maxWidth) {
        column['maxWidth'] = 170;
      }
      if (!column.maxWidth) {
        column['width'] = 100;
      }
      if (!column.headerClassName) {
        column['headerClassName'] = (column['sortable']) ? "fa fa-sort thheader" : "thheader";
        column['headerClassName'] = !column['draggable'] ? column['headerClassName'] + ' draggable-header' : column['headerClassName'];
      }
      if (column['isEditable']) {
        column['Cell'] = ({ value, original }) => (
          this.renderEditable(original, column)
        )
      }
      // updateColumns.push(column);

    })
    const { data } = this.state;
    const pageSizeOptions = [];
    if (data) {
      const dataLength = data.length;
      const pageSizeMultipe = 5;
      const dropDownLength = (dataLength / pageSizeMultipe).toString().split('.').length > 1 ? parseInt(dataLength / pageSizeMultipe) + 1 : parseInt(dataLength / pageSizeMultipe);
      for (let i = 1; i <= dropDownLength && i <= 10; i++) {
        pageSizeOptions.push(i * pageSizeMultipe)
      }

    }

    if (this.state.reorder && this.state.reorder.length) {
      let reorderObj = this.state.reorder[this.state.reorder.length - 1];
      console.log(reorderObj)
      updateColumns.splice(reorderObj.a, 0, updateColumns.splice(reorderObj.b, 1)[0])
      // if (this.state.leftFixed && this.state.leftFixed.lrngth) {
      //   updateColumns.forEach((itm, index) => {
      //     if (index < this.state.leftFixed.length) {
      //       itm['fixed'] = 'left'
      //     }
      //   })
      // }
    }

    return (
      <DragDropContext onDragEnd={this.handleDragEnd} >
        <ReactTableFixedColumns class="tablecss"
          {...this.props}
          TrComponent={DragTrComponent}
          TbodyComponent={DropTbodyComponent}
          getTrProps={this.getTrProps}
          columns={updateColumns}
          data={this.state.data}
          pageSizeOptions={pageSizeOptions}
          PaginationComponent={PaginationList(pageSize, false, this.setPageSizeOption)}
          pageSize={data.length === 0 ? 25 : (pageSize > data.length ? data.length : pageSize)}
        >
        </ReactTableFixedColumns>
      </DragDropContext>
    )

  }
}

Table.defaultProps = {

  columns: [{
    id: 'name',
    Header: 'Name',
    accessor: 'name', fixed: 'left',
    Cell: row => (
      <span title={row.value}>
        {row.value}
      </span>
    )
  },
  {
    id: 'description',
    Header: 'Description',
    accessor: 'description', fixed: 'left',
    Cell: row => (
      <span title={row.value}>
        {row.value}
      </span>
    )
  },
  {
    id: 'esdTrafficFileName',
    Header: 'ESD Traffic FileName',
    accessor: 'esdTrafficFileName',
    Cell: row => (
      <span title={row.value}>
        {row.value}
      </span>
    )
  },
  {
    id: 'days',
    Header: 'Days',
    accessor: 'days',
    minWidth: 80,
    maxWidth: 160,
  },
  {
    id: 'shipments',
    Header: 'Shipments',
    accessor: 'shipmentCount',

  },
  {
    id: 'Merchandise',
    Header: 'Merchandise',
    accessor: 'merchandise',
    isEditable: true, fixed: 'left',
  },
  {
    id: 'Automotive',
    Header: 'Automotive',
    accessor: 'automotive',
    minWidth: 80,
    maxWidth: 160
  },
  {
    Header: "Intermodal",
    accessor: "intermodal",
    id: "Intermodal",

  },
  {
    id: 'created By',
    Header: 'Created By',
    accessor: 'createdBy',

  },
  {
    id: 'created Date',
    Header: 'Created Date',
    accessor: 'createdDate'

  },
  {
    id: 'action',
    Header: 'Action',
    accessor: 'status',

    Cell: ({ value, original }) => (
      <FormGroup className="form-group-center">
        <Button id="new-scenario-cancel-button" value={original.uuid} className=""><span className="glyphicon glyphicon-trash default_color"></span></Button>
        {
          value === 'Failed' &&
          <Button id="new-scenario-create-button" value={original.uuid} className="" ><span className="glyphicon glyphicon-refresh default_color"></span></Button>
        }
      </FormGroup>
    )
  }],
  data:
    [
      { "uuid": "c16e6dfb-4c4e-4c1e-be30-f8ddb706f238", "name": "TEST 1", "description": "*** IMPORT [Mon Sep 13 10:33:31 CDT 2010] (trial):  Test of the traffic extract for 2 day traffic file 5/30 - 5/31", "esdTrafficFileName": "TRAFFIC TEST - 2 DAY", "days": 7, "shipmentCount": 0, "merchandise": "YES", "automotive": "NO", "intermodal": "NO", "createdBy": "C893064", "createdDate": "2019-12-02 20:14:28", "status": "Failed" },
      { "uuid": "b821ff5f-1d5a-4b2a-a7ff-a74bb70accc6", "name": "TEST 2", "description": "*** IMPORT [Thu Jun 30 15:10:03 CDT 2016] (prod):  TRFK 160521-160617", "esdTrafficFileName": "CARLOAD AND AUTO 28 DAY TRFK 160521-160617", "days": 28, "shipmentCount": 0, "merchandise": "YES", "automotive": "YES", "intermodal": "NO", "createdBy": "C893064", "createdDate": "2019-11-25 17:54:25", "status": "Failed" },
      { "uuid": "a788281a-0e07-4b7f-be01-aabdce215110", "name": "TEST 3", "description": "Test for authentication", "esdTrafficFileName": "TEST_ONE_WEEK_20170203_20170209", "days": 7, "shipmentCount": 0, "merchandise": "YES", "automotive": "YES", "intermodal": "NO", "createdBy": "C893064", "createdDate": "2019-11-25 17:52:07", "status": "Failed" },
      { "uuid": "896da859-e070-42c0-97a7-baee6af29b64", "name": "TEST 4", "description": "Test For Traffic File Generation in Dev", "esdTrafficFileName": "TEST_01_13_2017", "days": 7, "shipmentCount": 0, "merchandise": "YES", "automotive": "NO", "intermodal": "NO", "createdBy": "C893064", "createdDate": "2019-12-02 20:16:08", "status": "Failed" },
      { "uuid": "88cbfea7-7aca-4c0b-b979-7638a5e22393", "name": "TEST 5", "description": "*** IMPORT [Mon Sep 10 10:47:55 CDT 2018] (prod):  TRFK 180804 - 180831", "esdTrafficFileName": "CARLOAD AND AUTO 28 DAY TRFK 180804 - 180831", "days": 28, "shipmentCount": 0, "merchandise": "YES", "automotive": "YES", "intermodal": "NO", "createdBy": "C848609", "createdDate": "2019-12-16 20:38:48", "status": "Failed" },
      { "uuid": "53ff94eb-0a7c-4469-a678-389856667a2a", "name": "TEST 6", "description": "test1", "esdTrafficFileName": "CARLOAD AND AUTO 28 DAY TRFK 190720 - 190816", "days": 28, "shipmentCount": 0, "merchandise": "YES", "automotive": "YES", "intermodal": "NO", "createdBy": "testUser", "createdDate": "2019-11-13 12:27:50", "status": "Failed" },
      { "uuid": "1a9366fa-1842-40e2-95d3-848b431e37be", "name": "TEST 7", "description": "Default Traffic", "esdTrafficFileName": "28_Day", "days": 28, "shipmentCount": 0, "merchandise": "YES", "automotive": "NO", "intermodal": "NO", "createdBy": "C893064", "createdDate": "2019-11-25 18:44:23", "status": "Failed" },
      { "uuid": "1954acc9-a84f-4290-8079-fa5576beeae0", "name": "TEST 8", "description": "Testing Teradata connectivity", "esdTrafficFileName": "TEST_TERADATA_CONNECTIVITY", "days": 28, "shipmentCount": 0, "merchandise": "YES", "automotive": "YES", "intermodal": "NO", "createdBy": "C893064", "createdDate": "2019-11-25 17:47:48", "status": "Failed" }],
}
