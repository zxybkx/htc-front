/*
 * @Descripttion:发票池model
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-11 17:10:12
 * @LastEditTime: 2020-09-21 11:20:47
 * @Copyright: Copyright (c) 2020, Hand
 */
import { getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'invoices',
  state: {
    lovList: {}, // 值集
  },
  effects: {
    *init(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          displayOptions: 'HIVP.DISPLAY_OPTIONS',
          invoiceState: 'HMDM.INVOICE_STATE',
          abnormalSign: 'HIVP.ABNORMAL_SIGN',
          accountState: 'HIVP.ACCOUNT_STATE',
          interfaceDocsState: 'HIVP.INTERFACE_DOCS_STATE',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          lovList: result,
        },
      });
      return result;
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
