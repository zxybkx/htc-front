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
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
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
import { chunk, slice } from 'lodash';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import { downLoadFiles } from '@htccommon/utils/utils';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { deductionReportDownload } from '@src/services/checkCertificationService';
import formatterCollections from 'utils/intl/formatterCollections';
import ApplyDeductionSummaryDS, { ApplyDeductionHeader } from '../stores/ApplyDeductionSummary';
import ApplyDeductionDetailsDS from '../stores/ApplyDeductionDetails';
import styles from '../checkcertification.less';

const { TabPane } = Tabs;
const modelCode = 'hivp.checkCertification';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IVP_API || '';

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
    'chan.bill-push-history',
  ],
})
export default class ApplyDeductionReport extends Component<ApplyDeductionPageProps> {
  state = {
    summaryData: [],
    detailData: [],
    urlData: {} as any,
    empInfo: {} as any,
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

  async componentDidMount() {
    const { search } = this.props.location;
    const statisticalConfirmInfoStr = new URLSearchParams(search).get('statisticalConfirmInfo');
    if (statisticalConfirmInfoStr) {
      const statisticalConfirmInfo = JSON.parse(decodeURIComponent(statisticalConfirmInfoStr));
      const {
        currentPeriod,
        currentCertState,
        companyId,
        invoiceCategory,
        taxDiskPassword,
        invoiceDateFromStr,
        invoiceDateToStr,
        authorityCode,
      } = statisticalConfirmInfo;
      const curInfo = await getCurrentEmployeeInfo({ tenantId, companyId });
      if (curInfo && curInfo.content) {
        const {
          companyCode,
          employeeId,
          employeeNum,
          taxpayerNumber,
          companyName,
        } = curInfo.content[0];
        const date = moment().format(DEFAULT_DATETIME_FORMAT);
        this.headerDS.current!.set({
          companyName,
          currentCertState,
          currentPeriod,
          queryTime: date,
        });
        this.summaryDS.setQueryParameter('companyId', companyId);
        this.summaryDS.setQueryParameter('companyCode', companyCode);
        this.summaryDS.setQueryParameter('employeeId', employeeId);
        this.summaryDS.setQueryParameter('employeeNumber', employeeNum);
        this.summaryDS.setQueryParameter('nsrsbh', taxpayerNumber);
        this.summaryDS.setQueryParameter('ssq', currentPeriod);
        this.summaryDS.setQueryParameter('invoiceCategory', invoiceCategory);
        this.summaryDS.setQueryParameter('spmm', taxDiskPassword);
        this.summaryDS.setQueryParameter('rqq', invoiceDateFromStr);
        this.summaryDS.setQueryParameter('rqz', invoiceDateToStr);
        this.summaryDS.setQueryParameter('zgjgdm', authorityCode);
        this.summaryDS.query().then(res => {
          if (res) {
            const { deductionApplySummaryDtoList, detailList } = res;
            this.summaryDS.loadData(slice(deductionApplySummaryDtoList, 0, 10));
            this.detailDS.loadData(slice(detailList, 0, 10));
            this.setState({
              summaryData: deductionApplySummaryDtoList || [],
              detailData: detailList || [],
            });
          }
        });
      }
      this.setState({ urlData: statisticalConfirmInfo, empInfo: curInfo.content[0] });
    }
  }

  // 渲染金额列脚
  @Bind()
  renderColumnFooter(dataSet, name) {
    let total;
    dataSet.map(record => {
      const _total = Number(total) || 0;
      const _amount = Number(record.get(name)) || 0;
      total = ((_total * 100 + _amount * 100) / 100).toFixed(2);
      return total;
    });
    total =
      total &&
      total.toString().replace(/\d+/, n => {
        return n.replace(/(\d)(?=(\d{3})+$)/g, i => {
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
    const { summaryData, detailData, empInfo, urlData } = this.state;
    const {
      currentPeriod,
      invoiceCategory,
      taxDiskPassword,
      invoiceDateFromStr,
      invoiceDateToStr,
      authorityCode,
    } = urlData;
    const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;
    const params = {
      tenantId,
      companyId,
      companyCode,
      employeeId,
      employeeNumber: employeeNum,
      nsrsbh: taxpayerNumber,
      ssq: currentPeriod,
      invoiceCategory,
      spmm: taxDiskPassword,
      rqq: invoiceDateFromStr,
      rqz: invoiceDateToStr,
      zgjgdm: authorityCode,
      dto: { deductionApplySummaryDtoList: summaryData, detailList: detailData },
    };
    const res = getResponse(await deductionReportDownload(params));
    if (res) {
      const fileList = [
        {
          data: res,
          fileName: '申报抵扣统计表.pdf',
        },
      ];
      downLoadFiles(fileList, 0);
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
    const { urlData, empInfo } = this.state;
    const {
      currentPeriod,
      invoiceCategory,
      taxDiskPassword,
      invoiceDateFromStr,
      invoiceDateToStr,
      authorityCode,
    } = urlData;
    const { companyId, companyCode, employeeId, employeeNum, taxpayerNumber } = empInfo;
    const queryParams = {
      tenantId,
      companyId,
      companyCode,
      employeeId,
      employeeNumber: employeeNum,
      nsrsbh: taxpayerNumber,
      ssq: currentPeriod,
      invoiceCategory,
      spmm: taxDiskPassword,
      rqq: invoiceDateFromStr,
      rqz: invoiceDateToStr,
      zgjgdm: authorityCode,
    };
    return { ...queryParams } || {};
  }

  render() {
    const { summaryData, detailData } = this.state;
    return (
      <>
        <Header
          backPath="/htc-front-ivp/check-certification/list?type=2"
          title={intl.get(`${modelCode}.title.applyDeduction`).d('申请抵扣统计表')}
        >
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoice-operation/export-excel`}
            queryParams={() => this.handleGetQueryParams()}
          />
          <Button color={ButtonColor.primary} onClick={this.handlePrint}>
            {intl.get(`${modelCode}.button.applyDeductionPrint`).d('申请抵扣统计表打印')}
          </Button>
        </Header>
        <Content>
          <Form dataSet={this.headerDS} columns={3}>
            <TextField name="companyName" />
            <Select name="currentCertState" />
            <TextField name="currentPeriod" />
            <TextField name="queryTime" />
          </Form>
          <Tabs>
            <TabPane tab={intl.get(`${modelCode}.view.applyDeductionSummary`).d('申请抵扣汇总')}>
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
            <TabPane tab={intl.get(`${modelCode}.title.applyDeductionDetail`).d('申请抵扣明细')}>
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
