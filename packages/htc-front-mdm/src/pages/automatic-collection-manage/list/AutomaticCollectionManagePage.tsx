/**
 * @page: 自动催收管理页面
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-04-06 10:58
 * @LastEditTime: 2022-06-20 10:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import { Button, DataSet, notification, Table } from 'choerodon-ui/pro';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { RouteComponentProps } from 'react-router-dom';
import queryString from 'query-string';
import ExcelExport from 'components/ExcelExport';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { operatorRender } from 'utils/renderer';
import { Content, Header } from 'components/Page';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import commonConfig from '@htccommon/config/commonConfig';
import { batchSave, createNewAuto, sendCollection } from '@src/services/automaticCollectionService';
import AutomaticCollectionManageDS from '../stores/AutomationCollectionManageListDS';
import AutomaticCollectionManageLineDS from '../stores/AutomaticCollectionManageLineDS';

const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.MDM_API || '';

interface AutomaticCollectionManagePageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  tableDS: DataSet;
  lineDS: DataSet;
}

@withProps(
  () => {
    const lineDS = new DataSet({
      ...AutomaticCollectionManageLineDS(),
    });
    const tableDS = new DataSet({
      autoQuery: true,
      ...AutomaticCollectionManageDS(),
      children: {
        lines: lineDS,
      },
    });
    return { tableDS, lineDS };
  },
  { cacheState: true }
)
@formatterCollections({
  code: ['hmdm.automaticCollection', 'htc.common'],
})
export default class AutomaticCollectionManagePage extends Component<
  AutomaticCollectionManagePageProps
> {
  /**
   * 创建自动催收调接口
   * @params {[]} data-选中的记录组
   */
  @Bind()
  async createNewAuto(data) {
    const res = getResponse(await createNewAuto(data));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.props.tableDS.query();
    }
  }

  /**
   * 发送催收调接口
   * @params {[]} data-选中的记录组
   */
  @Bind()
  async sendCollection(data) {
    const res = getResponse(await sendCollection(data));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.props.tableDS.query();
    }
  }

  /**
   * 批量生产催收
   */
  @Bind()
  handelBatchCreate() {
    const data = this.props.tableDS.selected.map(record => record.toData());
    this.createNewAuto(data);
  }

  /**
   * 批量发送催收
   */
  @Bind()
  handelBatchSend() {
    const data = this.props.tableDS.selected.map(record => record.toData());
    if (data.some(item => item.collectionStatus !== 'PENDING_DUNNING')) {
      notification.warning({
        message: intl.get('hmdm.automaticCollection.message.createMessage').d('请先生成催收提醒'),
        description: '',
      });
      return;
    }
    this.sendCollection(data);
  }

  /**
   * 单条生产催收
   * @params {object} record-行记录
   */
  @Bind()
  handleSingleCreate(record) {
    const data = record.toData();
    this.createNewAuto([data]);
  }

  /**
   * 单条发送催收
   * @params {object} record-行记录
   */
  @Bind()
  handleSingleSend(record) {
    const data = record.toData();
    this.sendCollection([data]);
  }

  /**
   * 返回表格头按钮
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const BatchButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    return [
      TableButtonType.save,
      <BatchButtons
        key="batchCreate"
        onClick={() => this.handelBatchCreate()}
        dataSet={this.props.tableDS}
        title={intl.get('hmdm.automaticCollection.button.generateReminder').d('生成催收提醒')}
      />,
      <BatchButtons
        key="batchSend"
        onClick={() => this.handelBatchSend()}
        dataSet={this.props.tableDS}
        title={intl.get(`hmdm.automaticCollection.button.sendCollection`).d('发送催收提醒')}
      />,
    ];
  }

  /**
   * 取消催收回调
   * @params {object} record-行记录
   */
  @Bind()
  async handleCancel(record) {
    record.set('collectionStatus', 'CANCEL');
    const data = record.toData();
    const res = getResponse(await batchSave([data]));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
    }
  }

  /**
   * 返回操作列
   * @params {object} record-行记录
   */
  @Bind()
  operationsRender(record) {
    const collectionStatus = record.get('collectionStatus');
    const operators: any[] = [
      {
        key: 'generateReminder',
        ele: (
          <Button funcType={FuncType.link} onClick={() => this.handleSingleCreate(record)}>
            {intl.get('hmdm.automatic-collection-manage.button.generateReminder').d('生成提醒')}
          </Button>
        ),
        funcType: FuncType.link,
        len: 6,
        title: intl.get('hmdm.automatic-collection-manage.generateReminder').d('生成提醒'),
      },
    ];
    const cancelCollection = {
      key: 'cancelCollection',
      ele: (
        <Button funcType={FuncType.link} onClick={() => this.handleCancel(record)}>
          {intl.get('hmdm.automatic-collection-manage.button.cancelCollection').d('取消催收')}
        </Button>
      ),
      funcType: FuncType.link,
      len: 6,
      title: intl.get('hmdm.automatic-collection-manage.cancelCollection').d('取消催收'),
    };
    const sendCollectionBtn = {
      key: 'sendCollection',
      ele: (
        <Button funcType={FuncType.link} onClick={() => this.handleSingleSend(record)}>
          {intl.get('hmdm.automatic-collection-manage.button.sendCollection').d('发送催收')}
        </Button>
      ),
      funcType: FuncType.link,
      len: 6,
      title: intl.get('hmdm.automatic-collection-manage.collectionOccurs').d('发生催收'),
    };
    if (collectionStatus === 'PENDING_DUNNING') {
      operators.push(sendCollectionBtn);
    }
    if (!['SENT', 'CANCEL'].includes(collectionStatus)) {
      operators.push(cancelCollection);
    }
    const newOperators = operators.filter(Boolean);
    return operatorRender(newOperators, record, { limit: 1 });
  }

  /**
   * 查看详情跳转
   * @params {string} fileUrl-行fileUrl
   */
  @Bind()
  viewRemind(fileUrl) {
    const { history } = this.props;
    const pathname = '/htc-front-mdm/automatic-collection-manage/remind-detail';
    history.push({
      pathname,
      search: queryString.stringify({
        fileUrlInfo: encodeURIComponent(JSON.stringify({ fileUrl })),
      }),
    });
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      { name: 'tenantName', width: 180 },
      { name: 'companyCode' },
      { name: 'companyName', width: 180 },
      { name: 'creationDate', width: 150 },
      { name: 'sendTime', width: 150 },
      { name: 'collectionStatus' },
      { name: 'remindMode', width: 150 },
      { name: 'receiver', editor: true },
      { name: 'receiverEmail', width: 240, editor: true },
      { name: 'receiverPhone', width: 120, editor: true },
      { name: 'agreementStartDate', width: 120 },
      { name: 'agreementEndDate', width: 120 },
      {
        name: 'fileUrl',
        renderer: ({ record, value }) => {
          if (record && value) {
            return <a onClick={() => this.viewRemind(record.get('fileUrl'))}>查看详情</a>;
          }
        },
      },
      { name: 'personPhone', width: 120, editor: true },
      { name: 'personEmail', width: 240, editor: true },
      { name: 'persons', editor: true },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        renderer: ({ record }) => this.operationsRender(record),
      },
    ];
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get lineColumns(): ColumnProps[] {
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 80,
        renderer: ({ record }) => {
          return record ? this.props.lineDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'companyCode' },
      { name: 'expensesTypeCode', width: 160 },
      { name: 'expensesTypeMeaning', width: 150 },
      { name: 'solutionPackage' },
      { name: 'solutionPackageNumber' },
      { name: 'unitPrice' },
      { name: 'billingCode' },
      { name: 'annualFee' },
      { name: 'excessUnitPrice' },
      { name: 'usedQuantity' },
      { name: 'remainingQuantity' },
      { name: 'conReason' },
      { name: 'billingStartDate', width: 150 },
      { name: 'billingEndDate', width: 150 },
      { name: 'customerBillingModelCode', width: 130 },
    ];
  }

  /**
   * 导出
   */
  @Bind()
  exportParams() {
    const queryParams = this.props.tableDS.queryDataSet!.map(data => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    const { companyObj, ...otherData } = queryParams[0];
    const _queryParams = {
      ...companyObj,
      ...otherData,
    };
    return { ..._queryParams } || {};
  }

  render() {
    return (
      <>
        <Header
          title={intl.get(`hmdm.automaticCollection.title.automaticCollection`).d('自动催收')}
        >
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoicing-order-headers/export`}
            queryParams={() => this.exportParams()}
          />
        </Header>
        <Content>
          <Table
            queryFieldsLimit={3}
            dataSet={this.props.tableDS}
            columns={this.columns}
            buttons={this.buttons}
            style={{ height: 400 }}
          />
          <Table
            dataSet={this.props.lineDS}
            columns={this.lineColumns}
            style={{ height: 400, marginTop: 20 }}
          />
        </Content>
      </>
    );
  }
}
