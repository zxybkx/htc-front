/*
 * @Description:全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2022-11-16 14:05:07
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import BillPoolDetailPage from '@htccommon/pages/invoice-common/bill-detail/detail/BillPoolDetailPage';
import InvoiceDetailPage from '@htccommon/pages/invoice-common/invoice-detail/detail/InvoiceDetailPage';

const invoiceSourceCode = 'INVOICE_POOL';

interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: string;
}
interface InvoicePoolDetailPageProps extends RouteComponentProps<RouterInfo> {
  location: any;
}
export default class MyInvoiceDetailPage extends Component<InvoicePoolDetailPageProps> {
  state = { invoiceType: '', invoiceHeaderId: '', entryPoolSource: '' };

  async componentDidMount() {
    const { sourceCode } = this.props.match.params;
    if (sourceCode === invoiceSourceCode) {
      const { invoiceInfo } = this.props.location.state;
      if (invoiceInfo) {
        this.setState({
          invoiceType: invoiceInfo.invoiceType,
          invoiceHeaderId: invoiceInfo.invoiceHeaderId,
          entryPoolSource: invoiceInfo.entryPoolSource,
        });
      }
    }
  }

  render() {
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    const { invoiceHeaderId, invoiceType, entryPoolSource } = this.state;
    return sourceCode === invoiceSourceCode
      ? invoiceHeaderId && (
      <InvoiceDetailPage
        backPath="/htc-front-ivp/my-invoice/list"
        invoiceHeaderId={invoiceHeaderId}
        invoiceType={invoiceType}
        entryPoolSource={entryPoolSource}
      />
        )
      : sourceHeaderId && (
      <BillPoolDetailPage
        backPath="/htc-front-ivp/my-invoice/list"
        billPoolHeaderId={sourceHeaderId}
      />
        );
  }
}
