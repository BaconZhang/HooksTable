import React, { ReactNode, FunctionComponent, PropsWithChildren, ReactElement, CSSProperties } from 'react';
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
  width?: number;
  fixed?: "left" | "right";
}


interface ColumnHeader<T> extends ColumnProps<T> {
  style?: CSSProperties;
}

interface ColumnItemProps<T> extends ColumnHeader<T> {
  record: T;
  index: number;
  triggerReload: () => void;
}

export const ColumnHeader: FunctionComponent<ColumnHeader<any>> = <T extends object>(props: PropsWithChildren<ColumnHeader<T>>) => {
  const { title, style } = props;
  return <div className="column-header" style={style || {}}>
    {title}
  </div>
}

const renderItem = <T extends object>(props: PropsWithChildren<ColumnItemProps<T>>) => {
  if (props.render) {
    return props.render(props.record, props.index, props.triggerReload);
  }
  if (props.dataIndex) {
    return props.record[props.dataIndex]
  }
  return null;
};

export const ColumnItem: FunctionComponent<ColumnItemProps<any>> = <T extends object>(props: PropsWithChildren<ColumnItemProps<T>>) => {
  const { record, index, dataIndex, titleRender, style } = props;
  return <Tooltip title={titleRender ? titleRender(record, index) : dataIndex ? (record[dataIndex] || "") : ""} placement="topLeft">
    <div className="column-item" style={style || {}}>
      {renderItem(props)}
    </div>
  </Tooltip>
}
