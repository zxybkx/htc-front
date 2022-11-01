/*
 * @Description:发票子页面切换
 * @version: 1.0
 * @Author: huishan.yu@hand-china.com
 * @Date: 2021-10-29 12:00:48
 * @LastEditTime: 2022-11-01 12:02:47
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { Dispatch } from 'redux';
import intl from 'utils/intl';
import { Icon } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import queryString from 'query-string';
import { Bind } from 'lodash-decorators';
import { getActiveTabKey } from 'utils/menuTab';
import style from './invoiceChildSwitchPage.model.less';

interface InvoiceChildSwitchPageProps {
  // detailDataSet:any;
  type: number;
  dispatch?: Dispatch<any>;
}
const modelCode = 'hivp.invoices';
@formatterCollections({
  code: [modelCode, 'hivp.invoicesArchiveUpload', 'hivp.invoicesDocRelated'],
})
export default class InvoiceChildSwitchPage extends Component<InvoiceChildSwitchPageProps> {
  // 通过头跳转
  goToByHeaderParams(record, comParams) {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch(
        routerRedux.push({
          pathname: comParams.pathname,
          search: queryString.stringify({
            invoiceInfo: encodeURIComponent(
              JSON.stringify({
                companyId: record.companyId,
                ...comParams.otherSearch,
              })
            ),
          }),
        })
      );
    }
  }

  @Bind()
  switchFnType0({ record, subTabKey, sourceCode }) {
    const { dispatch } = this.props;
    let invoiceHeaderid;
    let pathname = '';
    const {
      companyCode,
      entryPoolSource,
      invoiceType,
      billPoolHeaderId,
      billType,
      poolHeaderId,
      invoiceHeaderId,
    } = record;
    switch (subTabKey) {
      case 'my-invoice':
        invoiceHeaderid = entryPoolSource === 'EXTERNAL_IMPORT' ? poolHeaderId : invoiceHeaderId;
        pathname =
          sourceCode === 'BILL_POOL'
            ? `/htc-front-ivp/my-invoice/billDetail/${billPoolHeaderId}/${invoiceType}`
            : `/htc-front-ivp/my-invoice/invoiceDetail/${invoiceHeaderid}/${invoiceType}/${entryPoolSource}/${companyCode}`;
        break;
      case 'invoices':
        invoiceHeaderid =
          entryPoolSource === 'EXTERNAL_IMPORT'
            ? record.invoicePoolHeaderId
            : record.invoiceHeaderId;
        pathname = `/htc-front-ivp/invoices/detail/${invoiceHeaderid}/${invoiceType}/${entryPoolSource}/${companyCode}`;
        break;
      case 'bills':
        pathname = `/htc-front-ivp/bills/detail/${billPoolHeaderId}/${billType || invoiceType}`;
        break;
      default:
        break;
    }
    if (dispatch) {
      dispatch(
        routerRedux.push({
          pathname,
        })
      );
    }
  }

  @Bind()
  switchFnType1({ record, subTabKey, sourceCode }) {
    if (subTabKey === 'my-invoice') {
      // 我的发票
      const { poolHeaderId } = record;
      if (!poolHeaderId) return;
      const comParams = {
        pathname: `/htc-front-ivp/my-invoice/archive-information/${sourceCode}/${poolHeaderId}`,
        otherSearch: { backPath: '/htc-front-ivp/my-invoice/list' },
      };
      this.goToByHeaderParams(record, comParams);
    }
    if (subTabKey === 'invoices') {
      // 发票
      const { invoicePoolHeaderId } = record;
      if (!invoicePoolHeaderId) return;
      const comParams = {
        pathname: `/htc-front-ivp/invoices/archive-information/${sourceCode}/${invoicePoolHeaderId}`,
        otherSearch: { backPath: '/htc-front-ivp/invoices/list' },
      };
      this.goToByHeaderParams(record, comParams);
    }
    if (subTabKey === 'bills') {
      // 票据
      const { billPoolHeaderId } = record;
      if (!billPoolHeaderId) return;
      const comParams = {
        pathname: `/htc-front-ivp/bills/archive-information/${sourceCode}/${billPoolHeaderId}`,
        otherSearch: { backPath: '/htc-front-ivp/bills/list' },
      };
      this.goToByHeaderParams(record, comParams);
    }
  }

  @Bind()
  switchFnType2({ record, subTabKey, sourceCode }) {
    // 关联单据
    if (subTabKey === 'my-invoice') {
      // 我的发票
      const { poolHeaderId } = record;
      if (!poolHeaderId) return;
      const comParams = {
        pathname: `/htc-front-ivp/my-invoice/doc-related/${sourceCode}/${poolHeaderId}`,
        otherSearch: { backPath: '/htc-front-ivp/my-invoice/list' },
      };
      this.goToByHeaderParams(record, comParams);
    }
    // 发票
    if (subTabKey === 'invoices') {
      const { invoicePoolHeaderId } = record;
      if (!invoicePoolHeaderId) return;
      const comParams = {
        pathname: `/htc-front-ivp/invoices/doc-related/${sourceCode}/${invoicePoolHeaderId}`,
        otherSearch: { backPath: '/htc-front-ivp/invoices/list' },
      };
      this.goToByHeaderParams(record, comParams);
    }
    // 票据
    if (subTabKey === 'bills') {
      const { billPoolHeaderId } = record;
      if (!billPoolHeaderId) return;
      const comParams = {
        pathname: `/htc-front-ivp/bills/doc-related/${sourceCode}/${billPoolHeaderId}`,
        otherSearch: { backPath: '/htc-front-ivp/bills/list' },
      };
      this.goToByHeaderParams(record, comParams);
    }
  }

  @Bind()
  handleSwitch(type) {
    const activeTabKey = getActiveTabKey();
    const subTabKey = activeTabKey.substr(15); // 获取当前子标签
    let record; // 获取跳转record缓存
    switch (subTabKey) {
      case 'invoices':
        record = JSON.parse(localStorage.getItem('currentInvoicerecord')!);
        break;
      case 'bills':
        record = JSON.parse(localStorage.getItem('currentBillrecord')!);
        break;
      default:
        record = JSON.parse(localStorage.getItem('myInvoicerecord')!);
        break;
    }
    const sourceCode = record && record.billPoolHeaderId ? 'BILL_POOL' : 'INVOICE_POOL';
    // 详情
    if (type === 0) {
      this.switchFnType0({ record, subTabKey, sourceCode });
      // 档案信息
    } else if (type === 1) {
      this.switchFnType1({ record, subTabKey, sourceCode });
    } else if (type === 2) {
      this.switchFnType2({ record, subTabKey, sourceCode });
    }
  }

  render() {
    const activeTabKey = getActiveTabKey();
    let record; // 获取跳转record缓存
    if (activeTabKey.includes('/invoices')) {
      record = JSON.parse(localStorage.getItem('currentInvoicerecord')!) || {};
    } else if (activeTabKey.includes('/bills')) {
      record = JSON.parse(localStorage.getItem('currentBillrecord')!) || {};
    } else {
      record = JSON.parse(localStorage.getItem('myInvoicerecord')!) || {};
    }
    console.log('record//', record);
    const { billPoolHeaderId } = record;
    const { type } = this.props;
    return (
      <div className={style.panel}>
        <p className={type === 0 ? style.panelList : ''} onClick={() => this.handleSwitch(0)}>
          {type === 0 && <Icon type="arrow_forward" />}
          {billPoolHeaderId
            ? intl.get(`${modelCode}.bill.detail`).d('票据详情')
            : intl.get(`${modelCode}.invoice.detail`).d('发票详情')}
        </p>
        <p className={type === 1 ? style.panelList : ''} onClick={() => this.handleSwitch(1)}>
          {type === 1 && <Icon type="arrow_forward" />}
          {intl.get(`hivp.invoicesArchiveUpload.view.title`).d('档案信息')}
        </p>
        <p className={type === 2 ? style.panelList : ''} onClick={() => this.handleSwitch(2)}>
          {type === 2 && <Icon type="arrow_forward" />}
          {intl.get(`hivp.invoicesDocRelated.title.associatedDocuments`).d('关联单据')}
        </p>
      </div>
    );
  }
}
