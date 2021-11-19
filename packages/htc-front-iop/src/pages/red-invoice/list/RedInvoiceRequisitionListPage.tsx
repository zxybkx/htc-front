/*
 * @Description: 专用红字申请单新建/详情页
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-14 09:10:12
 * @LastEditTime: 2020-12-01 09:36:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
// import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
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
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { operatorRender } from 'utils/renderer';
import { getCurrentEmployeeInfoOut } from '@common/services/commonService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withProps from 'utils/withProps';
import {
  redInvoiceReqUpdateStatus,
  redInvoiceReqUpload,
  redInvoiceInfoDeleteOrCancel,
  downloadPrintPdfFiles,
} from '@src/services/redInvoiceService';
import RedInvoiceRequisitionListDS from '../stores/RedInvoiceRequisitionListDS';

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
      ...RedInvoiceRequisitionListDS(),
    });
    return { headerDS };
  },
  { cacheState: true }
)
export default class RedInvoiceRequisitionListPage extends Component<RedInvoiceRequisitionListPageProps> {
  state = {};

  async componentDidMount() {
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet && !queryDataSet.current) {
      const res = await getCurrentEmployeeInfoOut({ tenantId: organizationId });
      if (res && res.content) {
        const empInfo = res.content[0];
        if (empInfo) {
          queryDataSet.current!.set({ companyObj: empInfo });
        }
      }
    }
  }

  // 查询条默认值
  @Bind()
  setQueryLovDefaultValue(queryDataSet, empInfo) {
    if (empInfo && empInfo.length > 0) {
      const { companyCode, employeeNum, employeeName, mobile, email, taxpayerNumber } = empInfo[0];
      const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
      queryDataSet.getField('companyObj')!.set('defaultValue', empInfo[0]);
      queryDataSet.getField('employeeDesc')!.set('defaultValue', employeeDesc);
      queryDataSet.getField('email')!.set('defaultValue', email);
      queryDataSet.getField('taxpayerNumber')!.set('defaultValue', taxpayerNumber);
    }
    queryDataSet.reset();
    queryDataSet.create({}, 0);
  }

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

            <DateTimePicker name="redInvoiceDateFrom" newLine colSpan={2} />
            <DateTimePicker name="redInvoiceDateTo" colSpan={2} />
            <Lov name="employeeName" colSpan={2} />

            <TextField name="serialNumber" newLine colSpan={2} />
            <TextField name="sellerName" colSpan={2} />
            <TextField name="buyerName" colSpan={2} />

            <Select name="status" colSpan={3} newLine />
            {/* <Lov name="blueInvoiceObj" colSpan={1} /> */}
            <TextField name="blueInvoiceCode" colSpan={1} />
            <TextField name="blueInvoiceNo" colSpan={1} />
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
   * 新建红字申请（跳转）
   * @returns
   */
  @Bind()
  handleAddRed() {
    const { queryDataSet } = this.props.headerDS;
    const curQueryInfo = queryDataSet && queryDataSet.current?.toData();
    if (curQueryInfo.companyId) {
      const pathname = `/htc-front-iop/red-invoice-requisition/create/${curQueryInfo.companyId}`;
      this.props.dispatch(
        routerRedux.push({
          pathname,
        })
      );
    }
  }

  // 查看红字发票申请单
  @Bind()
  handleGotoDetailPage(record) {
    const redInvoiceRequisitionHeaderId = record.get('redInvoiceRequisitionHeaderId');
    const pathname = `/htc-front-iop/red-invoice-requisition/detail/${record.get(
      'companyId'
    )}/${redInvoiceRequisitionHeaderId}`;
    this.props.dispatch(
      routerRedux.push({
        pathname,
      })
    );
  }

  /**
   * 上传局端
   * @returns
   */
  @Bind()
  async handleUploadLocalSide() {
    const { queryDataSet } = this.props.headerDS;
    const selectedList = this.props.headerDS.selected.map((rec) => rec.toData());
    if (selectedList.some((rec) => rec.status !== 'N')) {
      notification.warning({
        description: '',
        message: '存在状态不为新建的申请单！',
      });
      return;
    }
    if (queryDataSet) {
      const curQueryInfo = queryDataSet.current!.toData();
      const { companyCode, employeeNum } = curQueryInfo;
      const res = getResponse(
        await redInvoiceReqUpload({
          organizationId,
          companyCode,
          employeeNumber: employeeNum,
          requisitionHeaderIds: selectedList
            .map((rec) => rec.redInvoiceRequisitionHeaderId)
            .join(','),
        })
      );
      if (res && res.failed === 1) {
        notification.error({
          description: '',
          message: res.message,
        });
      } else {
        this.props.headerDS.query();
      }
    }
  }

  // 删除/撤销
  @Bind()
  async handleDeleteHeaders() {
    const { queryDataSet } = this.props.headerDS;
    const requisitionHeaderIds = this.props.headerDS.selected
      .map((rec) => rec.get('redInvoiceRequisitionHeaderId'))
      .join(',');
    if (queryDataSet) {
      const curQueryInfo = queryDataSet.current!.toData();
      const { companyCode, employeeNum } = curQueryInfo;
      const res = getResponse(
        await redInvoiceInfoDeleteOrCancel({
          organizationId,
          companyCode,
          employeeNumber: employeeNum,
          requisitionHeaderIds,
        })
      );
      if (res && res.failed === 1) {
        notification.error({
          description: '',
          message: res.message,
        });
      } else {
        this.props.headerDS.query();
      }
    }
  }

  // 删除/撤销（操作）
  @Bind()
  async handleDeleteHeadersOpt(record) {
    const { queryDataSet } = this.props.headerDS;
    const { redInvoiceRequisitionHeaderId } = record.toData();
    if (queryDataSet) {
      const curQueryInfo = queryDataSet.current!.toData();
      const { companyCode, employeeNum } = curQueryInfo;
      const res = getResponse(
        await redInvoiceInfoDeleteOrCancel({
          organizationId,
          companyCode,
          employeeNumber: employeeNum,
          requisitionHeaderIds: redInvoiceRequisitionHeaderId,
        })
      );
      if (res && res.failed === 1) {
        notification.error({
          description: '',
          message: res.message,
        });
      } else {
        this.props.headerDS.query();
      }
    }
  }

  // 刷新状态
  @Bind()
  async handleUpdateState() {
    const { queryDataSet } = this.props.headerDS;
    const selectedList = this.props.headerDS.selected.map((record) => record.toData());
    if (selectedList.some((rec) => rec.status !== 'U' && rec.status !== 'A')) {
      notification.warning({
        description: '',
        message: '存在状态不为上传和批准的申请单！',
      });
      return;
    }
    if (queryDataSet) {
      const curQueryInfo = queryDataSet.current!.toData();
      const { companyCode, employeeNum } = curQueryInfo;
      const res = getResponse(
        await redInvoiceReqUpdateStatus({
          organizationId,
          companyCode,
          employeeNumber: employeeNum,
          requisitionHeaderIds: selectedList
            .map((rec) => rec.redInvoiceRequisitionHeaderId)
            .join(','),
        })
      );
      if (res && res.failed === 1) {
        notification.error({
          description: '',
          message: res.message,
        });
      } else {
        this.props.headerDS.query();
      }
    }
  }

  // 刷新状态（操作）
  @Bind()
  async handleUpdateStateOpt(record) {
    // console.dir(record);
    const { queryDataSet } = this.props.headerDS;
    // const redInvoiceRequisitionHeaderList = [record];
    const { redInvoiceRequisitionHeaderId } = record.toData();
    if (queryDataSet) {
      const curQueryInfo = queryDataSet.current!.toData();
      const { companyCode, employeeNum } = curQueryInfo;
      const res = getResponse(
        await redInvoiceReqUpdateStatus({
          organizationId,
          companyCode,
          employeeNumber: employeeNum,
          requisitionHeaderIds: redInvoiceRequisitionHeaderId,
        })
      );
      if (res && res.failed === 1) {
        notification.error({
          description: '',
          message: res.message,
        });
      } else {
        this.props.headerDS.query();
      }
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
  optionsRender(record) {
    const editable = ['E', 'R', 'N'].includes(record.get('status')) ? 1 : 0;
    const operators = [
      {
        key: 'editOrView',
        ele: editable ? (
          <a onClick={() => this.handleGotoDetailPage(record)}>
            {intl.get(`${modelCode}.button.editOrView`).d('编辑')}
          </a>
        ) : (
          <a onClick={() => this.handleGotoDetailPage(record)}>
            {intl.get(`${modelCode}.button.editOrView`).d('查看')}
          </a>
        ),
        len: 4,
        title: editable
          ? intl.get(`${modelCode}.button.editOrView`).d('编辑')
          : intl.get(`${modelCode}.button.editOrView`).d('查看'),
      },
      {
        key: 'deleteOrWithdraw',
        ele: (
          <a onClick={() => this.handleDeleteHeadersOpt(record)}>
            {intl.get(`${modelCode}.button.deleteOrWithdraw`).d('删除/撤销')}
          </a>
        ),
        len: 4,
        title: intl.get(`${modelCode}.button.deleteOrWithdraw`).d('删除/撤销'),
      },
    ];
    const editOrViewBtn = {
      key: 'refreshStatus',
      ele: (
        <a onClick={() => this.handleUpdateStateOpt(record)}>
          {intl.get(`${modelCode}.button.refreshStatus`).d('刷新状态')}
        </a>
      ),
      len: 4,
      title: intl.get(`${modelCode}.button.refreshStatus`).d('刷新状态'),
    };
    if (editable) {
      operators.push(editOrViewBtn);
    }
    const updateStatusBtn = {
      key: 'refreshStatus',
      ele: (
        <a onClick={() => this.handleUpdateStateOpt(record)}>
          {intl.get(`${modelCode}.button.refreshStatus`).d('刷新状态')}
        </a>
      ),
      len: 4,
      title: intl.get(`${modelCode}.button.refreshStatus`).d('刷新状态'),
    };
    const curStatus = record.get('status');
    const updateStatusFlag = curStatus === 'U' || curStatus === 'A' ? 1 : 0;
    if (updateStatusFlag) {
      operators.push(updateStatusBtn);
    }
    const downloadBtn = {
      key: 'refreshStatus',
      ele: (
        <a onClick={() => this.handleDownloadPdfFile(record)}>
          {intl.get(`${modelCode}.button.download`).d('下载打印')}
        </a>
      ),
      len: 4,
      title: intl.get(`${modelCode}.button.download`).d('下载打印'),
    };

    const curInfoId = record.get('redInvoiceInfoHeaderId');
    const curInfoIdFlag = curInfoId ? 1 : 0;
    if (curInfoIdFlag) {
      operators.push(downloadBtn);
    }
    const newOperators = operators.filter(Boolean);
    return operatorRender(newOperators, record, { limit: 2 });
  }

  get columns(): ColumnProps[] {
    return [
      { name: 'status', width: 180 },
      { name: 'requisitionReason', width: 150 },
      { name: 'blueInvoiceCode', width: 180 },
      { name: 'blueInvoiceNo', width: 180 },
      { name: 'buyerName', width: 150 },
      { name: 'sellerName', width: 150 },
      { name: 'redInfoSerialNumber', width: 200 },
      { name: 'taxDiskNumber', width: 180 },
      { name: 'extensionNumber', width: 180 },
      { name: 'employeeName', width: 110 },
      { name: 'uploadEmployeeName', width: 110 },
      { name: 'redInvoiceDate', width: 150 },
      { name: 'serialNumber', width: 200 },
      { name: 'requisitionDescription', width: 150 },
      { name: 'businessNoticeNum', width: 200 },
      { name: 'uploadDate', width: 150 },
      { name: 'resultName', width: 150 },
      { name: 'errorMessage', width: 150 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 160,
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
    const HeaderButtons = observer((props: any) => {
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
      <Button key="addRedInvoiceReq" onClick={() => this.handleAddRed()}>
        {intl.get(`${modelCode}.button.addCreditNote`).d('新建')}
      </Button>,
      <HeaderButtons
        key="uploadLocalSide"
        onClick={() => this.handleUploadLocalSide()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.uploadLocalSide`).d('上传局端')}
      />,
      <HeaderButtons
        key="deleteOrWithdrawB"
        onClick={() => this.handleDeleteHeaders()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.layoutPush`).d('删除/撤销')}
      />,
      <HeaderButtons
        key="updateStatusB"
        onClick={() => this.handleUpdateState()}
        dataSet={this.props.headerDS}
        title={intl.get(`${modelCode}.button.updateStatus`).d('刷新状态')}
      />,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('专票红字申请单列表')} />
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
