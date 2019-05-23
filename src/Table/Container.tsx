import React, { FunctionComponent, PropsWithChildren, Reducer, useEffect, useReducer } from 'react';
import { Spin, Pagination } from 'antd';
import { PaginationProps } from "antd/lib/pagination";
import Table, { TableProps, FixedType, RenderTableProps, LoadData } from './Table';
import "./Table.less";

enum ActionTypes {
  filter = "filter",
  loading = "loading",
  dataSource = "dataSource"
};

interface Filter {
  page: number;
  size: number;
};

interface Store<T> {
  filter: Filter;
  loading: boolean;
  dataSource: T[];
  total: number;
}

interface Action<T> {
  type: ActionTypes;
  payload: {
    filter?: Partial<Filter>;
    loading?: boolean;
    dataSource?: T[];
    total?: number;
  }
}

const reducer = <T extends object>(state: Store<T>, action: Action<T>) => {
  switch (action.type) {
    case ActionTypes.filter:
      const filter = Object.assign({}, state.filter, action.payload.filter);
      return Object.assign({}, state, { filter });
    case ActionTypes.loading:
      return Object.assign({}, state, { loading: action.payload.loading });
    case ActionTypes.dataSource:
      return Object.assign({}, state, {
        dataSource: action.payload.dataSource,
        total: action.payload.total
      });
    default:
      return state;
  }
}

const defaultPagination: PaginationProps = {
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "30", "40", "50", "100"]
};

const useFetchData = <T extends object>(
  loadData: LoadData<T>,
  store: Store<T>,
  dispatch: React.Dispatch<Action<T>>,
) => {
  useEffect(() => {
    dispatch({
      type: ActionTypes.loading,
      payload: {
        loading: true
      }
    });
    loadData({
      page: store.filter.page - 1,
      size: store.filter.size
    }).then(res => {
      dispatch({
        type: ActionTypes.dataSource,
        payload: {
          dataSource: res.data,
          total: res.total
        }
      });
      dispatch({
        type: ActionTypes.filter,
        payload: {
          filter: {
            page: res.page + 1,
            size: res.size
          }
        }
      });
    }).finally(() => dispatch({
      type: ActionTypes.loading,
      payload: {
        loading: false
      }
    }));
  }, [store.filter.page, store.filter.size]);
};

const TableContainer: FunctionComponent<TableProps<any>> = <T extends object>(props: PropsWithChildren<TableProps<T>>) => {
  const { columns, loadData, local, bordered } = props;
  const pagination = Object.assign({}, defaultPagination, props.pagination);
  const initialState: Store<T> = {
    filter: {
      page: pagination.current as number,
      size: pagination.pageSize as number
    },
    loading: true,
    dataSource: [],
    total: pagination.total as number
  };
  const [store, dispatch] = useReducer<Reducer<Store<T>, Action<T>>>(reducer, initialState);
  useFetchData(loadData, store, dispatch);
  const setLoading = (loading: boolean) => dispatch({
    type: ActionTypes.loading,
    payload: { loading }
  });
  const triggerReload = () => {
    setLoading(true);
    loadData(store.filter).then(res => dispatch({
      type: ActionTypes.dataSource,
      payload: {
        dataSource: res.data
      }
    })).finally(() => setLoading(false));
  };
  const setPage = (page: number) => dispatch({
    type: ActionTypes.filter,
    payload: {
      filter: { page }
    }
  });
  const setPageSize = (_: number, size: number) => dispatch({
    type: ActionTypes.filter,
    payload: {
      filter: {
        page: 1,
        size
      }
    }
  });
  const getRenderProps = (type: FixedType): PropsWithChildren<RenderTableProps<T>> => ({
    ...props,
    type,
    dataSource: store.dataSource,
    loading: store.loading,
    local,
    triggerReload
  });
  return <div className={`react-hooks-table ${bordered ? "bordered" : ""}`}>
    <Spin spinning={store.loading}>
      {<Table {...getRenderProps(FixedType.center)} />}
      {columns.some(column => column.fixed === FixedType.left) && <Table {...getRenderProps(FixedType.left)} />}
      {columns.some(column => column.fixed === FixedType.right) && <Table {...getRenderProps(FixedType.right)} />}
    </Spin>
    <div className="footer">
      <div>{store.loading ? "" : `${store.total}条`}</div>
      {!!props.pagination && <Pagination
        {...pagination}
        disabled={store.loading}
        pageSize={store.filter.size}
        current={store.filter.page}
        total={store.total}
        onChange={setPage}
        onShowSizeChange={setPageSize}
      />}
    </div>
  </div>
}

export default TableContainer;