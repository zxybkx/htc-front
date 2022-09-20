/**
 * @Description:勾选认证-更新企业档案
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2020-09-23 14:26:15
 * @LastEditTime: 2022-08-26 09:32:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';

const modelCode = 'hivp.checkCertification';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { data } = config;
        const { companyId } = data || {};
        const url = `${API_PREFIX}/v1/${tenantId}/enterprise-file-infos/${companyId}`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            tenantId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    paging: false,
    primaryKey: 'enterpriseFileInfoId',
    fields: [
      {
        name: 'companyName',
        label: intl.get('htc.common.view.companyName').d('公司名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'currentTaxpayerNumber',
        label: intl.get(`${modelCode}.view.currentTaxpayerNumber`).d('当前纳税人识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'usedTaxpayerNumber',
        label: intl.get(`${modelCode}.view.usedTaxpayerNumber`).d('曾用纳税人识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'declarePeriod',
        label: intl.get(`${modelCode}.view.declarePeriodObj`).d('申报周期'),
        type: FieldType.string,
        lookupCode: 'HIVP.DELARE_PERIOD',
        readOnly: true,
      },
      {
        name: 'creditRating',
        label: intl.get(`${modelCode}.view.creditRating`).d('信用等级'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'exportComType',
        label: intl.get(`${modelCode}.view.exportComType`).d('出口退税企业类型'),
        labelWidth: '100',
        lookupCode: 'HIVP.EXPORT_COM_TYPE',
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'taxpayerType',
        label: intl.get(`${modelCode}.view.taxpayerType`).d('纳税人资格'),
        type: FieldType.string,
        lookupCode: 'HIVP.TAXPAYER_TYPE',
        readOnly: true,
      },
      {
        name: 'taxpayerRegisterDateFrom',
        label: intl.get(`${modelCode}.view.taxpayerRegisterDateFrom`).d('转登记纳税人登记时间起'),
        labelWidth: '150',
        type: FieldType.date,
        readOnly: true,
      },
      {
        name: 'taxpayerRegisterDateTo',
        label: intl.get(`${modelCode}.view.taxpayerRegisterDateTo`).d('转登记纳税人登记时间止'),
        labelWidth: '150',
        type: FieldType.date,
        readOnly: true,
      },
      {
        name: 'isSpecificCom',
        label: intl.get(`${modelCode}.view.isSpecificCom`).d('是否特定企业'),
        type: FieldType.string,
        lookupCode: 'HIVP.IS_SPECIFIC_COM',
        // trueValue: 'Y',
        // falseValue: 'N',
        readOnly: true,
      },
      {
        name: 'isParentCom',
        label: intl.get(`${modelCode}.view.isParentCom`).d('是否分公司'),
        type: FieldType.string,
        lookupCode: 'HIVP.IS_PARENT_COM',
        // trueValue: '2',
        // falseValue: '1',
        readOnly: true,
      },
      {
        name: 'oilsComType',
        label: intl.get(`${modelCode}.view.oilsComType`).d('油类企业类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.OILS_COM_TYPE',
        readOnly: true,
      },
      {
        name: 'oilsComTaxPeriod',
        label: intl.get(`${modelCode}.view.oilsComTaxPeriod`).d('油类企业类型为生产企业的报税周期'),
        labelWidth: '220',
        type: FieldType.string,
        lookupCode: 'HIVP.OILS_MANUFACTURING_ENTERPRISE_DECLARE_PERIOD',
        readOnly: true,
      },
      {
        name: 'ethylAlcoholOilsCom',
        label: intl.get(`${modelCode}.view.ethylAlcoholOilsCom`).d('是否乙醇调和油企业'),
        labelWidth: '160',
        lookupCode: 'HIVP.ETHYL_ALCOHOL_OILS_COM',
        type: FieldType.string,
        // trueValue: '1',
        // falseValue: '0',
        readOnly: true,
      },
      {
        name: 'parentComInfo',
        label: intl.get(`${modelCode}.view.parentComInfo`).d('总公司信息'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'fileSynchronizationTime',
        label: intl.get(`${modelCode}.view.fileSynchronizationTime`).d('档案同步时间'),
        type: FieldType.dateTime,
        readOnly: true,
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
        },
      },
      fields: [
        {
          name: 'tenantId',
          label: intl.get('htc.common.modal.tenantId').d('租户id'),
          type: FieldType.number,
        },
        {
          name: 'companyObj',
          type: FieldType.object,
          lovCode: 'HMDM.CURRENT_EMPLOYEE',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
          // required: true,
        },
        {
          name: 'companyId',
          type: FieldType.number,
          bind: 'companyObj.companyId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyName',
          label: intl.get('hzero.hzeroTheme.page.companyName').d('公司'),
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          label: intl.get('htc.common.modal.companyCode').d('公司代码'),
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          required: true,
        },
        {
          name: 'employeeId',
          type: FieldType.number,
          bind: 'companyObj.employeeId',
          // ignore: FieldIgnore.always,
        },
        {
          name: 'employeeDesc',
          label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
          type: FieldType.string,
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeNumber',
          label: intl.get('hiop.redInvoiceInfo.modal.employeeNum').d('员工编号'),
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          required: true,
        },
        {
          name: 'employeeName',
          label: intl.get(`${modelCode}.view.employeeName`).d('员工姓名'),
          type: FieldType.string,
          bind: 'companyObj.employeeName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'mobile',
          label: intl.get(`${modelCode}.view.mobile`).d('员工手机号'),
          type: FieldType.string,
          bind: 'companyObj.mobile',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
          type: FieldType.string,
          bind: 'companyObj.taxpayerNumber',
          ignore: FieldIgnore.always,
        },
        {
          name: 'curDate',
          label: intl.get('hivp.batchCheck.view.currentTime').d('当前日期'),
          type: FieldType.date,
          defaultValue: moment(),
          ignore: FieldIgnore.always,
          readOnly: true,
        },
      ],
    }),
  };
};

const TaxDiskPasswordDS = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'inChannelCode',
        type: FieldType.string,
      },
      {
        name: 'taxDiskPassword',
        label: intl.get(`${modelCode}.view.taxDiskPassword`).d('税盘密码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('inChannelCode') !== 'AISINO_IN_CHANNEL',
          readOnly: ({ record }) => record.get('inChannelCode') === 'AISINO_IN_CHANNEL',
        },
      },
    ],
  };
};
export { TaxDiskPasswordDS };
