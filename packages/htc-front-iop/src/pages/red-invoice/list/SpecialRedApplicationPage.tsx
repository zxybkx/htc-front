/**
 * @Description: 专票红字申请单列表
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-14 09:10:12
 * @LastEditTime: 2020-12-01 09:36:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { Content, Header } from 'components/Page';
import {
  Button,
  DataSet,
  DateTimePicker,
  Form,
  Icon,
  Lov,
  Modal,
  notification,
  Select,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { Col, Row, Tag } from 'choerodon-ui';
import queryString from 'query-string';
import { RouteComponentProps } from 'react-router-dom';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { operatorRender } from 'utils/renderer';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withProps from 'utils/withProps';
import {
  downloadPrintPdfFiles,
  redInvoiceInfoDeleteOrCancel,
  redInvoiceReqUpdateStatus,
  redInvoiceReqUpload,
} from '@src/services/redInvoiceService';
import RedInvoiceRequisitionListDS, {
  RedInvoiceCreateDS,
} from '../stores/RedInvoiceRequisitionListDS';

const organizationId = getCurrentOrganizationId();

interface RedInvoiceRequisitionListPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  headerDS: DataSet;
}

@formatterCollections({
  code: ['hiop.redInvoiceInfo', 'hiop.invoiceWorkbench', 'htc.common', 'hiop.invoiceReq'],
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
export default class SpecialRedApplicationPage extends Component<
  RedInvoiceRequisitionListPageProps
> {
  redInvoiceCreateDS = new DataSet({
    autoQuery: false,
    ...RedInvoiceCreateDS(),
  });

  state = { queryMoreDisplay: false };

  async componentDidMount() {
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet && !queryDataSet.current) {
      const res = await getCurrentEmployeeInfoOut({ tenantId: organizationId });
      if (res && res.content) {
        const empInfo = res.content[0];
        if (empInfo) {
          queryDataSet.current!.set({ companyObj: empInfo });
          this.props.headerDS.query();
        }
      }
    }
  }

  /**
   * 自定义查询
   */
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, dataSet, buttons } = props;
    const { queryMoreDisplay } = this.state;
    if (queryDataSet) {
      const queryMoreArray: JSX.Element[] = [
        <TextField name="sellerName" />,
        <TextField name="buyerName" />,
        <Select name="status" />,
        <TextField name="blueInvoiceCode" />,
        <TextField name="blueInvoiceNo" />,
      ];
      return (
        <div style={{ marginBottom: '0.1rem' }}>
          <Row>
            <Col span={20}>
              <Form columns={3} dataSet={queryDataSet}>
                <Lov name="companyObj" />
                <TextField name="taxpayerNumber" />
                <TextField name="employeeDesc" />
                {/*---*/}
                <DateTimePicker name="redInvoiceDate" />
                <Lov name="employeeName" />
                <TextField name="serialNumber" />
                {queryMoreDisplay && queryMoreArray}
              </Form>
            </Col>
            <Col span={4} style={{ textAlign: 'end' }}>
              <Button
                funcType={FuncType.link}
                onClick={() => this.setState({ queryMoreDisplay: !queryMoreDisplay })}
              >
                <span>
                  {intl.get('hzero.common.button.option').d('更多')}
                  {queryMoreDisplay ? <Icon type="expand_more" /> : <Icon type="expand_less" />}
                </span>
              </Button>
              <Button
                onClick={() => {
                  queryDataSet.reset();
                  queryDataSet.create();
                }}
              >
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Col>
          </Row>
          {buttons}
        </div>
      );
    }
    return <></>;
  }

  /**
   * 创建红字申请单
   * @params {object} record-行记录
   * @params {object} modal
   */
  @Bind()
  async handleCreate(record, modal) {
    const { history } = this.props;
    const validate = await this.redInvoiceCreateDS.validate(false, false);
    if (validate) {
      modal.close();
      const pathname = `/htc-front-iop/red-invoice-requisition/create/${record.get('companyId')}`;
      history.push({
        pathname,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(JSON.stringify(record.toData(true))),
        }),
      });
    }
  }

  /**
   * 取消创建红字申请单
   * @params {object} record-行记录
   * @params {object} modal
   */
  @Bind()
  handleCancel(record, modal) {
    this.redInvoiceCreateDS.remove(record);
    modal.close();
  }

  /**
   * 是否抵扣改变回调
   */
  @Bind()
  async handleDeductionChange(value) {
    if (value === '01') {
      this.redInvoiceCreateDS.current!.set({
        invoiceObj: null,
        invoiceCode: null,
        invoiceNo: null,
      });
    }
  }

  /**
   * 新建红字申请（跳转）
   */
  @Bind()
  handleAddRed() {
    const { queryDataSet } = this.props.headerDS;
    const curQueryInfo = queryDataSet && queryDataSet.current?.toData();
    const { companyId, companyCode, companyName, taxpayerNumber } = curQueryInfo;
    if (companyId && companyCode) {
      const record = this.redInvoiceCreateDS.create(
        { companyId, companyCode, companyName, taxpayerNumber },
        0
      );
      const modal = Modal.open({
        title: intl.get('hiop.redInvoiceInfo.title.createReq').d('新建申请单'),
        children: (
          <Form record={record}>
            <TextField name="companyName" />
            <TextField name="taxpayerNumber" />
            <Select name="applicantType" />
            <Select name="deductionStatus" onChange={this.handleDeductionChange} />
            <Select name="taxType" />
            <Lov name="invoiceObj" />
            <TextField name="invoiceNo" />
          </Form>
        ),
        footer: (
          <div>
            <Button color={ButtonColor.primary} onClick={() => this.handleCreate(record, modal)}>
              {intl.get('hzero.common.button.next').d('下一步')}
            </Button>
            <Button onClick={() => this.handleCancel(record, modal)}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        ),
      });
    }
  }

  /**
   * 查看红字发票申请单
   * @params {object} record-行记录
   */
  @Bind()
  handleGotoDetailPage(record) {
    const { history } = this.props;
    const redInvoiceApplyHeaderId = record.get('redInvoiceApplyHeaderId');
    const pathname = `/htc-front-iop/red-invoice-requisition/detail/${record.get(
      'companyId'
    )}/${redInvoiceApplyHeaderId}`;
    history.push(pathname);
  }

  /**
   * 上传局端
   */
  @Bind()
  async handleUploadLocalSide() {
    const { queryDataSet } = this.props.headerDS;
    const selectedList = this.props.headerDS.selected.map(rec => rec.toData());
    if (selectedList.some(rec => rec.status !== 'N')) {
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
          requisitionHeaderIds: selectedList.map(rec => rec.redInvoiceApplyHeaderId).join(','),
        })
      );
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        this.props.headerDS.query();
      }
    }
  }

  /**
   * 删除/撤销回调
   * @params {string} requisitionHeaderIds-操作的行id
   */
  @Bind()
  async deleteOrCancel(requisitionHeaderIds) {
    const { queryDataSet } = this.props.headerDS;
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
      if (res) {
        notification.success({
          description: '',
          message: res.message,
        });
        this.props.headerDS.query();
      }
    }
  }

  /**
   * 删除/撤销 (批量)
   */
  @Bind()
  async handleDeleteHeaders() {
    const requisitionHeaderIds = this.props.headerDS.selected
      .map(rec => rec.get('redInvoiceApplyHeaderId'))
      .join(',');
    this.deleteOrCancel(requisitionHeaderIds);
  }

  /**
   * 删除/撤销 (单条)
   */
  @Bind()
  async handleDeleteHeadersOpt(record) {
    const { redInvoiceApplyHeaderId } = record.toData();
    this.deleteOrCancel(redInvoiceApplyHeaderId);
  }

  /**
   * 刷新状态回调
   */
  @Bind()
  async updateState(requisitionHeaderIds) {
    const { queryDataSet } = this.props.headerDS;
    if (queryDataSet) {
      const curQueryInfo = queryDataSet.current!.toData();
      const { companyCode, employeeNum } = curQueryInfo;
      const res = getResponse(
        await redInvoiceReqUpdateStatus({
          organizationId,
          companyCode,
          employeeNumber: employeeNum,
          requisitionHeaderIds,
        })
      );
      if (res) {
        notification.success({
          description: '',
          message: intl.get('hiop.redInvoiceInfo.notification.success.fresh').d('刷新成功'),
        });
        this.props.headerDS.query();
      }
    }
  }

  /**
   * 刷新状态（批量）
   */
  @Bind()
  async handleUpdateState() {
    const selectedList = this.props.headerDS.selected.map(record => record.toData());
    if (selectedList.some(rec => !['U'].includes(rec.status))) {
      notification.warning({
        description: '',
        message: '存在状态不为上传的申请单！',
      });
      return;
    }
    const requisitionHeaderIds = selectedList.map(rec => rec.redInvoiceApplyHeaderId).join(',');
    this.updateState(requisitionHeaderIds);
  }

  /**
   * 刷新状态（单条）
   */
  @Bind()
  async handleUpdateStateOpt(record) {
    const { redInvoiceApplyHeaderId } = record.toData();
    this.updateState(redInvoiceApplyHeaderId);
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
   * 返回行操作列
   * @params {object} record-行记录
   */
  @Bind()
  optionsRender(record) {
    const status = record.get('status');
    const editable = ['E', 'R', 'N'].includes(record.get('status'));
    const operators = [
      {
        key: 'editOrView',
        ele: editable ? (
          <Button funcType={FuncType.link} onClick={() => this.handleGotoDetailPage(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </Button>
        ) : (
          <Button funcType={FuncType.link} onClick={() => this.handleGotoDetailPage(record)}>
            {intl.get('hzero.common.button.view').d('查看')}
          </Button>
        ),
        len: 4,
        title: editable
          ? intl.get('hzero.common.button.edit').d('编辑')
          : intl.get('hzero.common.button.view').d('查看'),
      },
      {
        key: 'deleteOrWithdraw',
        ele: (
          <Button funcType={FuncType.link} onClick={() => this.handleDeleteHeadersOpt(record)}>
            {intl.get('hiop.redInvoiceInfo.button.deleteOrWithdraw').d('删除/撤销')}
          </Button>
        ),
        len: 6,
        title: intl.get('hiop.redInvoiceInfo.button.deleteOrWithdraw').d('删除/撤销'),
      },
    ];
    const updateStatusBtn = {
      key: 'refreshStatus',
      ele: (
        <Button funcType={FuncType.link} onClick={() => this.handleUpdateStateOpt(record)}>
          {intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态')}
        </Button>
      ),
      len: 4,
      title: intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态'),
    };
    if (['R', 'I'].includes(status)) {
      // 当状态为撤销和撤销中时去掉（删除撤销按钮）
      const delBtnIndex = operators.findIndex(item => item.key === 'deleteOrWithdraw');
      operators.splice(delBtnIndex, 1);
    }
    if (['U', 'I'].includes(status)) {
      operators.push(updateStatusBtn);
    }
    const downloadBtn = {
      key: 'refreshStatus',
      ele: (
        <Button funcType={FuncType.link} onClick={() => this.handleDownloadPdfFile(record)}>
          {intl.get('hiop.invoiceWorkbench.button.downPrint').d('下载打印')}
        </Button>
      ),
      len: 4,
      title: intl.get('hiop.invoiceWorkbench.button.downPrint').d('下载打印'),
    };
    const curInfoId = record.get('redInvoiceInfoHeaderId');
    if (curInfoId) {
      operators.push(downloadBtn);
    }
    const newOperators = operators.filter(Boolean);
    return operatorRender(newOperators, record, { limit: 2 });
  }

  /**
   * 返回表格行
   * @return {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        name: 'status',
        width: 100,
        renderer: ({ value, text }) => {
          let color = '';
          let textColor = '';
          switch (value) {
            case 'N':
              color = '#DBEEFF';
              textColor = '#3889FF';
              break;
            case 'U':
              color = '#FFECC4';
              textColor = '#FF9D23';
              break;
            case 'A':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            case 'E':
              color = '#FFDCD4';
              textColor = '#FF5F57';
              break;
            case 'Q':
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            default:
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {text}
              </Tag>
            </>
          );
        },
      },
      { name: 'requisitionReason', width: 250 },
      { name: 'blueInvoiceCode', width: 140 },
      { name: 'blueInvoiceNo' },
      { name: 'buyerName', width: 220 },
      { name: 'sellerName', width: 200 },
      { name: 'redInfoSerialNumber', width: 200 },
      { name: 'taxDiskNumber', width: 180 },
      { name: 'extensionNumber' },
      { name: 'employeeName', width: 150 },
      { name: 'uploadEmployeeName', width: 150 },
      { name: 'redInvoiceDate', width: 150 },
      { name: 'serialNumber', width: 200 },
      { name: 'requisitionDescription', width: 150 },
      { name: 'businessNoticeNum', width: 200 },
      { name: 'uploadDate', width: 150 },
      { name: 'resultName' },
      { name: 'errorMessage' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 180,
        renderer: ({ record }) => this.optionsRender(record),
        lock: ColumnLock.right,
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
        >
          {props.title}
        </Button>
      );
    });
    return [
      <Button icon="add" key="addRedInvoiceReq" onClick={() => this.handleAddRed()}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <HeaderButtons
        key="uploadLocalSide"
        onClick={() => this.handleUploadLocalSide()}
        dataSet={this.props.headerDS}
        title={intl.get('hiop.redInvoiceInfo.button.uploadLocalSide').d('上传局端')}
      />,
      <HeaderButtons
        key="updateStatusB"
        onClick={() => this.handleUpdateState()}
        dataSet={this.props.headerDS}
        title={intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态')}
      />,
      <HeaderButtons
        key="deleteOrWithdrawB"
        onClick={() => this.handleDeleteHeaders()}
        dataSet={this.props.headerDS}
        title={intl.get('hiop.redInvoiceInfo.button.deleteOrWithdraw').d('删除/撤销')}
      />,
    ];
  }

  render() {
    return (
      <>
        <Header
          title={intl.get('hiop.redInvoiceInfo.title.applicationList').d('专票红字申请单列表')}
        />
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
