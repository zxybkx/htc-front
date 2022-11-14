/**
 * @Description:当期勾选(取消)可认证发票-已认证详情(实时)
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2020-10-19 11:07:33
 * @LastEditTime: 2021-03-04 11:52:54
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { Button, DataSet, Form, notification, Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';
import { getTaxAuthorityCode, findCertifiedInvoice } from '@src/services/checkCertificationService';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import CertifiedDetailListDS from '../stores/CertifiedDetailListDS';

const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();

const API_PREFIX = commonConfig.IVP_API || '';

interface CertifiedDetailPageProps {
  dispatch: Dispatch<any>;
  location: any;
}
@formatterCollections({
  code: [modelCode, 'hcan.invoiceDetail'],
})
export default class CertifiedDetailPage extends Component<CertifiedDetailPageProps> {
  state = {
    companyId: '',
    companyCode: '',
    employeeId: '',
    employeeNumber: '',
    spmm: '',
    currentPeriod: '',
    loadingFlag: false,
  };

  tableDS = new DataSet({
    autoQuery: false,
    ...CertifiedDetailListDS({}),
  });

  async componentDidMount() {
    const { search } = this.props.location;
    const certifiableInfoStr = new URLSearchParams(search).get('certifiableInfo');
    if (certifiableInfoStr) {
      const certifiableInfo = JSON.parse(decodeURIComponent(certifiableInfoStr));
      const {
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        spmm,
        currentPeriod,
      } = certifiableInfo;
      const { competentTaxAuthorities } = await getTaxAuthorityCode({ tenantId, companyId });

      this.tableDS = new DataSet({
        autoQuery: false,
        ...CertifiedDetailListDS({ ...certifiableInfo, competentTaxAuthorities }),
      });
      this.setState({ companyId, companyCode, employeeId, employeeNumber, spmm, currentPeriod });
      await this.tableDS.query();
    }
  }

  // 实时查找已认证发票
  @Bind()
  async handleSearch() {
    const { companyId, companyCode, employeeId, employeeNumber, spmm, currentPeriod } = this.state;
    const { queryDataSet } = this.tableDS;
    const authenticationDate =
      (queryDataSet && queryDataSet.current?.get('authenticationDate')) || currentPeriod;
    const checkTimeFrom = queryDataSet && queryDataSet.current?.get('checkTimeFrom');
    const checkTimeTo = queryDataSet && queryDataSet.current?.get('checkTimeTo');
    const params = {
      tenantId,
      companyId,
      companyCode,
      employeeId,
      employeeNumber,
      spmm,
      tjyf: authenticationDate,
      load: 1,
      rqq: checkTimeFrom && moment(checkTimeFrom).format(DEFAULT_DATE_FORMAT),
      rqz: checkTimeTo && moment(checkTimeTo).format(DEFAULT_DATE_FORMAT),
    };
    this.setState({ loadingFlag: true });
    const res = await findCertifiedInvoice(params);
    if (res && res.failed) {
      notification.error({
        description: '',
        message: res.message,
      });
      this.setState({ loadingFlag: false });
      return;
    }
    this.tableDS.query().then(() => {
      this.setState({ loadingFlag: false });
    });
  }

  renderBar = props => {
    const { queryFields, queryDataSet, queryFieldsLimit } = props;
    const { loadingFlag } = this.state;
    if (queryDataSet) {
      return (
        <>
          <Form columns={queryFieldsLimit} dataSet={queryDataSet}>
            {queryFields}
            <Button
              color={ButtonColor.primary}
              onClick={() => {
                this.handleSearch();
              }}
              loading={loadingFlag}
            >
              {intl.get('hzero.common.button.query').d('查询')}
            </Button>
          </Form>
        </>
      );
    }
  };

  // 导出
  @Bind()
  handleGetQueryParams() {
    const { companyId } = this.state;
    const queryParams = this.tableDS.queryDataSet!.map(data => data.toData()) || {};
    return { ...queryParams[0], companyId } || {};
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get('hcan.invoiceDetail.view.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.tableDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'invoiceType', width: 170 },
      { name: 'invoiceCode', width: 170 },
      { name: 'invoiceNo' },
      { name: 'invoiceDate', width: 130 },
      { name: 'buyerTaxNo', width: 170 },
      { name: 'salerName', width: 170 },
      { name: 'salerTaxNo', width: 170 },
      { name: 'invoiceAmount', width: 150, align: ColumnAlign.right },
      { name: 'taxAmount', width: 150, align: ColumnAlign.right },
      { name: 'validTaxAmount', width: 150, align: ColumnAlign.right },
      { name: 'invoiceState', renderer: value => value.value && `${value.value}-${value.text}` },
      { name: 'checkState', renderer: value => value.value && `${value.value}-${value.text}` },
      { name: 'checkDate', width: 130 },
      {
        name: 'authenticationState',
        renderer: value => value.value && `${value.value}-${value.text}`,
      },
      {
        name: 'authenticationType',
        renderer: value => value.value && `${value.value}-${value.text}`,
      },
      { name: 'infoSource', renderer: value => value.value && `${value.value}-${value.text}` },
      {
        name: 'taxBureauManageState',
        renderer: value => value.value && `${value.value}-${value.text}`,
      },
    ];
  }

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-ivp/check-certification/list"
          title={intl.get(`${modelCode}.view.title`).d('已认证详情(实时)')}
        >
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoice-operation/certified-detail-export`}
            queryParams={() => this.handleGetQueryParams()}
          />
        </Header>
        <Content>
          <Table
            dataSet={this.tableDS}
            columns={this.columns}
            queryFieldsLimit={4}
            queryBar={this.renderBar}
            style={{ height: 300 }}
          />
        </Content>
      </>
    );
  }
}
