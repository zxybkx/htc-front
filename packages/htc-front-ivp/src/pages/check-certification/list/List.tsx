import React, { useContext } from 'react';
import TestContext from './Store';

function List() {
  const { list } = useContext(TestContext);
  return (
    <ul>
      {list.map(item => (
        <li key={item.id}>{item.txt}</li>
      ))}
    </ul>
  );
}

export default List;
