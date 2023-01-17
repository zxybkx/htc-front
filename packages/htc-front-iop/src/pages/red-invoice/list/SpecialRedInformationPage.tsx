/**
 * @Description: 专票红字信息表
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-14 09:10:12
 * @LastEditTime: 2021-09-09 17:32:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import { RouteComponentProps } from 'react-router-dom';
import {
  Button,
  DataSet,
  DateTimePicker,
  Form,
  Lov,
  notification,
  Select,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { Col, Row, Tag } from 'choerodon-ui';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import queryString from 'query-string';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import { operatorRender } from 'utils/renderer';
import {
  getCurrentEmployeeInfoOut,
  getTenantAgreementCompany,
} from '@htccommon/services/commonService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import {
  downloadPrintPdfFiles,
  redInvoiceCreateRedOrder,
  redInvoiceCreateRequisition,
  examine,
  redInfoRefresh,
} from '@src/services/redInvoiceService';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import RedInvoiceInfoTableListDS from '../stores/RedInvoiceInfoTableListDS';
import styles from '../redInvoice.module.less';

const organizationId = getCurrentOrganizationId();

interface RedInvoiceRequisitionListPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  headerDS: DataSet;
}

@formatterCollections({
  code: ['hiop.redInvoiceInfo', 'hiop.invoiceWorkbench', 'htc.common', 'hiop.invoiceRule'],
})
@withProps(
  () => {
    const headerDS = new DataSet({
      autoQuery: false,
      ...RedInvoiceInfoTableListDS(),
    });
    return { headerDS };
  },
  { cacheState: true }
)
export default class SpecialRedInformationPage extends Component<
  RedInvoiceRequisitionListPageProps
> {
  state = {
    outChannelCode: undefined,
  };

  async componentDidMount() {
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet) {
      const outChannelCode = queryDataSet.current?.get('outChannelCode');
      if (outChannelCode) {
        this.setState({ outChannelCode });
      } else {
        const res = await getCurrentEmployeeInfoOut({ tenantId: organizationId });
        if (res && res.content) {
          const empInfo = res.content[0];
          if (empInfo) {
            queryDataSet.current!.set({ companyObj: empInfo });
            this.getChannelCode(empInfo);
          }
        }
      }
    }
  }

  /**
   * 获取销项通道
   */
  @Bind()
  async getChannelCode(companyInfo) {
    if (companyInfo) {
      const { companyId } = companyInfo;
      const resCop = await getTenantAgreementCompany({ companyId, tenantId: organizationId });
      const { outChannelCode } = resCop;
      const { queryDataSet } = this.props.headerDS;
      if (queryDataSet) queryDataSet.current!.set({ outChannelCode });
      this.setState({ outChannelCode });
    }
  }

  /**
   * 自定义查询
   */
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, dataSet, buttons } = props;
    if (queryDataSet) {
      return (
        <>
          <Row type="flex" style={{ flexWrap: 'nowrap' }}>
            <Col span={20}>
              <Form columns={3} dataSet={queryDataSet}>
                <Lov name="companyObj" onChange={this.getChannelCode} />
                <TextField name="employeeDesc" />
                <TextField name="taxpayerNumber" />
                <DateTimePicker name="redInvoiceDate" />
                <Lov name="taxDiskNumberObj" />
                <TextField name="extensionNumber" />
                <Select name="invoiceTypeCode" />
                <Select name="overdueStatus" />
              </Form>
            </Col>
            <Col>
              <Button
                onClick={() => {
                  queryDataSet.reset();
                  queryDataSet.create();
                }}
              >
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                color={ButtonColor.primary}
                onClick={() => {
                  dataSet.query();
                }}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Col>
          </Row>
          <Row type="flex" justify="space-between">
            <Col span={18}>{buttons}</Col>
          </Row>
        </>
      );
    }
    return <></>;
  }

  /**
   * 获取局端红字信息表
   */
  @Bind()
  async getRedInfo() {
    const { history } = this.props;
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet) {
      const queryData = queryDataSet.current!.toData();
      const {
        companyCode,
        employeeNum,
        taxpayerNumber,
        taxDiskNumber,
        extensionNumber,
        outChannelCode,
      } = queryData;
      if (!taxDiskNumber) {
        notification.warning({
          description: '',
          message: intl
            .get('hiop.redInvoiceInfo.notification.message.getRedInfo')
            .d('请选择金税盘编号'),
        });
        return;
      }
      const redInfo = {
        companyCode,
        employeeNumber: employeeNum,
        taxpayerNumber,
        goldenTaxDiskNumber: taxDiskNumber,
        extensionNumber,
        outChannelCode,
      };
      history.push({
        pathname: '/htc-front-iop/red-invoice-info/synchronize-red-info-list',
        search: queryString.stringify({
          redInfo: encodeURIComponent(JSON.stringify(redInfo)),
        }),
      });
    }
  }

  /**
   * 生成红冲订单
   */
  @Bind()
  async handleCreateRedOrder() {
    const { queryDataSet } = this.props.headerDS;
    const list = this.props.headerDS.selected;
    if (
      list.some(record =>
        ['02', '03', '05', '06', '07', '08'].includes(record.get('redInvoiceConfirmStatus'))
      )
    ) {
      notification.error({
        description: '',
        message: intl
          .get('hiop.redInvoiceInfo.notification.createRedOrder')
          .d(
            '信息表状态为“无需确认”、“购销双方已确认”和为空的，可以点击生成红字订单或者红字申请单'
          ),
      });
      return;
    }
    const redInvoiceInfoHeaderIds = list.map(rec => rec.get('redInvoiceInfoHeaderId')).join(',');
    if (queryDataSet) {
      const curQueryInfo = queryDataSet.current!.toData();
      const { companyObj, ...otherData } = curQueryInfo;
      const { companyCode, employeeNum } = companyObj;
      const res = getResponse(
        await redInvoiceCreateRedOrder({
          organizationId,
          companyCode,
          employeeNumber: employeeNum,
          redInvoiceInfoHeaderIds,
          ...otherData,
        })
      );
      if (res) {
        if (!res.message) {
          notification.success({
            description: '',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
        }
        this.props.headerDS.query();
        this.props.headerDS.setQueryParameter('resultName', res.resultName);
      }
    }
  }

  /**
   * 生成红冲申请单
   */
  @Bind()
  async handleCreateRedRequest() {
    const list = this.props.headerDS.selected;
    if (
      list.some(record =>
        ['02', '03', '05', '06', '07', '08'].includes(record.get('redInvoiceConfirmStatus'))
      )
    ) {
      notification.error({
        description: '',
        message: intl
          .get('hiop.redInvoiceInfo.notification.createRedOrder')
          .d(
            '信息表状态为“无需确认”、“购销双方已确认”和为空的，可以点击生成红字订单或者红字申请单'
          ),
      });
      return;
    }
    const companyCode = this.props.headerDS.current!.get('companyCode');
    const employeeNum =
      this.props.headerDS.queryDataSet &&
      this.props.headerDS.queryDataSet.current!.get('employeeNum');
    const redInvoiceInfoHeaderIds = list.map(rec => rec.get('redInvoiceInfoHeaderId')).join(',');
    const params = {
      organizationId,
      companyCode,
      employeeNumber: employeeNum,
      redInvoiceInfoHeaderIds,
    };
    const res = getResponse(await redInvoiceCreateRequisition(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.props.headerDS.query();
    }
  }

  /**
   * 下载红字发票信息表
   * @params {object} record-行记录
   */
  @Bind()
  async handleDownloadPdfFile(record) {
    const ids = record.get('redInvoiceInfoHeaderId');
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet) {
      const curQueryInfo = queryDataSet.current!.toData();
      const { companyObj } = curQueryInfo;
      const { companyCode, employeeNum } = companyObj;
      const resFile = getResponse(
        await downloadPrintPdfFiles({
          organizationId,
          companyCode,
          employeeNumber: employeeNum,
          ids,
        })
      );
      if (resFile) {
        const blob = new Blob([resFile]); // 字节流
        if (window.navigator.msSaveBlob) {
          try {
            window.navigator.msSaveBlob(blob, '开具红字增值税专用发票信息表.pdf');
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
          aElement.download = '开具红字增值税专用发票信息表.pdf';
          aElement.click();
          window.URL.revokeObjectURL(blobUrl);
        }
      }
    }
  }

  /**
   * 详情跳转
   * @params {object} record-行记录
   */
  @Bind()
  gotoDetail(record) {
    const { history } = this.props;
    const headerId = record.get('redInvoiceInfoHeaderId');
    const companyId = record.get('companyId');
    history.push(`/htc-front-iop/red-invoice-info/detail/${companyId}/${headerId}`);
  }

  /**
   * 行操作（同意/拒绝)
   * @params {object} record-行记录
   * @params {number} type 0-同意/1-拒绝
   */
  async handleAgreeOrRefuse(record, type) {
    const recordData = record.toData();
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet) {
      const companyCode = queryDataSet.current!.get('companyCode');
      const employeeNumber = queryDataSet.current!.get('employeeNum');
      const params = {
        organizationId,
        companyCode,
        employeeNumber,
        recordData,
        confirmType: type === 0 ? 1 : 0,
      };
      let res;
      if (type === 2) {
        res = getResponse(await redInfoRefresh(params));
      } else {
        res = getResponse(await examine(params));
      }
      if (res && res.status === '200') {
        notification.success({
          description: '',
          message: res.message,
        });
        this.props.headerDS.query();
      }
    }
  }

  /**
   * 返回行操作列按钮
   * @params {object} record-行记录
   * @return {ReactNode}
   */
  @Bind()
  optionsRender(record) {
    const { outChannelCode } = this.state;
    const invoiceTypeCode = record.get('invoiceTypeCode');
    const redInvoiceConfirmStatus = record.get('redInvoiceConfirmStatus');
    const confirmType = record.get('confirmType');
    const operators: any = [];
    if (
      outChannelCode === 'DOUBLE_CHANNEL' &&
      ['61', '81', '82'].includes(invoiceTypeCode) &&
      !['04', '05', '06', '07'].includes(redInvoiceConfirmStatus)
    ) {
      if (!confirmType) {
        operators.push({
          key: 'agree',
          ele: (
            <a onClick={() => this.handleAgreeOrRefuse(record, 0)}>
              {intl.get('hzero.common.status.agree').d('同意')}
            </a>
          ),
          len: 2,
          title: intl.get('hzero.common.status.agree').d('同意'),
        });
        operators.push({
          key: 'refuse',
          ele: (
            <a onClick={() => this.handleAgreeOrRefuse(record, 1)}>
              {intl.get('hzero.common.button.refuse').d('拒绝')}
            </a>
          ),
          len: 2,
          title: intl.get('hzero.common.button.refuse').d('拒绝'),
        });
      } else if (['0', '1'].includes(confirmType)) {
        operators.push({
          key: 'refresh',
          ele: (
            <a onClick={() => this.handleAgreeOrRefuse(record, 2)}>
              {intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态')}
            </a>
          ),
          len: 4,
          title: intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态'),
        });
      }
    }
    if (confirmType === '2') {
      operators.push({
        key: 'download',
        ele: (
          <a onClick={() => this.handleDownloadPdfFile(record)}>
            {intl.get('hiop.redInvoiceInfo.button.download').d('导出文件')}
          </a>
        ),
        len: 4,
        title: intl.get('hiop.redInvoiceInfo.button.download').d('导出文件'),
      });
    }
    return operatorRender(operators, record, { limit: 2 });
  }

  /**
   * 返回表格行
   * @return {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        name: 'redInfoSerialNumber',
        width: 240,
        renderer: ({ text, record }) => {
          let orderStatus;

          switch (record?.get('orderStatus')) {
            case 'D':
              orderStatus = (
                <Tag color="#D6FFD7" style={{ color: '#19A633' }}>
                  {intl.get('hiop.redInvoiceInfo.view.downloaded').d('已下载')}
                </Tag>
              );
              break;
            case 'S':
              orderStatus = (
                <Tag color="#FFECC4" style={{ color: '#FF8F07' }}>
                  {intl.get('hiop.redInvoiceInfo.view.submitted').d('已提交')}
                </Tag>
              );
              break;
            case 'R':
              orderStatus = (
                <Tag color="#F0F0F0" style={{ color: '#6C6C6C' }}>
                  {intl.get('hiop.redInvoiceInfo.view.revoked').d('已撤销')}
                </Tag>
              );
              break;
            case 'I':
              orderStatus = (
                <Tag color="#DBEEFF" style={{ color: '#3889FF' }}>
                  {intl.get('hiop.redInvoiceInfo.view.issued').d('已开具')}
                </Tag>
              );
              break;
            default:
              break;
          }
          return (
            <>
              {orderStatus}
              <a onClick={() => this.gotoDetail(record)}>{text}</a>
            </>
          );
        },
      },
      { name: 'redInvoiceConfirmStatus' },
      { name: 'redInvoiceDate', width: 150 },
      { name: 'taxDiskNumber', width: 150 },
      { name: 'extensionNumber', width: 150 },
      { name: 'blueInvoiceCode', width: 180 },
      { name: 'blueInvoiceNo', width: 180 },
      { name: 'invoiceAmount', width: 180 },
      { name: 'taxAmount', width: 180 },
      { name: 'buyerName', width: 180 },
      { name: 'buyerTaxNo', width: 180 },
      { name: 'sellerName', width: 150 },
      { name: 'sellerTaxNo', width: 150 },
      { name: 'overdueStatus', width: 110 },
      { name: 'invoiceTypeCode', width: 150 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 150,
        renderer: ({ record }) => this.optionsRender(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const BatchBtn = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={props.color}
          style={props.style}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <Button
        key="getCentralOffice"
        onClick={() => this.getRedInfo()}
        dataSet={this.props.headerDS}
        color={ButtonColor.primary}
      >
        {intl.get('hiop.redInvoiceInfo.button.getCentralOffice').d('获取局端红字信息表')}
      </Button>,
      <BatchBtn
        key="createRedOrder"
        onClick={() => this.handleCreateRedOrder()}
        dataSet={this.props.headerDS}
        color={ButtonColor.default}
        style={{ color: 'rgba(56, 137, 255, 1)' }}
        title={intl.get('hiop.redInvoiceInfo.button.createRedOrder').d('生成红冲订单')}
      />,
      <BatchBtn
        key="createRedRequest"
        onClick={() => this.handleCreateRedRequest()}
        dataSet={this.props.headerDS}
        color={ButtonColor.default}
        style={{ color: 'rgba(56, 137, 255, 1)' }}
        title={intl.get('hiop.redInvoiceInfo.button.createRedRequest').d('生成红冲申请单')}
      />,
    ];
  }

  render() {
    return (
      <>
        <Header
          title={intl.get('hiop.redInvoiceInfo.title.invoiceInfoList').d('企业红字信息表列表')}
        />
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.props.headerDS}
            columns={this.columns}
            className={styles.table}
            queryBar={this.renderQueryBar}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
