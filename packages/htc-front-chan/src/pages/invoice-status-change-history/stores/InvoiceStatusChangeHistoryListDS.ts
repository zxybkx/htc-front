import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import { isUndefined } from 'util';

const modelCode = 'hcan.invoice-status-change-history';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.CHAN_API || '';
  // const tenantId = getCurrentOrganizationId();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/invoice-status-change-historys`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            // tenantId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    primaryKey: 'statusChangeHistoryId',
    selection: false,
    fields: [
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('员工'),
        type: FieldType.string,
      },
      {
        name: 'batchNo',
        label: intl.get(`${modelCode}.view.batchNo`).d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDateStart',
        label: intl.get(`${modelCode}.view.invoiceDateStart`).d('开票日期起'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDateEnd',
        label: intl.get(`${modelCode}.view.invoiceDateEnd`).d('开票日期止'),
        type: FieldType.string,
      },
      {
        name: 'processStatusCode',
        label: intl.get(`${modelCode}.view.processStatusCode`).d('请求状态码'),
        type: FieldType.string,
      },
      {
        name: 'processRemark',
        label: intl.get(`${modelCode}.view.processRemark`).d('处理消息'),
        type: FieldType.string,
      },
      {
        name: 'processDateFrom',
        label: intl.get(`${modelCode}.view.processDateFrom`).d('处理日期从'),
        type: FieldType.dateTime,
      },
      {
        name: 'processDateTo',
        label: intl.get(`${modelCode}.view.processDateTo`).d('处理日期至'),
        type: FieldType.dateTime,
      },
      {
        name: 'statusChangeDateStart',
        label: intl.get(`${modelCode}.view.statusChangeDateStart`).d('状态变更日期起'),
        type: FieldType.dateTime,
      },
      {
        name: 'statusChangeDateEnd',
        label: intl.get(`${modelCode}.view.statusChangeDateEnd`).d('状态变更日期止'),
        type: FieldType.dateTime,
      },
    ],
    queryFields: [
      {
        name: 'tenantObject',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.object,
        lovCode: 'HPFM.TENANT',
        ignore: FieldIgnore.always,
      },
      {
        name: 'tenantId',
        type: FieldType.number,
        bind: `tenantObject.tenantId`,
      },
      {
        name: 'companyObject',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司'),
        type: FieldType.object,
        lovCode: 'HMDM.COMPANY_INFO_SITE',
        ignore: FieldIgnore.always,
        dynamicProps: {
          lovPara: ({ record }) => {
            if (!isUndefined(record.get('tenantId'))) {
              return { organizationId: record.get('tenantId') };
            }
          },
          disabled: ({ record }) => {
            return isUndefined(record.get('tenantId'));
          },
        },
      },
      {
        name: 'companyCode',
        type: FieldType.string,
        bind: 'companyObject.companyCode',
      },
      {
        name: 'employeeObject',
        label: intl.get(`${modelCode}.view.employeeNumber`).d('员工'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        cascadeMap: { tenantId: 'tenantId', companyCode: 'companyCode' },
      },
      {
        name: 'employeeNumber',
        type: FieldType.string,
        bind: 'employeeObject.employeeNum',
      },
      {
        name: 'bathNo',
        label: intl.get(`${modelCode}.view.bathNo`).d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDateStart',
        label: intl.get(`${modelCode}.view.invoiceDateStart`).d('开票日期起'),
        type: FieldType.date,
        max: 'invoiceDateEnd',
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceDateEnd',
        label: intl.get(`${modelCode}.view.invoiceDateEnd`).d('开票日期止'),
        type: FieldType.date,
        min: 'invoiceDateStart',
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'processDateFrom',
        label: intl.get(`${modelCode}.view.processDateFrom`).d('处理日期从'),
        type: FieldType.dateTime,
        max: 'processDateTo',
      },
      {
        name: 'processDateTo',
        label: intl.get(`${modelCode}.view.processDateTo`).d('处理日期至'),
        type: FieldType.dateTime,
        min: 'processDateFrom',
      },
      {
        name: 'statusChangeDateStart',
        label: intl.get(`${modelCode}.view.statusChangeDateStart`).d('状态变更日期起'),
        type: FieldType.date,
        max: 'statusChangeDateEnd',
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'statusChangeDateEnd',
        label: intl.get(`${modelCode}.view.statusChangeDateEnd`).d('状态变更日期止'),
        type: FieldType.date,
        min: 'statusChangeDateStart',
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
    ],
  };
};
