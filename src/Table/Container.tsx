import React, { FunctionComponent, PropsWithChildren, useState, useEffect } from 'react';
import { Spin, Pagination } from 'antd';
import { PaginationProps } from "antd/lib/pagination";
import Table, { TableProps, FixedType, RenderTableProps } from './Table';
import "./Table.less";

const defaultPagination: PaginationProps = {
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "30", "40", "50", "100"]
};

const useFetchData = <T extends object>(props: TableProps<T>) => {
  const { loadData } = props;
  const pagination = Object.assign({}, defaultPagination, props.pagination);
  const [loading, setLoading] = useState(props.loading ? props.loading : true);
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

const TableContainer: FunctionComponent<TableProps<any>> = <T extends object>(props: PropsWithChildren<TableProps<T>>) => {
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
  const getRenderProps = (type: FixedType): PropsWithChildren<RenderTableProps<T>> => ({
    ...props,
    type,
    dataSource,
    loading,
    local,
    triggerReload
  });
  return <div className={`react-hooks-table ${bordered ? "bordered" : ""}`}>
    <Spin spinning={loading}>
      {<Table {...getRenderProps(FixedType.center)} />}
      {columns.some(column => column.fixed === FixedType.left) && <Table {...getRenderProps(FixedType.left)} />}
      {columns.some(column => column.fixed === FixedType.right) && <Table {...getRenderProps(FixedType.right)} />}
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

export default TableContainer;