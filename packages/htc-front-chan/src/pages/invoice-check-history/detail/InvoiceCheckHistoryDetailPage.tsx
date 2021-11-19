/*
 * @Descripttion:全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-07-27 17:22:57
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
interface InvoiceCheckHistoryDetailPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

export default class InvoiceCheckHistoryDetailPage extends Component<
  InvoiceCheckHistoryDetailPageProps
> {
  render() {
    const { invoiceHeaderId, invoiceType } = this.props.match.params;
    return (
      <InvoiceDetailPage
        backPath="/htc-front-chan/invoice-check-history/list"
        invoiceHeaderId={invoiceHeaderId}
        invoiceType={invoiceType}
      />
    );
  }
}
