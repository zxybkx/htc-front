/*
 * @Description:全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-14 15:05:58
 * @LastEditTime: 2022-07-26 14:26:02
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import BillPoolDetailPage from '@htccommon/pages/invoice-common/bill-detail/detail/BillPoolDetailPage';

interface RouterInfo {
  invoiceHeaderId: any;
}
interface BillPoolDetailPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

export default class BatchBillDetailPage extends Component<BillPoolDetailPageProps> {
  render() {
    const { invoiceHeaderId } = this.props.match.params;
    return (
      <BillPoolDetailPage
        backPath="/htc-front-ivp/batch-check/list"
        billPoolHeaderId={invoiceHeaderId}
      />
    );
  }
}
