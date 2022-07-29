/**
 * @Description: 批量勾选明细
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-06-15 16:48
 * @LastEditTime:
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { RouteComponentProps } from 'react-router-dom';
import { Content, Header } from 'components/Page';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import intl from 'utils/intl';
import { failDetail } from '@src/services/checkCertificationService';
import formatterCollections from 'utils/intl/formatterCollections';
import BatchCheckDetailDS from '../stores/BatchCheckDetailTableDS';

const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();

interface ApplyDeductionPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  location: any;
  match: any;
}

@formatterCollections({
  code: [
    modelCode,
    'hiop.invoiceWorkbench',
    'hivp.invoices',
    'htc.common',
    'hiop.invoiceRule',
    'hivp.taxRefund',
    'hivp.bill',
    'hivp.batchCheck',
  ],
})
export default class BatchCheckDetailTable extends Component<ApplyDeductionPageProps> {
  batchCheckDetailDS = new DataSet({
    ...BatchCheckDetailDS(this.props.match.params),
  });

  async componentDidMount() {
    const { search } = this.props.location;
    const { type } = this.props.match.params;
    const { queryDataSet } = this.batchCheckDetailDS;
    const batchInvoiceInfoStr = new URLSearchParams(search).get('batchInvoiceInfo');
    if (batchInvoiceInfoStr) {
      const batchInvoiceInfo = JSON.parse(decodeURIComponent(batchInvoiceInfoStr));
      const { batchNo, requestTime, completeTime } = batchInvoiceInfo;
      if (queryDataSet) {
        queryDataSet.current!.set({ batchNo, requestTime, completeTime });
      }
      if (type === '0') {
        const params = { batchNumber: batchNo, tenantId };
        const res = getResponse(await failDetail(params));
        if (res) {
          this.batchCheckDetailDS.loadData(res);
        }
      } else {
        await this.batchCheckDetailDS.query();
      }
    }
  }

  /**
   * 操作列编辑回调
   * @params {object} record-行记录
   */
  @Bind()
  handleEdit(record) {
    record.setState('editing', true);
  }

  /**
   * 操作列保存回调
   * @params {object} record-行记录
   */
  @Bind()
  async handleSave(record) {
    const res = await this.batchCheckDetailDS.submit();
    if (res && res.content) record.setState('editing', false);
  }

  /**
   * 操作列取消回调
   * @params {object} record-行记录
   */
  @Bind()
  handleCancel(record) {
    if (record.status === 'add') {
      this.batchCheckDetailDS.remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  }

  /**
   * 返回行操作列
   * @params {object} record-行记录
   * @returns {*[]}
   */
  @Bind()
  commands(record) {
    const btns: any = [];
    if (record.getState('editing')) {
      btns.push(
        <a onClick={() => this.handleSave(record)}>
          {intl.get('hzero.common.btn.save').d('保存')}
        </a>,
        <a onClick={() => this.handleCancel(record)}>
          {intl.get('hzero.common.status.cancel').d('取消')}
        </a>
      );
    } else {
      btns.push(
        <a onClick={() => this.handleEdit(record)}>
          {intl.get('hzero.common.button.rule.edit').d('编辑')}
        </a>
      );
    }
    return [
      <span className="action-link" key="action">
        {btns}
      </span>,
    ];
  }

  /**
   * 返回批量勾选明细行
   * @returns {*[]}
   */
  get batchCheckColumn(): ColumnProps[] {
    return [
      { name: 'invoiceType', width: 150 },
      { name: 'invoiceCode', width: 150 },
      {
        name: 'invoiceNo',
        width: 180,
        renderer: ({ value, record }) => {
          const checkState = record?.get('checkState');
          const checkStateTxt = record?.getField('checkState')?.getText(checkState);
          let color = '';
          let textColor = '';
          switch (checkState) {
            case '0':
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            case '1':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            case 'R':
              color = '#FFECC4';
              textColor = '#FF9D23';
              break;
            default:
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {checkStateTxt}
              </Tag>
              &nbsp;
              <span>{value}</span>
            </>
          );
        },
      },
      { name: 'invoiceDate', width: 130 },
      { name: 'buyerTaxNo', width: 180 },
      { name: 'salerName', width: 160 },
      { name: 'salerTaxNo', width: 180 },
      { name: 'invoiceAmount', width: 150 },
      { name: 'taxAmount', width: 150 },
      {
        name: 'validTaxAmount',
        editor: record => record.getState('editing') && record.get('checkState') === '0',
        width: 150,
      },
      { name: 'invoiceState' },
      {
        name: 'isPoolFlag',
      },
      { name: 'checkDate', width: 130 },
      { name: 'authenticationState' },
      { name: 'authenticationType' },
      { name: 'failedDetail' },
      { name: 'infoSource' },
      { name: 'taxBureauManageState', width: 120 },
      // { name: 'purpose' },
      { name: 'entryAccountState' },
      { name: 'receiptsState' },
      { name: 'abnormalSign', width: 150 },
      { name: 'annotation', width: 200 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        renderer: ({ record }) => this.commands(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-ivp/check-certification/list?type=3"
          title={intl.get(`${modelCode}.title.batchCheckDetail`).d('批量勾选明细')}
        />
        <Content>
          <Table dataSet={this.batchCheckDetailDS} columns={this.batchCheckColumn} />
        </Content>
      </>
    );
  }
}
