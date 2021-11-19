import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Header, Content } from 'components/Page';
import { RouteComponentProps } from 'react-router-dom';
import {
  DataSet,
  Form,
  TextField,
  Lov,
  Output,
  Button,
  TextArea,
  notification,
  Spin,
} from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import moment from 'moment';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { permissionSave } from '@src/services/invoiceReqService';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import PermissionAssignDS from '../stores/PermissionAssignDS';

const modelCode = 'hiop.permisssion-assign';
const tenantId = getCurrentOrganizationId();
interface RouterInfo {
  sourceType: string;
  companyId: string;
  headerIds: string;
}
interface PermissionAssignPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

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
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
      });
      this.handleQuery();
    }
  };

  get renderCompanyDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.companyName || ''}`;
    }
    return '';
  }

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
        <Header title={intl.get(`${modelCode}.title`).d('数据权限分配')}>
          <Button color={ButtonColor.primary} onClick={this.handleSavePermission}>
            {intl.get('hzero.c7nProUI.Table.query_button').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin dataSet={this.detailDS}>
            <Form dataSet={this.detailDS} columns={3}>
              <Output
                label={intl.get(`${modelCode}.view.companyDesc`).d('所属公司')}
                value={this.renderCompanyDesc}
              />
              <Output
                label={intl.get(`${modelCode}.view.employeeDesc`).d('登录员工')}
                value={this.renderEmployeeDesc}
              />
              <Output
                label={intl.get(`${modelCode}.view.curDate`).d('当前日期')}
                value={moment().format(DEFAULT_DATE_FORMAT)}
              />
            </Form>
            <Form
              header={intl.get(`${modelCode}.view.permissionAssign`).d('权限分配')}
              dataSet={this.detailDS}
              columns={3}
            >
              <TextField name="creationName" />
              <TextField name="auditName" />
              <TextField name="issuerame" newLine />
              <TextField name="payeeName" />
              <TextField name="reviewer" />
              <TextArea name="whiteList" colSpan={3} newLine />
              <Lov name="invoicePermissions" colSpan={3} rowSpan={2} newLine />
            </Form>
          </Spin>
        </Content>
      </>
    );
  }
}
