import React, { FunctionComponent, CSSProperties } from 'react';
import { ColumnProps, ColumnHeader, ColumnItem } from './Column';

interface FixedTableProps<T> {
  show: boolean;
  columns: ColumnProps<T>[];
  dataSource: T[];
  rowKey: keyof T;
  triggerReload: () => void;
}

const renderFixedHeader = <T extends object>(columns: ColumnProps<T>[]) => {
  return columns.map(column => <ColumnHeader {...column} key={column.key || column.dataIndex as string} showContent />);
};

const renderFixedItem = <T extends object>(columns: ColumnProps<T>[], record: T, triggerReload: () => void) => {
  return columns.map((column, index) => <ColumnItem
    {...column}
    key={column.key || column.dataIndex as string}
    record={record}
    index={index}
    showContent
    triggerReload={triggerReload}
  />);
};

const computeColumnsWidth = <T extends object>(columns: ColumnProps<T>[]) => {
  return columns.map(column => column.width ? `${column.width}px` : "minmax(max-content, 1fr)").join(' ')
};

const computeStyle = <T extends object>(columns: ColumnProps<T>[], rows: number): {
  header: CSSProperties,
  body: CSSProperties,
  row: CSSProperties
} => {
  const fixedLeft = columns.filter(column => column.fixed === 'left');
  const fixedRight = columns.filter(column => column.fixed === 'right');
  const row = {
    gridTemplateColumns: [
      computeColumnsWidth(fixedLeft),
      computeColumnsWidth(fixedRight),
    ].join(" auto "),
    justifyContent: "stretch"
  };
  return {
    header: row,
    body: {
      gridTemplateRows: `repeat(${rows}, 1fr)`
    },
    row
  }
};

const FixedTable: FunctionComponent<FixedTableProps<any>> = (props) => {
  const { show, columns, dataSource, rowKey, triggerReload } = props;
  const styles = computeStyle(columns, dataSource.length);
  return show ? <div className="fixed-table-container">
    <div className="header" style={styles.header}>
      {renderFixedHeader(columns.filter(column => column.fixed === "left"))}
      <div className="column-header auto-fill"></div>
      {renderFixedHeader(columns.filter(column => column.fixed === "right"))}
    </div>
    {
      dataSource.length ? <div className="body" style={styles.body}>
        {
          dataSource.map((record) => <div className="row" style={styles.row} key={`${record[rowKey]}`}>
            {renderFixedItem(columns.filter(column => column.fixed === 'left'), record, triggerReload)}
            <div className="column-item auto-fill"></div>
            {renderFixedItem(columns.filter(column => column.fixed === 'right'), record, triggerReload)}
          </div>)
        }
      </div> : null
    }
  </div> : null
};

export default FixedTable;