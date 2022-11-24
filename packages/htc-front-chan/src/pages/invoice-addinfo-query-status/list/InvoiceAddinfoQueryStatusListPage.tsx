/**
 * @Description: 开票附加信息状态查询
 * @Author: huishan.yu <huishan.yu@hand-china.com>
 * @Date: 2021-09-06 10:26:45
 * @LastEditors: huishan.yu
 * @LastEditTime: 2021-09-06 16:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { Button as PermissionButton } from 'components/Permission';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Dispatch } from 'redux';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { DataSet, Dropdown, Icon, Menu, notification, Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { getPresentMenu } from '@htccommon/utils/utils';
import {
  electronicUploadApi,
  invoicePreviewApi,
  invoicePrintApi,
  notifyMessageApi,
  pushInvoicePoolApi,
  updateInvoicePoolApi,
} from '@src/services/invoiceAddinfoQueryStatusService';
import InvoiceAddinfoQueryStatusListDS, {
  modelCode,
} from '../stores/InvoiceAddinfoQueryStatusListDS';

const permissionPath = `${getPresentMenu().name}.ps`;
interface InvoiceAddinfoQueryStatusListPageProps {
  dispatch: Dispatch<any>;
}

export default class InvoiceAddinfoQueryStatusListPage extends Component<
  InvoiceAddinfoQueryStatusListPageProps
> {
  tableDS = new DataSet({
    autoQuery: false,
    ...InvoiceAddinfoQueryStatusListDS(),
  });

  /**
   * 操作列按钮回调
   */
  @Bind()
  async handleOperation(type, record) {
    const { queryDataSet } = this.tableDS;
    const invoiceHeadIds = record.map(item => item.invoicingOrderHeaderId);
    const tenantId = queryDataSet && queryDataSet.current!.get('tenantId');
    const params = {
      tenantId,
      invoiceHeadIds,
    };
    let res;
    switch (type) {
      case 0:
        res = getResponse(await invoicePreviewApi(params));
        break;
      case 1:
        res = getResponse(await electronicUploadApi(params));
        break;
      case 2:
        res = getResponse(await invoicePrintApi(params));
        break;
      case 3:
        res = getResponse(await notifyMessageApi(params));
        break;
      case 4:
        res = getResponse(await pushInvoicePoolApi(params));
        break;
      case 5:
        res = getResponse(await updateInvoicePoolApi(params));
        break;
      default:
    }
    if (res) {
      notification.success({
        description: '',
        message: intl.get('invoiceOpration.message.success').d('操作成功'),
      });
    }
  }

  /**
   * 返回操作列
   */
  @Bind()
  optionsRender(record) {
    const data = record.toData();
    const renderPermissionButton = params => (
      <PermissionButton
        type="c7n-pro"
        funcType={FuncType.flat}
        onClick={params.onClick}
        color={ButtonColor.primary}
        permissionList={[
          {
            code: `${permissionPath}.button.${params.permissionCode}`,
            type: 'button',
            meaning: `${params.permissionMeaning}`,
          },
        ]}
      >
        {params.title}
      </PermissionButton>
    );
    const previewBtn = {
      key: 'preview',
      ele: renderPermissionButton({
        onClick: () => this.handleOperation(0, [data]),
        permissionCode: 'preview',
        permissionMeaning: '按钮-纸票票面预览',
        title: intl.get(`${modelCode}.button.preview`).d('纸票票面预览'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.preview`).d('纸票票面预览'),
    };
    const uploadBtn = {
      key: 'upload',
      ele: renderPermissionButton({
        onClick: () => this.handleOperation(1, [data]),
        permissionCode: 'upload',
        permissionMeaning: '按钮-电子发票上传',
        title: intl.get(`${modelCode}.button.upload`).d('电子发票上传'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.upload`).d('电子发票上传'),
    };
    const printBtn = {
      key: 'print',
      ele: renderPermissionButton({
        onClick: () => this.handleOperation(2, [data]),
        permissionCode: 'print',
        permissionMeaning: '按钮-纸票打印文件',
        title: intl.get(`${modelCode}.button.print`).d('纸票打印文件'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.print`).d('纸票打印文件'),
    };
    const noticeBtn = {
      key: 'notice',
      ele: renderPermissionButton({
        onClick: () => this.handleOperation(3, [data]),
        permissionCode: 'notice',
        permissionMeaning: '按钮-短信邮件通知',
        title: intl.get(`${modelCode}.button.notice`).d('短信邮件通知'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.notice`).d('短信邮件通知'),
    };
    const pushInvoicePoolBtn = {
      key: 'pushInvoicePool',
      ele: renderPermissionButton({
        onClick: () => this.handleOperation(4, [data]),
        permissionCode: 'push-invoice-pool',
        permissionMeaning: '按钮-推送发票池',
        title: intl.get(`${modelCode}.button.pushInvoicePool`).d('推送发票池'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.pushInvoicePool`).d('推送发票池'),
    };
    const updateInvoicePoolBtn = {
      key: 'updateInvoicePool',
      ele: renderPermissionButton({
        onClick: () => this.handleOperation(5, [data]),
        permissionCode: 'update-invoice-pool',
        permissionMeaning: '按钮-推送发票池',
        title: intl.get(`${modelCode}.button.updateInvoicePool`).d('更新发票池'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.updateInvoicePool`).d('更新发票池'),
    };
    const operators: any = [
      previewBtn,
      uploadBtn,
      printBtn,
      noticeBtn,
      pushInvoicePoolBtn,
      updateInvoicePoolBtn,
    ];

    const btnMenu = (
      <Menu>
        {operators.map(action => {
          const { key } = action;
          return <Menu.Item key={key}>{action.ele}</Menu.Item>;
        })}
      </Menu>
    );
    return (
      <span className="action-link">
        <Dropdown overlay={btnMenu}>
          <a>
            {intl.get('hzero.common.button.action').d('操作')}
            <Icon type="arrow_drop_down" />
          </a>
        </Dropdown>
      </span>
    );
  }

  /**
   * 返回表格行
   */
  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.tableDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'tenantId' },
      { name: 'companyCode' },
      { name: 'orderFinishDate' },
      { name: 'invoicingOrderHeaderId' },
      { name: 'orderNumber' },
      { name: 'orderStatus' },
      { name: 'invoiceCode' },
      { name: 'invoiceNo' },
      { name: 'invoiceType' },
      { name: 'electronicUploadStatus', width: 120 },
      { name: 'electronicUploadNum', width: 140 },
      { name: 'paperUploadStatus', width: 140 },
      { name: 'paperUploadNum', width: 150 },
      { name: 'paperDownloadStatus', width: 140 },
      { name: 'paperDownloadNum', width: 150 },
      { name: 'printUploadStatus', width: 140 },
      { name: 'printUploadNum', width: 160 },
      { name: 'printDownloadStatus', width: 140 },
      { name: 'printDownloadNum', width: 150 },
      { name: 'pushInvoicePoolStatus', width: 140 },
      { name: 'pushInvoicePoolNum', width: 150 },
      { name: 'updateInvoicePoolStatus', width: 140 },
      { name: 'updateInvoicePoolNum', width: 140 },
      { name: 'notifyStatus', width: 140 },
      { name: 'notifyNum', width: 150 },
      { name: 'lastUpdateDate', width: 150 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 180,
        renderer: ({ record }) => this.optionsRender(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 批量操作表格行
   */
  @Bind()
  batchProcess(type) {
    const list = this.tableDS.selected.map(record => record.toData());
    this.handleOperation(type, list);
  }

  get buttons(): Buttons[] {
    const ObserverButtons = observer((props: any) => {
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={props.dataSet.selected.length === 0}
          funcType={FuncType.flat}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <ObserverButtons
        key="bpreview"
        onClick={() => this.batchProcess(0)}
        dataSet={this.tableDS}
        title={intl.get(`${modelCode}.button.preview`).d('纸票票面预览')}
      />,
      <ObserverButtons
        key="bupload"
        onClick={() => this.batchProcess(1)}
        dataSet={this.tableDS}
        title={intl.get(`${modelCode}.button.upload`).d('电子发票上传')}
      />,
      <ObserverButtons
        key="bpreview"
        onClick={() => this.batchProcess(2)}
        dataSet={this.tableDS}
        title={intl.get(`${modelCode}.button.print`).d('纸票打印文件')}
      />,
      <ObserverButtons
        key="bnotice"
        onClick={() => this.batchProcess(3)}
        dataSet={this.tableDS}
        title={intl.get(`${modelCode}.button.notice`).d('短信邮件通知')}
      />,
      <ObserverButtons
        key="bpushInvoicePool"
        onClick={() => this.batchProcess(4)}
        dataSet={this.tableDS}
        title={intl.get(`${modelCode}.button.pushInvoicePool`).d('推送发票池')}
      />,
      <ObserverButtons
        key="bupdateInvoicePool"
        onClick={() => this.batchProcess(5)}
        dataSet={this.tableDS}
        title={intl.get(`${modelCode}.button.updateInvoicePool`).d('更新发票池')}
      />,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('开票附加信息状态查询')} />
        <Content>
          <Table
            buttons={this.buttons}
            queryFieldsLimit={3}
            dataSet={this.tableDS}
            columns={this.columns}
            style={{ height: '500px' }}
          />
        </Content>
      </>
    );
  }
}
