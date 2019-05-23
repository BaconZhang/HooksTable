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
        name: '铪',
        age: 32 + index,
        address: '西湖区湖底公园1号',
        description: "这是一条毫无用处的描述".repeat(index === 1 ? 4 : 1)
      })),
      page: query.page || 0,
      size: query.size || 10,
      total: 100
    });
  }, 1000);
});

const columns: ColumnProps<User>[] = [
  {
    title: "姓名",
    key: "1",
    titleRender: (record) => "我是" + record.name,
    width: 200,
    fixed: "left",
    children: [{
      title: "姓氏",
      key: "1-1",
      dataIndex: "age"
    },
    {
      title: "名字",
      key: "1-2",
      children: [{ title: "名", key: "2-1", dataIndex: "name", }, { title: "字", key: "2-2", dataIndex: "name", }]
    }]
  },
  {
    title: "年龄",
    dataIndex: "age",
    width: 200
  },
  {
    title: "住址",
    dataIndex: "address",
    width: 300,
  },
  {
    title: "描述",
    dataIndex: "description",
    width: 300,
  },
  {
    title: "操作",
    key: "operation",
    width: 250,
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
      scroll={{
        x: true,
        y: 400
      }}
    />
  );
};

export default App;
