/*
 * @Description:待开票数据勾选
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-03 16:27:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Content, Header } from 'components/Page';
import withProps from 'utils/withProps';
import queryString from 'query-string';
import { Button as PermissionButton } from 'components/Permission';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@common/config/commonConfig';
import {
  Button,
  DataSet,
  DateTimePicker,
  Form,
  Lov,
  Output,
  Select,
  Table,
  TextField,
  Currency,
} from 'choerodon-ui/pro';
import { Col, Row } from 'choerodon-ui';
import { getPresentMenu } from '@common/utils/utils';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { operatorRender } from 'utils/renderer';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { getCurrentEmployeeInfoOut } from '@common/services/commonService';
import {
  invoiceMerge,
  invoiceSplit,
  cancelMerge,
  invoiceSave,
  withdraw,
} from '@src/services/tobeInvoiceService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import TobeInvoiceDS from '../stores/TobeInvoiceDS';

const modelCode = 'hiop.tobe-invoice';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IOP_API || '';
const permissionPath = `${getPresentMenu().name}.ps`;

interface InvoiceWorkbenchPageProps {
  dispatch: Dispatch<any>;
  tobeInvoiceDS: DataSet;
}

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
@connect()
export default class TobeInvoicePage extends Component<InvoiceWorkbenchPageProps> {
  state = {
    curCompanyId: undefined,
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

  @Bind()
  async handleCompanyChange(value) {
    if (value) {
      const { companyId } = value;
      this.setState({ curCompanyId: companyId });
    }
  }

  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    if (queryDataSet) {
      return (
        <>
          <Form columns={4} dataSet={queryDataSet}>
            <Lov
              name="companyObj"
              colSpan={2}
              onChange={(value) => this.handleCompanyChange(value)}
            />
            <Output name="employeeDesc" colSpan={1} />
            <Output name="taxpayerNumber" colSpan={1} />
            {/*---*/}
            <Output name="addressPhone" colSpan={2} />
            <Output name="bankNumber" colSpan={2} />
            {/*---*/}
            <DateTimePicker name="importDateFrom" />
            <DateTimePicker name="importDateTo" />
            <DateTimePicker name="documentDateFrom" />
            <DateTimePicker name="documentDateTo" />
            {/*---*/}
            <TextField name="documentHeadNumber" />
            <TextField name="projectNumber" />
            <TextField name="materialDescription" />
            <TextField name="erpSalesOrderNumber" />
            {/*---*/}
            <TextField name="receiptName" colSpan={2} />
            <TextField name="erpDeliveryNumber" />
            <TextField name="erpInvoiceNumber" />
            {/*---*/}
            <Select name="state" colSpan={2} />
            <Select name="documentLineType" colSpan={2} />
          </Form>
          <Row type="flex" justify="space-between">
            <Col span={20}>{buttons}</Col>
            <Col span={4} style={{ textAlign: 'end', marginBottom: '2px' }}>
              <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
                {intl.get(`${modelCode}.button.query`).d('查询')}
              </Button>
            </Col>
          </Row>
        </>
      );
    }
    return <></>;
  }

  // 导出
  @Bind()
  exportParams() {
    const queryParams = this.props.tobeInvoiceDS.queryDataSet!.map((data) => data.toData()) || {};
    const { companyObj, ...otherData } = queryParams[0];
    const _queryParams = {
      ...companyObj,
      ...otherData,
    };
    return { ..._queryParams } || {};
  }

  // 编辑商品
  @Bind()
  editCommodity(record) {
    const { dispatch } = this.props;
    const { curCompanyId } = this.state;
    const { queryDataSet } = this.props.tobeInvoiceDS;
    const recordData = record.toData();
    if (queryDataSet) {
      const companyCode = queryDataSet.current!.get('companyCode');
      const employeeNumber = queryDataSet.current!.get('employeeNumber');
      dispatch(
        routerRedux.push({
          pathname: `/htc-front-iop/tobe-invoice/commodity-edit/${curCompanyId}/${companyCode}/${employeeNumber}`,
          search: queryString.stringify({
            invoiceInfo: encodeURIComponent(JSON.stringify({ recordData })),
          }),
        })
      );
    }
  }

  // 编辑客户
  @Bind()
  editCustomer(record) {
    const { dispatch } = this.props;
    const { queryDataSet } = this.props.tobeInvoiceDS;
    const { curCompanyId } = this.state;
    const recordData = record.toData();
    if (queryDataSet) {
      const companyCode = queryDataSet.current!.get('companyCode');
      const employeeNumber = queryDataSet.current!.get('employeeNumber');
      dispatch(
        routerRedux.push({
          pathname: `/htc-front-iop/tobe-invoice/customer-edit/${curCompanyId}/${companyCode}/${employeeNumber}`,
          search: queryString.stringify({
            invoiceInfo: encodeURIComponent(JSON.stringify({ recordData })),
          }),
        })
      );
    }
  }

  // 撤回
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
          message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
        });
        await this.props.tobeInvoiceDS.query();
        return true;
      } else {
        notification.error({
          description: '',
          message: res && res.message,
        });
        return false;
      }
    }
  }

  // 查看申请单
  @Bind()
  viewRepInvoice(record) {
    const { dispatch } = this.props;
    const { curCompanyId } = this.state;
    const requisitionHeaderId = record.get('requisitionHeaderId');
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-iop/tobe-invoice/req-detail/TOBE/${curCompanyId}/${requisitionHeaderId}`,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: '/htc-front-iop/tobe-invoice/list',
            })
          ),
        }),
      })
    );
  }

  // 恢复
  @Bind()
  async handleRestore(record) {
    const recordData = record.toData();
    const selectedList = [
      {
        ...recordData,
        state: '11',
        enabledFlag: 1,
      },
    ];
    const params = {
      tenantId,
      selectedList,
    };
    const res = getResponse(await invoiceSave(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
      });
      await this.props.tobeInvoiceDS.query();
    } else {
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  }

  @Bind()
  operationsRender(record) {
    const state = record.get('state');
    const uquantity = record.get('uquantity');
    const uprojectAmount = record.get('uprojectAmount');
    const discountAmount = record.get('discountAmount');
    const deduction = record.get('deduction');
    const renderPermissionButton = (params) => (
      <PermissionButton
        type="c7n-pro"
        funcType={FuncType.flat}
        onClick={params.onClick}
        color={ButtonColor.primary}
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
    const operators: any = [];
    const editCommodityBtn = {
      key: 'editCommodity',
      ele: renderPermissionButton({
        onClick: () => this.editCommodity(record),
        permissionCode: 'edit-commodity',
        permissionMeaning: '按钮-编辑商品',
        title: intl.get(`${modelCode}.editCommodity`).d('编辑商品'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.editCommodity`).d('编辑商品'),
    };
    const editCustomerBtn = {
      key: 'editCustomer',
      ele: renderPermissionButton({
        onClick: () => this.editCustomer(record),
        permissionCode: 'edit-customer',
        permissionMeaning: '按钮-编辑客户',
        title: intl.get(`${modelCode}.editCustomer`).d('编辑客户'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.editCustomer`).d('编辑客户'),
    };
    const withdrawBtn = {
      key: 'handleWithdraw',
      ele: renderPermissionButton({
        onClick: () => this.handleWithdraw(record),
        permissionCode: 'withdraw',
        permissionMeaning: '按钮-撤回',
        title: intl.get(`${modelCode}.handleWithdraw`).d('撤回'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.handleWithdraw`).d('撤回'),
    };
    const viewRepInvoiceBtn = {
      key: 'viewRepInvoice',
      ele: renderPermissionButton({
        onClick: () => this.viewRepInvoice(record),
        permissionCode: 'view-rep-invoice',
        permissionMeaning: '按钮-查看申请单',
        title: intl.get(`${modelCode}.viewRepInvoice`).d('查看申请单'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.viewRepInvoice`).d('查看申请单'),
    };
    const restoreBtn = {
      key: 'restore',
      ele: renderPermissionButton({
        onClick: () => this.handleRestore(record),
        permissionCode: 'restore',
        permissionMeaning: '按钮-恢复',
        title: intl.get(`${modelCode}.restore`).d('恢复'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.restore`).d('恢复'),
    };
    // 导入行、已合并、被拆分行、部分勾选、已拆分、已撤回
    if (['1', '3', '5', '6', '7', '10', '11'].includes(state)) {
      operators.push(editCommodityBtn, editCustomerBtn);
    }
    // 已生成
    if (state === '2') {
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
      return operatorRender(newOperators, record, { limit: 1 });
    }
  }

  get columns(): ColumnProps[] {
    // 状态为‘已删除、已生成、已开具’的数据不允许修改
    const adjustEditAble = (record) => !['2', '8', '9'].includes(record.get('state'));
    // 行类型為‘折扣行’，不允許修改開票金額
    const adjustUAmount = (record) =>
      adjustEditAble(record) && record.get('documentLineType') !== '4';
    const adjustUdiscountAmount = (record) =>
      adjustEditAble(record) && record.get('documentLineType') === '4';
    // 状态=【导入行】、【已合并】、【被拆分行】、【部分勾选】、【已拆分】可以修改开票单位
    const adjustUunitAble = (record) => ['1', '3', '5', '6', '7'].includes(record.get('state'));
    // 金额>0且状态=【导入行】、【已合并】、【被拆分行】、【部分勾选】、【已拆分】且【行类型】=“赠品行”的行，可以允许在待开票列表界面上将【行类型】由“赠品行”修改为“折扣行”
    const _adjustLineTypeEditAble = (record) =>
      record.get('documentLineType') === '3' &&
      ['1', '3', '5', '6', '7'].includes(record.get('state')) &&
      record.get('amount') > 0;
    const renderLineType = (record) => {
      if (_adjustLineTypeEditAble(record)) {
        return (
          <Select optionsFilter={(rec) => rec.get('value') === '3' || rec.get('value') === '4'} />
        );
      } else {
        return false;
      }
    };
    const regExp = /(^[1-9]\d*$)/;
    const renderUPrice = (record) => {
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
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'state' },
      { name: 'documentHeadNumber', width: 200 },
      { name: 'documentLineNumber' },
      { name: 'documentDate', width: 180 },
      { name: 'businessDate', width: 120 },
      { name: 'documentLineType', editor: (record) => renderLineType(record) },
      { name: 'projectNumber', width: 150 },
      { name: 'materialDescription', width: 200 },
      { name: 'uprojectUnit', editor: (record) => adjustUunitAble(record) },
      { name: 'uquantity', editor: (record) => adjustEditAble(record) },
      {
        name: 'uprojectUnitPrice',
        editor: (record) => renderUPrice(record),
        renderer: ({ value }) =>
          value && (regExp.test(value) ? value.toFixed(2) : parseFloat(value)),
      },
      { name: 'uprojectAmount', editor: (record) => adjustUAmount(record) },
      { name: 'udiscountAmount', editor: (record) => adjustUdiscountAmount(record) },
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
      { name: 'salesMan' },
      { name: 'erpSalesOrderNumber' },
      { name: 'erpSalesOrderLineNumber' },
      { name: 'erpDeliveryNumber' },
      { name: 'erpDeliveryLineNumber' },
      { name: 'erpInvoiceNumber' },
      { name: 'erpInvoiceLineNumber' },
      { name: 'importDate', width: 180 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 110,
        renderer: ({ record }) => this.operationsRender(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  // 合并、拆分调接口
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
          message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
        });
        await this.props.tobeInvoiceDS.query();
        return true;
      } else {
        notification.error({
          description: '',
          message: res && res.message,
        });
        return false;
      }
    }
  }

  // 合并、拆分
  @Bind()
  async commonFuc(type) {
    const selectedList = this.props.tobeInvoiceDS.selected.map((record) => record.toData());
    const validateValue = await this.props.tobeInvoiceDS.validate(false, false);
    let message = '';
    if (type === 0) message = '合并';
    if (type === 1) message = '拆分';
    if (type === 2) message = '生成申请';
    let notiMess = '';
    new Promise((resolve) => {
      if (selectedList.some((item) => ['2', '4', '8', '9'].includes(item.state))) {
        notiMess = `存在状态为已生成、被合并行、已开具或已删除的数据，不允许${message}！`;
        throw new Error();
      }
      if (
        selectedList.some(
          (item) =>
            (item.state === '5' || item.state === '6') &&
            item.uquantity === 0 &&
            item.uprojectAmount === 0 &&
            item.discountAmount === 0 &&
            item.deduction === 0
        )
      ) {
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
          message: intl.get(`${modelCode}.view.message`).d(notiMess),
        });
      });
  }

  // 生成申请
  @Bind()
  async generateApplication() {
    const selectedList = this.props.tobeInvoiceDS.selected.map((record) => record.toData());
    if (
      selectedList.some((item) => ['2', '4', '8', '9'].includes(item.state)) ||
      selectedList.some((item) => item.documentLineType === '4')
    ) {
      notification.warning({
        description: '',
        duration: 8,
        message:
          '存在状态为已生成、被合并行、已开具、已删除或行类型为折扣行的数据，不允许生成申请！',
      });
      return;
    }
    if (
      selectedList.some(
        (item) =>
          (item.state === '5' || item.state === '6') &&
          item.uquantity === 0 &&
          item.uprojectAmount === 0 &&
          item.discountAmount === 0 &&
          item.deduction === 0
      )
    ) {
      notification.warning({
        description: '',
        duration: 8,
        message:
          '存在状态为被拆分行或部分勾选且行中【开票数量、开票金额、折扣金额、扣除额】均为0的数据，不允许生成申请！',
      });
      return;
    }
    const { dispatch } = this.props;
    const { curCompanyId } = this.state;
    const ids = selectedList.map((rec) => rec.prepareInvoiceId).join(',');
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-iop/tobe-invoice/generate-application/${curCompanyId}/${ids}`,
      })
    );
  }

  // 数据权限分配
  @Bind()
  handlePermission() {
    const { dispatch } = this.props;
    const { curCompanyId } = this.state;
    const selectedList = this.props.tobeInvoiceDS.selected.map((record) => record.toData());
    if (selectedList.some((item) => item.state === '9')) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.merge`)
          .d('存在状态为已删除的数据，不允许数据权限分配！'),
      });
      return;
    }
    const prepareInvoiceId = this.props.tobeInvoiceDS.selected
      .map((rec) => rec.get('prepareInvoiceId'))
      .join(',');
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-iop/permission-assign/PREPARE/${curCompanyId}/${prepareInvoiceId}`,
      })
    );
  }

  // 取消合并
  @Bind()
  async cancelMerge() {
    const selectedList = this.props.tobeInvoiceDS.selected.map((record) => record.toData());
    if (selectedList.some((item) => item.state !== '3')) {
      notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.merge`).d('状态为已合并的数据，才允许取消合并！'),
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
          message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
        });
        await this.props.tobeInvoiceDS.query();
      } else {
        notification.error({
          description: '',
          message: res && res.message,
        });
      }
    }
  }

  // 删除
  @Bind()
  async batchDelete() {
    const selectedList = this.props.tobeInvoiceDS.selected.map((record) => record.toData());
    if (selectedList.some((item) => !['1', '7', '10'].includes(item.state))) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.merge`)
          .d('状态为导入行、已拆分或已撤回的数据，才允许删除！'),
      });
      return;
    }
    const _selectedList = selectedList.map((lineData) => {
      const item = {
        ...lineData,
        state: '9',
        enabledFlag: 0,
      };
      return item;
    });
    const params = {
      tenantId,
      selectedList: _selectedList,
    };
    const res = getResponse(await invoiceSave(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
      });
      await this.props.tobeInvoiceDS.query();
    } else {
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  }

  // 保存
  @Bind()
  batchSave() {
    const submitList = this.props.tobeInvoiceDS.filter((record) => record.dirty);
    if (submitList.length !== 0) {
      if (
        submitList.some((record) => {
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
          message: intl.get(`${modelCode}.view.merge`).d('请使用拆分功能！'),
        });
        return;
      }
      this.props.tobeInvoiceDS.submit();
    } else {
      notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.merge`).d('请先修改数据！'),
      });
    }
  }

  get buttons(): Buttons[] {
    const { curCompanyId } = this.state;
    const BatchButtons = observer((props: any) => {
      let isDisabled = props.dataSet!.selected.length === 0;
      if (props.condition === 'mergeLine') isDisabled = props.dataSet!.selected.length < 2;
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
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
    return [
      <BatchButtons
        key="mergeLine"
        condition="mergeLine"
        onClick={() => this.commonFuc(0)}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get(`${modelCode}.batchMerge`).d('合并')}
        permissionCode="batch-merge"
        permissionMeaning="按钮-批量合并"
      />,
      <BatchButtons
        key="cancelMerge"
        onClick={() => this.cancelMerge()}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get(`${modelCode}.cancelMerge`).d('取消合并')}
        permissionCode="batch-cancel-merge"
        permissionMeaning="按钮-取消合并"
      />,
      <BatchButtons
        key="split"
        onClick={() => this.commonFuc(1)}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get(`${modelCode}.merge`).d('拆分')}
        permissionCode="batch-split"
        permissionMeaning="按钮-批量拆分"
      />,
      <BatchButtons
        key="generateApplication"
        onClick={() => this.generateApplication()}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get(`${modelCode}.merge`).d('生成申请')}
        permissionCode="generate-application"
        permissionMeaning="按钮-生成申请"
      />,
      <BatchButtons
        key="dataPermission"
        onClick={() => this.handlePermission()}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get(`${modelCode}.dataPermission`).d('数据权限分配')}
        permissionCode="data-permission"
        permissionMeaning="按钮-数据权限分配"
      />,
      <BatchButtons
        key="batchDelete"
        onClick={() => this.batchDelete()}
        dataSet={this.props.tobeInvoiceDS}
        title={intl.get(`${modelCode}.batchDelete`).d('删除')}
        permissionCode="batch-delete"
        permissionMeaning="按钮-删除"
      />,
      <PermissionButton
        type="c7n-pro"
        key="batchSave"
        disabled={!curCompanyId}
        onClick={() => this.batchSave()}
        permissionList={[
          {
            code: `${permissionPath}.batch-save`,
            type: 'button',
            meaning: '按钮-保存',
          },
        ]}
      >
        {intl.get(`${modelCode}.batchSave`).d('保存')}
      </PermissionButton>,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('待开票数据勾选')}>
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
