import React, { ReactNode, FunctionComponent, PropsWithChildren, ReactElement, CSSProperties, Fragment } from 'react';
import { Tooltip } from 'antd';

export interface ColumnProps<T> {
  title: string | ReactNode;
  dataIndex?: keyof T;
  key?: string;
  render?: (record: T, index: number, triggerReload: () => void) => ReactElement;
  titleRender?: (record: T, index: number) => ReactNode;
  width?: number;
  fixed?: "left" | "right";
  children?: ColumnProps<T>[];
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
  const { title, style, children } = props;
  return !children ? <div className={"column-header"} style={style || {}}>
    {title}
  </div> : <div className="column-header group" style={style || {}}>
      <div className="parent-title">
        {title}
      </div>
      <div className="children" style={{ gridTemplateColumns: `repeat(${children.length}, 1fr)` }}>
        {(children as ColumnProps<T>[]).map((child) => <ColumnHeader {...child} />)}
      </div>
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
  const { record, index, dataIndex, titleRender, style, children } = props;
  return <Tooltip title={titleRender ? titleRender(record, index) : dataIndex ? (record[dataIndex] || "") : ""} placement="topLeft">
    {!children ? <div className="column-item" style={style || {}}>
      {renderItem(props)}
    </div> : <div className="column-item group" style={Object.assign({}, style, { gridTemplateColumns: `repeat(${children.length}, 1fr)` })}>
        {children.map(child => <ColumnItem {...child} record={record} index={index} triggerReload={props.triggerReload} />)}
      </div>}
  </Tooltip>
}
