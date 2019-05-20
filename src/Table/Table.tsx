import React, { FunctionComponent, PropsWithChildren, CSSProperties, useState, useEffect, useMemo } from 'react';
import { Spin, Pagination } from 'antd';
import { PaginationProps } from "antd/lib/pagination";
import { ColumnProps, LoadData, ColumnHeader, ColumnItem } from './Column';
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

const computeColumnsWidth = <T extends object>(columns: ColumnProps<T>[]) => {
  return columns.map(column => column.width ? column.width : "1fr").join(' ')
};

const computeStyle = <T extends object>(columns: ColumnProps<T>[], rows: number): {
  header: CSSProperties,
  body: CSSProperties,
  row: CSSProperties
} => {
  const gridTemplateColumns = computeColumnsWidth(columns);
  return {
    header: {
      gridTemplateColumns
    },
    body: {
      gridTemplateRows: `repeat(${rows}, 1fr)`
    },
    row: {
      gridTemplateColumns
    }
  }
};

const useFetchData = <T extends object>(config: { loadData: LoadData<T>, columns: ColumnProps<T>[], pagination: PaginationProps }) => {
  const { loadData, pagination, columns } = config;
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(pagination.current as number);
  const [size, setSize] = useState(pagination.pageSize as number);
  const [total, setTotal] = useState(pagination.total as number);
  const [dataSource, setDataSource] = useState([] as T[]);
  const [styles, setStyles] = useState(computeStyle(columns, size));
  useEffect(() => {
    setLoading(true);
    loadData({ page: page - 1, size }).then(res => {
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
  const { total, loading, dataSource, setPage, setSize, setLoading, setDataSource, styles, page, size } = useFetchData({
    pagination,
    columns,
    loadData
  });
  const triggerReload = () => {
    setLoading(true);
    loadData({ page, size }).then(res => setDataSource(res.data)).finally(() => setLoading(false));
  };
  const onPageChange = (page: number) => setPage(page);
  const onSizeChange = (_: number, size: number) => {
    setSize(size);
    setPage(1);
  };
  return <div className={`react-hooks-table ${bordered ? "bordered" : ""}`}>
    <div className="header" style={styles.header}>
      {
        columns.map(column => <ColumnHeader {...column} key={column.key || column.dataIndex as string} />)
      }
    </div>
    <Spin spinning={loading}>
      {dataSource.length ? <div className="body" style={styles.body}>
        {
          dataSource.map((record, index) => <div className="row" style={styles.row} key={`${record[rowKey]}`}>
            {
              columns.map(column => <ColumnItem
                {...column}
                key={column.key || column.dataIndex as string}
                record={record}
                index={index}
                triggerReload={triggerReload}
              />)
            }
          </div>)
        }
      </div> : <div className="empty-text">{loading ? "" : (local || defaultLocal).emptyText}</div>}
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