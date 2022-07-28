/**
 * @Description:待开票数据勾选
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-03 16:27:22
 * @LastEditTime: 2021-11-23 15:32:15
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Content, Header } from 'components/Page';
import withProps from 'utils/withProps';
import queryString from 'query-string';
import { Button as PermissionButton } from 'components/Permission';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { RouteComponentProps } from 'react-router-dom';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import {
  Button,
  Currency,
  DataSet,
  DateTimePicker,
  Dropdown,
  Form,
  Icon,
  Lov,
  Menu,
  Modal,
  Select,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { Col, Row, Tag } from 'choerodon-ui';
import { getPresentMenu } from '@htccommon/utils/utils';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { operatorRender } from 'utils/renderer';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import {
  cancelMerge,
  invoiceMerge,
  invoiceSave,
  invoiceSplit,
  withdraw,
} from '@src/services/tobeInvoiceService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import TobeInvoiceDS from '../stores/TobeInvoiceDS';
import CommodityEdit from '../detail/CommodityEditPage';
import CustomerEdit from '../detail/CustomerEditPage';
import History from '../detail/HistoryModaL';

const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IOP_API || '';
const permissionPath = `${getPresentMenu().name}.ps`;
const { Item: MenuItem } = Menu;

interface InvoiceWorkbenchPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  tobeInvoiceDS: DataSet;
}

@formatterCollections({
  code: [
    'hiop.tobeInvoice',
    'hiop.invoiceWorkbench',
    'htc.common',
    'hiop.redInvoiceInfo',
    'hiop.invoiceReq',
  ],
})
@withProps(
  () => {
    const tobeInvoiceDS = new DataSet({
      autoQuery: false,
      ...TobeInvoiceDS(),
    });
    return { tobeInvoiceDS };
  },
  { cacheState: true }
)
export default class TobeInvoicePage extends Component<InvoiceWorkbenchPageProps> {
  state = {
    curCompanyId: undefined,
    queryMoreDisplay: false,
  };

  async componentDidMount() {
    const { queryDataSet } = this.props.tobeInvoiceDS;
    if (queryDataSet) {
      const res = await getCurrentEmployeeInfoOut({ tenantId });
      let curCompanyId = queryDataSet.current!.get('companyId');
      if (res && res.content) {
        const empInfo = res.content[0];
        if (empInfo && !curCompanyId) {
          queryDataSet.current!.set({ companyObj: empInfo });
          curCompanyId = empInfo.companyId;
        }
      }
      this.setState({ curCompanyId });
      this.props.tobeInvoiceDS.query(this.props.tobeInvoiceDS.currentPage || 0);
    }
  }

  /**
   * 公司改变回调
   */
  @Bind()
  async handleCompanyChange(value) {
    if (value) {
      const { companyId } = value;
      this.setState({ curCompanyId: companyId });
    }
  }

  /**
   * 自定义查询条
   * @returns {ReactNode}
   */
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    const { queryMoreDisplay } = this.state;
    if (queryDataSet) {
      const queryMoreArray: JSX.Element[] = [];
      queryMoreArray.push(<Select name="state" colSpan={2} />);
      queryMoreArray.push(<Select name="documentLineType" />);
      queryMoreArray.push(<TextField name="projectNumber" />);
      queryMoreArray.push(<TextField name="materialDescription" />);
      queryMoreArray.push(<TextField name="erpSalesOrderNumber" />);
      queryMoreArray.push(<TextField name="erpDeliveryNumber" />);
      queryMoreArray.push(<TextField name="sourceNumber1" />);
      queryMoreArray.push(<TextField name="batchNo" />);
      queryMoreArray.push(<TextField name="invoiceCode" />);
      queryMoreArray.push(<TextField name="invoiceNo" />);
      return (
        <div style={{ marginBottom: '0.1rem' }}>
          <Row>
            <Col span={20}>
              <Form columns={3} dataSet={queryDataSet}>
                <Lov name="companyObj" onChange={value => this.handleCompanyChange(value)} />
                <TextField name="taxpayerNumber" />
                <TextField name="receiptName" />
                {/*---*/}
                <DateTimePicker name="importDate" />
                <DateTimePicker name="documentDate" />
                <TextField name="sourceHeadNumber" />
                {queryMoreDisplay && queryMoreArray}
              </Form>
            </Col>
            <Col span={4} style={{ textAlign: 'end' }}>
              <Button
                funcType={FuncType.link}
                onClick={() => this.setState({ queryMoreDisplay: !queryMoreDisplay })}
              >
                <span>
                  {intl.get('hzero.common.button.option').d('更多')}
                  {queryMoreDisplay ? <Icon type="expand_more" /> : <Icon type="expand_less" />}
                </span>
              </Button>
              <Button
                onClick={() => {
                  queryDataSet.reset();
                  queryDataSet.create();
                }}
              >
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Col>
          </Row>
          {buttons}
        </div>
      );
    }
    return <></>;
  }

  /**
   * 导出
   */
  @Bind()
  exportParams() {
    const queryParams = this.props.tobeInvoiceDS.queryDataSet!.map(data => data.toData()) || {};
    const { companyObj, ...otherData } = queryParams[0];
    const _queryParams = {
      ...companyObj,
      ...otherData,
    };
    return { ..._queryParams } || {};
  }

  /**
   * 编辑商品
   * @params {object} record-行记录
   */
  @Bind()
  editCommodity(record) {
    const { queryDataSet } = this.props.tobeInvoiceDS;
    const recordData = record.toData();
    if (queryDataSet) {
      const companyId = record.get('companyId');
      const companyCode = record.get('companyCode');
      const employeeNumber = queryDataSet.current!.get('employeeNumber');
      const commodityProps = {
        companyId,
        companyCode,
        employeeNumber,
        recordData,
        dataSet: this.props.tobeInvoiceDS,
      };
      const modal = Modal.open({
        title: intl.get('hiop.invoiceWorkbench.title.commodityInfo').d('商品信息'),
        drawer: true,
        width: 480,
        bodyStyle: { overflow: 'hidden' },
        closable: true,
        children: <CommodityEdit {...commodityProps} onCloseModal={() => modal.close()} />,
        footer: null,
      });
    }
  }

  /**
   * 编辑客户
   * @params {object} record-行记录
   */
  @Bind()
  editCustomer(record) {
    const { queryDataSet } = this.props.tobeInvoiceDS;
    const recordData = record.toData();
    if (queryDataSet) {
      const companyId = record.get('companyId');
      const companyCode = record.get('companyCode');
      const employeeId = record.get('employeeId');
      const employeeNumber = queryDataSet.current!.get('employeeNumber');
      const customerProps = {
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        recordData,
        dataSet: this.props.tobeInvoiceDS,
      };
      const modal = Modal.open({
        title: intl.get('hiop.tobeInvoice.title.billingInfo').d('开票信息'),
        drawer: true,
        width: 480,
        bodyStyle: { overflow: 'hidden' },
        closable: true,
        children: <CustomerEdit {...customerProps} onCloseModal={() => modal.close()} />,
        footer: null,
      });
    }
  }

  /**
   * 撤回
   * @params {object} record-行记录
   */
  @Bind()
  async handleWithdraw(record) {
    const data = record.toData();
    const { curCompanyId } = this.state;
    const { queryDataSet } = this.props.tobeInvoiceDS;
    const companyCode = queryDataSet && queryDataSet.current!.get('companyCode');
    const employeeNumber = queryDataSet && queryDataSet.current!.get('employeeNumber');
    const params = {
      tenantId,
      companyId: curCompanyId,
      companyCode,
      employeeNumber,
      list: [
        {
          ...data,
          state: '10',
        },
      ],
    };
    const res = getResponse(await withdraw(params));
    if (res) {
      if (res.status === '1000') {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        await this.props.tobeInvoiceDS.query();
        return true;
      } else {
        notification.error({
          description: '',
          message: res.message,
        });
        return false;
      }
    }
  }

  /**
   * 查看申请单
   * @params {object} record-行记录
   */
  @Bind()
  viewRepInvoice(record) {
    const { history } = this.props;
    const { curCompanyId } = this.state;
    const requisitionHeaderId = record.get('requisitionHeaderId');
    history.push({
      pathname: `/htc-front-iop/tobe-invoice/req-detail/TOBE/${curCompanyId}/${requisitionHeaderId}`,
      search: queryString.stringify({
        invoiceInfo: encodeURIComponent(
          JSON.stringify({
            backPath: '/htc-front-iop/tobe-invoice/list',
          })
        ),
      }),
    });
  }

  /**
   * 恢复
   * @params {object} record-行记录
   */
  @Bind()
  async handleRestore(record) {
    const recordData = record.toData();
    const { queryDataSet } = this.props.tobeInvoiceDS;
    const companyCode = queryDataSet && queryDataSet.current!.get('companyCode');
    const employeeNumber = queryDataSet && queryDataSet.current!.get('employeeNumber');
    const selectedList = [
      {
        ...recordData,
        state: '11',
        enabledFlag: 1,
      },
    ];
    const params = {
      tenantId,
      companyCode,
      employeeNumber,
      selectedList,
    };
    const res = getResponse(await invoiceSave(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      await this.props.tobeInvoiceDS.query();
    } else {
      notification.error({
        description: '',
        message: res.message,
      });
    }
  }

  /**
   * 历史记录
   * @params {object} record-行记录
   */
  @Bind()
  viewHistory(record) {
    const historyProps = {
      batchNo: record.get('batchNo'),
      sourceHeadNumber: record.get('sourceHeadNumber'),
      sourceLineNumber: record.get('sourceLineNumber'),
      prepareInvoiceId: record.get('prepareInvoiceId'),
    };
    const modal = Modal.open({
      title: '历史记录',
      drawer: true,
      width: 480,
      bodyStyle: { overflow: 'hidden' },
      closable: true,
      children: <History {...historyProps} />,
      footer: (
        <Button color={ButtonColor.primary} onClick={() => modal.close()}>
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      ),
    });
  }

  /**
   * 返回操作列
   * @params {object} record-行记录
   */
  @Bind()
  operationsRender(record) {
    const state = record.get('state');
    const uquantity = record.get('uquantity');
    const uprojectAmount = record.get('uprojectAmount');
    const discountAmount = record.get('discountAmount');
    const deduction = record.get('deduction');
    const renderPermissionButton = params => (
      <PermissionButton
        type="c7n-pro"
        funcType={FuncType.link}
        onClick={params.onClick}
        color={ButtonColor.primary}
        style={{ color: 'rgba(56,137,255,0.8)' }}
        permissionList={[
          {
            code: `${permissionPath}.button.${params.permissionCode}`,
            type: 'button',
            meaning: `${params.permissionMeaning}`,
          },
        ]}
      >
        {params.title}
      </PermissionButton>
    );
    const operators: any = [
      {
        key: 'viewHistory',
        ele: renderPermissionButton({
          onClick: () => this.viewHistory(record),
          permissionCode: 'view-history',
          permissionMeaning: '按钮-历史记录',
          title: intl.get('hiop.tobeInvoice.button.viewHistory').d('历史记录'),
        }),
        len: 6,
        title: intl.get('hiop.tobeInvoice.button.viewHistory').d('历史记录'),
      },
    ];
    const editCommodityBtn = {
      key: 'editCommodity',
      ele: renderPermissionButton({
        onClick: () => this.editCommodity(record),
        permissionCode: 'edit-commodity',
        permissionMeaning: '按钮-编辑商品',
        title: intl.get('hiop.tobeInvoice.button.editCommodity').d('编辑商品'),
      }),
      len: 6,
      title: intl.get('hiop.tobeInvoice.button.editCommodity').d('编辑商品'),
    };
    const editCustomerBtn = {
      key: 'editCustomer',
      ele: renderPermissionButton({
        onClick: () => this.editCustomer(record),
        permissionCode: 'edit-customer',
        permissionMeaning: '按钮-编辑客户',
        title: intl.get('hiop.tobeInvoice.button.editCustomer').d('编辑客户'),
      }),
      len: 6,
      title: intl.get('hiop.tobeInvoice.button.editCustomer').d('编辑客户'),
    };
    const withdrawBtn = {
      key: 'handleWithdraw',
      ele: renderPermissionButton({
        onClick: () => this.handleWithdraw(record),
        permissionCode: 'withdraw',
        permissionMeaning: '按钮-撤回',
        title: intl.get('hiop.tobeInvoice.button.handleWithdraw').d('撤回'),
      }),
      len: 6,
      title: intl.get('hiop.tobeInvoice.button.handleWithdraw').d('撤回'),
    };
    const viewRepInvoiceBtn = {
      key: 'viewRepInvoice',
      ele: renderPermissionButton({
        onClick: () => this.viewRepInvoice(record),
        permissionCode: 'view-rep-invoice',
        permissionMeaning: '按钮-查看申请单',
        title: intl.get('hiop.tobeInvoice.button.viewRepInvoice').d('查看申请单'),
      }),
      len: 6,
      title: intl.get('hiop.tobeInvoice.button.viewRepInvoice').d('查看申请单'),
    };
    const restoreBtn = {
      key: 'restore',
      ele: renderPermissionButton({
        onClick: () => this.handleRestore(record),
        permissionCode: 'restore',
        permissionMeaning: '按钮-恢复',
        title: intl.get('hiop.tobeInvoice.button.restore').d('恢复'),
      }),
      len: 6,
      title: intl.get('hiop.tobeInvoice.button.restore').d('恢复'),
    };
    // 导入行、已合并、被拆分行、部分勾选、已拆分、已撤回
    if (['1', '3', '5', '6', '7', '10', '11'].includes(state)) {
      operators.push(editCommodityBtn, editCustomerBtn);
    }
    // 已生成
    if (['2', '8'].includes(state)) {
      operators.push(withdrawBtn, viewRepInvoiceBtn);
    }
    // 已删除
    if (state === '9') {
      operators.push(restoreBtn);
    }
    const newOperators = operators.filter(Boolean);
    if (
      state === '4' ||
      (['5', '6'].includes(state) &&
        uquantity === 0 &&
        uprojectAmount === 0 &&
        discountAmount === 0 &&
        deduction === 0)
    ) {
      return <span>-</span>;
    } else {
      return operatorRender(newOperators, record, { limit: 2 });
    }
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    // 状态为‘已删除、已生成、已开具’的数据不允许修改
    const adjustEditAble = record => !['2', '8', '9'].includes(record.get('state'));
    // 行类型為‘折扣行’，不允許修改開票金額
    const adjustUAmount = record =>
      adjustEditAble(record) && record.get('documentLineType') !== '4';
    const adjustUdiscountAmount = record =>
      adjustEditAble(record) && record.get('documentLineType') === '4';
    // 状态=【导入行】、【已合并】、【被拆分行】、【部分勾选】、【已拆分】可以修改开票单位
    // const adjustUunitAble = (record) => ['1', '3', '5', '6', '7'].includes(record.get('state'));
    // 金额>0且状态=【导入行】、【已合并】、【被拆分行】、【部分勾选】、【已拆分】且【行类型】=“赠品行”的行，可以允许在待开票列表界面上将【行类型】由“赠品行”修改为“折扣行”
    const _adjustLineTypeEditAble = record =>
      record.get('documentLineType') === '3' &&
      ['1', '3', '5', '6', '7'].includes(record.get('state')) &&
      record.get('amount') > 0;
    const renderLineType = record => {
      if (_adjustLineTypeEditAble(record)) {
        return (
          <Select optionsFilter={rec => rec.get('value') === '3' || rec.get('value') === '4'} />
        );
      } else {
        return false;
      }
    };
    const regExp = /(^[1-9]\d*$)/;
    const renderUPrice = record => {
      if (record.get('uprojectUnit') !== record.getPristineValue('uprojectUnit')) {
        return (
          <Currency
            renderer={({ value }) =>
              value && (regExp.test(value) ? value.toFixed(2) : parseFloat(value))
            }
          />
        );
      } else {
        return false;
      }
    };
    return [
      {
        name: 'sourceHeadNumber',
        width: 270,
        renderer: ({ text, record }) => {
          const state = record?.get('state');
          const stateTxt = record?.getField('state')?.getText(state);
          let color = '';
          let textColor = '';
          switch (state) {
            case '1':
              color = '#DBEEFF';
              textColor = '#3889FF';
              break;
            case '5':
            case '6':
              color = '#FFECC4';
              textColor = '#FF9D23';
              break;
            case '9':
              color = '#FFDCD4';
              textColor = '#FF5F57';
              break;
            case '10':
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            case '2':
            case '3':
            case '7':
            case '8':
            case '11':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            default:
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {stateTxt}
              </Tag>
              <span>{text}</span>
            </>
          );
        },
      },
      { name: 'sourceLineNumber' },
      { name: 'documentDate', width: 180 },
      { name: 'businessDate', width: 120 },
      { name: 'documentLineType', editor: record => renderLineType(record) },
      { name: 'projectNumber', width: 150 },
      // { name: 'uprojectUnit', editor: (record) => adjustUunitAble(record) },
      { name: 'uquantity', editor: record => adjustEditAble(record) },
      {
        name: 'uprojectUnitPrice',
        editor: record => renderUPrice(record),
        renderer: ({ value }) =>
          value && (regExp.test(value) ? value.toFixed(2) : parseFloat(value)),
      },
      { name: 'uprojectAmount', editor: record => adjustUAmount(record) },
      { name: 'udiscountAmount', editor: record => adjustUdiscountAmount(record) },
      { name: 'udeduction' },
      { name: 'utaxAmount' },
      { name: 'projectName', width: 150 },
      { name: 'model', width: 180 },
      { name: 'taxIncludedFlag' },
      { name: 'quantity' },
      {
        name: 'projectUnitPrice',
        renderer: ({ value }) =>
          value && (regExp.test(value) ? value.toFixed(2) : parseFloat(value)),
      },
      { name: 'amount' },
      { name: 'projectUnit' },
      { name: 'taxRate' },
      { name: 'taxAmount' },
      { name: 'discountAmount' },
      { name: 'deduction' },
      { name: 'receiptNumber' },
      { name: 'receiptName' },
      { name: 'remark' },
      { name: 'invoiceInfo' },
      { name: 'salesMan' },
      { name: 'erpSalesOrderNumber' },
      { name: 'erpSalesOrderLineNumber' },
      { name: 'erpDeliveryNumber' },
      { name: 'erpDeliveryLineNumber' },
      { name: 'sourceNumber1' },
      { name: 'sourceLineNumber1' },
      { name: 'batchNo' },
      { name: 'importDate', width: 180 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 190,
        renderer: ({ record }) => this.operationsRender(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 合并、拆分调接口
   * @params {number} type 0-合并 1-拆分
   * @params {[]} list-选择的表格行
   */
  @Bind()
  async sendRequest(type, list) {
    const { curCompanyId } = this.state;
    const { queryDataSet } = this.props.tobeInvoiceDS;
    const companyCode = queryDataSet && queryDataSet.current!.get('companyCode');
    const employeeNumber = queryDataSet && queryDataSet.current!.get('employeeNumber');
    const params = {
      tenantId,
      companyId: curCompanyId,
      companyCode,
      employeeNumber,
      selectedList: list,
    };
    const res = getResponse(type === 0 ? await invoiceMerge(params) : await invoiceSplit(params));
    if (res) {
      if (res.status === '1000') {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        await this.props.tobeInvoiceDS.query();
        return true;
      } else {
        notification.error({
          description: '',
          message: res.message,
        });
        return false;
      }
    }
  }

  @Bind()
  judgeStateAndAmount(selectedList) {
    return selectedList.some(
      item =>
        (item.state === '5' || item.state === '6') &&
        item.uquantity === 0 &&
        item.uprojectAmount === 0 &&
        item.discountAmount === 0 &&
        item.deduction === 0
    );
  }

  /**
   * 合并、拆分回调
   * @params {number} type 0-合并 1-拆分
   */
  @Bind()
  async commonFuc(type) {
    const selectedList = this.props.tobeInvoiceDS.selected.map(record => record.toData());
    const validateValue = await this.props.tobeInvoiceDS.validate(false, false);
    let message = '';
    if (type === 0) message = '合并';
    if (type === 1) message = '拆分';
    let notiMess = '';
    new Promise(resolve => {
      if (selectedList.some(item => ['2', '4', '8', '9'].includes(item.state))) {
        notiMess = `存在状态为已生成、被合并行、已开具或已删除的数据，不允许${message}！`;
        throw new Error();
      }
      if (this.judgeStateAndAmount(selectedList)) {
        notiMess = `存在状态为被拆分行或部分勾选且行中【开票数量、开票金额、折扣金额、扣除额】均为0的数据，不允许${message}！`;
        throw new Error();
      }
      if (!validateValue) {
        notiMess = '数据校验不通过！';
        throw new Error();
      }
      resolve();
    })
      .then(() => {
        if (type === 0) {
          this.sendRequest(0, selectedList);
        }
        if (type === 1) {
          this.sendRequest(1, selectedList);
        }
      })
      .catch(() => {
        notification.warning({
          description: '',
          duration: 8,
          message: intl
            .get('hiop.tobeInvoice.notification.message.mergeAndSplit', { notiMess })
            .d(notiMess),
        });
      });
  }

  /**
   * 生成申请
   */
  @Bind()
  async generateApplication() {
    const selectedList = this.props.tobeInvoiceDS.selected.map(record => record.toData());
    if (
      selectedList.some(item => ['2', '4', '8', '9'].includes(item.state)) ||
      selectedList.some(item => item.documentLineType === '4')
    ) {
      notification.warning({
        description: '',
        duration: 8,
        message: intl
          .get('hiop.tobeInvoice.notification.message.generateApplication')
          .d('存在状态为已生成、被合并行、已开具、已删除或行类型为折扣行的数据，不允许生成申请！'),
      });
      return;
    }
    if (this.judgeStateAndAmount(selectedList)) {
      notification.warning({
        description: '',
        duration: 8,
        message: intl
          .get('hiop.tobeInvoice.notification.message.unState')
          .d(
            '存在状态为被拆分行或部分勾选且行中【开票数量、开票金额、折扣金额、扣除额】均为0的数据，不允许生成申请！'
          ),
      });
      return;
    }
    const { history } = this.props;
    const { curCompanyId } = this.state;
    const ids = selectedList.map(rec => rec.prepareInvoiceId).join(',');
    history.push(`/htc-front-iop/tobe-invoice/generate-application/${curCompanyId}/${ids}`);
  }

  /**
   * 数据权限分配
   */
  @Bind()
  handlePermission() {
    const { history } = this.props;
    const { curCompanyId } = this.state;
    const selectedList = this.props.tobeInvoiceDS.selected.map(record => record.toData());
    if (selectedList.some(item => item.state === '9')) {
      notification.warning({
        description: '',
        message: intl
          .get('hiop.tobeInvoice.notification.message.permission')
          .d('存在状态为已删除的数据，不允许数据权限分配！'),
      });
      return;
    }
    const prepareInvoiceId = this.props.tobeInvoiceDS.selected
      .map(rec => rec.get('prepareInvoiceId'))
      .join(',');
    history.push(`/htc-front-iop/permission-assign/PREPARE/${curCompanyId}/${prepareInvoiceId}`);
  }

  /**
   * 取消合并
   */
  @Bind()
  async cancelMerge() {
    const selectedList = this.props.tobeInvoiceDS.selected.map(record => record.toData());
    if (selectedList.some(item => item.state !== '3')) {
      notification.warning({
        description: '',
        message: intl
          .get('hiop.tobeInvoice.notification.message.merge')
          .d('状态为已合并的数据，才允许取消合并！'),
      });
      return;
    }
    const { curCompanyId } = this.state;
    const { queryDataSet } = this.props.tobeInvoiceDS;
    const companyCode = queryDataSet && queryDataSet.current!.get('companyCode');
    const employeeNumber = queryDataSet && queryDataSet.current!.get('employeeNumber');
    const params = {
      tenantId,
      companyId: curCompanyId,
      companyCode,
      employeeNumber,
      selectedList,
    };
    const res = getResponse(await cancelMerge(params));
    if (res) {
      if (res.status === '1000') {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        await this.props.tobeInvoiceDS.query();
      } else {
        notification.error({
          description: '',
          message: res.message,
        });
      }
    }
  }

  /**
   * 删除待开票
   */
  @Bind()
  async batchDeleteTobeInvoice() {
    const selectedList = this.props.tobeInvoiceDS.selected.map(record => record.toData());
    const { queryDataSet } = this.props.tobeInvoiceDS;
    const companyCode = queryDataSet && queryDataSet.current!.get('companyCode');
    const employeeNumber = queryDataSet && queryDataSet.current!.get('employeeNumber');
    if (selectedList.some(item => !['1', '7', '10'].includes(item.state))) {
      notification.warning({
        description: '',
        message: intl
          .get('hiop.tobeInvoice.notification.message.batchDelete')
          .d('状态为导入行、已拆分或已撤回的数据，才允许删除！'),
      });
      return;
    }
    const _selectedList = selectedList.map(lineData => {
      return {
        ...lineData,
        state: '9',
        enabledFlag: 0,
      };
    });
    const params = {
      tenantId,
      selectedList: _selectedList,
      companyCode,
      employeeNumber,
    };
    const res = getResponse(await invoiceSave(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      await this.props.tobeInvoiceDS.query();
    } else {
      notification.error({
        description: '',
        message: res.message,
      });
    }
  }

  /**
   * 保存待开票
   */
  @Bind()
  batchSaveTobeInvoice() {
    const submitList = this.props.tobeInvoiceDS.filter(record => record.dirty);
    if (submitList.length !== 0) {
      if (
        submitList.some(record => {
          const data = record.toData();
          const {
            documentLineType,
            amount,
            uprojectAmount,
            udiscountAmount,
            uprojectUnit,
            projectUnit,
            discountAmount,
          } = data;
          if (documentLineType === '4') {
            // 折扣行
            return udiscountAmount !== discountAmount && uprojectUnit === projectUnit;
          } else {
            return uprojectAmount !== amount && uprojectUnit === projectUnit;
          }
        })
      ) {
        notification.warning({
          description: '',
          message: intl.get('hiop.tobeInvoice.notification.message.save').d('请使用拆分功能！'),
        });
        return;
      }
      this.props.tobeInvoiceDS.submit();
    } else {
      notification.warning({
        description: '',
        message: intl.get('htc.common.notification.noChange').d('请先修改数据！'),
      });
    }
  }

  /**
   * 返回表格头按钮
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const { curCompanyId } = this.state;
    const BatchButtons = observer((props: any) => {
      let isDisabled = props.dataSet!.selected.length === 0;
      if (props.condition === 'mergeLine') isDisabled = props.dataSet!.selected.length < 2;
      const { condition } = props;
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={['mergeLine', 'cancel'].includes(condition) ? FuncType.link : FuncType.flat}
          permissionList={[
            {
              code: `${permissionPath}.button.${props.permissionCode}`,
              type: 'button',
              meaning: `${props.permissionMeaning}`,
            },
          ]}
        >
          {props.title}
        </PermissionButton>
      );
    });
    const topBtns = [
      <BatchButtons
        key="mergeLine"
        condition="mergeLine"
        onClick={() => this.commonFuc(0)}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get('hiop.invoiceReq.button.batchMerge').d('合并数据')}
        permissionCode="batch-merge"
        permissionMeaning="按钮-批量合并"
      />,
      <BatchButtons
        key="cancelMerge"
        onClick={() => this.cancelMerge()}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get('hiop.invoiceReq.button.mergeCancel').d('取消合并')}
        permissionCode="batch-cancel-merge"
        permissionMeaning="按钮-取消合并"
        condition="cancel"
      />,
    ];
    const btnMenu = (
      <Menu>
        {topBtns.map(action => (
          <MenuItem>{action}</MenuItem>
        ))}
      </Menu>
    );
    return [
      <Dropdown overlay={btnMenu}>
        <Button color={ButtonColor.primary}>
          {intl.get('hiop.invoiceReq.button.merge').d('合并')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <BatchButtons
        key="split"
        onClick={() => this.commonFuc(1)}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get('hiop.tobeInvoice.button.split').d('拆分')}
        permissionCode="batch-split"
        permissionMeaning="按钮-批量拆分"
      />,
      <BatchButtons
        key="generateApplication"
        onClick={() => this.generateApplication()}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get('hiop.tobeInvoice.button.generateApply').d('生成申请')}
        permissionCode="generate-application"
        permissionMeaning="按钮-生成申请"
      />,
      <BatchButtons
        key="dataPermission"
        onClick={() => this.handlePermission()}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get('hiop.invoiceWorkbench.button.dataPermission').d('数据权限分配')}
        permissionCode="data-permission"
        permissionMeaning="按钮-数据权限分配"
      />,
      <PermissionButton
        type="c7n-pro"
        key="batchSave"
        disabled={!curCompanyId}
        onClick={() => this.batchSaveTobeInvoice()}
        color={ButtonColor.default}
        permissionList={[
          {
            code: `${permissionPath}.batch-save`,
            type: 'button',
            meaning: '按钮-保存',
          },
        ]}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </PermissionButton>,
      <BatchButtons
        key="batchDelete"
        onClick={() => this.batchDeleteTobeInvoice()}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get('hzero.common.button.delete').d('删除')}
        permissionCode="batch-delete"
        permissionMeaning="按钮-删除"
      />,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get('hiop.tobeInvoice.title.tobeInvoice').d('待开票数据勾选')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/prepare-invoice-infos/export`}
            queryParams={() => this.exportParams()}
          />
        </Header>
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.props.tobeInvoiceDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
