/**
 * page - 公司列表入口页面
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-06-29
 * @LastEditeTime: 2020-06-29
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import queryString from 'query-string';
import {
  ColumnLock,
  ColumnAlign,
  TableButtonType,
  TableEditMode,
  TableCommandType,
} from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DataSet, Table, Button, Modal, Tooltip } from 'choerodon-ui/pro'; // Lov
import { routerRedux } from 'dva/router';
import { openTab } from 'utils/menuTab';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import commonConfig from '@common/config/commonConfig';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import { getCurrentOrganizationId } from 'utils/utils';
import { responseDecryptionKey } from '@src/services/companyListService';
import CompanyListDS from '../stores/CompanyListDS';

const modelCode = 'hmdm.company-list';
const modalKey = Modal.key();
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.MDM_API || '';

interface CompanyListPageProps {
  dispatch: Dispatch<any>;
}

@connect()
export default class CompanyListPage extends Component<CompanyListPageProps> {
  tableDS = new DataSet({
    autoQuery: true,
    ...CompanyListDS(),
  });

  // tenantId = getCurrentOrganizationId();

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    return [TableButtonType.add, TableButtonType.delete];
  }

  /**
   * 处理保存事件
   */
  @Bind()
  async handleSave() {
    const validateValue = await this.tableDS.validate(false, false);
    if (!validateValue) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
      return;
    }
    const res = await this.tableDS.submit();
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.noChange').d('请先修改数据'),
      });
    } else if (res && res.failed && res.message) {
      throw new Error(res);
    } else {
      await this.tableDS.query();
    }
  }

  /**
   * 禁用/启用
   *
   * @param {*} [params={}]
   * @memberof FileAggregate
   */
  @Bind()
  handleEnableFlag(records) {
    if (records.enabledFlag === 0) {
      // 禁用转启用，单据状态为禁用时显示，点击按钮直接将单据状态更新为启用
      this.tableDS.current!.set({ enabledFlag: 1 });
      this.handleSave();
    } else {
      const title = intl.get(`${modelCode}.view.disableConfirm`).d('确认禁用？');
      Modal.confirm({
        key: modalKey,
        title,
      }).then((button) => {
        if (button === 'ok') {
          this.tableDS.current!.set({ enabledFlag: 0 });
          this.handleSave();
        }
      });
    }
  }

  // 跳转到明细页面
  @Bind()
  handleGoToDetail(records) {
    const { dispatch } = this.props;
    // const { companyId, taxpayerNumber, companyCode, companyName, outChannelCode } = records;
    const { companyId } = records;
    const pathname = `/htc-front-mdm/company/detail/${companyId}`;
    dispatch(
      routerRedux.push({
        pathname,
        // search: queryString.stringify({
        //   taxpayerNumber,
        //   companyCode,
        //   companyName,
        //   outChannelCode,
        // }),
      })
    );
  }

  /**
   * 变更单元格样式
   * @param {number} length - 单元格长度
   */
  handleCell(length) {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: length,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * 获取FilterForm的值
   */
  @Bind
  getFilterFormValues() {
    const selectList = this.tableDS.selected.map((item) => item.toData());
    const selectRowKeys = selectList.map((item) => item.archivesId);
    const exportParam = selectRowKeys
      ? {
          archivesIdList: selectRowKeys.join(','),
        }
      : {
          archivesIdList: null,
        };
    return exportParam;
  }

  // 获取秘钥
  @Bind()
  async handleGetDecryption(companyId) {
    const res = await responseDecryptionKey({ tenantId, companyId });
    if (res) {
      Modal.info({
        title: intl.get(`${modelCode}.view.decryptionKey`).d('解密秘钥'),
        children: res,
      });
    }
  }

  get columns(): ColumnProps[] {
    return [
      {
        name: 'companyCode',
        editor: true,
        width: 110,
        lock: ColumnLock.left,
      },
      {
        name: 'companyName',
        width: 280,
        editor: true,
        renderer: ({ value }) => {
          return (
            <Tooltip placement="topLeft" title={value}>
              <span>{value}</span>
            </Tooltip>
          );
        },
      },
      {
        name: 'companyShortName',
        width: 140,
        editor: true,
      },
      { name: 'taxpayerNumber', width: 180, editor: true },
      {
        name: 'companyAddressPhone',
        width: 350,
        editor: true,
        renderer: ({ value }) => {
          return (
            <Tooltip placement="topLeft" title={value}>
              <span>{value}</span>
            </Tooltip>
          );
        },
      },
      {
        name: 'bankNumber',
        width: 260,
        editor: true,
        renderer: ({ value }) => {
          return (
            <Tooltip placement="topLeft" title={value}>
              <span>{value}</span>
            </Tooltip>
          );
        },
      },
      { name: 'competentTaxAuthoritiesObject', width: 140, editor: true },
      { name: 'competentTaxAuthoritiesMeaning', width: 140 },
      { name: 'enabledFlag', width: 90, renderer: ({ value }) => enableRender(value) },
      // { name: 'startDate', width: 110, editor: true },
      // { name: 'endDate', width: 110, editor: true },
      { name: 'creationDate', width: 160 },
      { name: 'lastUpdateDate', width: 160 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 250,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          const records = record.toData();
          return [
            <Button key="disable" onClick={() => this.handleEnableFlag(records)}>
              {curFlag === 0
                ? intl.get('hzero.common.status.enableFlag').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')}
            </Button>,
            TableCommandType.edit,
            <Button key="detail" onClick={() => this.handleGoToDetail(records)}>
              {intl.get(`${modelCode}.button.detail`).d('明细')}
            </Button>,
            <Button key="decryption" onClick={() => this.handleGetDecryption(records.companyId)}>
              {intl.get(`${modelCode}.button.getDecryption`).d('获取秘钥')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 导出条件
   */
  @Bind()
  handleGetQueryParams() {
    const queryParams = this.tableDS.queryDataSet!.map((data) => data.toData()) || {};
    const exportParams = { ...queryParams[0] } || {};
    return exportParams;
  }

  /**
   * 导入
   */
  @Bind()
  handleImport() {
    const code = 'HMDM.COMPANY';
    openTab({
      key: `/himp/commentImport/${code}`,
      title: intl.get('hzero.common.button.import').d('导入'),
      search: queryString.stringify({
        prefixPath: API_PREFIX,
        action: intl.get(`${modelCode}.view.companyImport`).d('公司列表导入'),
        tenantId,
      }),
    });
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('公司列表维护')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/company-list-infos/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
          <Button onClick={() => this.handleImport()}>
            {intl.get(`${modelCode}.import`).d('导入')}
          </Button>
        </Header>
        <Content>
          <Table
            queryFieldsLimit={3}
            dataSet={this.tableDS}
            columns={this.columns}
            editMode={TableEditMode.inline}
            buttons={this.buttons}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
