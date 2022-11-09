/*
 * @Description:发票池-头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2022-09-02 10:27:37
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { phoneReg } from '@htccommon/utils/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';

const modelCode = 'hivp.invoices';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  const halfYearStart = moment()
    .subtract(6, 'months')
    .startOf('month');

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-pool-main/invoice-pool-search`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            tenantId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/invoice-pool-header-infos/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/invoice-pool-header-infos/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'invoicePoolHeaderId',
    events: {
      update: ({ dataSet, record, name, value }) => {
        if (name === 'ticketCollectorObj') {
          record.set('ticketCollectorDate', value ? moment() : '');
          dataSet.submit();
        }
      },
    },
    fields: [
      {
        name: 'invoicePoolHeaderId',
        label: intl.get(`hivp.bill.view.billPoolHeaderId`).d('记录ID'),
        type: FieldType.string,
      },
      {
        name: 'invoiceHeaderId',
        type: FieldType.string,
      },
      {
        name: 'tenantName',
        label: intl.get(`htc.common.view.tenantName`).d('租户名称'),
        type: FieldType.string,
        defaultValue: getCurrentTenant().tenantName,
      },
      {
        name: 'companyId',
        label: intl.get(`hivp.batchCheck.view.companyId`).d('公司ID'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get(`htc.common.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`hzero.hzeroTheme.page.companyName`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get(`htc.common.view.taxpayerNumber`).d('公司纳税人识别号'),
        type: FieldType.string,
      },

      {
        name: 'employeeId',
        label: intl.get(`hivp.bill.view.employeeId`).d('员工id'),
        type: FieldType.string,
      },
      {
        name: 'employeeNum',
        label: intl.get(`hivp.bill.view.employeeNum`).d('员工编码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceType',
        label: intl.get(`htc.common.view.invoiceType`).d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceState',
        label: intl.get(`hivp.batchCheck.view.invoiceState`).d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`htc.common.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) =>
            record.get('invoiceNo') && record.get('invoiceNo').length !== 20,
        },
      },
      {
        name: 'invoiceNo',
        label: intl.get(`htc.common.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
        required: true,
        maxLength: 20,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`htc.common.view.invoiceDate`).d('开票日期'),
        type: FieldType.date,
        required: true,
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`htc.common.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'taxAmount',
        label: intl.get(`hiop.invoiceWorkbench.modal.taxAmount`).d('发票税额'),
        type: FieldType.string,
      },
      {
        name: 'totalAmount',
        label: intl.get(`htc.common.view.totalAmount`).d('价税合计'),
        type: FieldType.currency,
      },
      {
        name: 'validTaxAmount',
        label: intl.get(`hivp.bill.view.EffectiveTax`).d('有效税额'),
        type: FieldType.currency,
      },
      {
        name: 'checkCode',
        label: intl.get(`hivp.bill.view.checkCode`).d('校验码'),
        type: FieldType.string,
        // pattern: /^[a-zA-Z0-9]{6}$/,
        // defaultValidationMessages: {
        //   patternMismatch: intl.get(`${modelCode}.view.checkNumberValid`).d('只能输入6位字符'),
        // },
      },
      {
        name: 'annotation',
        label: intl.get(`hivp.checkCertification.view.annotation`).d('特殊标记/说明/备忘/注释'),
        type: FieldType.string,
      },
      {
        name: 'salerName',
        label: intl.get(`htc.common.view.salerName`).d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'salerTaxNo',
        label: intl.get(`hiop.invoiceReq.modal.salerTaxNo`).d('销方纳税识别号'),
        type: FieldType.string,
      },
      {
        name: 'salerAddressPhone',
        label: intl.get(`hiop.invoiceReq.modal.salerAddressPhone`).d('销方地址、电话'),
        type: FieldType.string,
      },
      {
        name: 'salerAccount',
        label: intl.get(`hiop.invoiceReq.modal.salerAccount`).d('销方开户行及账号'),
        type: FieldType.string,
      },
      {
        name: 'buyerName',
        label: intl.get(`htc.common.view.buyerName`).d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get(`hiop.invoiceReq.modal.buyerTaxNo`).d('购方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'buyerAddressPhone',
        label: intl.get(`hiop.invoiceReq.modal.buyerAddressPhone`).d('购方地址、电话'),
        type: FieldType.string,
      },
      {
        name: 'buyerAccount',
        label: intl.get(`hiop.invoiceReq.modal.buyerAccount`).d('购方开户行及账号'),
        type: FieldType.string,
      },
      {
        name: 'machineNo',
        label: intl.get(`hcan.invoiceDetail.view.machineNo`).d('机器编号'),
        type: FieldType.string,
      },
      {
        name: 'drawer',
        label: intl.get(`hivp.bill.view.issuer`).d('开票人'),
        type: FieldType.string,
      },
      {
        name: 'payee',
        label: intl.get(`hiop.invoiceWorkbench.modal.payeeName`).d('收款人'),
        type: FieldType.string,
      },
      {
        name: 'reviewer',
        label: intl.get(`hivp.bill.view.reviewer`).d('复核人'),
        type: FieldType.string,
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get(`hcan.invoiceDetail.view.blueInvoiceCode`).d('蓝票发票代码'),
        type: FieldType.string,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get(`hcan.invoiceDetail.view.blueInvoiceNo`).d('蓝票发票号码'),
        type: FieldType.string,
      },
      {
        name: 'idNo',
        label: intl.get(`hcan.invoiceDetail.view.idNo`).d('购方身份证号/组织机构代码'),
        type: FieldType.string,
      },
      {
        name: 'vehicleType',
        label: intl.get(`${modelCode}.view.vehicleType`).d('车辆类型'),
        type: FieldType.string,
      },
      {
        name: 'bandModel',
        label: intl.get(`${modelCode}.view.bandModel`).d('厂牌类型'),
        type: FieldType.string,
      },
      {
        name: 'produceArea',
        label: intl.get(`hcan.invoiceDetail.view.produceArea`).d('产地'),
        type: FieldType.string,
      },
      {
        name: 'qualifiedNo',
        label: intl.get(`hcan.invoiceDetail.view.qualifiedNo`).d('合格证号'),
        type: FieldType.string,
      },
      {
        name: 'commodityInspectionNo',
        label: intl.get(`hcan.invoiceDetail.view.commodityInspectionNo`).d('商检单号'),
        type: FieldType.string,
      },
      {
        name: 'engineNo',
        label: intl.get(`hcan.invoiceDetail.view.engineNo`).d('发动机号'),
        type: FieldType.string,
      },
      {
        name: 'vehicleIdentificationNo',
        label: intl
          .get(`hcan.invoiceDetail.view.vehicleIdentificationNo`)
          .d('车辆识别代号/车架号码'),
        type: FieldType.string,
      },
      {
        name: 'certificateOfImport',
        label: intl.get(`hcan.invoiceDetail.view.certificateOfImport`).d('进口证明书号'),
        type: FieldType.string,
      },
      {
        name: 'taxAuthorityCode',
        label: intl.get(`hcan.invoiceDetail.view.taxAuthorityCode`).d('主管税务机关代码'),
        type: FieldType.string,
      },
      {
        name: 'taxPaymentCertificateNo',
        label: intl.get(`hcan.invoiceDetail.view.taxPaymentCertificateNo`).d('完税凭证号码'),
        type: FieldType.string,
      },
      {
        name: 'limitedPeopleCount',
        label: intl.get(`hcan.invoiceDetail.view.limitedPeopleCount`).d('限乘人数'),
        type: FieldType.string,
      },
      {
        name: 'taxAuthorityName',
        label: intl.get(`hcan.invoiceDetail.view.taxAuthorityName`).d('主管税务机关名称'),
        type: FieldType.string,
      },
      {
        name: 'tonnage',
        label: intl.get(`hcan.invoiceDetail.view.tonnage`).d('吨位'),
        type: FieldType.string,
      },
      {
        name: 'taxRate',
        label: intl.get(`htc.common.view.taxRate`).d('税率'),
        type: FieldType.string,
      },
      {
        name: 'salerAddress',
        label: intl.get(`hcan.invoiceDetail.view.salerAddress`).d('销方地址'),
        type: FieldType.string,
      },
      {
        name: 'salerPhone',
        label: intl.get(`hcan.invoiceDetail.view.salerPhone`).d('销方电话'),
        type: FieldType.string,
      },
      {
        name: 'salerBankName',
        label: intl.get(`hcan.invoiceDetail.view.salerBankName`).d('销方开户银行'),
        type: FieldType.string,
      },
      {
        name: 'salerBankAccount',
        label: intl.get(`hcan.invoiceDetail.view.salerBankAccount`).d('销方开户账号'),
        type: FieldType.string,
      },
      {
        name: 'carrierName',
        label: intl.get(`hcan.invoiceDetail.view.carrierName`).d('承运人名称'),
        type: FieldType.string,
      },
      {
        name: 'carrierTaxNo',
        label: intl.get(`hcan.invoiceDetail.view.carrierTaxNo`).d('承运人识别号'),
        type: FieldType.string,
      },
      {
        name: 'draweeName',
        label: intl.get(`hcan.invoiceDetail.view.draweeName`).d('受票方名称'),
        type: FieldType.string,
      },
      {
        name: 'draweeTaxNo',
        label: intl.get(`hcan.invoiceDetail.view.draweeTaxNo`).d('受票方识别号'),
        type: FieldType.string,
      },
      {
        name: 'receiveName',
        label: intl.get(`${modelCode}.view.receiveName`).d('收货人名称'),
        type: FieldType.string,
      },
      {
        name: 'receiveTaxNo',
        label: intl.get(`${modelCode}.view.receiveTaxNo`).d('收货人识别号'),
        type: FieldType.string,
      },
      {
        name: 'consignorName',
        label: intl.get(`hcan.invoiceDetail.view.consignorName`).d('发货人名称'),
        type: FieldType.string,
      },
      {
        name: 'consignorTaxNo',
        label: intl.get(`hcan.invoiceDetail.view.consignorTaxNo`).d('发货人识别号'),
        type: FieldType.string,
      },
      {
        name: 'transportGoodsInfo',
        label: intl.get(`hcan.invoiceDetail.view.transportGoodsInfo`).d('运输货物信息'),
        type: FieldType.string,
      },
      {
        name: 'throughAddress',
        label: intl.get(`hcan.invoiceDetail.view.throughAddress`).d('起运地、经由、到达地'),
        type: FieldType.string,
      },
      {
        name: 'taxDiskNumber',
        label: intl.get(`hcan.invoiceDetail.view.taxDiskNumber`).d('税控盘号'),
        type: FieldType.string,
      },
      {
        name: 'carNumber',
        label: intl.get(`hcan.invoiceDetail.view.carNumber`).d('车种车号'),
        type: FieldType.string,
      },
      {
        name: 'vehicleTonnage',
        label: intl.get(`hcan.invoiceDetail.view.vehicleTonnage`).d('车船吨位'),
        type: FieldType.string,
      },
      {
        name: 'trafficFeeFlag',
        label: intl.get(`hcan.invoiceDetail.view.trafficFeeFlag`).d('通行费标志'),
        type: FieldType.string,
        lookupCode: 'HCAN.TRAFFIC_FEE_FLAG',
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get(`hcan.invoiceDetail.view.zeroTaxRateFlag`).d('零税率标志'),
        type: FieldType.string,
        lookupCode: 'HCAN.ZERO_TAX_RATE_FLAG',
      },
      {
        name: 'licensePlate',
        label: intl.get(`hcan.invoiceDetail.view.licensePlate`).d('车牌照号'),
        type: FieldType.string,
      },
      {
        name: 'registrationNo',
        label: intl.get(`hcan.invoiceDetail.view.registrationNo`).d('登记证号'),
        type: FieldType.string,
      },
      {
        name: 'carPrice',
        label: intl.get(`hcan.invoiceDetail.view.carPrice`).d('车价合计'),
        type: FieldType.currency,
      },
      {
        name: 'carPriceUpper',
        label: intl.get(`${modelCode}.view.carPriceUpper`).d('车价合计大写'),
        type: FieldType.string,
      },
      {
        name: 'transferredVehicleOffice',
        label: intl
          .get(`hcan.invoiceDetail.view.transferredVehicleOffice`)
          .d('转入地车辆车管所名称'),
        type: FieldType.string,
      },
      {
        name: 'buyerUnitOrIndividual',
        label: intl.get(`hcan.invoiceDetail.view.buyerUnitOrIndividual`).d('买方单位/个人'),
        type: FieldType.string,
      },
      {
        name: 'buyerUnitCodeOrIdNo',
        label: intl.get(`hcan.invoiceDetail.view.buyerUnitCodeOrIdNo`).d('买方单位代码/身份证号'),
        type: FieldType.string,
      },
      {
        name: 'buyerUnitOrIndividualAddress',
        label: intl
          .get(`hcan.invoiceDetail.view.buyerUnitOrIndividualAddress`)
          .d('买方单位/个人住址'),
        type: FieldType.string,
      },
      {
        name: 'buyerPhone',
        label: intl.get(`hcan.invoiceDetail.view.buyerPhone`).d('买方电话'),
        type: FieldType.string,
      },
      {
        name: 'sellerUnitOrIndividual',
        label: intl.get(`hcan.invoiceDetail.view.sellerUnitOrIndividual`).d('卖方单位/个人'),
        type: FieldType.string,
      },
      {
        name: 'sellerUnitCodeOrIdNo',
        label: intl.get(`hcan.invoiceDetail.view.sellerUnitCodeOrIdNo`).d('卖方单位代码/身份证号'),
        type: FieldType.string,
      },
      {
        name: 'sellerUnitOrIndividualAddress',
        label: intl
          .get(`hcan.invoiceDetail.view.sellerUnitOrIndividualAddress`)
          .d('卖方单位/个人住址'),
        type: FieldType.string,
      },
      {
        name: 'sellerPhone',
        label: intl.get(`hcan.invoiceDetail.view.sellerPhone`).d('卖方电话'),
        type: FieldType.string,
      },
      {
        name: 'businessUnit',
        label: intl.get(`hcan.invoiceDetail.view.businessUnit`).d('经营、拍卖单位'),
        type: FieldType.string,
      },
      {
        name: 'businessUnitAddress',
        label: intl.get(`hcan.invoiceDetail.view.businessUnitAddress`).d('经营、拍卖单位地址'),
        type: FieldType.string,
      },
      {
        name: 'businessUnitTaxNo',
        label: intl
          .get(`hcan.invoiceDetail.view.businessUnitTaxNo`)
          .d('经营、拍卖单位纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'businessUnitBankAndAccount',
        label: intl.get(`hcan.invoiceDetail.view.businessUnitBankAndAccount`).d('开户银行及账号'),
        type: FieldType.string,
      },
      {
        name: 'businessUnitPhone',
        label: intl.get(`hcan.invoiceDetail.view.businessUnitPhone`).d('经营、拍卖单位电话'),
        type: FieldType.string,
      },
      {
        name: 'lemonMarket',
        label: intl.get(`hcan.invoiceDetail.view.lemonMarket`).d('二手车市场'),
        type: FieldType.string,
      },
      {
        name: 'lemonMarketTaxNo',
        label: intl.get(`hcan.invoiceDetail.view.lemonMarketTaxNo`).d('二手车市场纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'lemonMarketAddress',
        label: intl.get(`hcan.invoiceDetail.view.lemonMarketAddress`).d('二手车市场地址'),
        type: FieldType.string,
      },
      {
        name: 'lemonMarketBankAndAccount',
        label: intl
          .get(`hcan.invoiceDetail.view.lemonMarketBankAndAccount`)
          .d('二手车市场开户银行及账号'),
        type: FieldType.string,
      },
      {
        name: 'lemonMarketPhone',
        label: intl.get(`hcan.invoiceDetail.view.lemonMarketPhone`).d('二手车市场电话'),
        type: FieldType.string,
      },
      {
        name: 'productMark',
        label: intl.get(`${modelCode}.view.productMark`).d('成品油标记'),
        type: FieldType.string,
      },
      {
        name: 'issueMark',
        label: intl.get(`${modelCode}.view.issueMark`).d('代开标记'),
        type: FieldType.string,
      },
      {
        name: 'downloadPath',
        label: intl.get(`${modelCode}.view.downloadPath`).d('下载路径'),
        type: FieldType.string,
      },
      {
        name: 'buyerTell',
        label: intl.get(`${modelCode}.view.buyerTell`).d('购货方手机'),
        type: FieldType.string,
      },
      {
        name: 'buyerMail',
        label: intl.get(`${modelCode}.view.buyerMail`).d('购货方邮箱'),
        type: FieldType.string,
      },
      {
        name: 'authenticationDate',
        label: intl.get(`${modelCode}.view.authenticationDate`).d('认证属期'),
        type: FieldType.string,
      },
      {
        name: 'checkState',
        label: intl.get(`hivp.checkCertification.view.checkState`).d('勾选状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_STATE',
      },
      {
        name: 'checkDate',
        label: intl.get(`hivp.checkCertification.view.checkTime`).d('勾选时间'),
        type: FieldType.string,
      },
      {
        name: 'authenticationState',
        label: intl.get(`hivp.checkCertification.view.authenticationState`).d('认证状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_STATE',
      },
      {
        name: 'authenticationType',
        label: intl.get(`hivp.checkCertification.view.authenticationType`).d('认证类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_TYPE',
      },
      {
        name: 'originalEntryDate',
        label: intl.get(`${modelCode}.view.originalEntryDate`).d('入电子底账库日期'),
        type: FieldType.string,
      },
      {
        name: 'remark',
        label: intl.get(`${modelCode}.view.remark`).d('备注（票面）'),
        type: FieldType.string,
      },
      {
        name: 'ticketCollectorObj',
        label: intl.get(`hivp.batchCheck.view.collectionStaff`).d('收票员工'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        cascadeMap: { companyId: 'companyId' },
        ignore: FieldIgnore.always,
        textField: 'employeeDesc',
      },
      {
        name: 'ticketCollectorDesc',
        label: intl.get(`hivp.batchCheck.view.collectionStaff`).d('收票员工'),
        type: FieldType.string,
        bind: 'ticketCollectorObj.employeeDesc',
      },
      {
        name: 'ticketCollector',
        type: FieldType.string,
        bind: 'ticketCollectorObj.employeeId',
      },
      {
        name: 'employeeTypeCode',
        type: FieldType.string,
        bind: 'ticketCollectorObj.employeeTypeCode',
      },
      {
        name: 'internationalTelCode',
        label: intl.get(`hivp.batchCheck.view.countryCode`).d('国际区号'),
        type: FieldType.string,
        lookupCode: 'HPFM.IDD',
        computedProps: {
          required: ({ record }) => record.get('ticketCollector'),
        },
        bind: 'ticketCollectorObj.internationalTelCode',
      },
      {
        name: 'employeeIdentify',
        label: intl.get(`hivp.batchCheck.view.employeeIdentify`).d('收票员工标识'),
        type: FieldType.string,
        bind: 'ticketCollectorObj.mobile',
        computedProps: {
          required: ({ record }) => record.get('ticketCollector'),
          pattern: ({ record }) => {
            if (record.get('internationalTelCode') === '+86') {
              return phoneReg;
            }
          },
          defaultValidationMessages: ({ record }) => {
            if (record.get('internationalTelCode') === '+86') {
              return {
                patternMismatch: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
              };
            }
          },
        },
      },
      {
        name: 'ticketCollectorDate',
        label: intl.get(`hivp.bill.view.ticketCollectorDate`).d('收票日期'),
        type: FieldType.date,
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'abnormalSign',
        label: intl.get(`hivp.checkCertification.view.abnormalSign`).d('异常标记'),
        type: FieldType.string,
        lookupCode: 'HIVP.ABNORMAL_SIGN',
        multiple: ',',
      },
      {
        name: 'recordType',
        label: intl.get(`htc.common.view.recordType`).d('档案类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_TYPE',
      },
      {
        name: 'recordState',
        label: intl.get(`hivp.bill.view.recordState`).d('归档状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.ARCHIVING_STATE',
      },
      {
        name: 'receiptsState',
        label: intl.get(`hivp.bill.view.receiptsState`).d('单据状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
      },
      {
        name: 'entryAccountState',
        label: intl.get(`hivp.bill.view.entryAccountState`).d('入账状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.ACCOUNT_STATE',
      },
      {
        name: 'entryAccountDate',
        label: intl.get(`hivp.bill.view.entryAccountDate`).d('入账日期'),
        type: FieldType.date,
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'entryPoolDatetime',
        label: intl.get(`${modelCode}.view.entryPoolDatetime`).d('进池时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'entryPoolSource',
        label: intl.get(`hivp.bill.view.entryPoolSource`).d('进池来源'),
        type: FieldType.string,
        lookupCode: 'HIVP.INVOICE_FROM',
      },
      {
        name: 'entryPoolSourceIdentify',
        label: intl.get(`${modelCode}.view.entryPoolSourceIdentify`).d('进池来源标识'),
        type: FieldType.string,
      },
      {
        name: 'infoSource',
        label: intl.get(`hivp.checkCertification.view.infoSource`).d('信息来源'),
        type: FieldType.string,
      },
      {
        name: 'taxBureauManageState',
        label: intl.get(`hivp.bill.view.taxBureauManageState`).d('税局管理状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.SAT_MANAGEMENT_STATE',
      },
      {
        name: 'inOutType',
        label: intl.get(`hivp.invoicesLayoutPush.view.inOutType`).d('进销项类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.IN_OUT_TYPE',
      },
      {
        name: 'fileUrl',
        label: intl.get(`hivp.invoicesArchiveUpload.view.fileUrl`).d('文件URL'),
        type: FieldType.string,
      },
      {
        name: 'fileName',
        label: intl.get(`hivp.batchCheck.view.fileName`).d('文件名称'),
        type: FieldType.string,
      },
      {
        name: 'fileDate',
        label: intl.get(`hivp.bill.view.fileDate`).d('档案日期'),
        type: FieldType.dateTime,
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name, value }) => {
          if (value && name === 'companyObj') {
            const { companyCode, employeeNum, employeeName, mobile } = value;
            const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
            record.set('employeeDesc', employeeDesc);
          }
          if (name === 'systemCodeObj') {
            record.set('documentTypeCodeObj', null);
            record.set('documentNumberObj', null);
          }
          if (name === 'documentTypeCodeObj') {
            record.set('documentNumberObj', null);
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get(`htc.common.modal.companyName`).d('所属公司'),
          type: FieldType.object,
          lovCode: 'HMDM.CURRENT_EMPLOYEE',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'companyId',
          type: FieldType.string,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyName',
          label: intl.get(`hzero.hzeroTheme.page.companyName`).d('公司'),
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          label: intl.get(`hivp.bill.view.companyCode`).d('公司代码'),
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get(`hivp.bill.view.taxpayerNumber`).d('公司代码'),
          type: FieldType.string,
          bind: 'companyObj.taxpayerNumber',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeId',
          type: FieldType.string,
          bind: 'companyObj.employeeId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeDesc',
          label: intl.get(`htc.common.modal.employeeDesc`).d('登录员工'),
          type: FieldType.string,
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeNum',
          label: intl.get(`hiop.redInvoiceInfo.view.employeeNum`).d('员工编号'),
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          ignore: FieldIgnore.always,
        },
        {
          name: 'email',
          label: intl.get(`hzero.common.email`).d('邮箱'),
          type: FieldType.string,
          bind: 'companyObj.email',
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceType',
          label: intl.get(`htc.common.view.invoiceType`).d('发票类型'),
          type: FieldType.string,
          lookupCode: 'HIVC.INVOICE_TYPE',
        },
        {
          name: 'invoiceDate',
          label: intl.get(`htc.common.view.invoiceDate`).d('开票日期'),
          type: FieldType.date,
          required: true,
          range: ['invoiceDateFrom', 'invoiceDateTo'],
          defaultValue: {
            invoiceDateFrom: halfYearStart,
            invoiceDateTo: moment().format(DEFAULT_DATE_FORMAT),
          },
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceDateFrom',
          label: intl.get(`hivp.bill.view.invoiceDateFrom`).d('开票日期从'),
          type: FieldType.date,
          bind: 'invoiceDate.invoiceDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceDateTo',
          label: intl.get(`hivp.bill.view.invoiceDateTo`).d('开票日期至'),
          type: FieldType.date,
          bind: 'invoiceDate.invoiceDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'ticketCollectorDate',
          label: intl.get(`hivp.bill.view.ticketCollectorDate`).d('收票日期'),
          type: FieldType.date,
          // required: true,
          range: ['ticketCollectorDateFrom', 'ticketCollectorDateTo'],
          // defaultValue: {
          //   ticketCollectorDateFrom: yearStart,
          //   ticketCollectorDateTo: moment().format(DEFAULT_DATE_FORMAT),
          // },
          ignore: FieldIgnore.always,
        },
        {
          name: 'ticketCollectorDateFrom',
          label: intl.get(`hivp.bill.view.ticketCollectorDateFrom`).d('收票日期从'),
          type: FieldType.date,
          bind: 'ticketCollectorDate.ticketCollectorDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'ticketCollectorDateTo',
          label: intl.get(`hivp.bill.view.ticketCollectorDateTo`).d('收票日期至'),
          type: FieldType.date,
          bind: 'ticketCollectorDate.ticketCollectorDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'entryAccountDate',
          label: intl.get(`hivp.bill.view.entryAccountDate`).d('入账日期'),
          type: FieldType.date,
          // required: true,
          range: ['entryAccountDateFrom', 'entryAccountDateTo'],
          // defaultValue: {
          //   entryAccountDateFrom: yearStart,
          //   entryAccountDateTo: moment().format(DEFAULT_DATE_FORMAT),
          // },
          ignore: FieldIgnore.always,
        },
        {
          name: 'entryAccountDateFrom',
          label: intl.get(`hivp.bill.view.entryAccountDateFrom`).d('入账日期从'),
          type: FieldType.date,
          bind: 'entryAccountDate.entryAccountDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'entryAccountDateTo',
          label: intl.get(`hivp.bill.view.entryAccountDateTo`).d('入账日期至'),
          type: FieldType.date,
          bind: 'entryAccountDate.entryAccountDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'entryPoolDatetime',
          label: intl.get(`hivp.bill.view.entryPoolDatetime`).d('进池日期'),
          type: FieldType.date,
          // required: true,
          range: ['entryPoolDatetimeFrom', 'entryPoolDatetimeTo'],
          // defaultValue: {
          //   entryPoolDatetimeFrom: yearStart,
          //   entryPoolDatetimeTo: moment().format(DEFAULT_DATE_FORMAT),
          // },
          ignore: FieldIgnore.always,
        },
        {
          name: 'entryPoolDatetimeFrom',
          label: intl.get(`hivp.bill.view.entryPoolDatetimeFrom`).d('进池日期从'),
          type: FieldType.date,
          bind: 'entryPoolDatetime.entryPoolDatetimeFrom',
        },
        {
          name: 'entryPoolDatetimeTo',
          label: intl.get(`hivp.bill.view.entryPoolDatetimeTo`).d('进池日期至'),
          type: FieldType.date,
          bind: 'entryPoolDatetime.entryPoolDatetimeTo',
          transformRequest: value =>
            value &&
            moment(value)
              .endOf('day')
              .format(DEFAULT_DATETIME_FORMAT),
        },
        {
          name: 'warehousingDate',
          label: intl.get(`${modelCode}.view.warehousingDate`).d('入库日期'),
          type: FieldType.date,
          // required: true,
          range: ['warehousingDateFrom', 'warehousingDateTo'],
          // defaultValue: {
          //   warehousingDateFrom: yearStart,
          //   warehousingDateTo: moment().format(DEFAULT_DATE_FORMAT),
          // },
          ignore: FieldIgnore.always,
        },
        {
          name: 'warehousingDateFrom',
          label: intl.get(`${modelCode}.view.warehousingDateFrom`).d('入库日期从'),
          type: FieldType.date,
          bind: 'warehousingDate.warehousingDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'warehousingDateTo',
          label: intl.get(`${modelCode}.view.warehousingDateTo`).d('入库日期至'),
          type: FieldType.date,
          bind: 'warehousingDate.warehousingDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'checkDate',
          label: intl.get(`hivc.select.model.select.tickDate`).d('勾选日期'),
          type: FieldType.date,
          // required: true,
          range: ['checkDateFrom', 'checkDateTo'],
          // defaultValue: {
          //   checkDateFrom: yearStart,
          //   checkDateTo: moment().format(DEFAULT_DATE_FORMAT),
          // },
          ignore: FieldIgnore.always,
        },
        {
          name: 'checkDateFrom',
          label: intl.get(`hivc.select.model.select.tickDateFrom`).d('勾选日期从'),
          type: FieldType.date,
          bind: 'checkDate.checkDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'checkDateTo',
          label: intl.get(`hivc.select.model.select.tickDateTo`).d('勾选日期至'),
          type: FieldType.date,
          bind: 'checkDate.checkDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'displayOptions',
          label: intl.get(`${modelCode}.view.displayOptions`).d('显示选项'),
          type: FieldType.string,
          lookupCode: 'HIVP.DISPLAY_OPTIONS',
          // required: true,
          multiple: ',',
        },
        {
          name: 'invoiceStateStr',
          label: intl.get(`hivp.batchCheck.view.invoiceStatus`).d('发票状态'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_STATE',
          // required: true,
          multiple: ',',
        },
        {
          name: 'ticketCollectorObj',
          label: intl.get(`hivp.batchCheck.view.collectionStaff`).d('收票员工'),
          type: FieldType.object,
          lovCode: 'HMDM.EMPLOYEE_NAME',
          cascadeMap: { companyId: 'companyId' },
          ignore: FieldIgnore.always,
        },
        {
          name: 'ticketCollector',
          type: FieldType.string,
          bind: 'ticketCollectorObj.employeeId',
        },
        {
          name: 'entryPoolSource',
          label: intl.get(`hivp.bill.view.entryPoolSource`).d('进池来源'),
          type: FieldType.string,
          lookupCode: 'HIVP.INVOICE_FROM',
        },
        {
          name: 'recordState',
          label: intl.get(`hivp.bill.view.recordState`).d('归档状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.ARCHIVING_STATE',
        },
        {
          name: 'authenticationDateObj',
          label: intl.get(`${modelCode}.view.authenticationDate`).d('认证属期'),
          type: FieldType.object,
          lovCode: 'HIVP.AUTHENTICATION_DATE',
          ignore: FieldIgnore.always,
        },
        {
          name: 'authenticationDate',
          label: intl.get(`${modelCode}.view.authenticationDate`).d('认证属期'),
          type: FieldType.string,
          bind: 'authenticationDateObj.authenticationDate',
        },
        {
          name: 'authenticationState',
          label: intl.get(`hivp.checkCertification.view.authenticationState`).d('认证状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.CERTIFICATION_STATE',
          multiple: ',',
        },
        {
          name: 'authenticationType',
          label: intl.get(`hivp.checkCertification.view.authenticationType`).d('认证类型'),
          type: FieldType.string,
          lookupCode: 'HIVP.CERTIFICATION_TYPE',
          multiple: ',',
        },
        {
          name: 'taxBureauManageState',
          label: intl.get(`hivp.checkCertification.view.managementState`).d('管理状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.SAT_MANAGEMENT_STATE',
          multiple: ',',
        },
        {
          name: 'abnormalSign',
          label: intl.get(`hivp.checkCertification.view.abnormalSign`).d('异常标记'),
          type: FieldType.string,
          lookupCode: 'HIVP.ABNORMAL_SIGN',
          multiple: ',',
        },
        {
          name: 'entryAccountState',
          label: intl.get(`hivp.bill.view.entryAccountState`).d('入账状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.ACCOUNT_STATE',
          multiple: ',',
        },
        {
          name: 'receiptsState',
          label: intl.get(`hivp.bill.view.receiptsState`).d('单据状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
          multiple: ',',
        },
        {
          name: 'checkStates',
          label: intl.get(`hivp.checkCertification.view.checkState`).d('勾选状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.CHECK_STATE',
          multiple: ',',
        },
        {
          name: 'invoiceCode',
          label: intl.get(`htc.common.view.invoiceCode`).d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get(`htc.common.view.invoiceNo`).d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceAmount',
          label: intl.get('hivp.bill.view.amountExcludeTax').d('金额（不含税）'),
          type: FieldType.currency,
        },
        {
          name: 'salerName',
          label: intl.get(`htc.common.view.salerName`).d('销方名称'),
          type: FieldType.string,
        },
        {
          name: 'buyerName',
          label: intl.get(`htc.common.view.buyerName`).d('购方名称'),
          type: FieldType.string,
        },
        {
          name: 'systemCodeObj',
          label: intl.get('hivp.invoices.view.systemCode').d('来源系统'),
          type: FieldType.object,
          lovCode: 'HTC.SOURCE_SYSTEM',
          lovPara: { enabledFlag: 1 },
          ignore: FieldIgnore.always,
        },
        {
          name: 'systemCode',
          type: FieldType.string,
          bind: 'systemCodeObj.systemCode',
        },
        {
          name: 'docTypeHeaderId',
          type: FieldType.string,
          bind: 'systemCodeObj.docTypeHeaderId',
        },
        {
          name: 'documentTypeCodeObj',
          label: intl.get('hivp.invoicesArchiveUpload.view.documentTypeMeaning').d('单据类型'),
          type: FieldType.object,
          lovCode: 'HTC.DOCUMENT_TYPE',
          cascadeMap: { docTypeHeaderId: 'docTypeHeaderId' },
          lovPara: { enabledFlag: 1 },
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentTypeCode',
          type: FieldType.string,
          bind: 'documentTypeCodeObj.documentTypeCode',
        },
        {
          name: 'docTypeLineId',
          type: FieldType.string,
          bind: 'documentTypeCodeObj.docTypeLineId',
        },
        {
          name: 'docuTypeHeaderId',
          type: FieldType.string,
          bind: 'documentTypeCodeObj.docTypeHeaderId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentNumberObj',
          label: intl.get('hivp.invoicesArchiveUpload.view.documentNumber').d('单据编号'),
          type: FieldType.object,
          lovCode: 'HTC.DOCUMENT_CODE',
          cascadeMap: { docTypeHeaderId: 'docuTypeHeaderId', docTypeLineId: 'docTypeLineId' },
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentNumber',
          type: FieldType.string,
          bind: 'documentNumberObj.documentNumber',
        },
        {
          name: 'detailId',
          type: FieldType.string,
          bind: 'documentNumberObj.detailId',
        },
      ],
    }),
  };
};
