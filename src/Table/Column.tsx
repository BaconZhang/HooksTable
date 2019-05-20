import React, { ReactNode, FunctionComponent, PropsWithChildren, ReactElement } from 'react';
import { Tooltip } from 'antd';

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

export interface ColumnProps<T> {
  title: string | ReactNode;
  dataIndex?: keyof T;
  key?: string;
  render?: (record: T, index: number, triggerReload: () => void) => ReactElement;
  titleRender?: (record: T, index: number) => ReactNode;
  width?: string;
}

interface ColumnItemProps<T> extends ColumnProps<T> {
  record: T;
  index: number;
  triggerReload: () => void;
}

export const ColumnHeader: FunctionComponent<ColumnProps<any>> = <T extends object>(props: PropsWithChildren<ColumnProps<T>>) => <div className="column-header">
  {props.title}
</div>

export const ColumnItem: FunctionComponent<ColumnItemProps<any>> = <T extends object>(props: PropsWithChildren<ColumnItemProps<T>>) => {
  const { record, index, dataIndex, render, titleRender, triggerReload } = props;
  return <Tooltip title={titleRender ? titleRender(record, index) : dataIndex ? (record[dataIndex] || "") : ""} placement="topLeft">
    <div className="column-item">
      {render ? render(record, index, triggerReload) : dataIndex ? record[dataIndex] : null}
    </div>
  </Tooltip>
}