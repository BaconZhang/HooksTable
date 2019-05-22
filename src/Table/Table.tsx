import React, { FunctionComponent, PropsWithChildren, CSSProperties, useState, useEffect, ReactElement, SyntheticEvent } from 'react';
import { Spin, Pagination } from 'antd';
import { PaginationProps } from "antd/lib/pagination";
import { ColumnProps, LoadData, ColumnHeader, ColumnItem } from './Column';
import { getScrollbarWidth } from './util';
import "./Table.less";

const SCROLL_BAR_WIDTH = getScrollbarWidth();
interface Local {
  emptyText: string;
};

interface TableProps<T> {
  dataSource?: T[];
  columns: ColumnProps<T>[];
  loadData: LoadData<T>;
  rowKey: keyof T;
  local?: Local;
  bordered?: boolean;
  pagination?: PaginationProps;
  tableStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  maxRoweHeight?: string;
};

enum TableType {
  left = "left",
  center = "center",
  right = "right"
}
interface RenderTableProps<T> extends TableProps<T> {
  type: TableType;
  triggerReload: () => void;
  loading: boolean;
}

const defaultLocal: Local = {
  emptyText: "暂无数据"
};

const defaultPagination: PaginationProps = {
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "30", "40", "50", "100"]
};

const computeColumnsWidth = <T extends object>(columns: ColumnProps<T>[]) => {
  const sum = columns.reduce((prev, column) => prev += column.width || 0, 0);
  return columns.map(column => {
    if (column.width) {
      return `minmax(${column.width}px, ${column.width / sum}fr)`;
    }
    return "minmax(max-content, auto)";
  }).join(' ')
};

const useFetchData = <T extends object>(props: TableProps<T>) => {
  const { loadData } = props;
  const pagination = Object.assign({}, defaultPagination, props.pagination);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(pagination.current);
  const [size, setSize] = useState(pagination.pageSize);
  const [total, setTotal] = useState(pagination.total);
  const [dataSource, setDataSource] = useState(props.dataSource || []);
  useEffect(() => {
    setLoading(true);
    loadData({ page: page as number - 1, size }).then(res => {
      setDataSource(res.data);
      setPage(res.page + 1);
      setSize(res.size);
      setTotal(res.total);
    }).finally(() => setLoading(false));
  }, [page, size]);
  return {
    loading,
    total,
    dataSource,
    page,
    size,
    setPage,
    setSize,
    setLoading,
    setDataSource,
    pagination
  }
};

const MIN_ROW_HEIGHT = 48;

const getRowStyle = <T extends object>(columns: ColumnProps<T>[], maxRowHeight = '1fr') => ({
  gridTemplateColumns: computeColumnsWidth(columns),
  gridTemplateRows: `minmax(${MIN_ROW_HEIGHT}px, ${maxRowHeight})`
}) as CSSProperties;

const getBodyStyle = <T extends object>(dataSource: T[], bodyStyle?: CSSProperties) => Object.assign({
  gridTemplateRows: `repeat(${dataSource.length}, 1fr)`
}, bodyStyle);

const defaultTableStyle = {
  overflow: "hidden"
};

const getTableStyle = (type: TableType, tableStyle?: CSSProperties): CSSProperties => {
  if (type === "center") {
    return Object.assign({}, defaultTableStyle, tableStyle);
  } else {
    const style = Object.assign({}, tableStyle);
    Reflect.deleteProperty(style, "overflow");
    Reflect.deleteProperty(style, "overflowX");
    Reflect.deleteProperty(style, "overflowY");
    return Object.assign({}, defaultTableStyle, style, {
      position: "absolute",
      top: 0,
      width: "100%",
      height: parseFloat(`${style.height}`) - SCROLL_BAR_WIDTH,
      border: 'none'
    }, type === 'right' && {
      right: SCROLL_BAR_WIDTH,
      justifyContent: 'flex-end'
    }, type === 'left' && {
      left: 0,
      width: `calc(100% - ${SCROLL_BAR_WIDTH}px)`,
    }) as CSSProperties;
  };
};

const getItemstyle = <T extends object>(type: TableType, column: ColumnProps<T>): CSSProperties => Object.assign(
  {
    position: 'relative'
  },
  type === TableType.center && {
    zIndex: !column.fixed ? 1 : -1,
    visibility: !column.fixed ? 'visible' : 'hidden'
  },
  type !== TableType.center && {
    zIndex: column.fixed === type ? 1 : -1,
    visibility: column.fixed === type ? "visible" : "hidden",
  }
) as CSSProperties;

const renderTable = <T extends object>(props: RenderTableProps<T>): ReactElement => {
  const { type, dataSource, columns, rowKey, triggerReload, loading, local, bodyStyle } = props;
  const rowStyle = getRowStyle(columns, props.maxRoweHeight);
  const tableStyle = getTableStyle(type, props.tableStyle);
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

const Table: FunctionComponent<TableProps<any>> = <T extends object>(props: PropsWithChildren<TableProps<T>>) => {
  const { columns, loadData, local, bordered } = props;
  const { total, loading, dataSource, setPage, setSize, setLoading, setDataSource, page, size, pagination } = useFetchData(props);
  const triggerReload = () => {
    setLoading(true);
    loadData({ page, size }).then(res => setDataSource(res.data)).finally(() => setLoading(false));
  };
  const onPageChange = (page: number) => setPage(page);
  const onSizeChange = (_: number, size: number) => {
    setSize(size);
    setPage(1);
  };
  const getRenderProps = (type: TableType): PropsWithChildren<RenderTableProps<T>> => ({
    ...props,
    type,
    dataSource,
    loading,
    local,
    triggerReload
  });
  return <div className={`react-hooks-table ${bordered ? "bordered" : ""}`}>
    <Spin spinning={loading}>
      {renderTable(getRenderProps(TableType.center))}
      {columns.some(column => column.fixed === 'left') && renderTable(getRenderProps(TableType.left))}
      {columns.some(column => column.fixed === 'right') && renderTable(getRenderProps(TableType.right))}
    </Spin>
    <div className="footer">
      <div>{loading ? "" : `${total}条`}</div>
      {!!props.pagination && <Pagination
        {...pagination}
        disabled={loading}
        pageSize={size}
        current={page}
        total={total}
        onChange={onPageChange}
        onShowSizeChange={onSizeChange}
      />}
    </div>
  </div>
}

export default Table;