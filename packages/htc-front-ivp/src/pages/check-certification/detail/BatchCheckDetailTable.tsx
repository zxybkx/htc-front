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
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import BatchCheckDetailDS from '../stores/BatchCheckDetailTableDS';

const modelCode = 'hivp.checkCertification';

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
    const { type, invoiceCheckCollectId } = this.props.match.params;
    const { queryDataSet } = this.batchCheckDetailDS;
    const batchInvoiceInfoStr = new URLSearchParams(search).get('batchInvoiceInfo');
    if (batchInvoiceInfoStr) {
      const batchInvoiceInfo = JSON.parse(decodeURIComponent(batchInvoiceInfoStr));
      const { batchNo, batchNumber, requestTime, completeTime } = batchInvoiceInfo;
      if (queryDataSet) {
        queryDataSet.create({ batchNo, requestTime, completeTime }, 0);
      }
      switch (type) {
        case '0':
          this.batchCheckDetailDS.setQueryParameter('batchNumber', batchNumber);
          break;
        case '1':
          this.batchCheckDetailDS.setQueryParameter('batchNumber', batchNumber);
          this.batchCheckDetailDS.setQueryParameter('invoiceCheckCollectId', invoiceCheckCollectId);
          break;
        case '2':
          this.batchCheckDetailDS.setQueryParameter('batchNo', batchNo);
          break;
        default:
          break;
      }
      this.batchCheckDetailDS.query();
    }
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
   * 返回批量勾选明细行
   * @returns {*[]}
   */
  get batchCheckColumn(): ColumnProps[] {
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'invoiceType', width: 150 },
      { name: 'checkState' },
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
      { name: 'salerName', width: 220 },
      { name: 'salerTaxNo', width: 180 },
      { name: 'invoiceAmount', width: 150 },
      { name: 'taxAmount', width: 150 },
      {
        name: 'validTaxAmount',
        editor: record => record?.get('checkState') === '0',
        width: 150,
      },
      { name: 'isMatch' },
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
      { name: 'purpose' },
      { name: 'entryAccountState' },
      { name: 'receiptsState' },
      { name: 'abnormalSign', width: 150 },
      { name: 'annotation', width: 200 },
    ];
  }

  get buttons(): Buttons[] {
    return [TableButtonType.save, TableButtonType.delete];
  }

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-ivp/check-certification/list?type=3"
          title={intl.get(`${modelCode}.title.batchCheckDetail`).d('批量勾选明细')}
        />
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.batchCheckDetailDS}
            columns={this.batchCheckColumn}
          />
        </Content>
      </>
    );
  }
}
