/*
 * @Description: 专用红字申请单新建/详情页
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-01 09:10:12
 * @LastEditTime: 2021-03-05 15:51:54
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component, ReactNode } from 'react';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import {
  DataSet,
  Table,
  Button,
  Form,
  Lov,
  Output,
  TextField,
  DateTimePicker,
  Select,
  Spin,
  Currency,
  message,
  DatePicker,
} from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { RouteComponentProps } from 'react-router-dom';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { Card } from 'choerodon-ui';
import {
  createRedInvoiceReq,
  createRedInvoiceReqLines,
  taxInfos,
} from '@src/services/redInvoiceService';
import { observer } from 'mobx-react-lite';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import RedInvoiceRequisitionDS from '../stores/RedInvoiceRequisitionLineDS';
import RedInvoiceRequisitionHeaderDS from '../stores/RedInvoiceRequisitionHeaderDS';

const modelCode = 'hiop.redInvoice';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  companyId: any;
  headerId: any;
}

interface RedInvoiceRequisitionPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [modelCode],
})
export default class RedInvoiceRequisitionPage extends Component<RedInvoiceRequisitionPageProps> {
  state = {
    empInfo: undefined as any,
    editable: false,
    status: undefined as any,
    isMultipleTaxRate: null,
    listFlag: null,
  };

  get isCreatePage() {
    const { match } = this.props;
    const { headerId } = match.params;
    return !headerId;
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
          const unitPrice = record.get('unitPrice') || 0;
          if (unitPrice !== 0) {
            record.set({
              num: value / record.get('unitPrice'),
            });
          }
          if (record.get('deductionAmount') && !isNaN(record.get('deductionAmount'))) {
            record.set({
              taxAmount: ((value - record.get('deductionAmount')) * record.get('taxRate')).toFixed(
                2
              ),
            });
          } else {
            record.set({
              // num: value / record.get('unitPrice'),
              taxAmount: (value * record.get('taxRate')).toFixed(2),
            });
          }
        }
        // 单价变动
        if (name === 'unitPrice') {
          if (record.get('num') && Number(record.get('num')) !== 0) {
            record.set({
              detailAmount: record.get('unitPrice') * record.get('num'),
            });
          }
        }
        // 数量变动
        if (name === 'num') {
          if (!value) {
            record.set({
              unitPrice: '',
            });
          } else if (record.get('unitPrice')) {
            record.set({
              detailAmount: record.get('unitPrice') * record.get('num'),
            });
          }
        }
        // 优惠政策标识
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
        // 税率
        if (name === 'taxRateObj') {
          if (!(value && Number(value) === 0)) {
            record.set('zeroTaxRateFlag', '');
            record.set('preferentialPolicyFlag', 0);
          }
          if (record.get('deductionAmount') && !isNaN(record.get('deductionAmount'))) {
            record.set({
              taxAmount: (
                (record.get('detailAmount') - record.get('deductionAmount')) *
                record.get('taxRate')
              ).toFixed(2),
            });
          } else {
            const unitPrice = record.get('unitPrice') || 0;
            if (unitPrice !== 0) {
              record.set({
                num: record.get('detailAmount') / record.get('unitPrice'),
              });
            }
            record.set({
              taxAmount: (record.get('detailAmount') * record.get('taxRate')).toFixed(2),
            });
          }
        }
        // 自行编码
        if (name === 'projectObj' && value) {
          record.set({
            goodsName: value.invoiceProjectName,
            unit: value.projectUnit,
            specificationModel: value.model,
            unitPrice: value.projectUnitPrice,
            // taxRateObj: value.taxRate && { value: this.getTaxRate(value.taxRate) } || {},
            goodsCode: value.commodityNumber,
          });
        }
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

  @Bind
  calAmount(dataSet) {
    // 合计金额
    let invoiceAmount = 0;
    // 合计税额
    let taxAmount = 0;
    for (let i = 0; i < dataSet.toData().length; i++) {
      if (
        dataSet.toData()[i].detailAmount === undefined ||
        dataSet.toData()[i].taxAmount === undefined
      ) {
        return;
      }
      invoiceAmount += dataSet.toData()[i].detailAmount;
      taxAmount += dataSet.toData()[i].taxAmount;
    }
    this.headerDS.current!.set('invoiceAmount', invoiceAmount.toFixed(2));
    this.headerDS.current!.set('taxAmount', taxAmount.toFixed(2));
  }

  // 税率不为0 修改优惠政策标识为不使用
  @Bind()
  handleTaxRateNotZero() {
    if (this.linesDS.length > 0) {
      this.linesDS.forEach((line) => {
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
      this.headerDS.query().then((res) => {
        if (this.headerDS) {
          this.headerDS.current!.set('operateType', '1');
        }
        if (this.linesDS) {
          this.setState({
            editable: ['E', 'R', 'N'].includes(this.headerDS.current!.get('status')),
          });
          this.linesDS.query().then(() => {
            this.calAmount(this.linesDS);
            // this.handleTaxRateNotZero();
          });
        }
        const { status, isMultipleTaxRate, listFlag } = res;
        this.setState({ status, isMultipleTaxRate, listFlag });
      });
    } else if (this.headerDS) {
      this.headerDS.create({}, 0);
      this.setState({ editable: true });
    }
  }

  /**
   * 红字发票申请单新建
   * @returns
   */
  @Bind()
  async handleAddReq() {
    const { empInfo } = this.state;
    const curInfo = this.headerDS.current!.toData();
    const { invoiceCode, invoiceNo, deductionStatus, applicantType } = curInfo;
    const validateValue = await this.headerDS.validate(false, false);
    if (!validateValue) {
      notification.error({
        description: '',
        message: '校验不通过！',
      });
      return;
    }
    if (deductionStatus === '01') {
      this.headerDS.current!.set('buyerName', empInfo.companyName);
      this.headerDS.current!.set('buyerTaxNo', empInfo.taxpayerNumber);
      this.headerDS.current!.getField('invoiceDate')!.set('required', false);
    } else {
      const params = {
        tenantId,
        invoiceCode,
        invoiceNo,
        companyCode: empInfo.companyCode,
        employeeNumber: empInfo.employeeNum,
        deductionStatus,
        applicantType,
      };
      const res = getResponse(
        await Promise.all([createRedInvoiceReq(params), createRedInvoiceReqLines(params)])
      );

      if (res && res[0]) {
        const { status, isMultipleTaxRate, listFlag } = res[0];
        this.headerDS.current!.set({ ...res[0] });
        this.setState({ status, isMultipleTaxRate, listFlag });
      }
      if (res[1]) {
        this.linesDS.reset();
        const { extensionNumber, invoiceTypeCode } = res[0];
        if (res[1].length > 0) {
          res[1].forEach((line) =>
            this.linesDS.create({
              ...line,
              extNumber: extensionNumber,
              invoiceType: invoiceTypeCode,
            })
          );
        }
      }
      this.headerDS.current!.getField('invoiceDate')!.set('required', true);
    }
    this.headerDS.current!.getField('requisitionReasonObj')!.set('required', true);
    this.headerDS.current!.getField('taxType')!.set('required', true);
    this.headerDS.current!.getField('uploadEmployeeName')!.set('required', true);
    this.headerDS.current!.getField('infoType')!.set('required', true);
    this.headerDS.current!.getField('businessTaxMarkCode')!.set('required', true);
    this.headerDS.current!.getField('extensionNumberObj')!.set('required', true);
    this.headerDS.current!.set('taxType', '1');
    this.headerDS.current!.set('businessTaxMarkCode', '0000000000');
    this.headerDS.current!.set('infoType', '0');
    this.headerDS.current!.set('uploadEmployeeName', empInfo);

    if (this.isCreatePage) {
      this.headerDS.current!.set('operateType', '0');
    } else {
      this.headerDS.current!.set('operateType', '1');
    }
    this.calAmount(this.linesDS);
  }

  // 保存/生成
  @Bind()
  async handleSaveIvc() {
    const deductionStatus = this.headerDS.current!.get('deductionStatus');
    if (deductionStatus !== '01') {
      const originalAmount = this.headerDS.current!.get('originalAmount');
      const lineList: any = this.linesDS.toData();
      let totalAmount = 0;
      for (let i = 0; i < lineList.length; i++) {
        totalAmount += Math.abs(lineList[i].detailAmount);
      }
      if (totalAmount > Math.abs(originalAmount)) {
        notification.error({
          description: '',
          message: intl
            .get('hzero.common.notification.amountInvalid')
            .d('商品金额不能大于原蓝票金额'),
        });
        return;
      }
    }
    const res = await this.headerDS.submit();
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.noChange').d('请先修改数据'),
      });
    } else if (res === false) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
    } else if (res.failed === 1) {
      notification.error({
        description: '',
        message: res.message,
      });
    } else if (res) {
      if (this.isCreatePage) {
        const { dispatch } = this.props;
        const pathname = `/htc-front-iop/red-invoice-requisition/list/`;
        dispatch(
          routerRedux.push({
            pathname,
          })
        );
      } else {
        const { dispatch } = this.props;
        const pathname = `/htc-front-iop/red-invoice-requisition/list/`;
        dispatch(
          routerRedux.push({
            pathname,
          })
        );
      }
    }
  }

  // 删除
  @Bind()
  handleDeleteHeaders() {
    const headersList = this.linesDS.selected;
    this.linesDS.delete(headersList);
  }

  // 行零税率标识受控于头
  @Bind()
  handleTaxRateLovChange(field, value) {
    if (this.linesDS.length > 0) {
      this.linesDS.forEach((line) => line.set(field, value));
    }
  }

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

  get columns(): ColumnProps[] {
    const { editable, isMultipleTaxRate } = this.state;
    const taxRateIsZero = (record) =>
      record.get('taxRate') && Number(record.get('taxRate')) === 0 && editable;
    const taxAmountEdit = (record) =>
      ((record.get('taxRate') && Number(record.get('taxRate')) === 0) ||
        isMultipleTaxRate === 'Y') &&
      editable;
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      {
        name: 'goodsName',
        width: 200,
        editor: (record) => editable && <TextField onChange={() => record.set('projectObj', '')} />,
      },
      {
        name: 'unit',
        width: 150,
        editor: (record) => editable && <TextField onChange={() => record.set('projectObj', '')} />,
      },
      {
        name: 'specificationModel',
        width: 150,
        editor: (record) => editable && <TextField onChange={() => record.set('projectObj', '')} />,
      },
      {
        name: 'unitPrice',
        editor: (record) => editable && <TextField onChange={() => record.set('projectObj', '')} />,
        width: 150,
        align: ColumnAlign.right,
      },
      {
        name: 'num',
        width: 150,
        headerStyle: { color: 'red' },
        editor: editable,
        renderer: ({ value }) => <span>{value}</span>,
      },
      {
        name: 'detailAmount',
        width: 200,
        headerStyle: { color: 'red' },
        editor: (record) =>
          editable && <Currency onChange={(value) => this.handleAmount(value, record)} />,
        align: ColumnAlign.right,
      },
      {
        name: 'deductionAmount',
        width: 150,
        headerStyle: { color: 'red' },
        align: ColumnAlign.right,
      },
      { name: 'taxRateObj', width: 150, editor: editable },
      {
        name: 'taxAmount',
        width: 150,
        headerStyle: { color: 'red' },
        editor: (record) => taxAmountEdit(record),
      },
      { name: 'goodsCode', width: 150 },
      { name: 'projectObj', width: 150, editor: editable },
      {
        name: 'zeroTaxRateFlag',
        width: 150,
        editor: (record) => taxRateIsZero(record),
      },
      { name: 'preferentialPolicyFlag', width: 110 },
      { name: 'specialManagementVat', width: 110 },
    ];
  }

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
        message: intl.get(`${modelCode}.view.newHeader`).d('请先完善头数据'),
      });
      return;
    }
    if (this.linesDS.length > 0) {
      // const list = this.linesDS.toData();
      // const maxDetailNoObj: any = maxBy(list, (item: any) => item.detailNo);
      this.linesDS.create(
        {
          // detailNo: maxDetailNoObj.detailNo + 1,
          companyId: empInfo.companyId,
          companyCode: empInfo.companyCode,
        },
        0
      );
    } else {
      this.linesDS.create(
        {
          // detailNo: 1,
          companyId: empInfo.companyId,
          companyCode: empInfo.companyCode,
        },
        0
      );
    }
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const { status, listFlag } = this.state;
    const AddBtn = observer((props: any) => {
      const isDisabled = props.dataSet!.some(
        (record) => record.get('lineNum') && Number(listFlag === 1)
      );
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
    if (['U', 'A', 'E'].includes(status)) {
      return [];
    } else {
      return [
        <AddBtn
          dataSet={this.linesDS}
          icon="playlist_add"
          key="add"
          onClick={() => this.handleAddLine()}
          title={intl.get(`${modelCode}.button.add`).d('新增')}
        />,
        TableButtonType.delete,
      ];
    }
  }

  get renderCompanyDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.companyName || ''}`;
    }
    return '';
  }

  get renderEmployeeDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.employeeNum || ''}-${
        empInfo.employeeName || ''
      }-${empInfo.mobile || ''}`;
    }
    return '';
  }

  @Bind()
  handleApplicantTypeChange(value) {
    if (value === '02') {
      this.headerDS.current!.set({
        buyerName: null,
        buyerTaxNo: null,
      });
    }
  }

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

  render() {
    const { empInfo } = this.state;
    const redlabelInvoiceAmount: ReactNode = (
      <span style={{ color: 'red' }}>
        {intl.get(`${modelCode}.view.invoiceAmount`).d('合计金额')}
      </span>
    );
    const redlabelTaxAmount: ReactNode = (
      <span style={{ color: 'red' }}>{intl.get(`${modelCode}.view.taxAmount`).d('合计税额')}</span>
    );
    return (
      <>
        <Header
          backPath="/htc-front-iop/red-invoice-requisition/list"
          title={intl.get(`${modelCode}.title`).d('专票红字申请单')}
        >
          <Button
            key="save"
            onClick={() => this.handleSaveIvc()}
            disabled={this.isCreatePage || !this.state.editable}
          >
            {intl.get(`${modelCode}.button.save`).d('保存红字申请单')}
          </Button>
          <Button key="create" onClick={() => this.handleSaveIvc()} disabled={!this.isCreatePage}>
            {intl.get(`${modelCode}.button.generate`).d('生成红字申请单')}
          </Button>
        </Header>
        <Content>
          <Spin dataSet={this.headerDS}>
            <Form columns={3}>
              <Output
                label={intl.get(`${modelCode}.view.companyDesc`).d('所属公司')}
                value={this.renderCompanyDesc}
              />
              <Output
                label={intl.get(`${modelCode}.view.employeeDesc`).d('登录员工')}
                value={this.renderEmployeeDesc}
              />
              <Output
                label={intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号')}
                value={empInfo && empInfo.taxpayerNumber}
              />
            </Form>
            <Form columns={6} dataSet={this.headerDS}>
              <Select name="applicantType" onChange={this.handleApplicantTypeChange} />
              <Select name="deductionStatus" onChange={this.handleDeductionChange} />
              <Select name="taxType" />
              <Lov name="invoiceObj" />
              <TextField name="invoiceNo" />
              <Button
                key="new"
                onClick={() => this.handleAddReq()}
                disabled={!(this.isCreatePage && empInfo)}
                style={{ marginLeft: '-0.6rem', width: '70px', marginRight: '-3rem' }}
                color={ButtonColor.primary}
              >
                {intl.get(`${modelCode}.button.new`).d('新建')}
              </Button>
              {/*---*/}
              <Select name="requisitionReasonObj" newLine colSpan={2} />
              <TextField name="requisitionDescription" />
              <TextField name="goodsVersion" />
              <DateTimePicker name="redInvoiceDate" />
              <Lov name="uploadEmployeeName" />
              {/*---*/}
              <TextField name="serialNumber" colSpan={2} />
              <Select name="infoType" />
              <Select name="status" />
              <Select name="businessTaxMarkCode" />
              <Select name="operateType" />
            </Form>
            <Card bordered style={{ marginBottom: '0.2rem' }}>
              <Form
                columns={6}
                dataSet={this.headerDS}
                labelWidth={60}
                labelTooltip={Tooltip.overflow}
              >
                <TextField name="taxDiskNumber" newLine colSpan={1} />
                <Lov
                  name="extensionNumberObj"
                  colSpan={1}
                  onChange={(value) => this.handleTaxRateLovChange('extNumber', value.value)}
                />
                <Select name="invoiceTypeCode" />
                <TextField name="blueInvoiceCode" colSpan={1} />
                <TextField name="blueInvoiceNo" colSpan={1} />
                <DatePicker name="invoiceDate" colSpan={1} />

                <TextField name="sellerName" newLine colSpan={2} />
                <TextField name="sellerTaxNo" colSpan={2} />
                <Currency name="invoiceAmount" colSpan={1} label={redlabelInvoiceAmount} />
                <Currency name="taxAmount" colSpan={1} label={redlabelTaxAmount} />

                <TextField name="buyerName" newLine colSpan={2} />
                <TextField name="buyerTaxNo" colSpan={2} />
              </Form>
            </Card>
          </Spin>
          <Table
            buttons={this.buttons}
            dataSet={this.linesDS}
            columns={this.columns}
            style={{ height: 200 }}
          />
        </Content>
      </>
    );
  }
}
