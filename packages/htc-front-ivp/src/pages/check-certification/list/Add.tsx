import React, { useContext, useState } from 'react';
import TestContext from './Store';

function Add() {
  const [txt, setTxt] = useState('');
  const { setList, list } = useContext(TestContext);
  return (
    <ul>
      <li>
        <input placeholder="请输入内容" onChange={e => setTxt(e.target.value)} />
      </li>
      <li>
        <button
          type="button"
          onClick={() => {
            const item = {
              id: Date.now(),
              txt,
            };
            setList([item, ...list]);
          }}
        >
          保存
        </button>
      </li>
    </ul>
  );
}

export default Add;
