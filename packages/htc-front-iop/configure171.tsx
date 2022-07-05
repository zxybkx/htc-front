/**
 * choerodon-ui - choerodon-ui 客制化配置文件
 * @Author: wuyunqiang <yunqiang.wu@hand-china.com>
 * @Date: 2019-08-15 09:12:30
 * @LastEditTime: 2019-08-27 09:47:01
 * @Copyright: Copyright (c) 2018, Hand
 */
import axios from 'axios';
import { configure, message, getConfig as getC7nConfig } from 'choerodon-ui';
import { Config } from 'choerodon-ui/lib/configure';
// @ts-ignore
import { getConfig } from 'hzero-boot';
import { routerRedux } from 'dva/router';
import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';
import {
  generateUrlWithGetParam,
  getAccessToken,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getRequestId,
  setSession,
  getSession,
  isEqualOrganization,
  getCurrentUserId,
} from 'hzero-front/lib/utils/utils';
import { getEnvConfig, getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import { TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
// import request from 'utils/request';
import { getMenuId } from 'hzero-front/lib/utils/menuTab';


const lovDefineAxiosConfig = (code, field) => {
  let publicFlag = false;
  if (field?.get('lovPara')) {
    const { publicMode } = field.get('lovPara');
    publicFlag = publicMode;
  }
  const { API_HOST, HZERO_PLATFORM } = getEnvConfig();
  return {
    url: `${API_HOST}${HZERO_PLATFORM}/v1/${
      // eslint-disable-next-line no-nested-ternary
      publicFlag ? 'pub/' : isEqualOrganization() ? `${getCurrentOrganizationId()}/` : ''
      }lov-view/info?viewCode=${code}`,
    method: 'GET',
    transformResponse: [
      (data) => {
        // 对 data 进行任意转换处理
        let originData: any = {};

        try {
          originData = JSON.parse(data);
        } catch (e) {
          console.error(e, data);
          return data;
        }

        const {
          height,
          viewCode = code,
          valueField = 'value',
          displayField = 'name',
          pageSize = 5,
          queryFields = [],
          tableFields = [],
          // queryUrl,
        } = originData;
        let { title } = originData;
        if (originData.failed) {
          title = intl
            .get('hzero.common.c7n.lov.notDefine', { code })
            .d(`值集视图未定义: "${code}", 请维护值集视图!`);
        } else if (!originData.lovCode) {
          title = `lov ${code} loading...`;
        }
        const lovItems: any[] = [];
        // let tableWidth = 0;
        queryFields.forEach((queryItem: any = {}) => {
          const lovItem = {
            lovId: viewCode,
            lovItemId: `query_${queryItem.field}`,
            gridFieldName: queryItem.field,
            gridField: 'N',
            display: queryItem.label,
            autocompleteField: 'Y',
            conditionField: 'Y',
            isAutocomplete: 'N',
            conditionFieldWidth: null,
            conditionFieldLabelWidth: null,
            conditionFieldType: queryItem.dataType === 'LOV_CODE' ? 'object' : queryItem.dataType,
            conditionFieldSelectCode: queryItem.dataType === 'SELECT' ? queryItem.sourceCode : null,
            conditionFieldLovCode: queryItem.dataType === 'LOV_CODE' ? queryItem.sourceCode : null,
            conditionFieldName: null,
            conditionFieldTextfield: null,
            conditionFieldNewline: 'N',
            conditionFieldSelectUrl: null,
            conditionFieldSelectVf: null,
            conditionFieldSelectTf: null,
            conditionFieldSequence: 1,
            gridFieldSequence: 1,
          };
          lovItems.push(lovItem);
        });
        tableFields.forEach((tableItem) => {
          const lovItem = {
            lovId: viewCode,
            lovItemId: `table_${tableItem.dataIndex}`,
            gridFieldName: tableItem.dataIndex,
            gridFieldWidth: tableItem.width,
            gridFieldAlign: 'left',
            autocompleteField: 'Y',
            conditionField: 'N',
            isAutocomplete: 'N',
            gridField: 'Y',
            display: tableItem.title,
            conditionFieldWidth: null,
            conditionFieldLabelWidth: null,
            conditionFieldType: null,
            conditionFieldSelectCode: null,
            conditionFieldName: null,
            conditionFieldTextfield: null,
            conditionFieldNewline: 'N',
            conditionFieldSelectUrl: null,
            conditionFieldSelectVf: null,
            conditionFieldSelectTf: null,
            conditionFieldLovCode: null,
            conditionFieldSequence: 1,
            gridFieldSequence: 1,
          };
          lovItems.push(lovItem);
          // tableWidth += tableItem.width;
        });

        return {
          originData: {
            lovCode: code,
            ...originData,
          },
          code: viewCode,
          title,
          description: title,
          lovId: viewCode,
          placeholder: title,
          sqlId: viewCode,
          customSql: null,
          queryColumns: 2,
          customUrl: null,
          textField: displayField,
          valueField,
          delayLoad: 'N',
          needQueryParam: 'N',
          editableFlag: 'Y',
          canPopup: 'Y',
          lovPageSize: pageSize,
          treeFlag: 'N',
          idField: null,
          parentIdField: null,
          lovItems,
          width: 710,
          height,
        };
      },
    ],
  };
};
const lookupAxiosConfig = ({ params, lookupCode }) => {
  let publicFlag = false;
  let lovParams = {};
  if (params) {
    const { publicMode, ...other } = params;
    publicFlag = publicMode;
    lovParams = other;
  }
  const { API_HOST, HZERO_PLATFORM } = getEnvConfig();
  return {
    url: lookupCode
      ? `${API_HOST}${HZERO_PLATFORM}/v1/${
      // eslint-disable-next-line no-nested-ternary
      publicFlag ? 'pub/' : isEqualOrganization() ? `${getCurrentOrganizationId()}/` : ''
      }lovs/data?lovCode=${lookupCode}`
      : undefined,
    method: 'GET',
    params: lovParams,
    transformResponse: (data) => {
      // 对 data 进行任意转换处理
      let originData: any = data || [];
      if (typeof data === 'string') {
        try {
          originData = JSON.parse(data);
        } catch (e) {
          originData = data;
        }
      }
      return originData;
    },
  };
};
const lovQueryAxiosConfig = (code, lovConfig: any = {}, props, lovQueryUrl) => {
  const { queryUrl, lovCode } = lovConfig.originData || {};
  const { API_HOST, HZERO_PLATFORM } = getEnvConfig();
  let url = `${API_HOST}${HZERO_PLATFORM}/v1/${isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
    }lovs/data?lovCode=${lovCode}`;
  if (lovQueryUrl) {
    url = lovQueryUrl;
  } else if (queryUrl) {
    url = generateUrlWithGetParam(queryUrl, { lovCode });
    const organizationRe = /{organizationId}|{tenantId}/g;
    if (organizationRe.test(url)) {
      const tId = getCurrentOrganizationId();
      url = url.replace(organizationRe, tId);
    }
    // url = `${url}${url.indexOf('?') ? '&' : '?'}lovCode=${lovCode}`;
  }
  return {
    url,
    method: 'GET',
  };
};

// TODO: 批量查询lookupCode只支持独立值集，对于sql值集等的如何处理？？
// const lookupBatchAxiosConfig = codes => {
//   const url = `${API_HOST}${HZERO_PLATFORM}/v1/${
//     isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
//   }lovs/value/batch`;
//   return {
//     url,
//     method: 'GET',
//     params: codes.reduce((obj, code) => {
//       // eslint-disable-next-line
//       obj[code] = code;
//       return obj;
//     }, {}),
//   };
// };

const generatePageQuery = ({ page, pageSize, sortName, sortOrder }) => ({
  page: page === undefined ? page : page - 1,
  size: pageSize,
  sort: sortName && (sortOrder ? `${sortName},${sortOrder}` : sortName),
});

/**
 * 鉴权 401
 * @param status 状态码
 */
const authrIntercept = (status) => {
  if (status === 401) {
    const withTokenAxios = getC7nConfig('axios') || axios;
    const accessToken = getAccessToken();
    const { HZERO_OAUTH } = getEnvConfig();
    const dvaApp = getDvaApp();
    const language = getSession('language') || 'zh_CN';
    // FIXME:已处理过一次401后就不再处理
    const cacheLocation = encodeURIComponent(window.location.toString());
    if (accessToken) {
      withTokenAxios(`${HZERO_OAUTH}/public/token/kickoff`, {
        method: 'POST',
        params: {
          access_token: accessToken,
        },
      }).then((res: any) => {
        if (res?.kickoff === 1) {
          // 跳转到踢下线界面
          // eslint-disable-next-line
          dvaApp._store.dispatch(
            routerRedux.push({
              pathname: '/public/kickoff',
              search: `?language=${language}`,
            })
          );
          setSession('redirectUrl', cacheLocation);
          setSession('isErrorFlag', false);
        } else {
          // token 失效, 跳转到 token失效页面
          dvaApp._store.dispatch(
            routerRedux.push({
              pathname: '/public/unauthorized',
              search: `?language=${language}`,
            })
          );
          setSession('isErrorFlag', true);
          // 登陆后需要跳回的界面， 放到session中
          setSession('redirectUrl', cacheLocation);
        }
      });
    }
    return false;
  }
  return true;
};

const loadConfig = () => {
  const jsonMimeType = 'application/json';

  const withTokenAxios = getC7nConfig('axios') || axios;

  if (!(withTokenAxios as any)._HZERO_AXIOS_IS_CONFIGED) {
    // 微前端模式下， 这个语句块会多次执行， 所以加一个条件限制， 只能执行一次
    withTokenAxios.defaults = {
      ...withTokenAxios.defaults,
      headers: {
        ...(withTokenAxios.defaults || {}).headers,
        // Authorization: `bearer ${getAccessToken()}`,
        'Content-Type': jsonMimeType,
        Accept: jsonMimeType,
        'X-Requested-With': 'XMLHttpRequest',
        // baseURL: API_HOST,
      },
      withCredentials: true,
    };

    // Add a request interceptor
    withTokenAxios.interceptors.request.use(
      (config) => {
        let { url = '' } = config;
        const { API_HOST } = getEnvConfig();
        if (url.indexOf('://') === -1 && !url.startsWith('/_api')) {
          url = `${API_HOST}${url}`;
        }
        // Do something before request is sent
        const MenuId = getMenuId();

        // 添加额外的请求头
        const patchRequestHeaderConfig = getConfig('patchRequestHeader');
        let patchRequestHeader;
        if (patchRequestHeaderConfig) {
          if (typeof patchRequestHeaderConfig === 'function') {
            patchRequestHeader = patchRequestHeaderConfig();
          } else {
            patchRequestHeader = patchRequestHeaderConfig;
          }
        }

        if (MenuId) {
          return {
            ...config,
            url,
            withCredentials: true,
            headers: {
              ...config.headers,
              Authorization: `bearer ${getAccessToken()}`,
              'H-Menu-Id': `${getMenuId()}`,
              'H-Request-Id': `${getRequestId()}`,
              ...patchRequestHeader,
            },
          };
        } else {
          return {
            ...config,
            url,
            withCredentials: true,
            headers: {
              ...config.headers,
              Authorization: `bearer ${getAccessToken()}`,
              'H-Request-Id': `${getRequestId()}`,
              ...patchRequestHeader,
            },
          };
        }
      },
      (error) =>
        // Do something with request error
        Promise.reject(error)
    );

    withTokenAxios.interceptors.response.use((response) => {
      const {
        status,
        data,
        config: { url },
      } = response;
      if (!authrIntercept(status)) {
        return;
      }
      if (status === 204) {
        return undefined;
      }
      // 响应拦截
      const responseIntercept = getConfig('responseIntercept');
      if (responseIntercept) {
        if (typeof responseIntercept === 'function') {
          responseIntercept(url, status, data);
        }
      }
      if (data && data.failed) {
        throw data;
      } else if (data && data.detailsMessage) {
        let m = require('hzero-front/lib/assets/icon_page_wrong.svg');
        if (m.__esModule) {
          m = m.default;
        }
        notification.error({
          message: data?.detailsMessage || intl.get(`hzero.common.requestNotification.${status}`),
          description: data?.requestMessage,
        });
      } else {
        return data;
      }
    });
    (withTokenAxios as any)._HZERO_AXIOS_IS_CONFIGED = true;
  }

  // axios.defaults.headers.common.Authorization = `bearer ${getAccessToken()}`;
  message.config({
    placement: 'bottomRight',
    bottom: 48,
    duration: 2,
  });

  const notificationType = (type, msg) => {
    switch (type) {
      case 'info':
        notification.info({
          message: msg,
        });
        break;
      case 'warn':
        notification.warning({
          message: msg,
        });
        break;
      case 'error':
      default:
        notification.error({
          message: msg,
        });
        break;
    }
  };

  const tableCustomizedLoad = async (customizedCode) => {
    const { HZERO_PLATFORM } = getEnvConfig();
    const tenantId = getCurrentOrganizationId();
    const userId = getCurrentUserId();
    const code = `table.customized.${customizedCode}`;
    const localCode = `${code}.${tenantId}.${userId}`;
    const serializedCustomized = localStorage.getItem(localCode);
    if (serializedCustomized) {
      try {
        const customized = JSON.parse(serializedCustomized);
        if (tenantId === 0 || Date.now() - customized.lastUpdateTime < 60 * 60000) {
          return customized;
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (tenantId !== 0) {
      // try {
      const res: any = await withTokenAxios({
        url: `${HZERO_PLATFORM}/v1/${tenantId}/personal-tables`,
        method: 'GET',
        params: {
          code,
          tenantId,
          userId,
        },
      });
      if (res && res.dataJson) {
        const remoteCustomized = {
          ...JSON.parse(res.dataJson),
          lastUpdateTime: Date.now(),
        };
        const newSerializedCustomized = JSON.stringify(remoteCustomized);
        localStorage.setItem(localCode, newSerializedCustomized);
        return remoteCustomized;
      }
      //   const { dataJson } = await request(`${HZERO_PLATFORM}/v1/${tenantId}/personal-tables`, {
      //     method: 'GET',
      //     query: {
      //       code,
      //       tenantId,
      //       userId,
      //     },
      //   });
      //   if (dataJson) {
      //     const remoteCustomized = {
      //       ...JSON.parse(dataJson),
      //       lastUpdateTime: Date.now(),
      //     };
      //     const newSerializedCustomized = JSON.stringify(remoteCustomized);
      //     localStorage.setItem(localCode, newSerializedCustomized);
      //     return remoteCustomized;
      //   }
      // } catch (e) {
      //   console.error(e);
      // }
    }
    return {
      columns: {},
    };
  };

  const tableCustomizedSave = async (customizedCode, customized) => {
    const { HZERO_PLATFORM } = getEnvConfig();
    const code = `table.customized.${customizedCode}`;
    const tenantId = getCurrentOrganizationId();
    const userId = getCurrentUserId();
    const localCode = `${code}.${tenantId}.${userId}`;
    const serializedCustomized = JSON.stringify({
      ...customized,
      lastUpdateTime: Date.now(),
    });
    localStorage.setItem(localCode, serializedCustomized);
    if (tenantId !== 0) {
      withTokenAxios({
        url: `${HZERO_PLATFORM}/v1/${tenantId}/personal-tables`,
        method: 'POST',
        data: {
          code,
          tenantId,
          userId,
          dataJson: serializedCustomized,
        },
      })
        .then((res) => {
          if (res) {
            console.log(res);
          }
        })
        .catch((err) => {
          notification.error({
            message: err.message,
          });
        });
    }
  };

  configure({
    tableBorder: true,
    ripple: false,
    modalOkFirst: false,
    lookupAxiosConfig: lookupAxiosConfig as Config['lookupAxiosConfig'],
    lovDefineAxiosConfig: lovDefineAxiosConfig as Config['lovDefineAxiosConfig'],
    lovQueryAxiosConfig: lovQueryAxiosConfig as Config['lovDefineAxiosConfig'],
    lovQueryUrl: undefined,
    lookupUrl: undefined,
    // lookupBatchAxiosConfig,
    lookupAxiosMethod: 'GET',
    dataKey: 'content',
    totalKey: 'totalElements',
    axios: withTokenAxios,
    generatePageQuery: generatePageQuery as Config['generatePageQuery'],
    status: {
      add: 'create',
      update: 'update',
      delete: 'delete',
    },
    // iconfontPrefix: 'c7n',
    statusKey: '_status',
    tlsKey: '_tls',
    useColon: true,
    queryBar: TableQueryBarType.professionalBar,
    tableAutoHeightDiff: 100,
    modalMaskClosable: 'dblclick',
    modalAutoCenter: true,
    tableKeyboard: true,
    lovAutoSelectSingle: true,
    tableCustomizable: true,
    tableColumnDraggable: true,
    tableColumnTitleEditable: true,
    tableCustomizedLoad: tableCustomizedLoad as Config['tableCustomizedLoad'],
    tableCustomizedSave: tableCustomizedSave as Config['tableCustomizedSave'],
    feedback: {
      loadSuccess: () => { },
      loadFailed: (resp: any) => {
        if (resp && resp.failed) {
          notificationType(resp?.type, resp?.message);
        } else if (resp && resp.response) {
          if (!authrIntercept(resp.response.status)) {
            return;
          }
          let m = require('hzero-front/lib/assets/icon_page_wrong.svg');
          if (m.__esModule) {
            m = m.default;
          }
          if (resp.response.data && resp.response.data.detailsMessage) {
            notification.error({
              message:
                resp.response.data.detailsMessage ||
                intl.get(`hzero.common.requestNotification.${resp.response.status}`),
              description: resp.response.data?.requestMessage,
            });
          } else {
            notification.error({
              message:
                intl.get(`hzero.common.requestNotification.${resp.response.status}`) ||
                resp.message,
            });
          }
        }
      },
      submitSuccess: (resp) => {
        notification.success({
          message: resp && resp.message,
        });
      },
      submitFailed: (resp: any) => {
        if (resp && resp.failed) {
          notificationType(resp?.type, resp?.message);
        } else if (resp && resp.response) {
          let m = require('hzero-front/lib/assets/icon_page_wrong.svg');
          if (m.__esModule) {
            m = m.default;
          }
          notification.error({
            message:
              intl.get(`hzero.common.requestNotification.${resp.response.status}`) || resp.message,
          });
        }
      },
    },
    transport: {
      tls: ({ dataSet, name: fieldName }) => {
        // TODO: 先使用 dataSet.current 下个版本 c7n 会 把 record 传进来
        const _token = dataSet?.current?.get('_token');
        const { HZERO_PLATFORM } = getEnvConfig();
        return {
          url: `${HZERO_PLATFORM}/v1/multi-language`,
          method: 'GET',
          params: { _token, fieldName },
          transformResponse: (data) => {
            try {
              const jsonData = JSON.parse(data);
              if (jsonData && !jsonData.failed) {
                const tlsRecord = {};
                jsonData.forEach((intlRecord) => {
                  tlsRecord[intlRecord.code] = intlRecord.value;
                });
                return [{ [fieldName]: tlsRecord }];
              } else if (jsonData && jsonData.failed) {
                throw new Error(jsonData.message);
              }
            } catch (e) {
              // do nothing, use default error deal
              throw e;
            }
            return data;
          },
        };
      },
    },
  });
};

if (!(window as any)._ISLOADED_C7NUICONFIG) {
  loadConfig();
  (window as any)._ISLOADED_C7NUICONFIG = true;
}

export { lovDefineAxiosConfig, loadConfig };
