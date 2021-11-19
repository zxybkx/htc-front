/**
 * @Description:发票发票红冲
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-30 15:59:22
 * @LastEditTime: 2021-09-26 16:32:34
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import { RouteComponentProps } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@common/utils/utils';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { routerRedux } from 'dva/router';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import {
  Button,
  Currency,
  DataSet,
  Form,
  Icon,
  Modal,
  Output,
  Radio,
  Select,
  Table,
  TextArea,
  TextField,
  Lov,
  message,
} from 'choerodon-ui/pro';
import { Card, Col, Row } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { SelectionMode, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { batchInvalid, batchSave, review } from '@src/services/invoiceOrderService';
import { isEmpty } from 'lodash';
import InvoiceRedFlushHeaderDS from '../stores/InvoiceRedFlushHeaderDS';
import InvoiceRedFlushLineDS from '../stores/InvoiceRedFlushLineDS';
import RedInvoiceInfoLinesDS from '../stores/RedInvoiceInfoLineDS';

const modelCode = 'hiop.invoice-redFlush';
const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

interface InvoiceVoidPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  match: any;
}

@connect()
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
    // isInput: false,
    listFlag: null,
    taxIncludedFlag: null,
    redRemainAmount: 0,
    originTotalAmount: 0,
  };

  @Bind()
  queryLines() {
    this.invoiceRedFlushLineDS.query().then((lineRes) => {
      if (isEmpty(lineRes)) {
        this.setState({ redFinished: true });
        this.invoiceRedFlushHeaderDS.current!.set({ readonly: true });
        notification.warning({
          description: '',
          message: intl.get('hzero.common.notification.info').d('该蓝票已经存在未完成的红冲订单！'),
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
      this.invoiceRedFlushHeaderDS.query().then(async (res) => {
        if (res) {
          const { invoiceVariety, listFlag, invoicingOrderId } = res;
          if (invoicingReqHeaderId) {
            this.invoiceRedFlushLineDS.setQueryParameter('orderHeaderId', invoicingOrderId);
          }
          if (invoiceVariety !== '0' && invoiceVariety !== '52') {
            this.queryLines();
          }
          this.setState({ invoiceVariety, listFlag });
        }
      });
      this.setState({ empInfo: currentEmployee });
    }
  }

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

  get columns(): ColumnProps[] {
    const { listFlag } = this.state;
    const judgeEdit = (record) => Number(listFlag) !== 1 || !record.get('invoicingOrderHeaderId');
    const judgeTaxMount = (record) =>
      Number(listFlag) === 1 && record.get('invoicingOrderHeaderId') && !record.get('taxRate');
    const regExp = /(^[1-9]\d*$)/;
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'invoiceLineNature', editor: (record) => judgeEdit(record) },
      { name: 'projectObj', width: 150, editor: (record) => judgeEdit(record) },
      { name: 'projectName', width: 150, editor: (record) => judgeEdit(record) },
      {
        name: 'quantity',
        editor: (record) => judgeEdit(record),
        renderer: ({ value }) => <span>{value}</span>,
      },
      {
        name: 'projectUnitPrice',
        editor: (record) => judgeEdit(record),
        width: 150,
        renderer: ({ value }) =>
          value && (regExp.test(value) ? value.toFixed(2) : parseFloat(value)),
      },
      {
        name: 'taxRateObj',
        editor: (record) => judgeEdit(record),
      },
      {
        name: 'amount',
        editor: (record, name) => (
          <Currency onChange={(value) => this.handleAmount(value, record, name, 1)} />
        ),
        width: 130,
      },
      { name: 'taxIncludedFlag', editor: (record) => judgeEdit(record) },
      {
        name: 'taxAmount',
        width: 150,
        editor: (record, name) =>
          judgeTaxMount(record) && (
            <Currency onChange={(value) => this.handleAmount(value, record, name, 2)} />
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
      { name: 'commodityNumberObj', width: 150, editor: (record) => judgeEdit(record) },
    ];
  }

  // 保存
  @Bind()
  async save(type) {
    const { dispatch } = this.props;
    const { empInfo, redRemainAmount, taxIncludedFlag, originTotalAmount } = this.state;
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
    const { redMarkReason } = headerData;
    if (!redMarkReason) {
      notification.error({
        description: '红冲原因未填',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    const lineList: any = this.invoiceRedFlushLineDS.toData();
    let totalAmount = 0;
    if (taxIncludedFlag === 1) {
      // 含税
      for (let i = 0; i < lineList.length; i++) {
        totalAmount += Math.abs(lineList[i].amount);
      }
    } else {
      // 不含税
      for (let i = 0; i < lineList.length; i++) {
        totalAmount += Math.abs(lineList[i].amount) + Math.abs(lineList[i].taxAmount);
      }
    }
    const originalAmount = taxIncludedFlag === '1' ? redRemainAmount : originTotalAmount;
    if (totalAmount > originalAmount) {
      notification.error({
        description: '',
        message: intl
          .get('hzero.common.notification.amountInvalid')
          .d(`红冲超限！该发票已红冲${totalAmount}, 剩余红冲金额${originalAmount}`),
      });
      return;
    }
    const _lineList = lineList.map((record: any) => {
      const { projectObj, ...otherItem } = record;
      return {
        ...otherItem,
        ...projectObj,
        projectName: projectObj.invoiceProjectName,
      };
    });
    const params = {
      tenantId,
      curEmployeeId: empInfo.employeeId,
      ...headerData,
      lines: _lineList,
    };
    // 保存（红冲订单）0|红冲审核（提交）1
    const res = getResponse(type === 0 ? await batchSave(params) : await review(params));
    if (res) {
      if (type === 1) {
        dispatch(
          routerRedux.push({
            pathname: '/htc-front-iop/invoice-workbench/list',
          })
        );
      } else {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('保存成功！'),
        });
        const { lines, ..._otherData } = res[0];
        this.invoiceRedFlushHeaderDS.loadData([_otherData]);
        this.invoiceRedFlushLineDS.loadData(lines);
      }
    }
  }

  // 申请单保存
  @Bind()
  async requestSave(type) {
    const { dispatch } = this.props;
    const { empInfo, redRemainAmount, taxIncludedFlag, originTotalAmount } = this.state;
    const validate = await this.invoiceRedFlushHeaderDS.validate(false, false);
    const lineValidate = await this.invoiceRedFlushLineDS.validate(false, false);
    if (!validate || !lineValidate) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalidate').d('校验不通过！'),
      });
      return;
    }
    const headerData = this.invoiceRedFlushHeaderDS.current!.toData();
    const { redMarkReason } = headerData;
    if (!redMarkReason) {
      notification.error({
        description: '红冲原因未填',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    const lineList: any = this.invoiceRedFlushLineDS.toData();
    let totalAmount = 0;
    if (taxIncludedFlag === 1) {
      // 含税
      for (let i = 0; i < lineList.length; i++) {
        totalAmount += Math.abs(lineList[i].amount);
      }
    } else {
      // 不含税
      for (let i = 0; i < lineList.length; i++) {
        totalAmount += Math.abs(lineList[i].amount) + Math.abs(lineList[i].taxAmount);
      }
    }
    const originalAmount = taxIncludedFlag === '1' ? redRemainAmount : originTotalAmount;
    if (totalAmount > originalAmount) {
      notification.error({
        description: '',
        message: intl
          .get('hzero.common.notification.amountInvalid')
          .d(`红冲超限！该发票已红冲${totalAmount}, 剩余红冲金额${originalAmount}`),
      });
      return;
    }
    const _lineList = lineList.map((record: any) => {
      const { projectObj, ...otherItem } = record;
      return {
        ...otherItem,
        ...projectObj,
        projectName: projectObj.invoiceProjectName,
      };
    });
    const { companyCode, employeeNum, employeeId } = empInfo;
    const params = {
      organizationId: tenantId,
      headerCompanyCode: companyCode,
      headerEmployeeNumber: employeeNum,
      headerReviewerId: employeeId,
      submit: type === 1 && true,
      ...headerData,
      lines: _lineList,
    };
    const res = getResponse(await batchInvalid(params));
    if (res) {
      if (type === 1) {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        dispatch(
          routerRedux.push({
            pathname: '/htc-front-iop/invoice-req/list',
          })
        );
      } else {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('保存成功'),
        });
        const { lines, ..._otherData } = res[0];
        this.invoiceRedFlushHeaderDS.loadData([_otherData]);
        this.invoiceRedFlushLineDS.loadData(lines);
      }
    }
  }

  @Bind()
  redInfoSerialChange(value) {
    if (value) {
      const validateNumber = new RegExp(/^[0-9]{16}$/);
      if (validateNumber.test(value)) {
        this.invoiceRedFlushLineDS.setQueryParameter('redInvoiceHeaderId', null);
        this.queryLines();
        // this.setState({
        //   isInput: true,
        // });
      }
    }
  }

  get redInfoColumns(): ColumnProps[] {
    return [{ name: 'redInfoSerialNumber' }, { name: 'invoiceAmount' }];
  }

  @Bind()
  handleRow(record, modal) {
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
        this.queryLines();
        modal.close();
        // this.setState({
        //   isInput: false,
        // });
      },
    };
  }

  @Bind()
  handleOk(modal) {
    const selected = this.redInvoiceInfoLinesDS.current!.toData();
    this.invoiceRedFlushLineDS.setQueryParameter(
      'redInvoiceHeaderId',
      selected.redInvoiceInfoHeaderId
    );
    this.queryLines();
    this.invoiceRedFlushHeaderDS.current!.set('redInfoSerialNumber', selected.redInfoSerialNumber);
    modal.close();
    // this.setState({
    //   isInput: false,
    // });
  }

  @Bind()
  handleRedInfoSerial() {
    const { invoiceVariety } = this.state;
    if (invoiceVariety === '0' || invoiceVariety === '52') {
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
            onRow={({ record }) => this.handleRow(record, modal)}
          />
        ),
        onOk: () => this.handleOk(modal),
      });
    }
  }

  @Bind()
  handleInvoiceVarietyChange(value) {
    this.setState({ invoiceVariety: value });
  }

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
            color={ButtonColor.dark}
            disabled={redFinished || invoiceVariety === ''}
            onClick={() => this.requestSave(1)}
            permissionList={[
              {
                code: `${permissionPath}.redflush-reqsubmit`,
                type: 'button',
                meaning: '按钮-作废-提交（作废申请）',
              },
            ]}
          >
            {intl.get(`${modelCode}.button.submit`).d('提交（红冲申请）')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            color={ButtonColor.dark}
            disabled={redFinished || invoiceVariety === ''}
            onClick={() => this.requestSave(0)}
            permissionList={[
              {
                code: `${permissionPath}.redflush-reqsave`,
                type: 'button',
                meaning: '按钮-作废-保存（作废申请）',
              },
            ]}
          >
            {intl.get(`${modelCode}.button.submit`).d('保存（红冲申请）')}
          </PermissionButton>
        </>
      );
    } else {
      return (
        <>
          <PermissionButton
            type="c7n-pro"
            color={ButtonColor.dark}
            onClick={() => this.save(0)}
            disabled={redFinished || invoiceVariety === ''}
            permissionList={[
              {
                code: `${permissionPath}.redflush-save`,
                type: 'button',
                meaning: '按钮-红冲-保存（红冲订单）',
              },
            ]}
          >
            {intl.get(`${modelCode}.save`).d('保存（红冲订单）')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            color={ButtonColor.dark}
            onClick={() => this.save(1)}
            disabled={redFinished || invoiceVariety === ''}
            permissionList={[
              {
                code: `${permissionPath}.redflush-submit`,
                type: 'button',
                meaning: '按钮-红冲-红冲审核（提交）',
              },
            ]}
          >
            {intl.get(`${modelCode}.submit`).d('红冲审核（提交）')}
          </PermissionButton>
        </>
      );
    }
  }

  @Bind()
  handleAdd() {
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

  get lineButton(): Buttons[] {
    const { listFlag } = this.state;
    const AddBtn = observer((props: any) => {
      const isDisabled =
        Number(listFlag) === 1 &&
        props.dataSet!.some((record) => record.get('invoicingOrderHeaderId'));
      return (
        <Button
          icon={props.icon}
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
      <AddBtn
        dataSet={this.invoiceRedFlushLineDS}
        icon="playlist_add"
        key="add"
        onClick={() => this.handleAdd()}
        title={intl.get(`${modelCode}.button.add`).d('新增')}
      />,
      TableButtonType.delete,
    ];
  }

  render() {
    const { invoiceVariety } = this.state;
    const { match } = this.props;
    const { sourceType } = match.params;
    let backPath = '/htc-front-iop/invoice-workbench/list';
    if (sourceType) {
      backPath = '/htc-front-iop/invoice-req/list';
    }
    return (
      <PageHeaderWrapper
        title={intl.get(`${modelCode}.title`).d('发票红冲')}
        header={this.renderHeaderBts()}
        headerProps={{ backPath }}
      >
        <Content>
          <Row>
            <Col span={18}>
              <Form dataSet={this.invoiceRedFlushHeaderDS.queryDataSet} columns={5}>
                <Output name="companyName" colSpan={2} />
                <Output name="employeeDesc" colSpan={2} />
                <Output
                  colSpan={1}
                  value={moment().format(DEFAULT_DATE_FORMAT)}
                  label={intl.get(`${modelCode}.view.curDate`).d('当前日期')}
                />
              </Form>
            </Col>
            <Col span={6}>
              <Form dataSet={this.invoiceRedFlushHeaderDS}>
                <TextField
                  name="redInfoSerialNumber"
                  colSpan={2}
                  label={<span style={{ color: 'red' }}>红字信息表编号</span>}
                  onChange={this.redInfoSerialChange}
                  suffix={<Icon type="search" onClick={this.handleRedInfoSerial} />}
                  clearButton
                />
              </Form>
            </Col>
          </Row>
          <Form
            dataSet={this.invoiceRedFlushHeaderDS}
            excludeUseColonTagList={['Radio']}
            columns={5}
          >
            <Radio name="invoiceVariety" value="0" disabled>
              专票
            </Radio>
            <Radio
              name="invoiceVariety"
              value="2"
              disabled={invoiceVariety !== '2' && invoiceVariety !== '51'}
              onChange={this.handleInvoiceVarietyChange}
            >
              普票
            </Radio>
            <Radio name="invoiceVariety" value="41" disabled>
              卷票
            </Radio>
            <Radio
              name="invoiceVariety"
              value="51"
              disabled={invoiceVariety !== '2' && invoiceVariety !== '51'}
              onChange={this.handleInvoiceVarietyChange}
            >
              电子普票
            </Radio>
            <Radio name="invoiceVariety" value="52" disabled>
              电子专票
            </Radio>
          </Form>
          <Row gutter={8}>
            <Col span={12}>
              <Card title="购买方">
                <Form
                  columns={3}
                  dataSet={this.invoiceRedFlushHeaderDS}
                  excludeUseColonTagList={['Output']}
                >
                  <TextField name="buyerName" colSpan={3} />
                  <TextField name="buyerTaxpayerNumber" colSpan={2} />
                  <Output
                    colSpan={1}
                    renderer={() => <Select name="buyerCompanyType" placeholder="企业类型" />}
                  />
                  <TextField name="buyerCompanyAddressPhone" colSpan={3} />
                  <TextField name="buyerBankNumber" colSpan={3} />
                </Form>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="销售方">
                <Form
                  columns={3}
                  dataSet={this.invoiceRedFlushHeaderDS}
                  excludeUseColonTagList={['Output']}
                >
                  <TextField name="sellerName" colSpan={3} />
                  <TextField name="sellerTaxpayerNumber" colSpan={2} />
                  <Output
                    colSpan={1}
                    renderer={() => <Select name="sellerCompanyType" placeholder="企业类型" />}
                  />
                  <TextField name="sellerCompanyAddressPhone" colSpan={3} />
                  <TextField name="sellerBankNumber" colSpan={3} />
                </Form>
              </Card>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={12}>
              <Form
                columns={3}
                dataSet={this.invoiceRedFlushHeaderDS}
                excludeUseColonTagList={['Radio', 'Output']}
              >
                <Lov name="payeeNameObj" />
                <TextField name="issuerName" />
                <Lov name="reviewerNameObj" />
                {/*---*/}
                <Radio name="billingType" value="2" style={{ color: 'blue' }}>
                  蓝字发票
                </Radio>
                <TextField
                  name="blueInvoiceCode"
                  label={<span style={{ color: 'blue' }}>发票代码</span>}
                />
                <TextField
                  name="blueInvoiceNo"
                  label={<span style={{ color: 'blue' }}>发票号码</span>}
                />
                {/*---*/}
                <Output value="合计：" />
                <Currency name="totalPriceTaxAmount" colSpan={1} />
                <Currency name="totalTax" colSpan={1} />
                {/*---*/}
                <TextArea name="redMarkReason" colSpan={3} style={{ height: 135 }} />
              </Form>
            </Col>
            <Col span={12} style={{ marginTop: 10 }}>
              <Card title="开票订单">
                <Form
                  columns={3}
                  dataSet={this.invoiceRedFlushHeaderDS}
                  excludeUseColonTagList={['Output', 'Radio']}
                >
                  <TextField name="invoiceSourceOrder" colSpan={2} />
                  <TextField name="originalInvoiceDate" colSpan={1} />
                  {/* --- */}
                  <Select name="originalSourceType" colSpan={2} />
                  <TextField name="originalInvoiceSourceOrder" colSpan={1} />
                </Form>
              </Card>
              <Form columns={3} dataSet={this.invoiceRedFlushHeaderDS}>
                <Select name="specialRedMark" colSpan={1} />
                <TextField name="referenceNumber" colSpan={2} />
                {/* --- */}
                <Select name="deliveryWay" />
                <TextField name="electronicReceiverInfo" colSpan={2} />
              </Form>
            </Col>
          </Row>
          <Table
            buttons={this.lineButton}
            dataSet={this.invoiceRedFlushLineDS}
            columns={this.columns}
            style={{ height: 200 }}
          />
        </Content>
      </PageHeaderWrapper>
    );
  }
}
