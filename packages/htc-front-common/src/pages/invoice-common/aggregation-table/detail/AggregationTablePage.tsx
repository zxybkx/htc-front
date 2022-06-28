/**
 * @Description:聚合表格
 * @version: 1.0
 * @Author: huishan.yu@hand-china.com
 * @Date: 2021-11-08 10:23:48
 * @LastEditTime: 2021-11-08 10:23:48
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { TableProps } from 'choerodon-ui/pro/lib/table/Table';
import { Table } from 'choerodon-ui/pro';
import styles from './index.module.less';

export default class AggregationTable extends Component<TableProps> {
  render() {
    const { children, ...rest } = this.props;
    return (
      <Table className={styles.Table} aggregation {...rest}>
        {children}
      </Table>
    );
  }
}
