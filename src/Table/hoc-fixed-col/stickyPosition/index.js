import React from 'react';
import PropTypes from 'prop-types';
import { ReactTableDefaults } from '@bretkikehara/react-table';
// import uniqid from 'uniqid';
import cx from 'classnames'; 
import { getColumnId, isLeftFixed, isRightFixed, sortColumns, checkErrors, findPrevColumnNotHidden, findNextColumnNotHidden, memoize } from '../helpers';

export default (ReactTable) => {
  class ReactTableFixedColumns extends React.Component {
    // static propTypes = {
    //   columns: PropTypes.array.isRequired,
    //   innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    //   className: PropTypes.string,
    //   onResizedChange: PropTypes.func,
    //   uniqClassName: PropTypes.string,
    //   column: PropTypes.object
    // }

    // static defaultProps = {
    //   innerRef: null,
    //   className: null,
    //   onResizedChange: null,
    //   uniqClassName: null,
    //   column: ReactTableDefaults.column
    // }

    constructor(props) {
      super(props);

      checkErrors(this.props.columns);

      this.columnsWidth = {};
      this.uniqClassName = this.props.uniqClassName || 'rthfc-' + Math.floor(Math.random() * 1000000);
      //this.uniqClassName = this.props.uniqClassName || uniqid('rthfc-');
    }

    componentDidMount() {
      this.updateRowsPosition();
    }

    componentDidUpdate() {
      this.updateRowsPosition();
    }

    updateRowsPosition() {
      const headerRows = document.querySelectorAll(`.${this.uniqClassName} .rt-thead`);
      let topPosition = 0;
      /* eslint-disable no-param-reassign */
      Array.from(headerRows).forEach((row) => {
        row.style.top = `${topPosition}px`;
        topPosition += row.offsetHeight;
      });
      /* eslint-enable no-param-reassign */
    }

    // onResizedChange = (...args) => {
    //   const { onResizedChange } = this.props;
    //   if (onResizedChange) {
    //     onResizedChange(...args);
    //   }

    //   args[0].forEach(({ id, value }) => {
    //     this.columnsWidth[id] = value;
    //   });

    //   this.forceUpdate();
    // }
    onResizedChange () {
      var onResizedChange = this.props.onResizedChange;
    
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
    
      if (onResizedChange) {
        onResizedChange.apply(void 0, args);
      }
    
      args[0].forEach(function (_ref) {
        var id = _ref.id,
            value = _ref.value;
        this.columnsWidth[id] = value;
      });
    
      this.forceUpdate();
    };

    getLeftOffsetColumns(columns, index) {
      let offset = 0;
      for (let i = 0; i < index; i += 1) {
        const column = columns[i];
        if (column.show !== false) {
          const id = getColumnId(column);
          const width = this.columnsWidth[id] || column.width || column.minWidth || 100;
          offset += width;
        }
      }

      return offset;
    }

    getRightOffsetColumns(columns, index) {
      let offset = 0;
      for (let i = index + 1; i < columns.length; i += 1) {
        const column = columns[i];
        if (column.show !== false) {
          const id = getColumnId(column);
          const width = this.columnsWidth[id] || column.width || column.minWidth || 100;
          offset += width;
        }
      }

      return offset;
    }

    getColumnsWithFixed(columns, parentIsfixed, parentIsLastFixed, parentIsFirstFixed) {
      const defaultColumn = this.props.column;

      return columns.map((column, index) => {
        const fixed = column.fixed || parentIsfixed || false;

        const nextColumn = findNextColumnNotHidden(columns, index);
        const _parentIsLastFixed = fixed && parentIsfixed === undefined && nextColumn && !nextColumn.fixed;
        const isLastFixed = fixed && (parentIsfixed ? [true, 'left'].includes(parentIsfixed) && parentIsLastFixed : true) && (
          (parentIsfixed && !nextColumn) ||
          (!parentIsfixed && nextColumn && !nextColumn.fixed)
        );

        const prevColumn = findPrevColumnNotHidden(columns, index);
        const _parentIsFirstFixed = fixed && parentIsfixed === undefined && prevColumn && !prevColumn.fixed;
        const isFirstFixed = fixed && (parentIsfixed ? parentIsfixed === 'right' && parentIsFirstFixed : true) && (
          (parentIsfixed && !prevColumn) ||
          (!parentIsfixed && prevColumn && !prevColumn.fixed)
        );

        const columnIsLeftFixed = isLeftFixed({ fixed });
        const columnIsRightFixed = isRightFixed({ fixed });

        const left = columnIsLeftFixed && this.getLeftOffsetColumns(columns, index);
        const right = columnIsRightFixed && this.getRightOffsetColumns(columns, index);

        const output = {
          ...column,
          fixed,
          className: cx(
            defaultColumn.className,
            column.className,
            fixed && 'rthfc-td-fixed',
            columnIsLeftFixed && 'rthfc-td-fixed-left',
            columnIsRightFixed && 'rthfc-td-fixed-right',
            isLastFixed && 'rthfc-td-fixed-left-last',
            isFirstFixed && 'rthfc-td-fixed-right-first',
          ),
          style: {
            ...defaultColumn.style,
            ...column.style,
            left,
            right,
          },
          headerClassName: cx(
            defaultColumn.headerClassName,
            column.headerClassName,
            fixed && 'rthfc-th-fixed',
            columnIsLeftFixed && 'rthfc-th-fixed-left',
            columnIsRightFixed && 'rthfc-th-fixed-right',
            (_parentIsLastFixed || (parentIsLastFixed && isLastFixed)) && 'rthfc-th-fixed-left-last',
            (_parentIsFirstFixed || (parentIsFirstFixed && isFirstFixed)) && 'rthfc-th-fixed-right-first',
          ),
          headerStyle: {
            ...defaultColumn.headerStyle,
            ...column.headerStyle,
            left,
            right,
          },
        };

        if (column.columns) {
          output.columns = this.getColumnsWithFixed(column.columns, fixed, _parentIsLastFixed, _parentIsFirstFixed);
        }

        return output;
      });
    }

    // getColumns = memoize((columns) => {
    //   const sortedColumns = sortColumns(columns);
    //   const columnsWithFixed = this.getColumnsWithFixed(sortedColumns);
    //   return columnsWithFixed;
    // })
    getColumns (columns) {
      const sortedColumns = sortColumns(columns);
      const columnsWithFixed = this.getColumnsWithFixed(sortedColumns);
      return columnsWithFixed;
    }

    render() {
      const {
        className,
        innerRef,
        columns,
        ...props
      } = this.props;

      return (
        <ReactTable
          {...props}
          ref={innerRef}
          className={cx(className, this.uniqClassName, 'rthfc', '-sp')}
          columns={this.getColumns(columns)}
          onResizedChange={this.onResizedChange}
        />
      );
    }
  }
  
  ReactTableFixedColumns.propTypes = {
    columns: PropTypes.array.isRequired,
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    className: PropTypes.string,
    onResizedChange: PropTypes.func,
    uniqClassName: PropTypes.string,
    column: PropTypes.object
  }

  ReactTableFixedColumns.defaultProps = {
    innerRef: null,
    className: null,
    onResizedChange: null,
    uniqClassName: null,
    column: ReactTableDefaults.column
  }

  return ReactTableFixedColumns;
};
