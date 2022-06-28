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
import uuidv4 from 'uuid/v4';
import commonConfig from '@htccommon/config/commonConfig';
import queryString from 'query-string';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import {
  Button,
  DataSet,
  DatePicker,
  Dropdown,
  Form,
  Icon,
  Lov,
  Menu,
  Modal,
  Select,
  Switch,
  TextField,
} from 'choerodon-ui/pro';
import { Breadcrumb, Col, Row, Tag, Tree } from 'choerodon-ui';
import { closeTab, openTab } from 'utils/menuTab';
import { batchForbiddenEmployee, saveAndCreateAccount } from '@src/services/employeeDefineService';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';
import { Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import AggregationTable from '@htccommon/pages/invoice-common/aggregation-table/detail/AggregationTablePage';
import employeeDefendDS from '../stores/EmployeeDefineDS';
import styles from '../table.module.less';
import EmployeePhoneModify from './EmployeePhoneModifyPage';

const modelCode = 'hmdm.company-list';
const modalKey = Modal.key();
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.MDM_API || '';
const { TreeNode } = Tree;
const { Item: BreadItem } = Breadcrumb;
const { Item: MenuItem } = Menu;

interface CompanyListPageProps {
  dispatch: Dispatch<any>;
  tableDS: DataSet;
}

@connect()
export default class CompanyListPage extends Component<CompanyListPageProps> {
  state = {
    treeData: [],
    expandedKeys: [],
    autoExpandParent: true,
    companyName: undefined,
    roleName: undefined,
  };

  tableDS = new DataSet({
    autoQuery: false,
    ...employeeDefendDS(),
  });

  async componentDidMount() {
    const { queryDataSet } = this.tableDS;
    if (queryDataSet && queryDataSet.current) {
      const companyId = queryDataSet.current!.get('companyId');
      if (companyId) {
        this.tableDS.query(this.tableDS.currentPage);
      }
    }
    const companyOptions = getResponse(
      await queryUnifyIdpValue('HMDM.COMPANY_NAME', {
        tenantId,
        enabledFlag: 1,
      })
    );
    const roleOptions = getResponse(await queryUnifyIdpValue('HMDM.EMPLOYEE_ROLES', { tenantId }));
    if (companyOptions && roleOptions) {
      // 处理树形数据
      const treeData: any = [];
      companyOptions.forEach((item) => {
        const employeeData: any = [];
        roleOptions.forEach((record) => {
          const node = {
            title: record.name,
            key: `${item.companyId}-${record.id}`,
            ...record,
            parent: item,
          };
          employeeData.push(node);
        });
        const preNode = {
          title: item.companyName,
          key: item.companyId,
          ...item,
          children: employeeData,
        };
        treeData.push(preNode);
      });
      this.setState({ treeData });
    }
  }

  /**
   * 新增/编辑model
   * @params {} record-行记录
   * @params {} isNew true-新增 false-编辑
   */
  @Bind()
  openModal(record, isNew) {
    Modal.open({
      title: isNew ? '添加成员' : '编辑成员',
      drawer: true,
      width: 480,
      children: (
        <Form record={record} labelTooltip={Tooltip.overflow}>
          <Select name="employeeTypeCode" />
          <TextField name="employeeName" />
          <TextField name="employeeNum" />
          isNew && <Select name="internationalTelCode" />
          isNew && <TextField name="mobile" />
          <TextField name="email" />
          <Lov name="rolesObject" />
          <Select name="status" />
          <TextField name="department" />
          <DatePicker name="startDate" />
          <DatePicker name="endDate" />
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
   * 新增
   */
  @Bind()
  handleAddLine() {
    const { queryDataSet } = this.tableDS;
    this.openModal(
      this.tableDS.create({
        attachmentUuid: uuidv4(),
        companyName: queryDataSet ? queryDataSet.records[0].get('companyName') : '',
        companyId: queryDataSet ? queryDataSet.records[0].get('companyId') : '',
      }),
      true
    );
  }

  /**
   * 处理保存事件
   * @params {object} record-行记录
   */
  @Bind()
  async handleSave(record) {
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
      const params = {
        organizationId: tenantId,
        employeeInfosList: [record],
      };
      await batchForbiddenEmployee(params);
      await this.tableDS.query();
    }
  }

  /**
   * 禁用/启用
   * @params {object} records-行数据
   */
  @Bind()
  handleEnableFlag(records) {
    if (records.enabledFlag === 0) {
      // 禁用转启用，单据状态为禁用时显示，点击按钮直接将单据状态更新为启用
      this.tableDS.current!.set({ enabledFlag: 1 });
      this.handleSave(records);
    } else {
      const title = intl.get(`${modelCode}.view.disableConfirm`).d('确认禁用？');
      Modal.confirm({
        key: modalKey,
        title,
      }).then((button) => {
        if (button === 'ok') {
          this.tableDS.current!.set({ enabledFlag: 0 });
          this.handleSave(records);
        }
      });
    }
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
  async handleImport() {
    const code = 'HMDM.EMPLOYEE';
    const { queryDataSet } = this.tableDS;
    const companyCode = queryDataSet && queryDataSet.current?.get('companyCode');
    const params = {
      companyCode,
      tenantId,
    };
    await closeTab(`/himp/commentImport/${code}`);
    if (companyCode) {
      const argsParam = JSON.stringify(params);
      openTab({
        key: `/himp/commentImport/${code}`,
        title: intl.get('hzero.common.button.import').d('导入'),
        search: queryString.stringify({
          prefixPath: API_PREFIX,
          action: intl.get(`${modelCode}.view.employeeImport`).d('员工导入'),
          args: argsParam,
        }),
      });
    }
  }

  /**
   * 员工信息维护批量创建或更新
   * @params {object} record-行记录
   */
  @Bind()
  async handleSaveAndCreateAccount(record) {
    const res = getResponse(
      await saveAndCreateAccount({
        organizationId: tenantId,
        employeeInfosList: record,
      })
    );
    if (res && res.data) {
      notification.success({
        description: '',
        message: res && res.message,
      });
      this.tableDS.unSelectAll();
    }
  }

  /**
   * 员工信息维护批量创建
   */
  @Bind()
  async batchCreate() {
    const employeeInfosList = this.tableDS.selected.map((rec) => rec.toData());
    if (isEmpty(employeeInfosList)) {
      notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.createAccount`).d('至少选择一条数据！'),
      });
      return;
    }
    this.handleSaveAndCreateAccount(employeeInfosList);
  }

  /**
   * 修改手机号（跳转）
   * @params {object} record-行记录
   */
  @Bind()
  handlePhoneModify(record) {
    const companyId = record.get('companyId');
    const mobile = record.get('mobile');
    const email = record.get('email');
    const internationalTelCode = record.get('internationalTelCode');
    const phoneProps = { email, companyId, mobile, internationalTelCode };
    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get(`${modelCode}.invoiceQuery.phoneModify`).d('修改手机号'),
      drawer: true,
      width: 480,
      footer: null,
      children: (
        <EmployeePhoneModify key={mobile} {...phoneProps} onCloseModal={() => modal.close()} />
      ),
    });
  }

  /**
   * 编辑回调
   * @params {object} record-行记录
   */
  @Bind()
  handleEdit(record) {
    this.openModal(record, false);
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        name: 'employeeNameInfo',
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
            name: 'employeeName',
            title: '',
            renderer: ({ value }) => value || '-',
          },
        ],
      },
      { name: 'employeeNum' },
      {
        name: 'employeeTypeInfo',
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          {
            name: 'employeeTypeCode',
            title: '',
            renderer: ({ text, value }) => {
              return [
                value === 'INTERNAL' && <Tag color="#1AC2D9">{text}</Tag>,
                value === 'EXTERNAL' && <Tag color="#FF8F07">{text}</Tag>,
                value === 'PRESET' && <Tag color="#3889FF">{text}</Tag>,
              ];
            },
          },
          {
            name: 'status',
            title: '',
            renderer: ({ text, value }) => {
              return [
                value === 'NORMAL' && <Tag color="cyan">{text}</Tag>,
                value === 'DIMISSION' && <Tag color="#dadada">{text}</Tag>,
              ];
            },
          },
        ],
      },
      {
        name: 'connectInfo',
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          {
            name: 'email',
            title: '',
          },
          {
            name: 'mobile',
            title: '',
          },
        ],
      },
      {
        name: 'organization',
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          {
            name: 'department',
            title: '',
            renderer: ({ value }) => value || '-',
          },
          {
            name: 'rolesObject',
            title: '',
          },
        ],
      },
      {
        name: 'validPeriod',
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          {
            name: 'startDate',
            title: '开始：',
            renderer: ({ value, text }) => (value ? text : '-'),
          },
          {
            name: 'endDate',
            title: '截止：',
            renderer: ({ value, text }) => (value ? text : '-'),
          },
        ],
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 180,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          const records = record.toData();
          const operators = [
            {
              key: 'saveAndCreate',
              ele: (
                <a onClick={() => this.handleSaveAndCreateAccount([records])}>
                  {intl.get(`${modelCode}.button.saveAndCreate`).d('新建账户')}
                </a>
              ),
              len: 6,
              title: intl.get(`${modelCode}.button.saveAndCreate`).d('新建账户'),
            },
            {
              key: 'phoneModify',
              ele: (
                <a onClick={() => this.handlePhoneModify(record)}>
                  {intl.get(`${modelCode}.button.phoneModify`).d('修改手机号')}
                </a>
              ),
              len: 6,
              title: intl.get(`${modelCode}.button.phoneModify`).d('修改手机号'),
            },
          ];
          const btnMenu = (
            <Menu>
              {operators.map((action) => {
                const { key } = action;
                return <Menu.Item key={key}>{action.ele}</Menu.Item>;
              })}
            </Menu>
          );
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
              <Dropdown overlay={btnMenu}>
                <a>
                  {intl.get('hzero.common.button.action').d('更多')}
                  <Icon type="arrow_drop_down" />
                </a>
              </Dropdown>
            </span>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 树展开/收起回调
   */
  @Bind()
  onExpand(expandedKeys) {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  /**
   * 查询回调
   */
  @Bind()
  handleQuery() {
    const { queryDataSet } = this.tableDS;
    if (queryDataSet) {
      const companyNameObject = queryDataSet.current!.get('companyNameObject');
      if (!companyNameObject) {
        return notification.error({
          description: '',
          message: intl.get(`${modelCode}.view.unQuery`).d('请选择公司！'),
        });
      } else {
        this.tableDS.query();
      }
    }
  }

  /**
   * 公司值集视图变化回调
   */
  @Bind()
  handleCompanyChange(value) {
    const { queryDataSet } = this.tableDS;
    if (queryDataSet) {
      queryDataSet.current!.set({ companyNameObject: value });
      this.setState({
        companyName: value && value.companyName,
        roleName: null,
      });
      if (value) this.tableDS.query();
    }
  }

  /**
   * 查询条重置回调
   */
  @Bind()
  handleReset() {
    const { queryDataSet } = this.tableDS;
    if (queryDataSet) {
      queryDataSet.reset();
      queryDataSet.create();
    }
    this.setState({ companyName: null });
  }

  /**
   * 自定义查询条
   */
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet } = props;
    return (
      <>
        <Row type="flex">
          <Col span={20}>
            <Form dataSet={queryDataSet} columns={3}>
              <TextField name="employeeName" />
              <Select name="enabledFlag" />
              <Select name="status" />
            </Form>
          </Col>
          <Col span={4} style={{ textAlign: 'end' }}>
            <Button onClick={() => this.handleReset()}>
              {intl.get(`${modelCode}.button.reset`).d('重置')}
            </Button>
            <Button color={ButtonColor.primary} onClick={() => this.handleQuery()}>
              {intl.get(`${modelCode}.button.query`).d('查询')}
            </Button>
          </Col>
        </Row>
      </>
    );
  }

  /**
   * 树选择回调
   */
  @Bind()
  onTreeSelect(selectedKeys, info) {
    if (!isEmpty(selectedKeys)) {
      const { queryDataSet } = this.tableDS;
      // 子节点
      if (selectedKeys[0].indexOf('-') > -1) {
        const companyNameObject = info.node.data.parent;
        const roleIdObject = info.node.data;
        if (queryDataSet) {
          queryDataSet.current!.set({ companyNameObject });
          queryDataSet.current!.set({ roleIdObject });
        }
        this.setState({
          companyName: companyNameObject.companyName,
          roleName: roleIdObject.name,
        });
      } else {
        // 父节点
        const companyNameObject = info.node.data;
        if (queryDataSet) {
          queryDataSet.current!.set({ companyNameObject });
          queryDataSet.current!.set({ roleIdObject: null });
        }
        this.setState({
          companyName: companyNameObject.companyName,
          roleName: null,
        });
      }
      this.tableDS.query();
    }
  }

  /**
   * 表格头-公司名点击回调
   */
  @Bind()
  breadClick() {
    const { queryDataSet } = this.tableDS;
    if (queryDataSet) {
      queryDataSet.current!.set({ roleIdObject: null });
      this.setState({
        roleName: null,
      });
      this.tableDS.query();
    }
  }

  /**
   * 表格头-删除回调
   */
  @Bind()
  handleDelete() {
    this.tableDS.delete(this.tableDS.selected);
  }

  /**
   * 渲染表格上方部分
   */
  @Bind()
  renderBread() {
    const { companyName, roleName } = this.state;
    if (companyName) {
      const DeleteBtn = observer((props: any) => {
        const isDisabled = props.dataSet!.selected.length === 0;
        return (
          <Button key={props.key} onClick={props.onClick} disabled={isDisabled}>
            {props.title}
          </Button>
        );
      });
      const menu = (
        <Menu>
          <MenuItem>
            <a onClick={() => this.handleAddLine()}>
              {intl.get('hzero.common.button.assetChange').d('添加成员')}
            </a>
          </MenuItem>
          <MenuItem>
            <a onClick={() => this.batchCreate()}>
              {intl.get('hzero.common.button.createAccount').d('新建账户')}
            </a>
          </MenuItem>
        </Menu>
      );
      return (
        <Row type="flex">
          <Col span={20}>
            <Breadcrumb style={{ marginBottom: '0.1rem', fontSize: '0.14rem' }}>
              <BreadItem>
                <a onClick={() => this.breadClick()}>{companyName}</a>
              </BreadItem>
              {roleName && <BreadItem>{roleName}</BreadItem>}
            </Breadcrumb>
          </Col>
          <Col span={4} style={{ textAlign: 'end' }}>
            <DeleteBtn
              key="delete"
              onClick={() => this.handleDelete()}
              dataSet={this.tableDS}
              title={intl.get('hzero.common.button.delete').d('删除')}
            />
            <Dropdown overlay={menu}>
              <Button color={ButtonColor.primary}>
                {intl.get('hzero.common.button.assetChange').d('添加')}
                <Icon type="arrow_drop_down" />
              </Button>
            </Dropdown>
          </Col>
        </Row>
      );
    }
  }

  render() {
    const { treeData, expandedKeys, autoExpandParent } = this.state;
    const ImportBtn = observer((props: any) => {
      let isDisabled = true;
      if (props.dataSet) {
        const { queryDataSet } = props.dataSet;
        const companyId = queryDataSet && queryDataSet.current?.get('companyId');
        if (companyId) isDisabled = false;
      }
      return (
        <Button key={props.key} onClick={props.onClick} disabled={isDisabled}>
          {props.title}
        </Button>
      );
    });
    const loop = (data) =>
      data.map((item) => {
        const title = <span>{item.title}</span>;
        if (item.children) {
          return (
            <TreeNode key={item.key} title={title} data={item}>
              {loop(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.key} title={title} data={item} />;
      });
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('员工信息维护')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/employee-infos/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
          <ImportBtn
            key="import"
            onClick={() => this.handleImport()}
            dataSet={this.tableDS}
            title={intl.get(`${modelCode}.button.import`).d('导入')}
          />
        </Header>
        <Row gutter={8} style={{ height: 'calc(100%)' }}>
          <Col span={5} style={{ height: 'calc(100%)' }}>
            <Content style={{ overflowX: 'hidden' }}>
              <Lov
                dataSet={this.tableDS.queryDataSet}
                placeholder="搜索公司"
                name="companyNameObject"
                onChange={this.handleCompanyChange}
              />
              <div className={styles.treeNode}>
                <Tree
                  onExpand={this.onExpand}
                  expandedKeys={expandedKeys}
                  autoExpandParent={autoExpandParent}
                  onSelect={this.onTreeSelect}
                >
                  {loop(treeData)}
                </Tree>
              </div>
            </Content>
          </Col>
          <Col span={19} style={{ height: '100%' }}>
            <Content>
              {this.renderBread()}
              <AggregationTable
                queryFieldsLimit={3}
                dataSet={this.tableDS}
                aggregation
                columns={this.columns}
                style={{ height: 420 }}
                queryBar={this.renderQueryBar}
              />
            </Content>
          </Col>
        </Row>
      </>
    );
  }
}
