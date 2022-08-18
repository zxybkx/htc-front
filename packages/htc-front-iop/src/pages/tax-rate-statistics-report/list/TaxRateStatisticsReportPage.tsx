/**
 * @Description:分税率统计报表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-04-20
 * @LastEditTime: 2022-06-15 10:17
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExport from 'components/ExcelExport';
import { Dispatch } from 'redux';
import intl from 'utils/intl';
import { RouteComponentProps } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import withProps from 'utils/withProps';
import { DataSet, Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import queryString from 'query-string';
import TaxRateStatisticReportDS from '../stores/TaxRateStatisticsReportDS';

const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IOP_API || '';

interface TaxRateStatisticsReportPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  taxRateStatisticsReport: DataSet;
}

@withProps(
  () => {
    const taxRateStatisticsReport = new DataSet({
      autoQuery: false,
      ...TaxRateStatisticReportDS(),
    });
    return { taxRateStatisticsReport };
  },
  { cacheState: true }
)
@formatterCollections({
  code: ['htc.common', 'hiop.taxRateStatistic', 'hiop.invoiceWorkbench'],
})
export default class TaxRateStatisticsReportPage extends Component<
  TaxRateStatisticsReportPageProps
> {
  async componentDidMount() {
    const { queryDataSet } = this.props.taxRateStatisticsReport;
    if (queryDataSet) {
      const res = await getCurrentEmployeeInfoOut({ tenantId });
      const curTenantId = queryDataSet.current!.get('tenantId');
      if (res && res.content) {
        const empInfo = res.content[0];
        if (!curTenantId) {
          queryDataSet.current!.set({ companyObj: empInfo });
        }
      }
    }
  }

  /**
   * 查看详情
   * @params {object} record-行记录
   * @params {string} name-行标题
   */
  @Bind()
  handleGotoDetailPage(record, name) {
    const { history } = this.props;
    switch (name) {
      case 'blueAmountValue':
        record.set('billTypeList', [1]);
        break;
      case 'blueTaxAmountValue':
        record.set('billTypeList', [1]);
        break;
      case 'redAmountValue':
        record.set('billTypeList', [2]);
        break;
      case 'redTaxAmountValue':
        record.set('billTypeList', [2]);
        break;
      case 'blueWasteAmountValue':
        record.set('billTypeList', [4]);
        break;
      case 'blueWasteTaxAmountValue':
        record.set('billTypeList', [4]);
        break;
      case 'redWasteAmountValue':
        record.set('billTypeList', [5]);
        break;
      case 'redWasteTaxAmountValue':
        record.set('billTypeList', [5]);
        break;
      case 'actualSalesAmountValue':
        record.set('billTypeList', [1, 2, 4, 5]);
        break;
      case 'actualSalesTaxAmountValue':
        record.set('billTypeList', [1, 2, 4, 5]);
        break;
      default:
        break;
    }
    history.push({
      pathname: '/htc-front-iop/tax-rate-statistics-report/detail',
      search: queryString.stringify({
        recordInfo: encodeURIComponent(JSON.stringify({ record: record.toData() })),
      }),
    });
  }

  /**
   * 渲染列脚
   * @params {object} dataSet-数据源
   * @params {string} name-行标题
   */
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

  @Bind()
  renderAmount(value, text, record, name) {
    if (value === 0) {
      return text;
    } else {
      return <a onClick={() => this.handleGotoDetailPage(record, name)}>{text}</a>;
    }
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        name: 'taxRateMeaning',
        footer: () => intl.get('hiop.taxRateStatistic.view.total').d('合计'),
      },
      {
        name: 'blueAmountValue',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'blueWasteAmountValue',
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'redAmountValue',
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'redWasteAmountValue',
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'actualSalesAmountValue',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'blueTaxAmountValue',
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'blueWasteTaxAmountValue',
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'redTaxAmountValue',
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'redWasteTaxAmountValue',
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'actualSalesTaxAmountValue',
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
      {
        name: 'totalAmountValue',
        width: 120,
        renderer: ({ value, text, record, name }) => this.renderAmount(value, text, record, name),
        footer: (dataSet, name) => this.renderColumnFooter(dataSet, name),
      },
    ];
  }

  /**
   * 导出
   */
  @Bind()
  exportParams() {
    const queryParams =
      this.props.taxRateStatisticsReport.queryDataSet!.map(data => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    const { companyObj, ...otherData } = queryParams[0];
    const _queryParams = {
      ...companyObj,
      ...otherData,
    };
    return { ..._queryParams } || {};
  }

  render() {
    return (
      <>
        <Header title={intl.get('hiop.taxRateStatistic.title').d('分税率统计报表')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoicing-order-points/export`}
            queryParams={() => this.exportParams()}
          />
        </Header>
        <Content>
          <Table
            dataSet={this.props.taxRateStatisticsReport}
            columns={this.columns}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
