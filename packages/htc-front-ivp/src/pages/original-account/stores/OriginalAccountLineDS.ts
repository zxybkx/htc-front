/*
 * @Description:发票池-底账行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2022-07-26 17:18:21
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.invoicesOriginalAccount';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/original-account-lines-infos`;
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
    },
    pageSize: 10,
    selection: false,
    primaryKey: 'originalAccountLinesId',
    fields: [
      {
        name: 'originalAccountLinesId',
        type: FieldType.string,
      },
      {
        name: 'originalAccountHeaderId',
        type: FieldType.string,
      },
      {
        name: 'getDate',
        label: intl.get(`${modelCode}.view.getDate`).d('获取时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'requestFlag',
        label: intl.get(`${modelCode}.view.requestFlag`).d('请求方式'),
        type: FieldType.string,
        lookupCode: 'HIVP.MAIN_INFO_TYPE',
      },
      {
        name: 'completeStatus',
        label: intl.get(`${modelCode}.view.completeStatus`).d('完成状态'),
        type: FieldType.number,
      },
      {
        name: 'completeDate',
        label: intl.get(`hivp.checkCertification.view.completeTime`).d('完成时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'getInvoiceNum',
        label: intl.get(`${modelCode}.view.getInvoiceNum`).d('获取发票数量'),
        type: FieldType.number,
      },
      {
        name: 'updateInvoiceNum',
        label: intl.get(`${modelCode}.view.updateInvoiceNum`).d('更新发票数量'),
        type: FieldType.number,
      },
      {
        name: 'batchNo',
        label: intl.get(`hiop.redInvoiceInfo.modal.batchNo`).d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'parameter',
        label: intl.get('hzero.common.model.param').d('参数'),
        type: FieldType.string,
      },
      {
        name: 'exceptionInfo',
        label: intl.get('hzero.common.component.excelExport.v.hd.errorInfo').d('异常信息'),
        type: FieldType.string,
      },
    ],
  };
};
