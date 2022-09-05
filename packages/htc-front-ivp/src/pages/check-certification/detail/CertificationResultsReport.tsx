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
  notification,
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
import { statisticReportDownload } from '@src/services/checkCertificationService';
import { base64toBlob } from '@htccommon/utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { ApplyDeductionHeader } from '../stores/ApplyDeductionSummary';
import CertificationResultDetailsDS from '../stores/CertificationResultDetail';
import CertificationResultSummaryDS from '../stores/CertificationResultSummary';
import styles from '../checkcertification.less';

const { TabPane } = Tabs;
const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();

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
        statisticalPeriod,
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
        currentPeriod: statisticalPeriod,
      });
      this.summaryDS.setQueryParameter('companyId', companyId);
      this.summaryDS.setQueryParameter('companyCode', companyCode);
      this.summaryDS.setQueryParameter('companyName', companyName);
      this.summaryDS.setQueryParameter('employeeId', employeeId);
      this.summaryDS.setQueryParameter('employeeNumber', employeeNum);
      this.summaryDS.setQueryParameter('nsrsbh', taxpayerNumber);
      this.summaryDS.setQueryParameter('tjyf', statisticalPeriod);
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
    const statisticalConfirmInfoStr = new URLSearchParams(search).get('statisticalConfirmInfo');
    if (statisticalConfirmInfoStr) {
      const statisticalConfirmInfo = JSON.parse(decodeURIComponent(statisticalConfirmInfoStr));
      const {
        statisticalPeriod,
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
        ssq: statisticalPeriod,
        tjyf: statisticalPeriod,
        spmm: taxDiskPassword,
        rqq: invoiceDateFromStr,
        rqz: invoiceDateToStr,
      };
      const res = getResponse(await statisticReportDownload(params));
      if (res) {
        const blob = new Blob([base64toBlob(res)]);
        if ((window.navigator as any).msSaveBlob) {
          try {
            (window.navigator as any).msSaveBlob(blob);
          } catch (e) {
            notification.error({
              description: '',
              message: intl.get('hiop.invoiceRule.notification.error.upload').d('下载失败'),
            });
          }
        } else {
          const aElement = document.createElement('a');
          const blobUrl = window.URL.createObjectURL(blob);
          aElement.href = blobUrl; // 设置a标签路径
          aElement.download = '认证结果通知书.pdf';
          aElement.click();
          window.URL.revokeObjectURL(blobUrl);
        }
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

  render() {
    const { summaryData, detailData } = this.state;
    return (
      <>
        <Header
          backPath="/htc-front-ivp/check-certification/list?type=2"
          title={intl.get(`${modelCode}.title.certificationResult`).d('认证结果报表')}
        >
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
