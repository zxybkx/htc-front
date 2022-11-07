/**
 * @Description:发票发票红冲
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-30 15:59:22
 * @LastEditTime: 2021-09-26 16:32:34
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { RouteComponentProps } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@htccommon/utils/utils';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { Dispatch } from 'redux';
import {
  Button,
  Currency,
  DataSet,
  Form,
  Icon,
  Lov,
  message,
  Modal,
  Output,
  Select,
  Table,
  TextArea,
  TextField,
} from 'choerodon-ui/pro';
import { Card, Col, Row } from 'choerodon-ui';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnAlign, ColumnLock, SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import { batchInvalid, batchSave, review } from '@src/services/invoiceOrderService';
import { isEmpty } from 'lodash';
import InvoiceRedFlushHeaderDS from '../stores/InvoiceRedFlushHeaderDS';
import InvoiceRedFlushLineDS from '../stores/InvoiceRedFlushLineDS';
import RedInvoiceInfoLinesDS from '../stores/RedInvoiceInfoLineDS';
import styles from '../../invoice-workbench/invoiceWorkbench.module.less';

const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

interface InvoiceVoidPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  match: any;
}

@formatterCollections({
  code: [
    'hiop.invoiceWorkbench',
    'htc.common',
    'hiop.invoiceReq',
    'hiop.invoiceRedFlush',
    'hiop.customerInfo',
  ],
})
export default class InvoiceRedFlushPage extends Component<InvoiceVoidPageProps> {
  invoiceRedFlushLineDS = new DataSet({
    autoQuery: false,
    ...InvoiceRedFlushLineDS(this.props.match.params),
  });

  invoiceRedFlushHeaderDS = new DataSet({
    autoQuery: false,
    ...InvoiceRedFlushHeaderDS(this.props.match.params),
  });

  redInvoiceInfoLinesDS = new DataSet({
    autoQuery: false,
    ...RedInvoiceInfoLinesDS(),
  });

  state = {
    invoiceVariety: '',
    redFinished: false,
    empInfo: {} as any,
    listFlag: null,
    taxIncludedFlag: null,
    redRemainAmount: 0,
    originTotalAmount: 0,
    showMore: false,
  };

  /**
   * 查询行
   */
  @Bind()
  queryLines() {
    this.invoiceRedFlushLineDS.query().then(lineRes => {
      if (isEmpty(lineRes)) {
        this.setState({ redFinished: true });
        this.invoiceRedFlushHeaderDS.current!.set({ readonly: true });
        notification.warning({
          description: '',
          message: intl
            .get('hiop.invoiceRedFlush.notification.queryInfo')
            .d('该蓝票已经存在未完成的红冲订单！'),
        });
      } else {
        const { taxIncludedFlag, redRemainAmount, originTotalAmount } = lineRes[0];
        this.setState({
          taxIncludedFlag,
          redRemainAmount,
          originTotalAmount,
        });
      }
    });
  }

  /**
   * 渲染备注
   */
  @Bind()
  renderRemark() {
    const blueInvoiceCode = this.invoiceRedFlushHeaderDS.current?.get('blueInvoiceCode');
    const blueInvoiceNo = this.invoiceRedFlushHeaderDS.current?.get('blueInvoiceNo');
    return `对应正数发票代码:${blueInvoiceCode}号码:${blueInvoiceNo}`;
  }

  async componentDidMount() {
    const { match } = this.props;
    const { invoicingReqHeaderId, companyId } = match.params;
    const { queryDataSet } = this.invoiceRedFlushHeaderDS;
    if (queryDataSet) {
      const employeeInfo = await getCurrentEmployeeInfo({ tenantId, companyId });
      const currentEmployee = employeeInfo && employeeInfo.content[0];
      const { companyCode, employeeNum, employeeName, mobile } = currentEmployee;
      const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
      queryDataSet.current!.set({ companyObj: currentEmployee });
      queryDataSet.current!.set({ employeeDesc });
      this.invoiceRedFlushHeaderDS.create({}, 0);
      this.invoiceRedFlushHeaderDS.query().then(async res => {
        if (res) {
          const { invoiceVariety, listFlag, invoicingOrderId } = res;
          if (invoicingReqHeaderId) {
            this.invoiceRedFlushLineDS.setQueryParameter('orderHeaderId', invoicingOrderId);
          }
          if (invoiceVariety !== '0' && invoiceVariety !== '52') {
            this.queryLines();
          }
          this.setState({ invoiceVariety, listFlag });
          this.invoiceRedFlushHeaderDS.current!.set('redInvoice', '蓝字发票');
          this.invoiceRedFlushHeaderDS.current!.set('remark', this.renderRemark());
        }
      });
      this.setState({ empInfo: currentEmployee });
    }
  }

  /**
   * 计算金额
   * @params {number} value-当前值
   * @params {object} record-行记录
   * @params {string} name-标签名
   * @params {number} type 1-金额 2-税额
   */
  @Bind()
  handleAmount(value, record, name, type) {
    if (value > 0) {
      let label = '';
      if (type === 1) {
        label = '金额';
      } else {
        label = '税额';
      }
      message.config({
        top: 300,
      });
      message.error(`${label}必须小于0！`, undefined, undefined, 'top');
      record.set(name, -value);
    }
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    const { listFlag } = this.state;
    const judgeEdit = record => Number(listFlag) !== 1 || !record.get('invoicingOrderHeaderId');
    const judgeTaxMount = record =>
      Number(listFlag) === 1 && record.get('invoicingOrderHeaderId') && !record.get('taxRate');
    const toNonExponential = num => {
      const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
      return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
    };
    const regExp = /(^\d*.[0]*$)/;
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'invoiceLineNature', editor: record => judgeEdit(record) },
      { name: 'projectObj', width: 150, editor: record => judgeEdit(record) },
      { name: 'projectName', width: 150, editor: record => judgeEdit(record) },
      {
        name: 'quantity',
        editor: record => judgeEdit(record),
        renderer: ({ value }) => <span>{value}</span>,
      },
      {
        name: 'projectUnitPrice',
        editor: record => judgeEdit(record),
        width: 150,
        renderer: ({ value }) =>
          value &&
          (regExp.test(value) ? Number(value).toFixed(2) : toNonExponential(Number(value))),
      },
      {
        name: 'taxRateObj',
        editor: record => judgeEdit(record),
      },
      {
        name: 'amount',
        editor: (record, name) => (
          <Currency onChange={value => this.handleAmount(value, record, name, 1)} />
        ),
        width: 130,
      },
      { name: 'taxIncludedFlag', editor: true },
      {
        name: 'taxAmount',
        width: 150,
        editor: (record, name) =>
          (judgeTaxMount(record) || record.get('invoiceLineNature') === '6') && (
            <Currency onChange={value => this.handleAmount(value, record, name, 2)} />
          ),
      },
      { name: 'deduction', width: 150 },
      {
        name: 'model',
        editor: true,
      },
      {
        name: 'projectUnit',
        editor: true,
      },
      { name: 'preferentialPolicyFlag' },
      {
        name: 'zeroTaxRateFlag',
        editor: true,
      },
      { name: 'specialVatManagement', width: 140 },
      { name: 'commodityNumberObj', width: 150, editor: record => judgeEdit(record) },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          return [
            <Button
              key="delete"
              funcType={FuncType.link}
              onClick={() => this.invoiceRedFlushLineDS.delete(record)}
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

  @Bind()
  async handleSaveResult(params, classify, type) {
    const { history } = this.props;
    let res;
    if (classify === 'order') {
      res = getResponse(type === 0 ? await batchSave(params) : await review(params));
    }
    if (classify === 'request') {
      res = getResponse(await batchInvalid(params));
    }
    if (res) {
      if (type === 1) {
        const pathname =
          classify === 'request'
            ? '/htc-front-iop/invoice-req/list'
            : '/htc-front-iop/invoice-workbench/list';
        history.push(pathname);
      } else {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success.save').d('保存成功！'),
        });
        const { lines, ..._otherData } = res[0];
        this.invoiceRedFlushHeaderDS.loadData([_otherData]);
        this.invoiceRedFlushLineDS.loadData(lines);
      }
    }
  }

  @Bind()
  handleRedPunchOver(lineList) {
    const { redRemainAmount, taxIncludedFlag, originTotalAmount } = this.state;
    let totalAmount = 0;
    lineList.forEach(item => {
      if (item.taxIncludedFlag === '1') {
        totalAmount += Math.abs(item.amount);
      } else {
        totalAmount += Math.abs(item.amount) + Math.abs(item.taxAmount);
      }
    });
    totalAmount = Number(totalAmount.toFixed(2));
    const originalAmount = taxIncludedFlag === '1' ? redRemainAmount : originTotalAmount;
    if (totalAmount > originalAmount) {
      notification.error({
        description: '',
        message: `红冲超限！该发票本次红冲${totalAmount.toFixed(2)}, 剩余红冲金额${originalAmount}`,
      });
      return false;
    }
    return true;
  }

  /**
   * 订单保存
   * @params {number} type 0-保存 1-提交
   */
  @Bind()
  async handleSaveRedFlush(type, classify) {
    const { empInfo } = this.state;
    const validate = await this.invoiceRedFlushHeaderDS.validate(false, false);
    const lineValidate = await this.invoiceRedFlushLineDS.validate(false, false);
    if (!validate || !lineValidate) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    const headerData = this.invoiceRedFlushHeaderDS.current!.toData();
    const lineList: any = this.invoiceRedFlushLineDS.toData();
    const redPunchOverResult = await this.handleRedPunchOver(lineList);
    if (redPunchOverResult) {
      const _lineList = lineList.map((record: any) => {
        const { projectObj, ...otherItem } = record;
        return {
          ...otherItem,
          ...projectObj,
          projectName: projectObj.invoiceProjectName,
        };
      });
      let params = {
        tenantId,
        curEmployeeId: empInfo.employeeId,
        ...headerData,
        lines: _lineList,
      };
      if (classify === 'request') {
        const { companyCode, employeeNum, employeeId } = empInfo;
        params = {
          curEmployeeId: employeeId,
          organizationId: tenantId,
          headerCompanyCode: companyCode,
          headerEmployeeNumber: employeeNum,
          headerReviewerId: employeeId,
          submit: type === 1,
          ...headerData,
          lines: _lineList,
        };
      }
      // 保存（红冲订单）0|红冲审核（提交）1
      this.handleSaveResult(params, classify, type);
    }
  }

  /**
   * 返回专票备注
   * @params {sting} value-红字信息表编号
   */
  @Bind()
  renderSpecialRemark(value) {
    const remark = this.renderRemark();
    const specialRemark = `${remark}，开具红字增值税专用发票信息表编号${value}`;
    this.invoiceRedFlushHeaderDS.current!.set('remark', specialRemark);
  }

  /**
   * 红字信息表编号回调
   * @params {number} value-当前值
   */
  @Bind()
  redInfoSerialChange(value) {
    if (value) {
      const validateNumber = new RegExp(/^\d{16}$/);
      if (validateNumber.test(value)) {
        this.invoiceRedFlushLineDS.setQueryParameter('redInvoiceHeaderId', null);
        this.renderSpecialRemark(value);
        this.queryLines();
      }
    }
  }

  /**
   * 返回红字信息表格行
   * @returns {*[]}
   */
  get redInfoColumns(): ColumnProps[] {
    return [{ name: 'redInfoSerialNumber' }, { name: 'invoiceAmount' }];
  }

  /**
   * 红字信息表格行点击回调
   * @params {object} record-行记录
   * @params {object} modal
   */
  @Bind()
  handleRowLine(record, modal) {
    return {
      onDoubleClick: () => {
        this.invoiceRedFlushHeaderDS.current!.set(
          'redInfoSerialNumber',
          record.get('redInfoSerialNumber')
        );
        this.invoiceRedFlushLineDS.setQueryParameter(
          'redInvoiceHeaderId',
          record.get('redInvoiceInfoHeaderId')
        );
        this.renderSpecialRemark(record.get('redInfoSerialNumber'));
        this.queryLines();
        modal.close();
      },
    };
  }

  /**
   * 红字信息表格确定回调
   * @params {object} modal
   */
  @Bind()
  handleOkLine(modal) {
    const selected = this.redInvoiceInfoLinesDS.current!.toData();
    this.invoiceRedFlushLineDS.setQueryParameter(
      'redInvoiceHeaderId',
      selected.redInvoiceInfoHeaderId
    );
    this.queryLines();
    this.invoiceRedFlushHeaderDS.current!.set('redInfoSerialNumber', selected.redInfoSerialNumber);
    this.renderSpecialRemark(selected.redInfoSerialNumber);
    modal.close();
  }

  /**
   * 红字信息表搜索图标回调
   */
  @Bind()
  handleRedInfoSerial() {
    const headerData = this.invoiceRedFlushHeaderDS.current!.toData();
    const { blueInvoiceCode, blueInvoiceNo } = headerData;
    const { invoiceVariety } = this.state;
    if (invoiceVariety === '0' || invoiceVariety === '52') {
      this.redInvoiceInfoLinesDS.setQueryParameter('blueInvoiceCode', blueInvoiceCode);
      this.redInvoiceInfoLinesDS.setQueryParameter('blueInvoiceNo', blueInvoiceNo);
      this.redInvoiceInfoLinesDS.query();
      const modal = Modal.open({
        key: Modal.key(),
        title: '',
        destroyOnClose: true,
        closable: true,
        style: { width: '50%' },
        children: (
          <Table
            dataSet={this.redInvoiceInfoLinesDS}
            columns={this.redInfoColumns}
            selectionMode={SelectionMode.click}
            onRow={({ record }) => this.handleRowLine(record, modal)}
          />
        ),
        onOk: () => this.handleOkLine(modal),
      });
    }
  }

  /**
   * 渲染Header按钮
   */
  @Bind()
  renderHeaderBts() {
    const { redFinished, invoiceVariety } = this.state;
    const { match } = this.props;
    const { sourceType } = match.params;
    if (sourceType) {
      return (
        <>
          <PermissionButton
            type="c7n-pro"
            disabled={redFinished || invoiceVariety === ''}
            onClick={() => this.handleSaveRedFlush(1, 'request')}
            permissionList={[
              {
                code: `${permissionPath}.redflush-reqsubmit`,
                type: 'button',
                meaning: '按钮-作废-提交（作废申请）',
              },
            ]}
          >
            {intl.get('hiop.invoiceRedFlush.button.reqSubmit').d('提交（红冲申请）')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            disabled={redFinished || invoiceVariety === ''}
            onClick={() => this.handleSaveRedFlush(0, 'request')}
            permissionList={[
              {
                code: `${permissionPath}.redflush-reqsave`,
                type: 'button',
                meaning: '按钮-作废-保存（作废申请）',
              },
            ]}
          >
            {intl.get('hiop.invoiceRedFlush.button.reqSave').d('保存（红冲申请）')}
          </PermissionButton>
        </>
      );
    } else {
      return (
        <>
          <PermissionButton
            type="c7n-pro"
            onClick={() => this.handleSaveRedFlush(0, 'order')}
            disabled={redFinished || invoiceVariety === ''}
            permissionList={[
              {
                code: `${permissionPath}.redflush-save`,
                type: 'button',
                meaning: '按钮-红冲-保存（红冲订单）',
              },
            ]}
          >
            {intl.get('hiop.invoiceRedFlush.button.orderSave').d('保存（红冲订单）')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            onClick={() => this.handleSaveRedFlush(1, 'order')}
            disabled={redFinished || invoiceVariety === ''}
            permissionList={[
              {
                code: `${permissionPath}.redflush-submit`,
                type: 'button',
                meaning: '按钮-红冲-红冲审核（提交）',
              },
            ]}
          >
            {intl.get('hiop.invoiceRedFlush.button.orderSubmit').d('红冲审核（提交）')}
          </PermissionButton>
        </>
      );
    }
  }

  /**
   * 发票红冲新增
   */
  @Bind()
  handleAddRedFlush() {
    const { taxIncludedFlag } = this.state;
    const headerData = this.invoiceRedFlushHeaderDS.current!.toData();
    const {
      companyId,
      companyCode,
      invoiceVariety,
      listFlag,
      purchaseInvoiceFlag,
      buyerName,
      sellerName,
      extNumber,
      totalTax,
    } = headerData;
    const customerName = purchaseInvoiceFlag === '0' ? sellerName : buyerName;
    this.invoiceRedFlushLineDS.create(
      {
        companyId,
        companyCode,
        listFlag,
        invoiceVariety,
        customerName,
        extNumber,
        totalTax,
        invoiceLineNature: '0',
        taxIncludedFlag,
      },
      0
    );
  }

  /**
   * 返回发票红冲行按钮组
   * @return {*[]}
   */
  get lineButton(): Buttons[] {
    const { listFlag } = this.state;
    const AddBtn = observer((props: any) => {
      const isDisabled =
        Number(listFlag) === 1 &&
        props.dataSet!.some(record => record.get('invoicingOrderHeaderId'));
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
    return [
      <AddBtn
        dataSet={this.invoiceRedFlushLineDS}
        icon="playlist_add"
        key="add"
        onClick={() => this.handleAddRedFlush()}
        title={intl.get('hzero.common.button.add').d('新增')}
      />,
    ];
  }

  /**
   * 设置发票种类选项数属性
   * @params {object} record-行记录
   */
  @Bind()
  handleOption({ record }) {
    return {
      disabled: ['0', '41', '52'].includes(record.get('value')),
    };
  }

  /**
   * 发票红冲自定义查询条
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
            {intl.get('hiop.invoiceWorkbench.label.totalPriceTax').d('合计含税金额：')}
            <span>{this.invoiceRedFlushHeaderDS.current?.get('totalPriceTaxAmount')}</span>
          </p>
          <p>
            {intl.get('hiop.invoiceWorkbench.label.totalTax').d('合计税额：')}
            <span>{this.invoiceRedFlushHeaderDS.current?.get('totalTax')}</span>
          </p>
        </div>
      </div>
    );
  }

  render() {
    const { match } = this.props;
    const { showMore } = this.state;
    const { sourceType } = match.params;
    let backPath = '/htc-front-iop/invoice-workbench/list';
    if (sourceType) {
      backPath = '/htc-front-iop/invoice-req/list';
    }
    const invoiceInfo = (
      <Form dataSet={this.invoiceRedFlushHeaderDS} columns={4}>
        <TextField name="invoiceSourceOrder" />
        <TextField name="originalInvoiceDate" />
        <Select name="originalSourceType" />
        <TextField name="originalInvoiceSourceOrder" />
        {/*---*/}
        <Select name="specialRedMark" />
        <TextField name="referenceNumber" />
        <Select name="deliveryWay" />
        <TextField name="electronicReceiverInfo" />
      </Form>
    );
    return (
      <>
        <Header
          title={intl.get('hiop.invoiceRedFlush.title.invoiceRedFlush').d('发票红冲')}
          backPath={backPath}
        >
          {this.renderHeaderBts()}
        </Header>
        <div style={{ overflow: 'auto' }}>
          <Card style={{ marginTop: 10 }}>
            <Form dataSet={this.invoiceRedFlushHeaderDS.queryDataSet} columns={3}>
              <Output name="companyName" />
              <Output name="employeeDesc" />
              <Output
                value={moment().format(DEFAULT_DATE_FORMAT)}
                label={intl.get('hiop.invoiceReq.modal.curDate').d('当前日期')}
              />
            </Form>
            <Form dataSet={this.invoiceRedFlushHeaderDS} columns={3}>
              <TextField
                name="redInfoSerialNumber"
                label={
                  <span style={{ color: 'red' }}>
                    {intl
                      .get('hiop.invoiceWorkbench.modal.redInfoSerialNumber')
                      .d('红字信息表编号')}
                  </span>
                }
                onChange={this.redInfoSerialChange}
                suffix={<Icon type="search" onClick={this.handleRedInfoSerial} />}
                clearButton
              />
              <Select name="invoiceVariety" onOption={this.handleOption} />
            </Form>
          </Card>
          <Card style={{ marginTop: 10 }}>
            <Row gutter={8}>
              <Col span={12}>
                <div style={{ backgroundColor: '#f6f6f6', padding: '10px 20px 0 20px' }}>
                  <h3>
                    <b>{intl.get('hiop.invoiceWorkbench.label.buyer').d('购买方')}</b>
                  </h3>
                  <Form columns={2} dataSet={this.invoiceRedFlushHeaderDS}>
                    <TextField name="buyerName" colSpan={2} />
                    <TextField name="buyerTaxpayerNumber" />
                    <Select name="buyerCompanyType" placeholder="企业类型" />
                    <TextField name="buyerCompanyAddressPhone" colSpan={2} />
                    <TextField name="buyerBankNumber" colSpan={2} />
                  </Form>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ backgroundColor: '#f6f6f6', padding: '10px 20px 0 20px' }}>
                  <h3>
                    <b>{intl.get('hiop.invoiceWorkbench.label.seller').d('销售方')}</b>
                  </h3>
                  <Form columns={2} dataSet={this.invoiceRedFlushHeaderDS}>
                    <TextField name="sellerName" colSpan={2} />
                    <TextField name="sellerTaxpayerNumber" />
                    <Select name="sellerCompanyType" />
                    <TextField name="sellerCompanyAddressPhone" colSpan={2} />
                    <TextField name="sellerBankNumber" colSpan={2} />
                  </Form>
                </div>
              </Col>
            </Row>
            <Form
              columns={6}
              dataSet={this.invoiceRedFlushHeaderDS}
              style={{ marginTop: 10 }}
              excludeUseColonTagList={['Radio', 'Output']}
            >
              <Lov name="payeeNameObj" />
              <TextField name="issuerName" />
              <Lov name="reviewerNameObj" />
              {/*---*/}
              <TextField name="redInvoice" />
              <TextField
                name="blueInvoiceCode"
                label={
                  <span style={{ color: 'blue' }}>
                    {intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码')}
                  </span>
                }
              />
              <TextField
                name="blueInvoiceNo"
                label={
                  <span style={{ color: 'blue' }}>
                    {intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码')}
                  </span>
                }
              />
              {/*---*/}
              <Select name="redMarkReason" colSpan={3} />
              <TextArea name="remark" rows={1} colSpan={3} resize={ResizeType.both} />
            </Form>
            {!showMore && (
              <Button block onClick={() => this.setState({ showMore: !showMore })}>
                {intl.get('hiop.invoiceRedFlush.button.viewMore').d('查看更多信息')}
              </Button>
            )}
            {showMore && invoiceInfo}
            {showMore && (
              <Button block onClick={() => this.setState({ showMore: !showMore })}>
                {intl.get('hiop.invoiceRedFlush.button.putWay').d('收起更多信息')}
              </Button>
            )}
          </Card>
          <Card style={{ marginTop: 10 }}>
            <Table
              buttons={this.lineButton}
              dataSet={this.invoiceRedFlushLineDS}
              columns={this.columns}
              queryBar={this.renderQueryBar}
              style={{ height: 200 }}
              showRemovedRow={false}
            />
          </Card>
        </div>
      </>
    );
  }
}
