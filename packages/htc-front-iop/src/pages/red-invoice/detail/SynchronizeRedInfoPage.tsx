/**
 * @Description: 同步请求列表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-25 15:45:14
 * @LastEditTime: 2021-06-26 10:35:14
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { RouteComponentProps } from 'react-router-dom';
import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import {
  DataSet,
  Button,
  Form,
  TextField,
  DatePicker,
  Table,
  Select,
  notification,
} from 'choerodon-ui/pro';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import { getPresentMenu } from '@common/utils/utils';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { synchronize, refresh, allRefresh } from '@src/services/redInvoiceService';
import SynchronizeRedInfoDS, { HeaderDS } from '../stores/SynchronizeRedInfolListDS';

const modelCode = 'hiop.redInvoice';
const organizationId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

interface RedInvoiceRequisitionListPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [modelCode],
})
export default class RedInvoiceRequisitionListPage extends Component<RedInvoiceRequisitionListPageProps> {
  synchronizeRedInfoDS = new DataSet({
    autoQuery: false,
    ...SynchronizeRedInfoDS(),
  });

  headerDS = new DataSet({
    autoQuery: false,
    autoCreate: true,
    ...HeaderDS(),
  });

  async componentDidMount() {
    const { search } = this.props.location;
    const redInfoStr = new URLSearchParams(search).get('redInfo');
    if (redInfoStr) {
      const redInfo = JSON.parse(decodeURIComponent(redInfoStr));
      const { companyCode } = redInfo;
      this.synchronizeRedInfoDS.setQueryParameter('companyCode', companyCode);
      this.synchronizeRedInfoDS.query();
    }
  }

  // 刷新状态
  @Bind()
  async handleRefreshStatus(record) {
    const { search } = this.props.location;
    const redInfoStr = new URLSearchParams(search).get('redInfo');
    if (redInfoStr) {
      const redInfo = JSON.parse(decodeURIComponent(redInfoStr));
      const { companyCode, employeeNumber } = redInfo;
      const params = {
        organizationId,
        companyCode,
        employeeNumber,
        data: record.toData(),
      };
      const res = await refresh(params);
      if (res) {
        if (res.status === '1000') {
          notification.success({
            description: '',
            message: intl.get(`${modelCode}.view.handleRefreshStatus`).d(`操作成功`),
          });
          this.synchronizeRedInfoDS.query();
        } else {
          notification.error({
            description: '',
            message: res && res.message,
          });
        }
      }
    }
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'batchNo', width: 250 },
      { name: 'businessNoticeNum', width: 320 },
      { name: 'state' },
      { name: 'stateDescription', width: 200 },
      { name: 'redInvoiceDateFrom', width: 120 },
      { name: 'redInvoiceDateTo', width: 120 },
      { name: 'overdueStatus' },
      { name: 'redInfoSerialNumber', width: 180 },
      { name: 'invoiceType' },
      { name: 'purchasersTaxNumber', width: 180 },
      { name: 'salesTaxNumber', width: 180 },
      { name: 'downloadRange', width: 180 },
      { name: 'requestTime' },
      { name: 'completeTime' },
      { name: 'employeeName' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 150,
        command: ({ record }): Commands[] => {
          return [
            <Button
              key="refreshStatus"
              onClick={() => this.handleRefreshStatus(record)}
              disabled={record.get('state') !== '0'}
            >
              {intl.get(`${modelCode}.button.refreshStatus`).d('刷新状态')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  // 一键刷新
  @Bind()
  async oneClickRefresh() {
    const { search } = this.props.location;
    const redInfoStr = new URLSearchParams(search).get('redInfo');
    if (redInfoStr) {
      const redInfo = JSON.parse(decodeURIComponent(redInfoStr));
      const { companyCode, employeeNumber } = redInfo;
      const params = {
        organizationId,
        companyCode,
        employeeNumber,
      };
      const res = await allRefresh(params);
      if (res) {
        if (res.status === '1000') {
          notification.success({
            description: '',
            message: intl.get(`${modelCode}.view.handleRefreshStatus`).d(`操作成功`),
          });
          this.synchronizeRedInfoDS.query();
        } else {
          notification.error({
            description: '',
            message: res && res.message,
          });
        }
      }
    }
  }

  // 同步
  @Bind()
  async handleSynchronize() {
    const { search } = this.props.location;
    const redInfoStr = new URLSearchParams(search).get('redInfo');
    if (redInfoStr) {
      const redInfo = JSON.parse(decodeURIComponent(redInfoStr));
      const {
        companyCode,
        employeeNumber,
        taxpayerNumber,
        goldenTaxDiskNumber,
        extensionNumber,
      } = redInfo;
      const validateValue = await this.headerDS.validate(false, false);
      // 页面校验
      if (!validateValue) {
        notification.error({
          description: '',
          message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
        });
        return;
      }
      const headerData = this.headerDS.current!.toData();
      const params = {
        organizationId,
        companyCode,
        employeeNumber,
        redInvoiceSynchronizeDto: {
          ...headerData,
          taxpayerNumber,
          goldenTaxDiskNumber,
          extensionNumber,
        },
      };
      const res = getResponse(await synchronize(params));
      if (res) {
        if (res.status === '1000') {
          notification.success({
            description: '',
            message: intl.get(`${modelCode}.view.handleSynchronize`).d(`操作成功`),
          });
          this.synchronizeRedInfoDS.query();
        } else {
          notification.error({
            description: '',
            message: res && res.message,
          });
        }
      }
    }
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const OneClickRefreshBtn = observer((props: any) => {
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          // disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          permissionList={[
            {
              code: `${permissionPath}.button.${props.permissionCode}`,
              type: 'button',
              meaning: `${props.permissionMeaning}`,
            },
          ]}
        >
          {props.title}
        </PermissionButton>
      );
    });
    return [
      <OneClickRefreshBtn
        key="oneClickRefresh"
        onClick={() => this.oneClickRefresh()}
        dataSet={this.synchronizeRedInfoDS}
        title={intl.get(`${modelCode}.button.oneClickRefresh`).d('一键刷新')}
        permissionCode="one-click-refresh"
        permissionMeaning="按钮-一键刷新"
      />,
      <Button
        funcType={FuncType.raised}
        style={{ float: 'right' }}
        onClick={() => this.handleSynchronize()}
      >
        {intl.get('hzero.c7nProUI.Table.SynchronizeRedInfoList').d('同步')}
      </Button>,
    ];
  }

  render() {
    return (
      <>
        <Header
          title={intl.get(`${modelCode}.title`).d('同步请求列表')}
          backPath="/htc-front-iop/red-invoice-info/list"
        />
        <Content>
          <Form columns={3} dataSet={this.headerDS}>
            <DatePicker name="fromDate" />
            <DatePicker name="untilDate" />
            <Select name="overdueStatus" />
            <TextField name="informationSheetNumber" />
            <TextField name="purchasersTaxNumber" />
            <TextField name="salesTaxNumber" />
            <Select name="invoiceType" />
            <Select name="informationSheetDownloadRange" />
          </Form>
          <Table
            buttons={this.buttons}
            dataSet={this.synchronizeRedInfoDS}
            columns={this.columns}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
