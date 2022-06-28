/**
 * @Description:数据权限分配
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-03-10 17:57:04
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Content, Header } from 'components/Page';
import { RouteComponentProps } from 'react-router-dom';
import { Button, DataSet, Form, Lov, notification, Output, Spin, TextArea } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import moment from 'moment';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { permissionSave } from '@src/services/invoiceReqService';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import PermissionAssignDS from '../stores/PermissionAssignDS';

const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  sourceType: string;
  companyId: string;
  headerIds: string;
}

interface PermissionAssignPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: ['hiop.permission', 'hiop.invoiceWorkbench', 'hiop.invoiceReq', 'htc.common'],
})
export default class PermissionAssignPage extends Component<PermissionAssignPageProps> {
  state = { empInfo: {} as any };

  detailDS = new DataSet({
    autoQuery: false,
    ...PermissionAssignDS(this.props.match.params.companyId),
  });

  componentDidMount() {
    this.handleQuery();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params && prevProps.match.params !== this.props.match.params) {
      this.handleQuery();
    }
  }

  /**
   * 查询
   */
  handleQuery = () => {
    const { sourceType, companyId, headerIds } = this.props.match.params;
    this.detailDS.setQueryParameter('sourceType', sourceType);
    this.detailDS.setQueryParameter('companyId', companyId);
    this.detailDS.setQueryParameter('headerIds', headerIds);
    this.detailDS.query().then(() => {
      if (this.detailDS.length === 0) {
        this.detailDS.create({}, 0);
      }
    });
    getCurrentEmployeeInfo({ tenantId, companyId }).then((empRes) => {
      if (empRes && empRes.content) {
        const empInfo = empRes.content[0];
        this.setState({ empInfo });
      }
    });
  };

  /**
   * 保存
   */
  handleSavePermission = async () => {
    const { sourceType, companyId, headerIds } = this.props.match.params;
    const invoicePermissions = this.detailDS.current!.get('invoicePermissions');
    const params = {
      tenantId,
      companyId,
      sourceType,
      permissionReq: {
        headerIds: headerIds.split(','),
        employees:
          invoicePermissions &&
          invoicePermissions.map((emp) => ({
            employeeId: emp.employeeId,
            employeeName: emp.employeeName,
          })),
      },
    };
    const res = getResponse(await permissionSave(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.handleQuery();
    }
  };

  /**
   * 返回公司信息
   */
  get renderCompanyDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.companyName || ''}`;
    }
    return '';
  }

  /**
   * 返回员工信息
   */
  get renderEmployeeDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.employeeNum || ''}-${
        empInfo.employeeName || ''
      }-${empInfo.mobile || ''}`;
    }
    return '';
  }

  render() {
    return (
      <>
        <Header title={intl.get('hiop.permission.title.permissionAssign').d('数据权限分配')}>
          <Button color={ButtonColor.primary} onClick={this.handleSavePermission}>
            {intl.get('hzero.c7nProUI.Table.query_button').d('保存')}
          </Button>
        </Header>
        <Card style={{ marginTop: 10 }}>
          <Form dataSet={this.detailDS} columns={3}>
            <Output
              label={intl.get('htc.common.label.companyName').d('所属公司')}
              value={this.renderCompanyDesc}
            />
            <Output
              label={intl.get('htc.common.modal.employeeDesc').d('登录员工')}
              value={this.renderEmployeeDesc}
            />
            <Output
              label={intl.get('hiop.invoiceReq.modal.curDate').d('当前日期')}
              value={moment().format(DEFAULT_DATE_FORMAT)}
            />
          </Form>
        </Card>
        <Content>
          <Spin dataSet={this.detailDS}>
            <Form
              header={intl.get('hiop.permission.title.PermissionAssign').d('权限分配')}
              dataSet={this.detailDS}
              columns={5}
            >
              <Output name="creationName" />
              <Output name="auditName" />
              <Output name="issuerame" />
              <Output name="payeeName" />
              <Output name="reviewer" />
              <TextArea name="whiteList" colSpan={5} />
              <Lov name="invoicePermissions" colSpan={5} rowSpan={2} />
            </Form>
          </Spin>
        </Content>
      </>
    );
  }
}
