import React, { FunctionComponent, CSSProperties, ReactElement, SyntheticEvent } from 'react';
import { PaginationProps } from "antd/lib/pagination";
import { ColumnProps, ColumnHeader, ColumnItem } from './Column';
import { getScrollbarWidth } from './util';

const SCROLL_BAR_WIDTH = getScrollbarWidth();

export interface PagedQuery {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
};

export interface PagedResponse<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
};

export interface LoadData<T> {
  (query: PagedQuery): Promise<PagedResponse<T>>
};

interface Local {
  emptyText: string;
};

const defaultLocal: Local = {
  emptyText: "暂无数据"
};

const MIN_ROW_HEIGHT = 48;

enum ZIndex {
  low = -1,
  mid = 0,
  high = 1
}

interface Scroll {
  x?: boolean;
  y?: number;
}
export interface TableProps<T> {
  dataSource?: T[];
  columns: ColumnProps<T>[];
  loadData: LoadData<T>;
  rowKey: keyof T;
  loading?: boolean;
  local?: Local;
  bordered?: boolean;
  pagination?: PaginationProps;
  tableStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  rowStyle?: CSSProperties;
  scroll?: Scroll;
};

export enum FixedType {
  left = "left",
  center = "center",
  right = "right"
}

export interface RenderTableProps<T> extends TableProps<T> {
  type: FixedType;
  triggerReload: () => void;
}

const computeColumnsWidth = <T extends object>(columns: ColumnProps<T>[]) => {
  const sum = columns.reduce((prev, column) => prev += column.width || 0, 0);
  return columns.map(column => {
    if (column.width) {
      return `minmax(${column.width}px, ${column.width / sum}fr)`;
    }
    return "minmax(max-content, auto)";
  }).join(' ')
};

const getRowStyle = <T extends object>(columns: ColumnProps<T>[], rowStyle?: CSSProperties): CSSProperties => Object.assign({
  gridTemplateColumns: computeColumnsWidth(columns),
  gridTemplateRows: `minmax(${MIN_ROW_HEIGHT}px, 1fr)`,
}, rowStyle);

const getBodyStyle = <T extends object>(dataSource: T[], bodyStyle?: CSSProperties): CSSProperties => Object.assign({
  gridTemplateRows: `repeat(${dataSource.length}, 1fr)`
}, bodyStyle);

const defaultTableStyle = {
  overflow: "hidden"
};

const defaultFixedTabelStyle = {
  position: "absolute",
  top: 0,
  width: "100%",
  border: 'none',
  overflow: 'hidden'
};

const TableStyles: {
  [key in FixedType]: (tableStyle?: CSSProperties, scroll?: Scroll) => CSSProperties
} = {
  [FixedType.center]: (tableStyle, scroll) => Object.assign(
    {},
    defaultTableStyle,
    tableStyle,
    scroll ? {
      overflowX: scroll.x ? "auto" : 'hidden',
      overflowY: scroll.y ? "auto" : 'hidden',
      height: scroll.y ? scroll.y : "auto"
    } : {}
  ),
  [FixedType.left]: (tableStyle, scroll) => Object.assign({}, defaultFixedTabelStyle, tableStyle, {
    left: 0,
    width: scroll && scroll.x ? `calc(100% - ${SCROLL_BAR_WIDTH}px)` : "100%"
  }),
  [FixedType.right]: (tableStyle, scroll) => Object.assign({}, defaultFixedTabelStyle, tableStyle, {
    right: scroll && scroll.y ? SCROLL_BAR_WIDTH : 0,
    justifyContent: 'flex-end'
  }),
};

const getTableStyle = (type: FixedType, tableStyle?: CSSProperties, scroll?: Scroll): CSSProperties => {
  if (type === "center") {
    return TableStyles[type](tableStyle, scroll);
  } else {
    const style = Object.assign({}, tableStyle);
    ["overflow", "overflowX", "overflowY"].forEach(key => Reflect.deleteProperty(style, key));
    if (scroll && scroll.y !== undefined) {
      Reflect.set(style, "height", scroll.y - SCROLL_BAR_WIDTH)
    }
    return TableStyles[type](style, scroll);
  };
};

const ItemStyles: {
  [key in FixedType]: <T extends object>(column: ColumnProps<T>) => CSSProperties
} = {
  [FixedType.center]: (column) => ({
    position: 'relative',
    zIndex: !column.fixed ? ZIndex.high : ZIndex.low,
    visibility: !column.fixed ? 'visible' : 'hidden'
  }),
  [FixedType.left]: (column) => ({
    position: 'relative',
    zIndex: column.fixed === FixedType.left ? ZIndex.high : ZIndex.low,
    visibility: column.fixed === FixedType.left ? 'visible' : 'hidden'
  }),
  [FixedType.right]: (column) => ({
    position: 'relative',
    zIndex: column.fixed === FixedType.right ? ZIndex.high : ZIndex.low,
    visibility: column.fixed === FixedType.right ? 'visible' : 'hidden'
  })
};
const getItemstyle = <T extends object>(type: FixedType, column: ColumnProps<T>): CSSProperties => ItemStyles[type](column);

const Table: FunctionComponent<RenderTableProps<any>> = <T extends object>(props: RenderTableProps<T>): ReactElement => {
  const { type, dataSource, columns, rowKey, triggerReload, loading, local, bodyStyle } = props;
  const rowStyle = getRowStyle(columns, props.rowStyle);
  const tableStyle = getTableStyle(type, props.tableStyle, props.scroll);
  const onScroll = (e: SyntheticEvent) => {
    if (e.target !== e.currentTarget) {
      return
    }
    const scrollTop = e.target["scrollTop"];
    if (scrollTop !== undefined) {
      document.querySelectorAll(".react-hooks-table .table-container").forEach((elm) => {
        if (e.target !== elm) {
          elm.scrollTop = scrollTop;
        }
      });
    }
  }
  const onWheel = (e: SyntheticEvent) => {
    const deltaY = e["deltaY"];
    if (deltaY !== undefined) {
      const center = document.querySelector(".react-hooks-table .table-container.center");
      const left = document.querySelector(".react-hooks-table .table-container.left");
      const right = document.querySelector(".react-hooks-table .table-container.right");
      if (center && center.clientHeight + center.scrollTop === center.scrollHeight && deltaY > 0) {
        return
      }
      [center, left, right].forEach(elm => {
        if (elm && e.target !== elm) {
          elm.scrollTop = elm.scrollTop + deltaY;
        }
      })
    }
  }
  return <div className={`table-container ${type}`} style={tableStyle} onScroll={onScroll} onWheel={onWheel}>
    <div className="header" style={rowStyle}>
      {
        columns.map(((column) => <ColumnHeader
          {...column}
          key={column.key || column.dataIndex as string}
          style={getItemstyle(type, column)}
        />))
      }
    </div>
    {Array.isArray(dataSource) && dataSource.length ? <div
      className="body"
      style={getBodyStyle(dataSource || [], bodyStyle)}
    >
      {
        dataSource.map((record) => <div className="row" style={rowStyle} key={`${record[rowKey]}`}>
          {
            columns.map((column, index) => <ColumnItem
              {...column}
              key={column.key || column.dataIndex as string}
              record={record}
              index={index}
              triggerReload={triggerReload}
              style={getItemstyle(type, column)}
            />)
          }
        </div>)
      }
    </div> : <div className="empty-text">{loading ? "" : (local || defaultLocal).emptyText}</div>}
  </div>
};

export default Table;