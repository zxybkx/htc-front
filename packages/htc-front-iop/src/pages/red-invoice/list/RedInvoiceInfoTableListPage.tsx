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
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import {
  DataSet,
  Button,
  Form,
  Lov,
  Output,
  TextField,
  DateTimePicker,
  Table,
  Select,
  notification,
} from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import queryString from 'query-string';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import { operatorRender } from 'utils/renderer';
import { getCurrentEmployeeInfoOut } from '@common/services/commonService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import {
  redInvoiceCreateRedOrder,
  downloadPrintPdfFiles,
  redInvoiceCreateRequisition,
} from '@src/services/redInvoiceService';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import RedInvoiceInfoTableListDS from '../stores/RedInvoiceInfoTableListDS';

const modelCode = 'hiop.redInvoice';
const organizationId = getCurrentOrganizationId();

interface RedInvoiceRequisitionListPageProps {
  dispatch: Dispatch<any>;
  headerDS: DataSet;
}

@formatterCollections({
  code: [modelCode],
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
export default class RedInvoiceRequisitionListPage extends Component<RedInvoiceRequisitionListPageProps> {
  async componentDidMount() {
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet && !queryDataSet.current) {
      const res = await getCurrentEmployeeInfoOut({ tenantId: organizationId });
      if (res && res.content) {
        const empInfo = res.content[0];
        if (empInfo) {
          queryDataSet.current!.set({ companyObj: empInfo });
        }
        const { companyId } = empInfo;
        const taxDiskRes = await queryUnifyIdpValue('HIOP.TAX_DISK_NUMBER', { companyId });
        if (taxDiskRes) {
          const taxNumberInfo = taxDiskRes[0];
          if (taxNumberInfo) {
            queryDataSet.current!.set({ taxDiskNumberObj: taxNumberInfo });
          }
        }
      }
    }
  }

  invoiceTypeFilter = (record) => {
    return ['0', '52'].includes(record.get('value'));
  };

  // 自定义查询
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, dataSet, buttons } = props;
    if (queryDataSet) {
      return (
        <>
          <Form columns={6} dataSet={queryDataSet}>
            <Lov name="companyObj" colSpan={2} />
            <Output name="employeeDesc" colSpan={2} />
            <Output name="taxpayerNumber" colSpan={2} />
            <DateTimePicker name="redInvoiceDateFrom" newLine colSpan={1} />
            <DateTimePicker name="redInvoiceDateTo" colSpan={1} />
            <Lov name="taxDiskNumberObj" colSpan={2} />
            <TextField name="extensionNumber" colSpan={2} />
            <Select name="invoiceType" newLine colSpan={1} optionsFilter={this.invoiceTypeFilter} />
            <Select name="overdueStatus" colSpan={1} />
            {/* <TextField name="businessNoticeNum" colSpan={2} /> */}
            {/* <Select name="resultName" colSpan={2} /> */}
          </Form>
          <Row type="flex" justify="space-between">
            <Col span={18}>{buttons}</Col>
            <Col span={6} style={{ textAlign: 'end', marginBottom: '2px' }}>
              <Button
                onClick={() => {
                  queryDataSet.reset();
                  queryDataSet.create();
                }}
              >
                {intl.get('hzero.c7nProUI.Table.reset_button').d('重置')}
              </Button>
              <Button
                color={ButtonColor.primary}
                onClick={() => {
                  dataSet.query();
                }}
              >
                {intl.get('hzero.c7nProUI.Table.query_button').d('查询')}
              </Button>
            </Col>
          </Row>
        </>
      );
    }
    return <></>;
  }

  /**
   * 获取局端红字信息表
   * @returns
   */
  @Bind()
  async getRedInfo() {
    const { dispatch } = this.props;
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet) {
      const queryData = queryDataSet.current!.toData();
      const {
        companyCode,
        employeeNum,
        taxpayerNumber,
        taxDiskNumber,
        extensionNumber,
      } = queryData;
      if (!taxDiskNumber) {
        notification.warning({
          description: '',
          message: intl.get(`${modelCode}.view.success`).d('请选择金税盘编号'),
        });
        return;
      }
      const redInfo = {
        companyCode,
        employeeNumber: employeeNum,
        taxpayerNumber,
        goldenTaxDiskNumber: taxDiskNumber,
        extensionNumber,
      };
      dispatch(
        routerRedux.push({
          pathname: '/htc-front-iop/red-invoice-info/SynchronizeRedInfoList',
          search: queryString.stringify({
            redInfo: encodeURIComponent(JSON.stringify(redInfo)),
          }),
        })
      );
    }
  }

  /**
   * 生成红冲订单
   * @returns
   */
  @Bind()
  async handleCreateRedOrder() {
    const { queryDataSet } = this.props.headerDS;

    // if (this.headerDS.selected.length <= 0) {
    //   notification.success({
    //     description: '',
    //     message: '请勾选红字信息表！',
    //   });
    // }

    const redInvoiceInfoHeaderIds = this.props.headerDS.selected
      .map((rec) => rec.get('redInvoiceInfoHeaderId'))
      .join(',');
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
        if (res.failed === 1) {
          notification.error({
            description: '',
            message: res.message,
          });
          return;
        }
        if (!res.message) {
          notification.success({
            description: '',
            message: '生成成功！',
          });
        }
        this.props.headerDS.query();
        this.props.headerDS.setQueryParameter('resultName', res.resultName);
      }
    }
  }

  /**
   * 生成红冲申请单
   * @returns
   */
  @Bind()
  async handleCreateRedRequest() {
    const companyCode = this.props.headerDS.current!.get('companyCode');
    const employeeNum =
      this.props.headerDS.queryDataSet &&
      this.props.headerDS.queryDataSet.current!.get('employeeNum');
    const redInvoiceInfoHeaderIds = this.props.headerDS.selected
      .map((rec) => rec.get('redInvoiceInfoHeaderId'))
      .join(',');
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
        message: intl.get(`${modelCode}.view.success`).d('刷新成功'),
      });
      this.props.headerDS.query();
    }
  }

  // 下载红字发票信息表
  @Bind()
  async handleDownloadPdfFile(record) {
    const ids = record.get('redInvoiceInfoHeaderId');
    // const reportCode = "IOP.RED_INVOCIE_INFO";
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
        if (resFile.failed === 1) {
          notification.error({
            description: '',
            message: resFile.message,
          });
          return;
        }
        const blob = new Blob([resFile]); // 字节流
        if (window.navigator.msSaveBlob) {
          try {
            window.navigator.msSaveBlob(blob, '开具红字增值税专用发票信息表.pdf');
          } catch (e) {
            notification.error({
              description: '',
              message: intl.get(`${modelCode}.view.ieUploadInfo`).d('下载失败'),
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

  @Bind()
  gotoDetail(record) {
    const { dispatch } = this.props;
    const headerId = record.get('redInvoiceInfoHeaderId');
    const companyId = record.get('companyId');
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-iop/red-invoice-info/detail/${companyId}/${headerId}`,
      })
    );
  }

  @Bind()
  optionsRender(record) {
    const operators = [
      {
        key: 'detail',
        ele: (
          <a onClick={() => this.gotoDetail(record)}>
            {intl.get(`${modelCode}.button.detail`).d('详情')}
          </a>
        ),
        len: 4,
        title: intl.get(`${modelCode}.button.detail`).d('详情'),
      },
      {
        key: 'download',
        ele: (
          <a onClick={() => this.handleDownloadPdfFile(record)}>
            {intl.get(`${modelCode}.button.download`).d('导出文件')}
          </a>
        ),
        len: 4,
        title: intl.get(`${modelCode}.button.download`).d('导出文件'),
      },
    ];
    return operatorRender(operators, record);
  }

  get columns(): ColumnProps[] {
    return [
      { name: 'redInfoSerialNumber', width: 200 },
      { name: 'orderStatus', width: 120 },
      { name: 'redInvoiceDate', width: 150 },
      { name: 'taxDiskNumber', width: 150 },
      { name: 'extensionNumber', width: 150 },
      { name: 'blueInvoiceCode', width: 180 },
      { name: 'blueInvoiceNo', width: 180 },
      {
        name: 'invoiceAmount',
        width: 180,
        headerStyle: { color: 'red' },
        align: ColumnAlign.right,
      },
      { name: 'taxAmount', width: 180, headerStyle: { color: 'red' }, align: ColumnAlign.right },
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
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <Button
        key="uploadLocalSide"
        onClick={() => this.getRedInfo()}
        dataSet={this.props.headerDS}
        color={ButtonColor.primary}
      >
        {intl.get(`${modelCode}.button.uploadLocalSide`).d('获取局端红字信息表')}
      </Button>,
      <BatchBtn
        key="createRedOrder"
        onClick={() => this.handleCreateRedOrder()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.createRedOrder`).d('生成红冲订单')}
      />,
      <BatchBtn
        key="createRedRequest"
        onClick={() => this.handleCreateRedRequest()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.createRedRequest`).d('生成红冲申请单')}
      />,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('企业红字信息表列表')} />
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.props.headerDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
