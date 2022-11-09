/**
 * @Description:当期已勾选发票-认证结果统计
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-05-05 15:10
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import {
  Button,
  DataSet,
  Form,
  Pagination,
  Select,
  Table,
  Tabs,
  TextField,
} from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { getCurrentOrganizationId, getCurrentTenant, getResponse } from 'utils/utils';
import { chunk } from 'lodash';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import { statisticReportDownload } from '@src/services/checkCertificationService';
import { downLoadFiles } from '@htccommon/utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { ApplyDeductionHeader } from '../stores/ApplyDeductionSummary';
import CertificationResultDetailsDS from '../stores/CertificationResultDetail';
import CertificationResultSummaryDS from '../stores/CertificationResultSummary';
import styles from '../checkcertification.less';

const { TabPane } = Tabs;
const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IVP_API || '';

interface ApplyDeductionPageProps {
  dispatch: Dispatch<any>;
  location: any;
}

@formatterCollections({
  code: [modelCode, 'htc.common', 'hiop.invoiceRule', 'hivp.bill'],
})
export default class CertificationResultsReport extends Component<ApplyDeductionPageProps> {
  state = {
    summaryData: [],
    detailData: [],
    urlData: {} as any,
  };

  headerDS = new DataSet({
    ...ApplyDeductionHeader(),
  });

  summaryDS = new DataSet({
    autoQuery: false,
    ...CertificationResultSummaryDS(),
  });

  detailDS = new DataSet({
    autoQuery: false,
    ...CertificationResultDetailsDS(),
  });

  componentDidMount() {
    const { search } = this.props.location;
    const statisticalConfirmInfoStr = new URLSearchParams(search).get('statisticalConfirmInfo');
    if (statisticalConfirmInfoStr) {
      const statisticalConfirmInfo = JSON.parse(decodeURIComponent(statisticalConfirmInfoStr));
      const {
        currentPeriod,
        currentCertState,
        companyId,
        companyCode,
        companyName,
        employeeId,
        employeeNum,
        taxpayerNumber,
        // invoiceCategory,
        taxDiskPassword,
        invoiceDateFromStr,
        invoiceDateToStr,
      } = statisticalConfirmInfo;
      this.headerDS.current!.set({
        tenantName: getCurrentTenant().tenantName,
        currentCertState,
        currentPeriod,
      });
      this.summaryDS.setQueryParameter('companyId', companyId);
      this.summaryDS.setQueryParameter('companyCode', companyCode);
      this.summaryDS.setQueryParameter('companyName', companyName);
      this.summaryDS.setQueryParameter('employeeId', employeeId);
      this.summaryDS.setQueryParameter('employeeNumber', employeeNum);
      this.summaryDS.setQueryParameter('nsrsbh', taxpayerNumber);
      this.summaryDS.setQueryParameter('tjyf', currentPeriod);
      this.summaryDS.setQueryParameter('ssq', currentPeriod);
      this.summaryDS.setQueryParameter('spmm', taxDiskPassword);
      this.summaryDS.setQueryParameter('rqq', invoiceDateFromStr);
      this.summaryDS.setQueryParameter('rqz', invoiceDateToStr);
      this.summaryDS.query().then(res => {
        if (res) {
          const { certifiedResultStatisticSummaryDtoList, detailList, queryTime } = res;
          this.headerDS.current!.set({ queryTime });
          this.summaryDS.loadData(certifiedResultStatisticSummaryDtoList);
          this.detailDS.loadData(detailList);
          this.setState({
            summaryData: certifiedResultStatisticSummaryDtoList || [],
            detailData: detailList || [],
          });
        }
      });
      this.setState({ urlData: statisticalConfirmInfo });
    }
  }

  // 汇总
  get summaryColumns(): ColumnProps[] {
    return [
      { name: 'taxRate', align: ColumnAlign.center },
      { name: 'invoiceNum', align: ColumnAlign.center },
      { name: 'amount', align: ColumnAlign.center },
      { name: 'validTaxAmount', align: ColumnAlign.center },
    ];
  }

  // 明细
  get detailColumns(): ColumnProps[] {
    return [
      { name: 'count', width: 60 },
      { name: 'fpdm', width: 120 },
      { name: 'fphm' },
      { name: 'kprq', width: 150 },
      { name: 'xfnsrmc', width: 200 },
      { name: 'fpje' },
      { name: 'yxse' },
      { name: 'sl' },
      { name: 'gxsj', width: 150 },
      { name: 'rzzt' },
      { name: 'fplx', width: 120 },
    ];
  }

  @Bind()
  async handlePrint() {
    const { search } = this.props.location;
    const { summaryData, detailData } = this.state;
    const statisticalConfirmInfoStr = new URLSearchParams(search).get('statisticalConfirmInfo');
    if (statisticalConfirmInfoStr) {
      const statisticalConfirmInfo = JSON.parse(decodeURIComponent(statisticalConfirmInfoStr));
      const {
        currentPeriod,
        companyId,
        companyCode,
        companyName,
        employeeId,
        employeeNum,
        taxpayerNumber,
        taxDiskPassword,
        invoiceDateFromStr,
        invoiceDateToStr,
      } = statisticalConfirmInfo;
      const params = {
        tenantId,
        companyId,
        companyCode,
        companyName,
        employeeId,
        employeeNumber: employeeNum,
        nsrsbh: taxpayerNumber,
        ssq: currentPeriod,
        tjyf: currentPeriod,
        spmm: taxDiskPassword,
        rqq: invoiceDateFromStr,
        rqz: invoiceDateToStr,
        list: [...summaryData, ...detailData],
      };
      const res = getResponse(await statisticReportDownload(params));
      if (res) {
        const fileList = [
          {
            data: res,
            fileName: '认证结果通知书.pdf',
          },
        ];
        downLoadFiles(fileList, 0);
      }
    }
  }

  @Bind()
  handleSummaryChange(page, pageSize) {
    const { summaryData } = this.state;
    const currentPageSize = this.summaryDS.pageSize;
    const _page = currentPageSize === pageSize ? page : 1;
    const chunkData = chunk(summaryData, pageSize);
    this.summaryDS.loadData(chunkData[_page - 1]);
  }

  @Bind()
  handleDetailChange(page, pageSize) {
    const { detailData } = this.state;
    const currentPageSize = this.detailDS.pageSize;
    const _page = currentPageSize === pageSize ? page : 1;
    const chunkData = chunk(detailData, pageSize);
    this.detailDS.loadData(chunkData[_page - 1]);
  }

  /**
   * 导出条件
   */
  @Bind()
  handleGetQueryParams() {
    const { urlData } = this.state;
    const {
      currentPeriod,
      companyId,
      companyCode,
      companyName,
      employeeId,
      employeeNum,
      taxpayerNumber,
      taxDiskPassword,
      invoiceDateFromStr,
      invoiceDateToStr,
    } = urlData;
    const queryParams = {
      tenantId,
      companyId,
      companyCode,
      companyName,
      employeeId,
      employeeNumber: employeeNum,
      nsrsbh: taxpayerNumber,
      tjyf: currentPeriod,
      ssq: currentPeriod,
      spmm: taxDiskPassword,
      rqq: invoiceDateFromStr,
      rqz: invoiceDateToStr,
    };
    return { ...queryParams } || {};
  }

  render() {
    const { summaryData, detailData } = this.state;
    return (
      <>
        <Header
          backPath="/htc-front-ivp/check-certification/list?type=2"
          title={intl.get(`${modelCode}.title.certificationResult`).d('认证结果报表')}
        >
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoice-operation/certified-result-statistic-report-export`}
            queryParams={() => this.handleGetQueryParams()}
          />
          <Button color={ButtonColor.primary} onClick={this.handlePrint}>
            {intl.get(`${modelCode}.button.printOfCertificationResult`).d('认证结果通知书打印')}
          </Button>
        </Header>
        <Content>
          <Form dataSet={this.headerDS} columns={3}>
            <TextField name="tenantName" />
            <Select name="currentCertState" />
            <TextField name="currentPeriod" />
            <TextField name="queryTime" />
          </Form>
          <Tabs>
            <TabPane tab={intl.get(`${modelCode}.title.applyDeductionSummary`).d('认证报表汇总')}>
              <div style={{ textAlign: 'right' }}>
                <span>{intl.get(`${modelCode}.title.unit`).d('单位：元')}</span>
              </div>
              <Table
                className={styles.tableTh}
                dataSet={this.summaryDS}
                columns={this.summaryColumns}
              />
              <Pagination
                total={summaryData.length}
                onChange={this.handleSummaryChange}
                style={{ marginTop: '0.1rem', textAlign: 'right' }}
              />
            </TabPane>
            <TabPane
              tab={intl.get(`${modelCode}.title.summaryOfCertificationReports`).d('认证报表明细')}
            >
              <div style={{ textAlign: 'right' }}>
                <span>{intl.get(`${modelCode}.title.unit`).d('单位：元')}</span>
              </div>
              <Table dataSet={this.detailDS} columns={this.detailColumns} />
              <Pagination
                total={detailData.length}
                onChange={this.handleDetailChange}
                style={{ marginTop: '0.1rem', textAlign: 'right' }}
              />
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
