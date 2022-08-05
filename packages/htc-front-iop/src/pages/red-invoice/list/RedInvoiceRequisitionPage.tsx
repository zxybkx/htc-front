/**
 * @Description: 专用红字申请单新建/详情页
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-01 09:10:12
 * @LastEditTime: 2021-03-05 15:51:54
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { Header } from 'components/Page';
import {
  Button,
  Currency,
  DataSet,
  DatePicker,
  DateTimePicker,
  Form,
  Lov,
  message,
  Select,
  Spin,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { RouteComponentProps } from 'react-router-dom';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { Card, Col, Row } from 'choerodon-ui';
import {
  createRedInvoiceReq,
  createRedInvoiceReqLines,
  saveReqInvoice,
  taxInfos,
} from '@src/services/redInvoiceService';
import { observer } from 'mobx-react-lite';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import RedInvoiceRequisitionDS from '../stores/RedInvoiceRequisitionLineDS';
import RedInvoiceRequisitionHeaderDS from '../stores/RedInvoiceRequisitionHeaderDS';
import styles from '../../invoice-workbench/invoiceWorkbench.module.less';

const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  companyId: any;
  headerId: any;
}

interface RedInvoiceRequisitionPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: ['hiop.redInvoiceInfo', 'hiop.invoiceWorkbench', 'htc.common', 'hiop.invoiceReq'],
})
export default class RedInvoiceRequisitionPage extends Component<RedInvoiceRequisitionPageProps> {
  state = {
    empInfo: undefined as any,
    editable: false,
    status: undefined as any,
    isMultipleTaxRate: null,
    listFlag: null,
  };

  /**
   * 判断是否新建
   * @return {boolean} true-新建 false-编辑
   */
  get isCreatePage() {
    const { match } = this.props;
    const { headerId } = match.params;
    return !headerId;
  }

  @Bind()
  calculateNum(record, value) {
    const unitPrice = Number(record.get('unitPrice')) || 0;
    if (unitPrice !== 0) {
      const num = value / unitPrice;
      if (num.toString().length > 8) {
        record.set({
          num: num.toFixed(8),
        });
      } else {
        record.set({ num });
      }
    }
  }

  @Bind()
  setTaxAmount(record, value) {
    if (record.get('deductionAmount') && !isNaN(record.get('deductionAmount'))) {
      record.set({
        taxAmount: ((value - record.get('deductionAmount')) * record.get('taxRate')).toFixed(2),
      });
    } else {
      record.set({
        taxAmount: (value * record.get('taxRate')).toFixed(2),
      });
    }
  }

  @Bind()
  handleZeroTaxRateFlagChange(name, value, dataSet, record) {
    if (name === 'zeroTaxRateFlag') {
      if (['0', '1', '2'].includes(value)) {
        record.set('preferentialPolicyFlag', '1');
        record.set(
          'specialManagementVat',
          dataSet.current!.getField('zeroTaxRateFlag')!.getText(value)
        );
      } else {
        record.set('preferentialPolicyFlag', '0');
        record.set('specialManagementVat', '');
      }
    }
  }

  @Bind()
  setNum(unitPrice, record, detailAmount) {
    if (unitPrice !== 0) {
      const num = detailAmount / unitPrice;
      if (num.toString().length > 8) {
        record.set({
          num: num.toFixed(8),
        });
      } else {
        record.set({ num });
      }
    }
  }

  @Bind()
  handleDeductionAmountChange(record) {
    if (record.get('deductionAmount') && !isNaN(record.get('deductionAmount'))) {
      record.set({
        taxAmount: (
          (record.get('detailAmount') - record.get('deductionAmount')) *
          record.get('taxRate')
        ).toFixed(2),
      });
    } else {
      const unitPrice = record.get('unitPrice') || 0;
      const detailAmount = record.get('detailAmount') || 0;
      this.setNum(unitPrice, record, detailAmount);
      record.set({
        taxAmount: (record.get('detailAmount') * record.get('taxRate')).toFixed(2),
      });
    }
  }

  @Bind()
  handleTaxRateObjChange(name, value, record) {
    if (name === 'taxRateObj') {
      if (!(value && Number(value) === 0)) {
        record.set('zeroTaxRateFlag', '');
        record.set('preferentialPolicyFlag', 0);
      }
      this.handleDeductionAmountChange(record);
    }
  }

  @Bind()
  handleProjectObjChange(name, value, record) {
    if (name === 'projectObj' && value) {
      record.set({
        goodsName: value.invoiceProjectName,
        unit: value.projectUnit,
        specificationModel: value.model,
        unitPrice: value.projectUnitPrice,
        goodsCode: value.commodityNumber,
      });
    }
  }

  linesDS = new DataSet({
    autoQuery: false,
    ...RedInvoiceRequisitionDS(this.isCreatePage),
    events: {
      update: ({ dataSet, record, name, value }) => {
        // 合计金额税额变动
        this.calAmount(dataSet);
        // 金额变动
        if (name === 'detailAmount') {
          this.calculateNum(record, value);
          this.setTaxAmount(record, value);
        }
        // 单价变动、数量变动
        if (['unitPrice', 'num'].includes(name)) {
          const num = Number(record.get('num')) || 0;
          const unitPrice = Number(record.get('unitPrice')) || 0;
          const detailAmount = num * unitPrice;
          record.set({ detailAmount: detailAmount.toFixed(2) });
        }
        // 优惠政策标识
        this.handleZeroTaxRateFlagChange(name, value, dataSet, record);
        // 税率
        this.handleTaxRateObjChange(name, value, record);
        // 自行编码
        this.handleProjectObjChange(name, value, record);
      },
      remove: ({ dataSet }) => {
        if (this.isCreatePage) {
          this.calAmount(dataSet);
        }
      },
    },
  });

  headerDS = new DataSet({
    autoQuery: false,
    ...RedInvoiceRequisitionHeaderDS(this.props.match.params),
    children: {
      redInvoiceRequisitionLines: this.linesDS,
    },
  });

  /**
   * 计算金额
   * @params {object} dataSet-数据源
   */
  @Bind
  calAmount(dataSet) {
    // 合计金额
    let invoiceAmount = 0;
    let taxAmount = 0;
    for (const element of dataSet.toData()) {
      if (element.detailAmount === undefined || element.taxAmount === undefined) {
        return;
      }
      invoiceAmount += element.detailAmount;
      taxAmount += element.taxAmount;
    }
    this.headerDS.current!.set('invoiceAmount', invoiceAmount.toFixed(2));
    this.headerDS.current!.set('taxAmount', taxAmount.toFixed(2));
  }

  /**
   * 税率影响优惠政策标识
   */
  @Bind()
  handleTaxRateNotZero() {
    if (this.linesDS.length > 0) {
      this.linesDS.forEach(line => {
        if (line.get('taxRate') && Number(line.get('taxRate')) !== 0) {
          line.set('preferentialPolicyFlag', 0);
        }
      });
    }
  }

  async componentDidMount() {
    const empRes = await getCurrentEmployeeInfo({
      tenantId,
      companyId: this.props.match.params.companyId,
    });
    const empInfo = empRes && empRes.content[0];
    if (empInfo) {
      this.headerDS = new DataSet({
        autoQuery: false,
        ...RedInvoiceRequisitionHeaderDS({
          ...this.props.match.params,
          companyCode: empInfo.companyCode,
          employeeNumber: empInfo.employeeNum,
          employeeId: empInfo.employeeId,
        }),
        children: {
          redInvoiceRequisitionLines: this.linesDS,
        },
      });
    }

    this.setState({
      empInfo,
    });
    if (!this.isCreatePage) {
      this.headerDS.query().then(res => {
        if (this.headerDS) {
          const { blueInvoiceCode, blueInvoiceNo } = res;
          this.headerDS.current!.set({
            // 'operateType': '1',
            invoiceCode: blueInvoiceCode,
            invoiceNo: blueInvoiceNo,
          });
        }
        const { status, isMultipleTaxRate, listFlag } = res;
        this.setState({
          status,
          isMultipleTaxRate,
          listFlag,
          editable: ['E', 'R', 'N'].includes(status),
        });
      });
    } else {
      this.headerDS.create({}, 0);
      const { search } = this.props.location;
      const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
      if (invoiceInfoStr) {
        const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
        this.handleAddReq(invoiceInfo);
      }
      this.setState({ editable: true });
    }
  }

  /**
   * 红字发票申请单新建
   * @params {object} invoiceInfo-发票信息
   */
  @Bind()
  async handleAddReq(invoiceInfo) {
    const { empInfo } = this.state;
    const { invoiceCode, invoiceNo, deductionStatus, applicantType } = invoiceInfo;
    const params = {
      tenantId,
      invoiceCode,
      invoiceNo,
      companyCode: empInfo.companyCode,
      employeeNumber: empInfo.employeeNum,
      deductionStatus,
      applicantType,
    };
    const headerRes = getResponse(await createRedInvoiceReq(params));
    if (headerRes) {
      const { status, isMultipleTaxRate, listFlag, blueInvoiceCode, blueInvoiceNo } = headerRes;
      const headerData = {
        ...headerRes,
        invoiceCode: blueInvoiceCode,
        invoiceNo: blueInvoiceNo,
      };
      this.headerDS.reset();
      this.headerDS.create({ ...headerData }, 0);
      this.setState({ status, isMultipleTaxRate, listFlag });
    }
    if (deductionStatus !== '01') {
      const lineRes = await createRedInvoiceReqLines(params);
      if (lineRes && lineRes.length > 0) {
        lineRes.forEach(line => this.linesDS.create(line));
      }
    }
  }

  /**
   * 保存红字信息
   */
  @Bind()
  async saveRedInvoice() {
    const { empInfo } = this.state;
    const validateValue = await this.headerDS.validate(false, false);
    if (!validateValue) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    const data = this.headerDS.toData();
    const params = {
      tenantId,
      companyCode: empInfo.companyCode,
      employeeNumber: empInfo.employeeNum,
      dsData: data[0],
    };
    const res = getResponse(await saveReqInvoice(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
    }
  }

  /**
   * 生成红字申请单调接口
   */
  @Bind()
  async createRedInvoice() {
    const res = await this.headerDS.submit();
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get('htc.common.notification.noChange').d('请先修改数据'),
      });
    } else if (res === false) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
    } else if (res.failed === 1) {
      notification.error({
        description: '',
        message: res.message,
      });
    } else if (res) {
      const { history } = this.props;
      const pathname = `/htc-front-iop/red-invoice-requisition/list/`;
      history.push(pathname);
    }
  }

  /**
   * 生成红字申请单
   */
  @Bind()
  async handleSaveIvc() {
    const deductionStatus = this.headerDS.current!.get('deductionStatus');
    if (deductionStatus !== '01') {
      const originalAmount = this.headerDS.current!.get('originalAmount');
      const lineList: any = this.linesDS.toData();
      let totalAmount = 0;
      for (const item of lineList) {
        totalAmount += Math.abs(item.detailAmount);
      }
      if (totalAmount > Math.abs(originalAmount)) {
        notification.error({
          description: '',
          message: intl
            .get('hiop.redInvoiceInfo.notification.message.amountInvalid')
            .d('商品金额不能大于原蓝票金额'),
        });
        return;
      }
    }
    this.createRedInvoice();
  }

  /**
   * 行零税率标识受控于头
   * @params {string} field-标签名
   * @params {object} value-当前值
   */
  @Bind()
  handleTaxRateLovChange(field, value) {
    if (this.linesDS.length > 0) {
      this.linesDS.forEach(line => line.set(field, value));
    }
  }

  /**
   * 金额回调
   * @params {number} value-当前值
   * @params {object} record-行记录
   */
  @Bind()
  handleAmount(value, record) {
    if (value > 0) {
      message.config({
        top: 300,
      });
      message.error('商品金额必须小于0！', undefined, undefined, 'top');
      record.set('detailAmount', -value);
    }
  }

  /**
   * 返回表格行
   * @return {*[]}
   */
  get columns(): ColumnProps[] {
    const { editable, isMultipleTaxRate } = this.state;
    const taxRateIsZero = record =>
      record.get('taxRate') && Number(record.get('taxRate')) === 0 && editable;
    const taxAmountEdit = record =>
      ((record.get('taxRate') && Number(record.get('taxRate')) === 0) ||
        isMultipleTaxRate === 'Y') &&
      editable;
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      {
        name: 'goodsName',
        width: 200,
        editor: record => editable && <TextField onChange={() => record.set('projectObj', '')} />,
      },
      {
        name: 'unit',
        editor: record => editable && <TextField onChange={() => record.set('projectObj', '')} />,
      },
      {
        name: 'specificationModel',
        width: 150,
        editor: record => editable && <TextField onChange={() => record.set('projectObj', '')} />,
      },
      {
        name: 'unitPrice',
        editor: record => editable && <TextField onChange={() => record.set('projectObj', '')} />,
        width: 150,
      },
      {
        name: 'num',
        width: 150,
        // headerStyle: { color: 'red' },
        // header: (_, __, title) => <span style={{ color: 'red' }}>{title}</span>,
        editor: editable,
        renderer: ({ value }) => <span>{value}</span>,
      },
      {
        name: 'detailAmount',
        width: 200,
        // headerStyle: { color: 'red' },
        // header: (_, __, title) => <span style={{ color: 'red' }}>{title}</span>,
        editor: record =>
          editable && <Currency onChange={value => this.handleAmount(value, record)} />,
      },
      {
        name: 'deductionAmount',
        width: 150,
        // headerStyle: { color: 'red' },
        // header: (_, __, title) => <span style={{ color: 'red' }}>{title}</span>,
      },
      { name: 'taxRateObj', width: 150, editor: editable },
      {
        name: 'taxAmount',
        width: 150,
        // headerStyle: { color: 'red' },
        // header: (_, __, title) => <span style={{ color: 'red' }}>{title}</span>,
        editor: record => taxAmountEdit(record),
      },
      { name: 'goodsCode', width: 150 },
      { name: 'projectObj', width: 150, editor: editable },
      {
        name: 'zeroTaxRateFlag',
        width: 150,
        editor: record => taxRateIsZero(record),
      },
      { name: 'preferentialPolicyFlag', width: 110 },
      { name: 'specialManagementVat', width: 110 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          return [
            <Button
              key="delete"
              funcType={FuncType.link}
              disabled={!editable}
              onClick={() => this.linesDS.delete(record)}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 专票红字申请单新增
   */
  @Bind()
  handleAddLine() {
    const { empInfo } = this.state;
    const extNumber = this.headerDS.current!.get('extensionNumber');
    const invoiceType = this.headerDS.current!.get('invoiceTypeCode');
    const applicantType = this.headerDS.current!.get('applicantType');
    const buyerName = this.headerDS.current!.get('buyerName');
    const sellerName = this.headerDS.current!.get('sellerName');
    // const invoiceDate = this.headerDS.current!.get('invoiceDate');
    const customerName = applicantType === '01' ? sellerName : buyerName;
    if (!extNumber || !invoiceType || !customerName) {
      notification.info({
        description: '',
        message: intl.get('htc.common.validation.completeData').d('请先完善头数据'),
      });
      return;
    }
    this.linesDS.create(
      {
        companyId: empInfo.companyId,
        companyCode: empInfo.companyCode,
      },
      0
    );
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const { status, listFlag } = this.state;
    const AddBtn = observer((props: any) => {
      const isDisabled = props.dataSet!.some(
        record => record.get('lineNum') && Number(listFlag === 1)
      );
      return (
        <Button
          icon={props.icon}
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.link}
          style={{ marginLeft: 10 }}
        >
          {props.title}
        </Button>
      );
    });
    if (['U', 'A', 'E'].includes(status)) {
      return [];
    } else {
      return [
        <AddBtn
          dataSet={this.linesDS}
          icon="add"
          key="add"
          onClick={() => this.handleAddLine()}
          title={intl.get('hzero.common.button.add').d('新增')}
        />,
        // TableButtonType.delete,
      ];
    }
  }

  /**
   * 返回公司信息
   * @returns {string}
   */
  get renderCompanyDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.companyName || ''}`;
    }
    return '';
  }

  /**
   * 返回员工信息
   * @returns {string}
   */
  get renderEmployeeDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.employeeNum || ''}-${empInfo.employeeName ||
        ''}-${empInfo.mobile || ''}`;
    }
    return '';
  }

  /**
   * 申请方改变回调
   */
  @Bind()
  handleApplicantTypeChange(value) {
    if (value === '02') {
      this.headerDS.current!.set({
        buyerName: null,
        buyerTaxNo: null,
      });
    }
  }

  /**
   * 是否抵扣改变回调
   */
  @Bind()
  async handleDeductionChange(value) {
    const { empInfo } = this.state;
    if (value === '01') {
      this.headerDS.current!.set({
        invoiceObj: null,
        invoiceCode: null,
        invoiceNo: null,
        blueInvoiceCode: '000000000000',
        blueInvoiceNo: '00000000',
        invoiceDate: null,
        invoiceAmount: null,
        taxAmount: null,
        sellerName: null,
        sellerTaxNo: null,
        goodsVersion: '33.0',
        buyerName: empInfo.companyName,
        buyerTaxNo: empInfo.taxpayerNumber,
      });
      const params = {
        tenantId,
        companyId: empInfo.companyId,
      };
      const res = getResponse(await taxInfos(params));
      if (res && res.content[0]) {
        this.headerDS.current!.set('taxDiskNumber', res.content[0].taxDiskNumber);
      }
      this.linesDS.loadData([]);
    }
  }

  /**
   * 自定义查询条
   */
  @Bind()
  renderQueryBar(props) {
    const { buttons } = props;
    return (
      <div className={styles.containTable}>
        <div className={styles.containTable}>
          <h3 style={{ display: 'inline' }}>
            <b>{intl.get('hiop.invoiceWorkbench.title.commodityInfo').d('商品信息')}</b>
          </h3>
          {buttons}
        </div>
        <div className={styles.tableTitleRight}>
          <p>
            {intl.get('hiop.redInvoiceInfo.title.InvoiceAmount').d('合计金额：')}
            <span>{this.headerDS.current?.get('invoiceAmount')}</span>
          </p>
          <p>
            {intl.get('hiop.invoiceWorkbench.label.totalTax').d('合计税额：')}
            <span>{this.headerDS.current?.get('taxAmount')}</span>
          </p>
        </div>
      </div>
    );
  }

  render() {
    const { empInfo } = this.state;
    return (
      <>
        <Header
          backPath="/htc-front-iop/red-invoice-requisition/list"
          title={intl.get('hiop.redInvoiceInfo.title.specialAppliaction').d('专票红字申请单')}
        >
          <Button
            key="save"
            onClick={() => this.saveRedInvoice()}
            disabled={this.isCreatePage || !this.state.editable}
          >
            {intl.get('hiop.redInvoiceInfo.button.saveRedReq').d('保存红字申请单')}
          </Button>
          <Button key="create" onClick={() => this.handleSaveIvc()} disabled={!this.isCreatePage}>
            {intl.get('hiop.redInvoiceInfo.button.createRedReq').d('生成红字申请单')}
          </Button>
        </Header>
        <div style={{ overflow: 'auto' }}>
          <Card style={{ marginTop: 10 }}>
            <Form columns={4} dataSet={this.headerDS}>
              <TextField
                label={intl.get('htc.common.label.companyName').d('所属公司')}
                value={this.renderCompanyDesc}
              />
              <TextField
                label={intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号')}
                value={empInfo && empInfo.taxpayerNumber}
              />
              <Select name="applicantType" onChange={this.handleApplicantTypeChange} />
              <Select name="deductionStatus" onChange={this.handleDeductionChange} />
              <Select name="taxType" />
              <Lov name="invoiceObj" />
              <TextField name="invoiceNo" />
            </Form>
          </Card>
          <Card style={{ marginTop: 10 }}>
            <Spin dataSet={this.headerDS}>
              <Form columns={4} dataSet={this.headerDS} labelTooltip={Tooltip.overflow}>
                <Lov name="uploadEmployeeNameObj" />
                <Select name="requisitionReasonObj" />
                <TextField name="requisitionDescription" />
                <Select name="status" />
                {/*---*/}
                <TextField name="goodsVersion" />
                <DateTimePicker name="redInvoiceDate" />
                <TextField name="serialNumber" />
                <Select name="infoType" />
                {/*---*/}
                <Select name="businessTaxMarkCode" />
                <Select name="operateType" />
                <TextField name="taxDiskNumber" />
                <Lov
                  name="extensionNumberObj"
                  onChange={value => this.handleTaxRateLovChange('extNumber', value.value)}
                />
              </Form>
              <Row gutter={8}>
                <Col span={12}>
                  <div style={{ backgroundColor: '#f6f6f6', padding: '10px 20px 0 20px' }}>
                    <h3>
                      <b>{intl.get('hiop.invoiceWorkbench.label.buyer').d('购买方')}</b>
                    </h3>
                    <Form dataSet={this.headerDS}>
                      <TextField name="buyerName" />
                      <TextField name="buyerTaxNo" />
                    </Form>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#f6f6f6', padding: '10px 20px 0 20px' }}>
                    <h3>
                      <b>{intl.get('hiop.invoiceWorkbench.label.seller').d('销售方')}</b>
                    </h3>
                    <Form dataSet={this.headerDS}>
                      <TextField name="sellerName" />
                      <TextField name="sellerTaxNo" />
                    </Form>
                  </div>
                </Col>
              </Row>
              <Form columns={4} dataSet={this.headerDS} style={{ marginTop: 10 }}>
                <Select name="invoiceTypeCode" />
                <TextField name="blueInvoiceCode" />
                <TextField name="blueInvoiceNo" />
                <DatePicker name="invoiceDate" />
              </Form>
            </Spin>
          </Card>
          <Card style={{ marginTop: 10 }}>
            <Table
              buttons={this.buttons}
              dataSet={this.linesDS}
              columns={this.columns}
              queryBar={this.renderQueryBar}
              style={{ height: 400 }}
            />
          </Card>
        </div>
      </>
    );
  }
}
