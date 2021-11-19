/*
 * @Description:退税确认勾选
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-03-30 14:18:54
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import {
  Button,
  DataSet,
  Form,
  Table,
  TextField,
  Select,
  DatePicker,
  Currency,
  Lov,
} from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Button as PermissionButton } from 'components/Permission';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { Col, Row } from 'choerodon-ui';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@common/config/commonConfig';
import notification from 'utils/notification';
import { getPresentMenu } from '@common/utils/utils';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { confirmInvoice } from '@src/services/taxRefundService';
import TaxRefundComfirmDS from '../stores/TaxRefundComfirmDS';

const modelCode = 'hivp.check-certification';
const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

// const API_PREFIX = `${commonConfig.IVP_API}-31183`;
const API_PREFIX = commonConfig.IVP_API || '';

interface CertifiedDetailPageProps {
  dispatch: Dispatch<any>;
  location: any;
  match: any;
}

export default class CertifiedDetailPage extends Component<CertifiedDetailPageProps> {
  state = {};

  taxRefundComfirmDS = new DataSet({
    autoQuery: false,
    ...TaxRefundComfirmDS(),
  });

  async componentDidMount() {
    const { companyId } = this.props.match.params;
    const { queryDataSet } = this.taxRefundComfirmDS;
    const employeeRes = await getCurrentEmployeeInfo({ tenantId, companyId });
    const curEmployee = employeeRes && employeeRes.content[0];
    if (curEmployee) {
      const { companyCode, companyName, employeeId, employeeNum } = curEmployee;
      const companyDesc = `${companyCode}-${companyName}`;
      if (queryDataSet) {
        const { search } = this.props.location;
        const taxInfoStr = new URLSearchParams(search).get('taxInfo');
        if (taxInfoStr) {
          const taxInfo = JSON.parse(decodeURIComponent(taxInfoStr));
          const { authorityCode, taxDiskPassword } = taxInfo;
          queryDataSet.current!.set({ authorityCode });
          queryDataSet.current!.set({ taxDiskPassword });
        }
        queryDataSet.current!.set({ companyDesc });
        queryDataSet.current!.set({ companyId });
        queryDataSet.current!.set({ companyCode });
        queryDataSet.current!.set({ employeeId });
        queryDataSet.current!.set({ employeeNumber: employeeNum });
      }
    }
  }

  renderQueryBar = (props) => {
    const { queryDataSet, buttons, dataSet } = props;
    if (queryDataSet) {
      return (
        <>
          <Form columns={4} dataSet={queryDataSet} excludeUseColonTagList={['Output']}>
            <TextField name="companyDesc" />
            <Lov name="confirmMonthObj" />
            <TextField name="checkMonth" />
            <TextField name="authorityCode" />
            <Select name="confirmFlag" />
            <TextField name="salerTaxNo" />
            <TextField name="invoiceCode" />
            <TextField name="invoiceNo" />
            <DatePicker name="invoiceDateFrom" />
            <DatePicker name="invoiceDateTo" />
            <TextField
              name="number"
              newLine
              renderer={(value) => value.text && `${value.text}份`}
            />
            <Currency name="amount" />
            <Currency name="taxAmount" />
          </Form>
          <Row type="flex" justify="space-between">
            <Col span={20}>{buttons}</Col>
            <Col span={4} style={{ textAlign: 'end', marginBottom: '2px' }}>
              <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
                {intl.get(`${modelCode}.button.save`).d('查询')}
              </Button>
            </Col>
          </Row>
        </>
      );
    }
  };

  // 导出
  @Bind()
  handleGetQueryParams() {
    const queryParams = this.taxRefundComfirmDS.queryDataSet!.map((data) => data.toData()) || {};
    const exportParams = { ...queryParams[0] } || {};
    return exportParams;
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.taxRefundComfirmDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'confirmFlag' },
      { name: 'invoiceType', width: 170 },
      { name: 'invoiceCode', width: 170 },
      { name: 'invoiceNo' },
      { name: 'invoiceDate', width: 130 },
      { name: 'buyerTaxNo', width: 170 },
      { name: 'salerTaxName', width: 170 },
      { name: 'salerTaxNo', width: 170 },
      { name: 'invoiceAmountGross', width: 150, align: ColumnAlign.right },
      { name: 'invoiceTheAmount', width: 150, align: ColumnAlign.right },
      { name: 'validTaxAmount', width: 150, align: ColumnAlign.right },
      { name: 'invoiceState', renderer: (value) => value.value && `${value.value}-${value.text}` },
      { name: 'checkState', renderer: (value) => value.value && `${value.value}-${value.text}` },
      { name: 'checkDate', width: 130 },
      { name: 'confirmState' },
      { name: 'qrsj' },
      {
        name: 'authenticationMethod',
        renderer: (value) => value.value && `${value.value}-${value.text}`,
      },
      { name: 'infoSource', renderer: (value) => value.value && `${value.value}-${value.text}` },
      {
        name: 'managementState',
        renderer: (value) => value.value && `${value.value}-${value.text}`,
      },
    ];
  }

  @Bind()
  async handleConfirm() {
    const unPass = this.taxRefundComfirmDS.some((record) => record.get('confirmFlag') === '1');
    const { queryDataSet } = this.taxRefundComfirmDS;
    if (unPass) {
      notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.unSubmit`).d('存在勾选状态为已确认的发票，无法确认'),
      });
      return;
    }
    if (queryDataSet) {
      const {
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        authorityCode,
        taxDiskPassword,
        confirmMonth,
      } = queryDataSet.current!.toData();
      const params = {
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        authorityCode,
        taxDiskPassword,
        confirmMonth,
        tenantId,
      };
      const res = getResponse(await confirmInvoice(params));
      if (res && res.status === '1000') {
        notification.success({
          description: '',
          message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
        });
        queryDataSet.current!.set({ number: res.data.invoiceNum });
        queryDataSet.current!.set({ amount: res.data.invoiceAllAmountGross });
        queryDataSet.current!.set({ taxAmount: res.data.invoiceAllAmount });
        this.taxRefundComfirmDS.query();
      } else {
        notification.error({
          description: '',
          message: res && res.message,
        });
      }
    }
  }

  get buttons(): Buttons[] {
    const HeaderButtons = observer((props: any) => {
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
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
      <HeaderButtons
        key="confirm"
        onClick={() => this.handleConfirm()}
        dataSet={this.taxRefundComfirmDS}
        title={intl.get(`${modelCode}.button.confirm`).d('确认')}
        permissionCode="confirm"
        permissionMeaning="按钮-确认"
      />,
    ];
  }

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-ivp/tax-refund/list"
          title={intl.get(`${modelCode}.title`).d('退税确认勾选')}
        >
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/refund-invoice-operation/confirm-invoice-export`}
            queryParams={() => this.handleGetQueryParams()}
          />
        </Header>
        <Content>
          <Table
            dataSet={this.taxRefundComfirmDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            buttons={this.buttons}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
