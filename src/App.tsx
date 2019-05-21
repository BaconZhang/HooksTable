import React from 'react';
import { Button, Divider } from 'antd';
import Table, { ColumnProps, LoadData } from './Table';

interface User {
  id: string;
  name: string;
  age: number;
  address: string;
  description: string;
}

const loadData: LoadData<User> = (query) => new Promise(resolve => {
  setTimeout(() => {
    resolve({
      data: Array.from({ length: query.size || 10 }, (_, index) => ({
        id: index + 1 + "",
        name: '胡彦斌',
        age: 32 + index,
        address: '西湖区湖底公园1号',
        description: "这是一条毫无用处的描述"
      })),
      page: query.page || 0,
      size: query.size || 10,
      total: 100
    });
  }, 2000);
});

const columns: ColumnProps<User>[] = [
  {
    title: "姓名",
    dataIndex: "name",
    titleRender: (record) => "我是" + record.name,
    width: 300,
    fixed: "left"
  },
  {
    title: "年龄",
    dataIndex: "age",
  },
  {
    title: "住址",
    dataIndex: "address",
  },
  {
    title: "描述",
    dataIndex: "description",
  },
  {
    title: "操作",
    key: "operation",
    width: 250,
    fixed: "right",
    render: (record, _, reloadData) => <div>
      <Button type="link" onClick={() => console.log(record)}>编辑</Button>
      <Divider type="vertical" />
      <Button type="link">查看</Button>
      <Divider type="vertical" />
      <Button type="link" onClick={() => reloadData()}>删除</Button>
    </div>
  }
];

const App: React.FunctionComponent = (): React.ReactElement => {
  return (
    <Table
      columns={columns}
      loadData={loadData}
      rowKey="id"
      bordered
      pagination={{}}
      overflow={{
        overflowX: "auto",
        overflowY: "hidden"
      }}
    />
  );
};

export default App;
