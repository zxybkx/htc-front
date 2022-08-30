import React from 'react';
import ReactDOM from 'react-dom';
import { TestProvider } from './Store';
import List from './List';
import Add from './Add';

ReactDOM.render(
  <TestProvider>
    <List />
    <hr />
    <Add />
  </TestProvider>,
  document.getElementById('root')
);
