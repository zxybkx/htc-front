/**
 * page - 公司列表入口页面
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-06-29
 * @LastEditeTime: 2020-06-29
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import queryString from 'query-string';
import commonConfig from '@htccommon/config/commonConfig';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Button, DataSet, Form, Lov, Modal, Switch, TextField } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { RouteComponentProps } from 'react-router-dom';
import { openTab } from 'utils/menuTab';
import { observer } from 'mobx-react-lite';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import { getCurrentOrganizationId } from 'utils/utils';
import { responseDecryptionKey } from '@src/services/companyListService';
import AggregationTable from '@htccommon/pages/invoice-common/aggregation-table/detail/AggregationTablePage';
import CompanyListDS from '../stores/CompanyListDS';

const modelCode = 'hmdm.company-list';
const modalKey = Modal.key();
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.MDM_API || '';

interface CompanyListPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
}

@connect()
export default class CompanyListPage extends Component<CompanyListPageProps> {
  tableDS = new DataSet({
    autoQuery: true,
    ...CompanyListDS(),
  });

  @Bind()
  create() {
    this.openModal(this.tableDS.create({}, 0), true);
  }

  /**
   * 删除公司回调
   */
  @Bind()
  handleDelete() {
    const record = this.tableDS.selected;
    this.tableDS.delete(record);
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const DeleteButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <Button icon="add" onClick={this.create}>
        {intl.get(`${modelCode}.add`).d('新增')}
      </Button>,
      <DeleteButtons
        key="delete"
        onClick={() => this.handleDelete()}
        dataSet={this.tableDS}
        title={intl.get(`${modelCode}.button.delete`).d('删除')}
      />,
    ];
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

  /**
   * 跳转到明细页面
   * @param {object} record-行记录
   */
  @Bind()
  handleGoToDetail(record) {
    const { history } = this.props;
    const companyId = record.get('companyId');
    const pathname = `/htc-front-mdm/company/detail/${companyId}`;
    history.push(pathname);
    // dispatch(
    //   routerRedux.push({
    //     pathname,
    //   })
    // );
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

  /**
   * 获取秘钥
   */
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

  /**
   * 新增/编辑公司Modal
   * @params {object}  record-行记录
   * @params {boolean} isNew true-新建 false-编辑
   */
  @Bind()
  openModal(record, isNew) {
    Modal.open({
      title: isNew ? '新增公司' : '编辑公司',
      drawer: true,
      width: 480,
      children: (
        <Form record={record} labelTooltip={Tooltip.overflow}>
          <TextField name="companyCode" />
          <TextField name="companyName" />
          <TextField name="companyShortName" />
          <TextField name="taxpayerNumber" />
          <TextField name="companyAddressPhone" />
          <TextField name="bankNumber" />
          <Lov name="competentTaxAuthoritiesObject" />
          <Switch name="enabledFlag" />
        </Form>
      ),
      onOk: () => this.tableDS.submit(),
      onCancel: () => {
        if (isNew) {
          this.tableDS.remove(record);
        } else {
          this.tableDS.reset();
        }
      },
    });
  }

  /**
   * 编辑回调
   * @params {object}  record-行记录
   */
  @Bind()
  handleEdit(record) {
    this.openModal(record, false);
  }

  /**
   * 返回表格行
   * @params {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        name: 'companyInfo',
        width: 110,
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          {
            name: 'enabledFlag',
            title: '',
            renderer: ({ text, value }) => (
              <Tag color={value === 0 ? '#dadada' : '#87d068'}>{text}</Tag>
            ),
          },
          {
            name: 'companyCode',
            // tooltip: Tooltip.overflow,
            title: '',
            renderer: ({ value, record }) => (
              <a onClick={() => this.handleGoToDetail(record)}>{value}</a>
            ),
          },
        ],
      },
      {
        name: 'companyNameInfo',
        align: ColumnAlign.left,
        aggregation: true,
        children: [
          {
            name: 'companyName',
            title: '',
          },
          {
            name: 'companyShortName',
            header: () => <span style={{ color: '#8C8C8C' }}>简称：</span>,
            renderer: ({ value }) => <span style={{ color: '#8C8C8C' }}>{value}</span>,
          },
        ],
      },
      {
        name: 'taxpayerNumber',
        tooltip: Tooltip.overflow,
      },
      {
        name: 'companyAddressPhone',
        // tooltip: Tooltip.overflow,
      },
      {
        name: 'bankNumber',
        // tooltip: Tooltip.overflow,
      },
      {
        name: 'competentTaxAuthoritiesInfo',
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          {
            name: 'competentTaxAuthoritiesObject',
            // tooltip: Tooltip.overflow,
            title: '',
          },
          { name: 'competentTaxAuthoritiesMeaning', title: '' },
        ],
      },
      {
        name: 'dateInfo',
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          { name: 'creationDate', title: '' },
          { name: 'lastUpdateDate', title: '' },
        ],
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 180,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          const records = record.toData();
          return [
            <span className="action-link" key="action">
              <a
                onClick={() => this.handleEnableFlag(records)}
                style={{ color: curFlag === 0 ? 'green' : 'gray' }}
              >
                {curFlag === 0
                  ? intl.get('hzero.common.status.enableFlag').d('启用')
                  : intl.get('hzero.common.status.disable').d('禁用')}
              </a>
              <a onClick={() => this.handleEdit(record)}>
                {intl.get(`${modelCode}.button.edit`).d('编辑')}
              </a>
              <a onClick={() => this.handleGetDecryption(records.companyId)}>
                {intl.get(`${modelCode}.button.getDecryption`).d('获取秘钥')}
              </a>
            </span>,
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
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
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
          <AggregationTable
            queryFieldsLimit={3}
            aggregation
            dataSet={this.tableDS}
            columns={this.columns}
            buttons={this.buttons}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
