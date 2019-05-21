import React, { FunctionComponent, PropsWithChildren, CSSProperties, useState, useEffect } from 'react';
import { Spin, Pagination } from 'antd';
import { PaginationProps } from "antd/lib/pagination";
import { ColumnProps, LoadData, ColumnHeader, ColumnItem } from './Column';
import FixedTable from './Fixed';
import "./Table.less";

interface Local {
  emptyText: string;
};

interface TableProps<T> {
  columns: ColumnProps<T>[];
  loadData: LoadData<T>;
  rowKey: keyof T;
  local?: Local;
  bordered?: boolean;
  pagination?: PaginationProps;
  overflow?: Partial<CSSProperties>
};

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

const defaultOverflow: Partial<CSSProperties> = {
  overflowX: "hidden",
  overflowY: "hidden"
};

const computeColumnsWidth = <T extends object>(columns: ColumnProps<T>[]) => {
  const sum = columns.filter(i => !i.fixed).reduce((prev, column) => prev += column.width || 0, 0);
  return columns.map(column => {
    if (column.fixed) {
      return column.width ? `${column.width}px` : "minmax(auto, 1fr)"
    }
    if (column.width) {
      return `minmax(${column.width}px, ${column.width / sum}fr)`;
    }
    return "minmax(auto, 1fr)";
  }).join(' ')
};

const computeStyle = <T extends object>(columns: ColumnProps<T>[], rows: number): {
  header: CSSProperties,
  body: CSSProperties,
  row: CSSProperties
} => {
  const gridTemplateColumns = computeColumnsWidth(columns);
  const row = {
    gridTemplateColumns
  }
  return {
    header: row,
    body: {
      gridTemplateRows: `repeat(${rows}, 1fr)`
    },
    row
  }
};

const useFetchData = <T extends object>(props: TableProps<T>) => {
  const { loadData, pagination, columns } = props;
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(pagination ? pagination.current : 1);
  const [size, setSize] = useState(pagination ? pagination.pageSize : defaultPagination.pageSize);
  const [total, setTotal] = useState(pagination ? pagination.total : 0);
  const [dataSource, setDataSource] = useState([] as T[]);
  const [styles, setStyles] = useState(computeStyle(columns, size as number));
  useEffect(() => {
    setLoading(true);
    loadData({ page: page as number - 1, size }).then(res => {
      setDataSource(res.data);
      setPage(res.page + 1);
      setSize(res.size);
      setTotal(res.total);
      setStyles(computeStyle(columns, res.size));
    }).finally(() => setLoading(false));
  }, [page, size]);
  return {
    loading,
    total,
    dataSource,
    styles,
    page,
    size,
    setPage,
    setSize,
    setLoading,
    setDataSource
  }
};

const Table: FunctionComponent<TableProps<any>> = <T extends object>(props: PropsWithChildren<TableProps<T>>) => {
  const { columns, loadData, rowKey, local, bordered } = props;
  const pagination = Object.assign({}, defaultPagination, props.pagination);
  const { total, loading, dataSource, setPage, setSize, setLoading, setDataSource, styles, page, size } = useFetchData(Object.assign({}, props, { pagination }));
  const triggerReload = () => {
    setLoading(true);
    loadData({ page, size }).then(res => setDataSource(res.data)).finally(() => setLoading(false));
  };
  const onPageChange = (page: number) => setPage(page);
  const onSizeChange = (_: number, size: number) => {
    setSize(size);
    setPage(1);
  };
  const overflow = Object.assign({}, defaultOverflow, props.overflow) as CSSProperties;
  return <div className={`react-hooks-table ${bordered ? "bordered" : ""}`}>
    <Spin spinning={loading}>
      <div className="table-container" style={overflow}>
        <div className="header" style={styles.header}>
          {
            columns.map(((column) => <ColumnHeader
              {...column}
              showContent={!column.fixed}
              key={column.key || column.dataIndex as string}
            />))
          }
        </div>
        {dataSource.length ? <div className="body" style={styles.body}>
          {
            dataSource.map((record) => <div className="row" style={styles.row} key={`${record[rowKey]}`}>
              {
                columns.map((column, index) => <ColumnItem
                  {...column}
                  key={column.key || column.dataIndex as string}
                  record={record}
                  index={index}
                  showContent={!column.fixed}
                  triggerReload={triggerReload}
                />)
              }
            </div>)
          }
        </div> : <div className="empty-text">{loading ? "" : (local || defaultLocal).emptyText}</div>}
      </div>
      <div className="table-container" style={{ position: "absolute", right: 0, top: 0, width: 250, overflow: "hidden", justifyContent: 'flex-end' }}>
        <div className="header" style={styles.row}>
          {
            columns.map(((column) => <ColumnHeader
              {...column}
              showContent
              key={column.key || column.dataIndex as string}
              style={{ opacity: column.fixed === 'right' ? 1 : 0 }}
            />))
          }
        </div>
        {dataSource.length ? <div className="body" style={styles.body}>
          {
            dataSource.map((record) => <div className="row" style={styles.row} key={`${record[rowKey]}`}>
              {
                columns.map((column, index) => <ColumnItem
                  {...column}
                  key={column.key || column.dataIndex as string}
                  record={record}
                  index={index}
                  showContent
                  triggerReload={triggerReload}
                  style={{ opacity: column.fixed === 'right' ? 1 : 0 }}
                />)
              }
            </div>)
          }
        </div> : <div className="empty-text">{loading ? "" : (local || defaultLocal).emptyText}</div>}
      </div>
      <div className="table-container" style={{ position: "absolute", left: 0, top: 0, overflow: "hidden", width: 300 }}>
        <div className="header" style={styles.row}>
          {
            columns.map(((column) => <ColumnHeader
              {...column}
              showContent
              key={column.key || column.dataIndex as string}
              style={{ opacity: column.fixed === 'left' ? 1 : 0, position: 'relative', zIndex: column.fixed === 'left' ? 0 : -1 }}
            />))
          }
        </div>
        {dataSource.length ? <div className="body" style={styles.body}>
          {
            dataSource.map((record) => <div className="row" style={styles.row} key={`${record[rowKey]}`}>
              {
                columns.map((column, index) => <ColumnItem
                  {...column}
                  key={column.key || column.dataIndex as string}
                  record={record}
                  index={index}
                  showContent
                  triggerReload={triggerReload}
                  style={{
                    opacity: column.fixed === 'left' ? 1 : 0,
                  }}
                />)
              }
            </div>)
          }
        </div> : <div className="empty-text">{loading ? "" : (local || defaultLocal).emptyText}</div>}
      </div>
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

export default Table