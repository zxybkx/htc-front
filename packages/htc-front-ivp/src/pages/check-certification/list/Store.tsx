import React, { createContext, useState } from 'react';

const TestContext = createContext(null as any);
const { Provider } = TestContext;

export function TestProvider(props) {
  const [list, setList] = useState([
    {
      id: 1,
      txt: '测试1',
    },
    {
      id: 2,
      txt: '测试2',
    },
  ]);
  return <Provider value={{ list, setList }}>{props.children}</Provider>;
}

export default TestContext;
