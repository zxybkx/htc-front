/*
 * @Description:批量识别全发票明细
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-1-29 16:10:32
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import InvoiceDetailPage from '@common/pages/invoice-common/invoice-detail/detail/InvoiceDetailPage';

interface RouterInfo {
  invoiceHeaderId: any;
  invoiceType: string;
}
interface InvoicePoolDetailPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
export default class BatchInvoiceDetailPage extends Component<InvoicePoolDetailPageProps> {
  render() {
    const { invoiceHeaderId, invoiceType } = this.props.match.params;
    return (
      <InvoiceDetailPage
        backPath="/htc-front-ivp/batch-check/list"
        invoiceHeaderId={invoiceHeaderId}
        invoiceType={invoiceType}
      />
    );
  }
}
