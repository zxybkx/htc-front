/**
 * @Description:当期已勾选发票-申请抵扣统计
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-05-05 15:03
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { RouteComponentProps } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import { getCurrentOrganizationId, getCurrentTenant, getResponse } from 'utils/utils';
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
import { chunk } from 'lodash';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';
import { base64toBlob } from '@htccommon/utils/utils';
import { deductionReportDownload } from '@src/services/checkCertificationService';
import formatterCollections from 'utils/intl/formatterCollections';
import ApplyDeductionSummaryDS, { ApplyDeductionHeader } from '../stores/ApplyDeductionSummary';
import ApplyDeductionDetailsDS from '../stores/ApplyDeductionDetails';
import styles from '../checkcertification.less';

const { TabPane } = Tabs;
const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  certRequestHeaderId: any;
}

interface ApplyDeductionPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
  location: any;
}

@formatterCollections({
  code: [
    modelCode,
    'hiop.invoiceWorkbench',
    'hivp.invoices',
    'htc.common',
    'hiop.invoiceRule',
    'hivp.taxRefund',
    'hivp.bill',
  ],
})
export default class ApplyDeductionPage extends Component<ApplyDeductionPageProps> {
  state = {
    summaryData: [],
    detailData: [],
  };

  headerDS = new DataSet({
    ...ApplyDeductionHeader(),
  });

  summaryDS = new DataSet({
    autoQuery: false,
    ...ApplyDeductionSummaryDS(),
  });

  detailDS = new DataSet({
    autoQuery: false,
    ...ApplyDeductionDetailsDS(),
  });

  componentDidMount() {
    const { search } = this.props.location;
    const statisticalConfirmInfoStr = new URLSearchParams(search).get('statisticalConfirmInfo');
    if (statisticalConfirmInfoStr) {
      const statisticalConfirmInfo = JSON.parse(decodeURIComponent(statisticalConfirmInfoStr));
      const {
        statisticalPeriod,
        currentCertState,
        companyId,
        companyCode,
        employeeId,
        employeeNum,
        taxpayerNumber,
        invoiceCategory,
        taxDiskPassword,
        invoiceDateFromStr,
        invoiceDateToStr,
        authorityCode,
      } = statisticalConfirmInfo;
      const date = moment().format(DEFAULT_DATETIME_FORMAT);
      this.headerDS.current!.set({
        tenantName: getCurrentTenant().tenantName,
        currentCertState,
        currentPeriod: statisticalPeriod,
        queryTime: date,
      });
      this.summaryDS.setQueryParameter('companyId', companyId);
      this.summaryDS.setQueryParameter('companyCode', companyCode);
      this.summaryDS.setQueryParameter('employeeId', employeeId);
      this.summaryDS.setQueryParameter('employeeNumber', employeeNum);
      this.summaryDS.setQueryParameter('nsrsbh', taxpayerNumber);
      this.summaryDS.setQueryParameter('ssq', statisticalPeriod);
      this.summaryDS.setQueryParameter('invoiceCategory', invoiceCategory);
      this.summaryDS.setQueryParameter('spmm', taxDiskPassword);
      this.summaryDS.setQueryParameter('rqq', invoiceDateFromStr);
      this.summaryDS.setQueryParameter('rqz', invoiceDateToStr);
      this.summaryDS.setQueryParameter('zgjgdm', authorityCode);
      this.summaryDS.query().then((res) => {
        if (res) {
          const { deductionApplySummaryDtoList, detailList } = res;
          this.summaryDS.loadData(deductionApplySummaryDtoList);
          this.detailDS.loadData(detailList);
          this.setState({
            summaryData: deductionApplySummaryDtoList || [],
            detailData: detailList || [],
          });
        }
      });
    }
  }

  // 渲染金额列脚
  @Bind()
  renderColumnFooter(dataSet, name) {
    let total;
    dataSet.map((record) => {
      const _total = Number(total) || 0;
      const _amount = Number(record.get(name)) || 0;
      total = ((_total * 100 + _amount * 100) / 100).toFixed(2);
      return total;
    });
    total =
      total &&
      total.toString().replace(/\d+/, (n) => {
        return n.replace(/(\d)(?=(\d{3})+$)/g, (i) => {
          return `${i},`;
        });
      });
    return `${total || ''}`;
  }

  // 汇总
  get summaryColumns(): ColumnProps[] {
    return [
      {
        name: 'invoiceType',
        width: 200,
        header: (
          <div className={styles.headerCell}>
            <div
              style={{
                position: 'absolute',
                top: '-60px',
                left: '-100px',
                width: '60px',
                color: '#666666',
              }}
            >
              {intl.get(`${modelCode}.view.classification`).d('分类')}
            </div>
            <div
              style={{
                position: 'absolute',
                top: '-24px',
                left: '-215px',
                width: '60px',
                color: '#666666',
              }}
            >
              {intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类')}
            </div>
          </div>
        ),
      },
      {
        name: 'deductInfo',
        header: intl.get(`${modelCode}.view.deductInfo`).d('抵扣'),
        children: [
          {
            name: 'deductionInvoiceNum',
            align: ColumnAlign.center,
          },
          {
            name: 'deductionAmount',
            align: ColumnAlign.center,
          },
          {
            name: 'deductionValidTaxAmount',
            align: ColumnAlign.center,
          },
        ],
      },
      {
        name: 'noDeductibleInfo',
        header: intl.get(`${modelCode}.view.noDeductibleInfo`).d('不抵扣'),
        children: [
          {
            name: 'nonDeductionInvoiceNum',
            align: ColumnAlign.center,
          },
          {
            name: 'nonDeductionAmount',
            align: ColumnAlign.center,
          },
          {
            name: 'nonDeductionValidTaxAmount',
            align: ColumnAlign.center,
          },
        ],
      },
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
      { name: 'gxsj' },
      { name: 'fplx', width: 150 },
      { name: 'fpzt' },
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
        employeeId,
        employeeNum,
        taxpayerNumber,
        invoiceCategory,
        taxDiskPassword,
        invoiceDateFromStr,
        invoiceDateToStr,
        authorityCode,
      } = statisticalConfirmInfo;
      const params = {
        tenantId,
        companyId,
        companyCode,
        employeeId,
        employeeNumber: employeeNum,
        nsrsbh: taxpayerNumber,
        ssq: statisticalPeriod,
        invoiceCategory,
        spmm: taxDiskPassword,
        rqq: invoiceDateFromStr,
        rqz: invoiceDateToStr,
        zgjgdm: authorityCode,
      };
      const res = getResponse(await deductionReportDownload(params));
      if (res) {
        const blob = new Blob([base64toBlob(res)]);
        if (window.navigator.msSaveBlob) {
          try {
            window.navigator.msSaveBlob(blob, name);
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
          aElement.download = '申报抵扣统计表.pdf';
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
          title={intl.get(`${modelCode}.title.applyDeduction`).d('申请抵扣统计表')}
        >
          <Button color={ButtonColor.primary} onClick={this.handlePrint}>
            {intl.get(`${modelCode}.button.applyDeductionPrint`).d('申请抵扣统计表打印')}
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
            <TabPane tab={intl.get(`${modelCode}.view.applyDeductionSummary`).d('申请抵扣汇总')}>
              <div style={{ textAlign: 'right' }}>
                <span>单位：元</span>
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
            <TabPane tab={intl.get(`${modelCode}.title.applyDeductionDetail`).d('申请抵扣明细')}>
              <div style={{ textAlign: 'right' }}>
                <span>单位：元</span>
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
