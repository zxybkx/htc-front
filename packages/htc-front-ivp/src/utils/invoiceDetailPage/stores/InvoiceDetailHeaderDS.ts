/*
 * @Description:发票头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 11:54:42
 * @LastEditTime: 2020-11-24 15:19:36
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hcan.invoice-detail';

export default (propsData): DataSetProps => {
  // const API_PREFIX = commonConfig.CHAN_API || '';
  const IVP_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  let url = `${process.env.CHECK_API}/v1/${tenantId}/invoice-header-infos/query-invoice-all-info/${propsData.invoiceHeaderId}`;
  if (propsData.entryPoolSource && propsData.entryPoolSource === 'EXTERNAL_IMPORT') {
    url = `${IVP_PREFIX}/v1/${tenantId}/invoice-pool-header-infos`;
  }
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            invoicePoolHeaderId: propsData.invoiceHeaderId,
            companyCode: propsData.companyCode,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    paging: false,
    selection: false,
    fields: [
      {
        name: 'machineNo',
        label: intl.get(`${modelCode}.view.machineNo`).d('机器编号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'drawer',
        label: intl.get(`${modelCode}.view.drawer`).d('开票人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        readOnly: true,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'checkCount',
        label: intl.get(`${modelCode}.view.checkCount`).d('查验次数'),
        type: FieldType.number,
        readOnly: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'checkCode',
        label: intl.get(`${modelCode}.view.checkCode`).d('校验码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerName',
        label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerAddressPhone',
        label: intl.get(`${modelCode}.view.salerAddressPhone`).d('销方地址电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerTaxNo',
        label: intl.get(`${modelCode}.view.salerTaxNo`).d('销方税号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerAccount',
        label: intl.get(`${modelCode}.view.salerAccount`).d('销方银行账号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerAddressPhone',
        label: intl.get(`${modelCode}.view.buyerAddressPhone`).d('购方地址电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get(`${modelCode}.view.buyerTaxNo`).d('购方税号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerAccount',
        label: intl.get(`${modelCode}.view.buyerAccount`).d('购方银行账号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('发票税额'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'totalAmount',
        label: intl.get(`${modelCode}.view.totalAmount`).d('价税合计'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'payee',
        label: intl.get(`${modelCode}.view.payee`).d('收款人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'reviewer',
        label: intl.get(`${modelCode}.view.reviewer`).d('复核人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'cancellationMark',
        label: intl.get(`${modelCode}.view.cancellationMark`).d('作废标志'),
        type: FieldType.string,
        lookupCode: 'HCAN.CANCELLCATION_MARK',
        readOnly: true,
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get(`${modelCode}.view.blueInvoiceCode`).d('蓝票发票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get(`${modelCode}.view.blueInvoiceNo`).d('蓝票发票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'remark',
        label: intl.get(`${modelCode}.view.remark`).d('备注'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'idNo',
        label: intl.get(`${modelCode}.view.idNo`).d('购方身份证号/组织机构代码'),
        type: FieldType.string,
        readOnly: true,
        labelWidth: '160',
      },
      {
        name: 'vehicleType',
        label: intl.get(`${modelCode}.view.vehicleType`).d('车牌型号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'bandModel',
        label: intl.get(`${modelCode}.view.bandModel`).d('厂牌型号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'produceArea',
        label: intl.get(`${modelCode}.view.produceArea`).d('产地'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'qualifiedNo',
        label: intl.get(`${modelCode}.view.qualifiedNo`).d('合格证号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'commodityInspectionNo',
        label: intl.get(`${modelCode}.view.commodityInspectionNo`).d('商检单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'engineNo',
        label: intl.get(`${modelCode}.view.engineNo`).d('发动机号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'vehicleIdentificationNo',
        label: intl.get(`${modelCode}.view.vehicleIdentificationNo`).d('车辆识别代号/车架号码'),
        type: FieldType.string,
        readOnly: true,
        labelWidth: '160',
      },
      {
        name: 'certificateOfImport',
        label: intl.get(`${modelCode}.view.certificateOfImport`).d('进口证明书号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'taxAuthorityCode',
        label: intl.get(`${modelCode}.view.taxAuthorityCode`).d('主管税务机关代码'),
        type: FieldType.string,
        readOnly: true,
        labelWidth: '120',
      },
      {
        name: 'taxPaymentCertificateNo',
        label: intl.get(`${modelCode}.view.taxPaymentCertificateNo`).d('完税凭证号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'limitedPeopleCount',
        label: intl.get(`${modelCode}.view.limitedPeopleCount`).d('限乘人数'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'taxAuthorityName',
        label: intl.get(`${modelCode}.view.taxAuthorityName`).d('主管税务机关名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'tonnage',
        label: intl.get(`${modelCode}.view.tonnage`).d('吨位'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'taxRate',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerAddress',
        label: intl.get(`${modelCode}.view.salerAddress`).d('销方地址'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerPhone',
        label: intl.get(`${modelCode}.view.salerPhone`).d('销方电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerBankName',
        label: intl.get(`${modelCode}.view.salerBankName`).d('销方开户银行'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerBankAccount',
        label: intl.get(`${modelCode}.view.salerBankAccount`).d('销方开户账号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'carrierName',
        label: intl.get(`${modelCode}.view.carrierName`).d('承运人名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'carrierTaxNo',
        label: intl.get(`${modelCode}.view.carrierTaxNo`).d('承运人识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'draweeName',
        label: intl.get(`${modelCode}.view.draweeName`).d('受票方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'draweeTaxNo',
        label: intl.get(`${modelCode}.view.draweeTaxNo`).d('受票方识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'receiveName',
        label: intl.get(`${modelCode}.view.receiveName`).d('收货方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'receiveTaxNo',
        label: intl.get(`${modelCode}.view.receiveTaxNo`).d('收货方识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'consignorName',
        label: intl.get(`${modelCode}.view.consignorName`).d('发货人名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'consignorTaxNo',
        label: intl.get(`${modelCode}.view.consignorTaxNo`).d('发货人识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'transportGoodsInfo',
        label: intl.get(`${modelCode}.view.transportGoodsInfo`).d('运输货物信息'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'throughAddress',
        label: intl.get(`${modelCode}.view.throughAddress`).d('起运地、经由、到达地'),
        type: FieldType.string,
        readOnly: true,
        labelWidth: '150',
      },
      {
        name: 'taxDiskNumber',
        label: intl.get(`${modelCode}.view.taxDiskNumber`).d('税控盘号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'carNumber',
        label: intl.get(`${modelCode}.view.carNumber`).d('车种车号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'vehicleTonnage',
        label: intl.get(`${modelCode}.view.vehicleTonnage`).d('车船吨位'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'trafficFeeFlag',
        label: intl.get(`${modelCode}.view.trafficFeeFlag`).d('通行费标志'),
        type: FieldType.string,
        readOnly: true,
        lookupCode: 'HCAN.TRAFFIC_FEE_FLAG',
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get(`${modelCode}.view.zeroTaxRateFlag`).d('零税率标志'),
        type: FieldType.string,
        readOnly: true,
        lookupCode: 'HCAN.ZERO_TAX_RATE_FLAG',
      },
      {
        name: 'licensePlate',
        label: intl.get(`${modelCode}.view.licensePlate`).d('车牌照号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'registrationNo',
        label: intl.get(`${modelCode}.view.registrationNo`).d('登记证号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'carPrice',
        label: intl.get(`${modelCode}.view.carPrice`).d('车价合计'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'transferredVehicleOffice',
        label: intl.get(`${modelCode}.view.transferredVehicleOffice`).d('转入地车辆车管所名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerUnitOrIndividual',
        label: intl.get(`${modelCode}.view.buyerUnitOrIndividual`).d('买方单位/个人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerUnitCodeOrIdNo',
        label: intl.get(`${modelCode}.view.buyerUnitCodeOrIdNo`).d('买方单位代码/身份证号'),
        type: FieldType.string,
        readOnly: true,
        labelWidth: '160',
      },
      {
        name: 'buyerUnitOrIndividualAddress',
        label: intl.get(`${modelCode}.view.buyerUnitOrIndividualAddress`).d('买方单位/个人住址'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerPhone',
        label: intl.get(`${modelCode}.view.buyerPhone`).d('买方电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerUnitOrIndividual',
        label: intl.get(`${modelCode}.view.sellerUnitOrIndividual`).d('卖方单位/个人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerUnitCodeOrIdNo',
        label: intl.get(`${modelCode}.view.sellerUnitCodeOrIdNo`).d('卖方单位代码/身份证号'),
        type: FieldType.string,
        readOnly: true,
        labelWidth: '160',
      },
      {
        name: 'sellerUnitOrIndividualAddress',
        label: intl.get(`${modelCode}.view.sellerUnitOrIndividualAddress`).d('卖方单位/个人住址'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerPhone',
        label: intl.get(`${modelCode}.view.sellerPhone`).d('卖方电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'businessUnit',
        label: intl.get(`${modelCode}.view.businessUnit`).d('经营、拍卖单位'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'businessUnitAddress',
        label: intl.get(`${modelCode}.view.businessUnitAddress`).d('经营、拍卖单位地址'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'businessUnitTaxNo',
        label: intl.get(`${modelCode}.view.businessUnitTaxNo`).d('经营、拍卖单位纳税人识别号'),
        type: FieldType.string,
        readOnly: true,
        labelWidth: '160',
      },
      {
        name: 'businessUnitBankAndAccount',
        label: intl.get(`${modelCode}.view.businessUnitBankAndAccount`).d('开户银行及账号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'businessUnitPhone',
        label: intl.get(`${modelCode}.view.businessUnitPhone`).d('经营、拍卖单位电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'lemonMarket',
        label: intl.get(`${modelCode}.view.lemonMarket`).d('二手车市场'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'lemonMarketTaxNo',
        label: intl.get(`${modelCode}.view.lemonMarketTaxNo`).d('二手车市场纳税人识别号'),
        type: FieldType.string,
        readOnly: true,
        labelWidth: '160',
      },
      {
        name: 'lemonMarketAddress',
        label: intl.get(`${modelCode}.view.lemonMarketAddress`).d('二手车市场地址'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'lemonMarketBankAndAccount',
        label: intl
          .get(`${modelCode}.view.lemonMarketBankAndAccount`)
          .d('二手车市场开户银行及账号'),
        type: FieldType.string,
        readOnly: true,
        labelWidth: '160',
      },
      {
        name: 'lemonMarketPhone',
        label: intl.get(`${modelCode}.view.lemonMarketPhone`).d('二手车市场电话'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};
