import React, { Component } from 'react';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { Button as PermissionButton } from 'components/Permission';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Dispatch } from 'redux';
import { DataSet,
  Table,
  Menu,
  Dropdown,
  Icon,
  notification,
  Modal,
  TextField,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getPresentMenu } from '@common/utils/utils';
import {
  invoicePreviewApi,
  invoicePrintApi,
  electronicUploadApi,
  updateInvoicePoolApi,
  pushInvoicePoolApi,
  notifyMessageApi,
  cancelOrderApi,
} from '@src/services/invoiceAddinfoQueryStatusService';
import InvoiceAddinfoQueryStatusListDS, {
  modelCode,
} from '../stores/InvoiceAddinfoQueryStatusListDS';

const permissionPath = `${getPresentMenu().name}.ps`;
interface InvoiceAddinfoQueryStatusListPageProps {
  dispatch: Dispatch<any>;
}
// const tenantId = getCurrentOrganizationId();
export default class InvoiceAddinfoQueryStatusListPage extends Component<InvoiceAddinfoQueryStatusListPageProps> {
  state={employeeNumber: ''}

  tableDS = new DataSet({
    autoQuery: false,
    ...InvoiceAddinfoQueryStatusListDS(),
  });

  // 操作请求
  @Bind()
  async handleOperation(type){
    const companyCode = this.tableDS.current!.get('companyCode');
    const invoiceHeadId = this.tableDS.current!.get('invoicingOrderHeaderId');
    const tenantId=this.tableDS.current!.get('tenantId');
    const toggleOkDisabled = (e, modal) => {
      const { value } = e.currentTarget;
      if (value.trim()) {
        this.setState({ employeeNumber: value });
        modal.update({
          okProps: { disabled: false },
        });
      }
    };
    const myModal = Modal.open({
      key: Modal.key(),
      okText: '确定',
      title: intl.get(`${modelCode}.modal.title`).d('输入employeeNumber：'),
      children: <TextField onInput={(e) => toggleOkDisabled(e, myModal)} />,
      okProps: { disabled: true },
      onOk: async () => {
        const params = {
          tenantId,
          companyCode,
          employeeNumber: this.state.employeeNumber,
          invoiceHeadId,
        };
        let res;
        switch(type) {
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
          default:{
            const transformParams={
              tenantId,
              companyCode,
              employeeNumber: this.state.employeeNumber,
              body: [invoiceHeadId],
            };
            res = getResponse(await cancelOrderApi(transformParams));
          }
        }
        if (res) {
          notification.success({
            description: '',
            message: intl.get('invoiceOpration.message.success').d('操作成功'),
          });
        }
      },
    });
  }

  // 操作渲染
  @Bind()
  optionsRender(record) {
    console.log(record);
    const renderPermissionButton = (params) => (
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
        onClick: () => this.handleOperation(0),
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
        onClick: () => this.handleOperation(1),
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
        onClick: () => this.handleOperation(2),
        permissionCode: 'print',
        permissionMeaning: '按钮-纸票打印文件',
        title: intl.get(`${modelCode}.button.print`).d('纸票打印文件'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.print`).d('纸票打印文件'),
    };
    const noticeBtn={
      key: 'notice',
      ele: renderPermissionButton({
        onClick: () => this.handleOperation(3),
        permissionCode: 'notice',
        permissionMeaning: '按钮-短信邮件通知',
        title: intl.get(`${modelCode}.button.notice`).d('短信邮件通知'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.notice`).d('短信邮件通知'),
    };

    const pushInvoicePoolBtn={
      key: 'pushInvoicePool',
      ele: renderPermissionButton({
        onClick: () => this.handleOperation(4),
        permissionCode: 'push-invoice-pool',
        permissionMeaning: '按钮-推送发票池',
        title: intl.get(`${modelCode}.button.pushInvoicePool`).d('推送发票池'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.pushInvoicePool`).d('推送发票池'),
    };
    const updateInvoicePoolBtn={
      key: 'updateInvoicePool',
      ele: renderPermissionButton({
        onClick: () => this.handleOperation(5),
        permissionCode: 'update-invoice-pool',
        permissionMeaning: '按钮-推送发票池',
        title: intl.get(`${modelCode}.button.updateInvoicePool`).d('更新发票池'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.updateInvoicePool`).d('更新发票池'),
    };
    const cancelOrderBtn={
      key: 'cancelOrder',
      ele: renderPermissionButton({
        onClick: () => this.handleOperation(6),
        permissionCode: 'cancel-order',
        permissionMeaning: '按钮-取消订单',
        title: intl.get(`${modelCode}.button.cancelOrder`).d('取消订单'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.cancelOrder`).d('取消订单'),
    };
    const operators: any = [
      previewBtn,
      uploadBtn,
      printBtn,
      noticeBtn,
      pushInvoicePoolBtn,
      updateInvoicePoolBtn,
      cancelOrderBtn,
    ];

    const btnMenu = (
      <Menu>
        {operators.map((action) => {
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

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('开票附加信息状态查询')} />
        <Content>
          <Table queryFieldsLimit={3} dataSet={this.tableDS} columns={this.columns} />
        </Content>
      </>
    );
  }
}
