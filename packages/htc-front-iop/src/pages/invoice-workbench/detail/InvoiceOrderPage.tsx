/**
 * @Description:开票订单页面
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-3 16:54:22
 * @LastEditTime: 2021-03-10 17:42:33
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import queryString from 'query-string';
import { Button as PermissionButton } from 'components/Permission';
import { downLoadFiles, getPresentMenu } from '@htccommon/utils/utils';
import {
  Button,
  CheckBox,
  Currency,
  DataSet,
  Form,
  Icon,
  Lov,
  message,
  Modal,
  Radio,
  Select,
  Spin,
  Table,
  TextArea,
  TextField,
} from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import {
  batchSave,
  companyDetailInfo,
  defaultInvoiceInfo,
  employeeInvoiceType,
  employeePurchaseMark,
  exportPrintFile,
  lineRemove,
  orderCopy,
  orderNew,
  review,
} from '@src/services/invoiceOrderService';
import { closeTab } from 'utils/menuTab';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { find, isEmpty, last, replace } from 'lodash';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import notification from 'utils/notification';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import InvoiceQueryTable from '@src/utils/invoice-query/InvoiceQueryTable';
import { FormLayout } from 'choerodon-ui/pro/lib/form/enum';
import InvoiceOrderHeaderDS from '../stores/InvoiceOrderHeaderDS';
import InvoiceOrderLinesDS from '../stores/InvoiceOrderLinesDS';
import IssuePreview from './IssuesPreview';
import styles from '../invoiceWorkbench.module.less';

const tenantId = getCurrentOrganizationId();
const { Option } = Select;
const permissionPath = `${getPresentMenu().name}.ps`;

interface InvoiceOrderPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  match: any;
}

@formatterCollections({
  code: [
    'hiop.invoiceWorkbench',
    'htc.common',
    'hiop.invoiceReq',
    'hiop.tobeInvoice',
    'hivp.invoices',
    'hivp.invoicesArchiveUpload',
  ],
})
export default class InvoiceOrderPage extends Component<InvoiceOrderPageProps> {
  invoiceOrderLinesDS = new DataSet({
    autoQuery: false,
    ...InvoiceOrderLinesDS(),
  });

  invoiceOrderHeaderDS = new DataSet({
    ...InvoiceOrderHeaderDS(this.props.match.params),
    autoQuery: false,
    autoCreate: false,
    children: {
      lineData: this.invoiceOrderLinesDS,
    },
  });

  state = {
    invoiceType: [],
    billingType: undefined,
    invoiceVarietyOpt: [],
    isDisabled: false,
    submitDisabled: false,
    submitLoading: false,
    orderStatus: undefined,
    addDisabled: false,
    employeeInfo: {} as any,
    purchaseMark: [],
    invoiceVariety: undefined,
    invoiceTypeTag: '',
  };

  /**
   * 判断是否新建
   */
  get isCreatePage() {
    const { match } = this.props;
    const { invoicingOrderHeaderId } = match.params;
    return !invoicingOrderHeaderId;
  }

  /**
   * 获取可用发票类型
   * @params {object} employeeInfo 当前员工信息
   */
  @Bind()
  async getInvoiceType(employeeInfo) {
    const { companyId, employeeId } = employeeInfo;
    const params = {
      tenantId,
      companyId,
      employeeId,
    };
    const res = await employeeInvoiceType(params);
    if (res && res.failed) {
      notification.warning({
        description: '',
        message: res.message,
      });
    } else {
      this.setState({ invoiceType: res });
    }
  }

  /**
   * 获取业务类型
   * @params {object} employeeInfo 当前员工信息
   */
  @Bind()
  async getPurchaseMark(employeeInfo) {
    const { companyId, employeeId } = employeeInfo;
    const params = {
      tenantId,
      companyId,
      employeeId,
    };
    const res = await employeePurchaseMark(params);
    if (res && res.failed) {
      notification.warning({
        description: '',
        message: res.message,
      });
    } else {
      this.setState({ purchaseMark: res });
    }
  }

  /**
   * 填充下次默认值
   * @params {object} params 默认发票交付信息接口参数
   */
  @Bind()
  async setDefaultValue(params) {
    const defaultRes = getResponse(await defaultInvoiceInfo(params));
    if (!isEmpty(defaultRes)) {
      this.invoiceOrderHeaderDS.current!.set({
        paperTicketReceiverName: defaultRes.paperTicketReceiverName,
        paperTicketReceiverPhone: defaultRes.paperTicketReceiverPhone,
        paperTicketReceiverAddress: defaultRes.paperTicketReceiverAddress,
        // deliveryWay: defaultRes.deliveryWay,
        electronicReceiverInfo: defaultRes.electronicReceiverInfo,
        nextDefaultFlag: 1,
      });
    }
  }

  /**
   * 头信息传给行
   * @params {string} field 标签名
   * @params {object} value 当前值
   */
  @Bind()
  handleTaxRateLovChange(field, value) {
    if (this.invoiceOrderLinesDS.length > 0) {
      this.invoiceOrderLinesDS.forEach(record => record.set(field, value));
    }
  }

  @Bind()
  judgeIsEdit(orderStatus, billingType, sourceType, invoiceSourceType, hasPermission) {
    if (
      (orderStatus === 'N' && billingType === 1) ||
      (orderStatus === 'Q' && (billingType === 1 || billingType === 2))
    ) {
      if (sourceType !== 'invoiceReq' && invoiceSourceType !== 'APPLY') {
        this.setState({ isDisabled: false, submitDisabled: !!hasPermission });
        this.invoiceOrderHeaderDS.current!.set({ readonly: false });
      } else {
        this.setState({ isDisabled: true, submitDisabled: !!hasPermission });
        this.invoiceOrderHeaderDS.current!.set({ readonly: true });
      }
    } else {
      this.setState({ isDisabled: true, submitDisabled: false });
      this.invoiceOrderHeaderDS.current!.set({ readonly: true });
    }
    if (orderStatus === 'N' && billingType === 2 && invoiceSourceType === 'RED_INFO') {
      this.setState({ isDisabled: false, submitDisabled: !!hasPermission });
      this.invoiceOrderHeaderDS.current!.set({ readonly: false });
    }
  }

  /**
   * 获取订单详情
   * @params {string} headerId 订单id
   * @params {string} employeeId 员工id
   */
  @Bind()
  getOrderData(headerId, employeeId) {
    const { sourceType } = this.props.match.params;
    this.invoiceOrderHeaderDS.setQueryParameter('headerId', headerId);
    this.invoiceOrderHeaderDS.setQueryParameter('employeeId', employeeId);
    this.invoiceOrderHeaderDS.query().then(res => {
      const { billingType, userRemark, remark } = res;
      let mark = '';
      if (remark) {
        if (userRemark) {
          mark = `${remark}${userRemark}`;
        } else {
          mark = `${remark}`;
        }
      } else if (userRemark) {
        mark = `${userRemark}`;
      }
      this.invoiceOrderHeaderDS.current!.set('userRemark', mark);
      this.invoiceOrderHeaderDS.current!.set('sourceType', sourceType);
      if (billingType !== 1 && billingType !== 2) {
        this.invoiceOrderHeaderDS.current!.set('billingType', billingType === 5 ? '2' : '1');
      }
      // 判断页面是否可编辑
      const { orderStatus, invoiceSourceType, invoiceVariety, hasPermission } = res;
      this.setState({ orderStatus, billingType, invoiceVariety, invoiceTypeTag: invoiceVariety });
      this.judgeIsEdit(orderStatus, billingType, sourceType, invoiceSourceType, hasPermission);
      if (sourceType === 'issues') {
        this.issueModal(
          {
            curEmployeeId: employeeId,
            ...res,
          },
          1
        );
      }
    });
    this.invoiceOrderLinesDS.setQueryParameter('invoicingOrderHeaderId', headerId);
    this.invoiceOrderLinesDS.query();
  }

  async componentDidMount() {
    const { invoicingOrderHeaderId } = this.props.match.params;
    if (invoicingOrderHeaderId) {
      this.loadData(false);
    } else {
      this.loadData(true);
    }
  }

  async componentDidUpdate(prevProps) {
    if (
      prevProps.match.params.invoicingOrderHeaderId &&
      prevProps.match.params.invoicingOrderHeaderId !==
        this.props.match.params.invoicingOrderHeaderId
    ) {
      this.loadData(false);
    }
  }

  /**
   * 加载数据
   * @params {boolean} newFlag true-新建 false-编辑
   */
  @Bind()
  async loadData(newFlag: boolean) {
    const { invoicingOrderHeaderId, companyId } = this.props.match.params;
    const employeeRes = await getCurrentEmployeeInfo({ tenantId, companyId });
    const employeeInfo = employeeRes && employeeRes.content[0];
    if (employeeInfo) {
      this.getInvoiceType(employeeInfo);
      this.getPurchaseMark(employeeInfo);
    }
    const invoiceVarietyOpt = await queryIdpValue('HMDM.INVOICE_TYPE');
    this.setState({ invoiceVarietyOpt, employeeInfo });
    if (employeeInfo) {
      // 新建订单
      if (newFlag) {
        const params = {
          tenantId,
          companyId,
          companyCode: employeeInfo.companyCode,
          employeeId: employeeInfo.employeeId,
          employeeNumber: employeeInfo.employeeNum,
          employeeName: employeeInfo.employeeName,
        };
        const newData = getResponse(await orderNew(params));
        if (newData) {
          const { billingType, invoiceVariety } = newData;
          this.invoiceOrderHeaderDS.create(newData, 0);
          this.setState({ billingType, invoiceTypeTag: invoiceVariety, orderStatus: 'N' });
        }
      } else {
        // 编辑/查看订单
        const { employeeId } = employeeInfo;
        this.getOrderData(invoicingOrderHeaderId, employeeId);
      }
    }
  }

  /**
   * 发票种类限制
   * @params {object} value 当前值
   */
  @Bind()
  invoiceDisabled(value) {
    const { invoiceType } = this.state;
    const curData: any = this.invoiceOrderHeaderDS.toData();
    const { purchaseInvoiceFlag } = curData;
    if (purchaseInvoiceFlag === '0') {
      if (value === '0' || value === '52') {
        return true;
      }
    }
    const data = find(invoiceType, (item: any) => item.value === value);
    if (data) return false;
  }

  /**
   * 删除行
   * @params {object} record 要删除的行记录
   */
  @Bind()
  async handleDeleteLines(record) {
    if (record.get('invoicingOrderHeaderId')) {
      const data = record.toData();
      const params = {
        tenantId,
        invoicingOrderHeaderList: [data],
      };
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除'),
        onOk: async () => {
          const res = getResponse(await lineRemove(params));
          if (res) {
            this.invoiceOrderLinesDS.remove(record);
            this.invoiceOrderLinesDS.query();
          } else {
            notification.error({
              description: '',
              message: intl.get('hzero.common.notification.error').d('操作失败'),
            });
          }
        },
      });
    } else {
      this.invoiceOrderLinesDS.delete(record);
    }
  }

  /**
   * 金额计算
   * @params {number/string} value 金额值
   * @params {object} record 行记录
   */
  @Bind()
  calculate(value, record) {
    const quantity = record.get('quantity');
    const price = record.get('projectUnitPrice');
    const _quantity = Number(quantity) || 0;
    const _price = Number(price) || 0;
    const _amount = Number(value) || 0;
    if (quantity && _amount !== 0 && _quantity !== 0) {
      const calPrice = _amount / _quantity;
      if (calPrice.toString().length > 8) {
        record.set({
          projectUnitPrice: calPrice.toFixed(8),
        });
      } else {
        record.set({ projectUnitPrice: calPrice });
      }
    } else if (_price !== 0 && _amount !== 0) {
      const calQuantity = _amount / _price;
      if (calQuantity.toString().length > 8) {
        record.set({
          quantity: calQuantity.toFixed(8),
        });
      } else {
        record.set({ quantity: calQuantity });
      }
    }
  }

  /**
   * 金额改变回调
   * @params {number/string} value 金额值
   * @params {object} record 行记录
   */
  @Bind()
  handleAmount(value, record) {
    const invoiceLineNature = record.get('invoiceLineNature');
    if (value > 0 && invoiceLineNature === '1') {
      message.config({
        top: 300,
      });
      message.error('折扣金额必须小于0！', undefined, undefined, 'top');
      record.set('amount', -value);
      this.calculate(-value, record);
    } else {
      this.calculate(value, record);
    }
  }

  /**
   * 返回表格行
   * @return {*[]}
   */
  get columns(): ColumnProps[] {
    const { isDisabled } = this.state;
    const adjustEditAble = () => !isDisabled;
    const toNonExponential = num => {
      const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
      return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
    };
    const regExp = /(^\d*.0*$)/;
    return [
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          return [
            <Button
              key="delete"
              onClick={() => this.handleDeleteLines(record)}
              disabled={isDisabled}
              funcType={FuncType.link}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      {
        name: 'invoiceLineNature',
        editor: adjustEditAble() && (
          <Select optionsFilter={record => record.get('value') !== '6'} />
        ),
        width: 150,
      },
      { name: 'projectObj', editor: !isDisabled, width: 150 },
      {
        name: 'commodityNumberObj',
        editor: record =>
          adjustEditAble() && (
            <Lov
              name="commodityNumberObj"
              onChange={() => record.get('projectName') && record.set({ projectObj: '' })}
            />
          ),
        width: 180,
      },
      {
        name: 'projectNameSuffix',
        editor: record =>
          adjustEditAble() && (
            <TextField name="projectNameSuffix" onChange={() => record.set({ projectObj: '' })} />
          ),
        width: 150,
      },
      { name: 'projectName', width: 150 },
      { name: 'model', editor: !isDisabled },
      { name: 'projectUnit', editor: !isDisabled },
      {
        name: 'quantity',
        editor: !isDisabled,
        renderer: ({ value }) => <span>{value}</span>,
      },
      {
        name: 'projectUnitPrice',
        editor: !isDisabled,
        renderer: ({ value }) =>
          value &&
          (regExp.test(value) ? Number(value).toFixed(2) : toNonExponential(Number(value))),
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'taxIncludedFlag', editor: !isDisabled },
      {
        name: 'amount',
        editor: record =>
          !isDisabled && <Currency onChange={value => this.handleAmount(value, record)} />,
        width: 150,
      },
      {
        name: 'taxRateObj',
        editor: () => !isDisabled && <Lov name="taxRateObj" noCache />,
        width: 120,
        align: ColumnAlign.right,
      },
      { name: 'taxAmount', width: 150, align: ColumnAlign.right },
      {
        name: 'deduction',
        editor: record => {
          return this.invoiceOrderLinesDS.indexOf(record) === 0 && !isDisabled;
        },
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'zeroTaxRateFlag', editor: !isDisabled, width: 180 },
      { name: 'preferentialPolicyFlag' },
      { name: 'specialVatManagement', width: 140 },
    ];
  }

  /**
   * 行新增回调
   */
  @Bind()
  handleAddLine() {
    const currentData = this.invoiceOrderHeaderDS.current!.toData(true);
    const lineList = this.invoiceOrderLinesDS.map(record => record.toData(true));
    if (lineList.length > 1 && lineList[0].deduction && lineList[0].deduction > 0) {
      return notification.error({
        description: '',
        message: intl
          .get('htc.invoiceWorkbench.notification.error.add')
          .d('差额征税最多只能有两行'),
      });
    }
    if (currentData) {
      const {
        companyId,
        companyCode,
        extNumber,
        invoiceVariety,
        purchaseInvoiceFlag,
        buyerName,
        sellerName,
      } = currentData;
      const customerName = purchaseInvoiceFlag === '0' ? sellerName : buyerName;
      if (!customerName) {
        notification.info({
          description: '',
          message: intl.get('htc.common.validation.completeData').d('请先完善头数据'),
        });
        return;
      }
      this.invoiceOrderLinesDS.create({
        companyId,
        companyCode,
        extNumber,
        invoiceType: invoiceVariety,
      });
    } else {
      notification.info({
        description: '',
        message: intl.get('htc.common.validation.addHeader').d('请先新增头数据'),
      });
    }
  }

  /**
   * 票面预览
   */
  @Bind()
  previewInvoice() {
    const { invoicingOrderHeaderId: headerId, companyId } = this.props.match.params;
    const { history } = this.props;
    const { employeeId } = this.invoiceOrderHeaderDS.current!.toData(true);
    const pathname = `/htc-front-iop/invoice-workbench/invoice-view/ORDER/${headerId}/${employeeId}`;
    history.push({
      pathname,
      search: queryString.stringify({
        invoiceInfo: encodeURIComponent(
          JSON.stringify({
            backPath: `/htc-front-iop/invoice-workbench/edit/invoiceOrder/${companyId}/${headerId}`,
          })
        ),
      }),
    });
  }

  /**
   * 复制订单
   */
  @Bind()
  async handleCopyOrd() {
    const resParams: any = await this.batchSave(3, null);
    if (!resParams) return;
    const params = {
      ...resParams,
      tenantId,
    };
    const res = getResponse(await orderCopy(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      const pathname = `/htc-front-iop/invoice-workbench/edit/invoiceOrder/${res[0].companyId}/${res[0].invoicingOrderHeaderId}`;
      this.props.history.push(pathname);
    }
  }

  /**
   * 下载打印
   */
  @Bind()
  async downloadInvoice() {
    const curInfo = this.invoiceOrderHeaderDS.current!.toData(true);
    const params = {
      tenantId,
      exportOrderHeader: curInfo,
    };
    const res = getResponse(await exportPrintFile(params));
    if (res && res.data) {
      const { fileName } = curInfo;
      const names = fileName.split('/');
      const fileList: any[] = [];
      names.forEach(item => {
        const file = {
          data: res.data,
          fileName: item,
        };
        fileList.push(file);
      });
      downLoadFiles(fileList, 0);
      // names.forEach(item => {
      //   const blob = new Blob([base64toBlob(res.data)]);
      //   if ((window.navigator as any).msSaveBlob) {
      //     try {
      //       (window.navigator as any).msSaveBlob(blob, item);
      //     } catch (e) {
      //       notification.error({
      //         description: '',
      //         message: intl.get('hzero.common.notification.download.error').d('下载失败'),
      //       });
      //     }
      //   } else {
      //     const aElement = document.createElement('a');
      //     const blobUrl = window.URL.createObjectURL(blob);
      //     aElement.href = blobUrl; // 设置a标签路径
      //     aElement.download = item;
      //     aElement.click();
      //     window.URL.revokeObjectURL(blobUrl);
      //   }
      // });
      const printElement = document.createElement('a');
      printElement.href = 'Webshell://'; // 设置a标签路径
      printElement.click();
    }
  }

  /**
   * 校验行
   * @params {[]} lineList 行数据
   * @params {string} companyType 企业类型
   */
  @Bind()
  validateLine(lineList, companyType) {
    const firstData: any = lineList[0];
    const seconedData: any = lineList[1];
    const { deduction } = firstData;
    // 差额征税最多只能有两行
    if (lineList.length > 2 && lineList[0].deduction && lineList[0].deduction > 0) {
      notification.error({
        description: '',
        message: intl
          .get('hiop.invoiceWorkbench.notification.error.dedu')
          .d('差额征税最多只能有两行'),
      });
      return false;
    }
    // 表格校验首行输入扣除额后第二行是否是折扣行
    if (deduction && seconedData) {
      if (seconedData.invoiceLineNature !== '1') {
        notification.error({
          description: '',
          message: intl
            .get('hiop.invoiceWorkbench.notification.error.sec')
            .d(`表格第一行有扣除额，第二行只能选择折扣行`),
        });
        return false;
      }
    }
    // 表格行校验小规模企业不为普通零税率
    if (companyType === '1') {
      const normalZero = find(lineList, (item: any) => item.zeroTaxRateFlag === '3');
      if (normalZero) {
        notification.error({
          description: '',
          message: intl
            .get('hiop.invoiceWorkbench.notification.error.zeroTaxRate')
            .d(`小规模企业不允许开具普通零税率发票`),
        });
        return false;
      }
    }
    // 表格校验折扣行是否紧跟在被折扣行之后下一行
    const lineNatureArr = lineList.map((item: any) => {
      return item.invoiceLineNature;
    });
    const unCount = find(
      lineNatureArr,
      (item, index) => item === '2' && lineNatureArr[index + 1] !== '1'
    );
    if (last(lineNatureArr) === '2' || unCount) {
      notification.error({
        description: '',
        message: intl
          .get('hiop.invoiceWorkbench.notification.error.discount')
          .d(`折扣行紧跟在被折扣行之后下一行`),
      });
      return false;
    }
    return true;
  }

  /**
   * 审核（提交）
   * @params {[]} lineList 行数据
   * @params {object} params 接口传参
   * @params {string} 来源类型 sourceType
   * @params {number} companyId 公司id
   * @params {number} 订单id invoicingOrderHeaderId
   */
  @Bind()
  async handleSubmit(lineList, params, sourceType, companyId, invoicingOrderHeaderId) {
    const { history } = this.props;
    // 表格行校验空
    if (isEmpty(lineList)) {
      return notification.error({
        description: '',
        message: intl.get('hiop.invoiceWorkbench.validation.error.addLine').d(`请新增表格行`),
      });
    }
    const res = getResponse(await review(params));
    this.setState({
      submitLoading: false,
    });
    let pathname;
    let pathSearch;
    if (['issues', 'invoiceOrder'].includes(sourceType)) {
      pathname = '/htc-front-iop/invoice-workbench/list';
    } else {
      const { search } = this.props.location;
      const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
      closeTab(
        `/htc-front-iop/invoice-workbench/edit/invoiceReq/${companyId}/${invoicingOrderHeaderId}`
      );
      if (invoiceInfoStr) {
        const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
        pathname = invoiceInfo.backPath;
        pathSearch = invoiceInfo.backSearch;
      }
    }
    if (res) {
      history.push({
        pathname,
        search: pathSearch,
      });
    }
  }

  /**
   * 保存新建
   * @params {object} params 接口传参
   * @params {number} companyId 公司id
   */
  @Bind()
  async createOrder(params, companyId) {
    const { history } = this.props;
    const res = getResponse(await batchSave(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      if (!this.props.match.params.invoicingOrderHeaderId) {
        this.loadData(true);
      }
      history.push(`/htc-front-iop/invoice-workbench/invoice-order/invoiceOrder/${companyId}`);
    }
  }

  /**
   * 保存继续
   * @params {object} params 接口传参
   * @params {number} companyId 公司id
   */
  @Bind()
  async editOrder(params, companyId, source) {
    const { history } = this.props;
    const res = getResponse(await batchSave(params));
    if (res && res[0]) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      if (this.props.match.params.invoicingOrderHeaderId) {
        this.loadData(false);
      }
      const pathname = source
        ? `/htc-front-iop/invoice-workbench/edit/issues/${companyId}/${res[0].invoicingOrderHeaderId}`
        : `/htc-front-iop/invoice-workbench/edit/invoiceOrder/${companyId}/${res[0].invoicingOrderHeaderId}`;
      history.push(pathname);
    }
  }

  /**
   * 保存继续
   * @params {object} params 接口传参
   * @params {object} employeeInfo 员工信息
   */
  @Bind()
  async copyOrder(params, employeeInfo) {
    const tempParams = {
      ...params,
      employeeId: employeeInfo.employeeId,
      employeeName: employeeInfo.employeeName,
      employeeNumber: employeeInfo.employeeNum,
    };
    const { isDisabled } = this.state;
    // 当是完成订单时 不提交
    if (isDisabled) {
      return tempParams;
    }
    const res = getResponse(await batchSave(params));
    if (res && res[0]) {
      return tempParams;
    }
  }

  /**
   * 保存
   * @params {number} type 0-保存新建 1-审核提交 2-保存继续 3-复制订单
   */
  @Bind()
  async batchSave(type, source) {
    const { companyId, invoicingOrderHeaderId, sourceType } = this.props.match.params;
    const { billingType, employeeInfo } = this.state;
    const headerData = this.invoiceOrderHeaderDS.current!.toData(true);
    const lineList: any = this.invoiceOrderLinesDS.map(record => record.toData(true));
    const validateValue = await this.invoiceOrderHeaderDS.validate(false, false);
    const linesValidate = await this.invoiceOrderLinesDS.validate(false, false);
    const { companyType, remark, userRemark, calculateSpin } = headerData;
    if (!validateValue || !linesValidate) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
      return;
    }
    if (!isEmpty(lineList)) {
      const ifRes = this.validateLine(lineList, companyType);
      if (!ifRes) {
        return;
      }
    }
    let mark = userRemark;
    if (remark) {
      mark = replace(userRemark, `${remark}`, '');
    }
    const params = {
      ...headerData,
      curEmployeeId: employeeInfo.employeeId,
      billingType,
      tenantId,
      userRemark: mark,
      lines: lineList,
      discountSplitFlag: this.invoiceOrderLinesDS.dirty && calculateSpin,
    };
    // 审核（提交）1
    switch (type) {
      case 0:
        this.createOrder(params, companyId);
        break;
      case 1:
        this.handleSubmit(lineList, params, sourceType, companyId, invoicingOrderHeaderId);
        break;
      case 2:
        this.editOrder(params, companyId, source);
        break;
      case 3:
        return this.copyOrder(params, employeeInfo);
      default:
        break;
    }
  }

  /**
   * 返回表格行按钮
   * @return {*[]}
   */
  get lineButton(): Buttons[] {
    const { isDisabled, addDisabled } = this.state;
    return [
      <Button
        icon="playlist_add"
        key="add"
        funcType={FuncType.link}
        onClick={() => this.handleAddLine()}
        disabled={isDisabled || addDisabled}
      >
        {intl.get('hzero.common.add').d('新增')}
      </Button>,
    ];
  }

  /**
   * 销方/购方公司搜索
   * @params {number} type 0-购方 1-销方
   */
  @Bind()
  handleCompanySearch(type) {
    const { employeeInfo } = this.state;
    if (!employeeInfo) return;
    const curData = this.invoiceOrderHeaderDS.current!.toData();
    const { companyCode, employeeNum } = employeeInfo;
    const invoiceQueryProps = {
      invoiceType: curData.invoiceVariety,
      enterpriseName: type === 0 ? curData.buyerName : curData.sellerName,
      sourceRecord: this.invoiceOrderHeaderDS.current,
      sourceField: type === 0 ? 'buyerObj' : 'sellerObj',
      companyCode,
      employeeNum,
    };
    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get('hiop.invoiceWorkbench.title.invoiceQuery').d('开票信息查询'),
      destroyOnClose: true,
      closable: true,
      footer: null,
      style: { width: '50%' },
      children: <InvoiceQueryTable {...invoiceQueryProps} onCloseModal={() => modal.close()} />,
    });
  }

  /**
   * 销方/购方改变回调
   * @params {object} value-当前值
   * @params {object} oldValue-旧值
   * @params {number} type 0-购方 1-销方
   */
  @Bind()
  handleCompanyChange(value, oldValue, type) {
    if (value === oldValue) return;
    const buyerNameField = this.invoiceOrderHeaderDS.current?.getField('buyerName');
    const sellerNameField = this.invoiceOrderHeaderDS.current?.getField('sellerName');
    if (type === 0) {
      if (buyerNameField) {
        const buyerName = buyerNameField.getText(value) || buyerNameField.getValue();
        const buyerObj: any = buyerNameField.getLookupData(value);
        this.invoiceOrderHeaderDS.current!.set({
          buyerName,
          buyerObj: buyerObj.buyerName ? buyerObj : { buyerName },
        });
      }
    } else if (sellerNameField) {
      const sellerName = sellerNameField.getText(value) || sellerNameField.getValue();
      const sellerObj: any = sellerNameField.getLookupData(value);
      this.invoiceOrderHeaderDS.current!.set({
        sellerName,
        sellerObj: sellerObj.sellerName ? sellerObj : { sellerName },
      });
    }
  }

  /**
   * 收购标志变化回调
   * @params {object} value-当前值
   */
  @Bind()
  async invoiceFlagChange(value) {
    const { companyCode } = this.state.employeeInfo;
    const params = { companyCode, tenantId };
    const res = getResponse(await companyDetailInfo(params));
    if (res) {
      if (value === '0') {
        const buyerObj = {
          buyerName: res.companyName,
          buyerTaxpayerNumber: res.taxpayerNumber,
          buyerCompanyAddressPhone: res.companyAddressPhone,
          buyerBankNumber: res.bankNumber,
          buyerCompanyType: '01',
        };
        this.invoiceOrderHeaderDS.current!.set('buyerObj', buyerObj);
        this.invoiceOrderHeaderDS.current!.set('sellerObj', {});
      } else {
        const sellerObj = {
          sellerName: res.companyName,
          sellerTaxpayerNumber: res.taxpayerNumber,
          sellerCompanyAddressPhone: res.companyAddressPhone,
          sellerBankNumber: res.bankNumber,
          sellerCompanyType: '01',
        };
        this.invoiceOrderHeaderDS.current!.set('sellerObj', sellerObj);
        this.invoiceOrderHeaderDS.current!.set('buyerObj', {});
      }
    }
  }

  /**
   * 购货清单标志变化回调
   * @params {string} value-当前值
   */
  @Bind()
  flagChange(value) {
    const { addDisabled } = this.state;
    if (value !== '0' && addDisabled) {
      this.setState({ addDisabled: false });
    }
  }

  /**
   * 发票种类联动下次默认值
   * @params {string} value-当前值
   */
  @Bind()
  invoiceVarietyChange(value) {
    this.setState({
      invoiceTypeTag: value,
    });
    const { companyId } = this.props.match.params;
    const curHeaderInfo = this.invoiceOrderHeaderDS.current!.toData();
    const { buyerName, sellerName } = curHeaderInfo;
    if (value && buyerName && sellerName) {
      const params = {
        tenantId,
        companyId,
        invoiceVariety: value,
        buyerName,
        sellerName,
      };
      this.setDefaultValue(params);
    }
    this.handleTaxRateLovChange('invoiceType', value);
  }

  /**
   * 渲染员工信息
   */
  get renderEmployeeDesc() {
    const { employeeInfo } = this.state;
    if (employeeInfo) {
      return `${employeeInfo.companyCode || ''}-${employeeInfo.employeeNum ||
        ''}-${employeeInfo.employeeName || ''}-${employeeInfo.mobile || ''}`;
    }
    return '';
  }

  /**
   * 查询条自定义
   */
  @Bind()
  renderQueryBar(props) {
    const { buttons } = props;
    const { current } = this.invoiceOrderHeaderDS;
    return (
      <>
        <div className={styles.containTable}>
          <div className={styles.containTable}>
            <h3 className={styles.title}>
              <b>{intl.get('hiop.invoiceWorkbench.title.commodityInfo').d('商品信息')}</b>
            </h3>
            {buttons}
          </div>
          <div className={styles.tableTitleRight}>
            <p>
              {intl.get('hiop.invoiceWorkbench.label.totalTax').d('合计税额：')}
              <span>{current?.get('totalTax') && current?.get('totalTax').toFixed(2)}</span>
            </p>
            <p>
              {intl.get('hiop.invoiceWorkbench.label.totalExcludeTax').d('合计不含税金额：')}
              <span>
                {current?.get('totalExcludingTaxAmount') &&
                  current?.get('totalExcludingTaxAmount').toFixed(2)}
              </span>
            </p>
            <p>
              {intl.get('hiop.invoiceWorkbench.label.totalPriceTax').d('合计含税金额：')}
              <span>
                {current?.get('totalPriceTaxAmount') &&
                  current?.get('totalPriceTaxAmount').toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      </>
    );
  }

  /**
   * 发票类型切换UI切换
   */
  invoiceTypeTag() {
    const { invoiceTypeTag } = this.state;
    if (['51', '52'].includes(invoiceTypeTag)) {
      return [
        <Select name="deliveryWay" />,
        <TextField name="electronicReceiverInfo" colSpan={2} />,
      ];
    } else {
      return [
        <TextField name="paperTicketReceiverName" />,
        <TextField name="paperTicketReceiverPhone" />,
        <TextField name="paperTicketReceiverAddress" />,
      ];
    }
  }

  /**
   * 提交开具回调
   * @params {object} modal-发票预览modal
   */
  @Bind()
  async handleCommitIssue(modal, data, type) {
    modal.close();
    if (type === 0) {
      this.batchSave(1, null);
    } else {
      const { companyId, invoicingOrderHeaderId, sourceType } = this.props.match.params;
      const { history } = this.props;
      const res = getResponse(await review(data));
      let pathname;
      let pathSearch;
      if (['issues', 'invoiceOrder', 'likeOrder'].includes(sourceType)) {
        pathname = '/htc-front-iop/invoice-workbench/list';
      } else {
        const { search } = this.props.location;
        const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
        closeTab(
          `/htc-front-iop/invoice-workbench/edit/invoiceReq/${companyId}/${invoicingOrderHeaderId}`
        );
        if (invoiceInfoStr) {
          const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
          pathname = invoiceInfo.backPath;
          pathSearch = invoiceInfo.backSearch;
        }
      }
      if (res) {
        history.push({
          pathname,
          search: pathSearch,
        });
      }
    }
  }

  /**
   * 开具预览弹窗
   * @params {object} pageData-页面数据
   */
  @Bind()
  issueModal(pageData, type) {
    const modal = Modal.open({
      title: intl.get('hzero.invoiceWorkbench.title.issuePreview').d('发票预览'),
      children: <IssuePreview invoiceData={pageData} />,
      closable: true,
      bodyStyle: { width: 'calc(63vw)', height: 'calc(60vh)', padding: '16px 26px' },
      contentStyle: { width: 'calc(65vw)' },
      className: styles.invoiceModal,
      footer: (
        <div style={{ display: 'block', textAlign: 'center' }}>
          <Button
            color={ButtonColor.primary}
            onClick={() => this.handleCommitIssue(modal, pageData, type)}
          >
            {intl.get('hzero.invoiceWorkbench.modalColse').d('提交开具')}
          </Button>
          <Button color={ButtonColor.primary} onClick={() => modal.close()}>
            {intl.get('hzero.invoiceWorkbench.modalColse').d('返回')}
          </Button>
        </div>
      ),
    });
  }

  /**
   * 开具预览回调
   */
  @Bind()
  issuePreview() {
    const invoiceSourceType = this.invoiceOrderHeaderDS.current!.get('invoiceSourceType');
    if (['APPLY', 'RED_MARK', 'VOID', 'RED_INFO'].includes(invoiceSourceType)) {
      const pageData = this.invoiceOrderHeaderDS.current!.toData();
      this.issueModal(pageData, 0);
    } else {
      this.batchSave(2, 1);
    }
  }

  /**
   * 返回header按钮
   */
  renderHeaderBts = () => {
    const { isDisabled, orderStatus, invoiceVariety, submitDisabled, submitLoading } = this.state;
    const invoiceSourceType = this.invoiceOrderHeaderDS.getField('invoiceSourceType')?.getValue();
    return (
      <>
        <PermissionButton
          type="c7n-pro"
          color={ButtonColor.primary}
          loading={submitLoading}
          disabled={!submitDisabled}
          onClick={() => {
            this.setState({
              submitLoading: true,
            });
            this.batchSave(1, null);
          }}
          permissionList={[
            {
              code: `${permissionPath}.detail-submit`,
              type: 'button',
              meaning: '按钮-明细-审核(提交)',
            },
          ]}
        >
          {intl.get('hzero.common.button.submit').d('提交')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={isDisabled}
          onClick={() => this.batchSave(0, null)}
          permissionList={[
            {
              code: `${permissionPath}.detail-save-new`,
              type: 'button',
              meaning: '按钮-明细-保存（新建）',
            },
          ]}
        >
          {intl.get('hiop.invoiceWorkbench.button.saveCreate').d('保存(新建)')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={isDisabled}
          onClick={() => this.batchSave(2, null)}
          permissionList={[
            {
              code: `${permissionPath}.detail-save-continue`,
              type: 'button',
              meaning: '按钮-明细-保存（继续）',
            },
          ]}
        >
          {intl.get('hiop.invoiceWorkbench.button.saveContinue').d('保存(继续)')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={orderStatus !== 'F' || invoiceVariety === '51'}
          onClick={() => this.downloadInvoice()}
          permissionList={[
            {
              code: `${permissionPath}.detail-download-invoice`,
              type: 'button',
              meaning: '按钮-明细-下载打印',
            },
          ]}
        >
          {intl.get('hiop.invoiceWorkbench.button.downPrint').d('下载打印')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={orderStatus !== 'F'}
          onClick={() => this.previewInvoice()}
          permissionList={[
            {
              code: `${permissionPath}.detail-preview-invoice`,
              type: 'button',
              meaning: '按钮-明细-票面预览',
            },
          ]}
        >
          {intl.get('hiop.invoiceWorkbench.button.invoicePreview').d('票面预览')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={orderStatus !== 'N'}
          onClick={() => this.issuePreview()}
          permissionList={[
            {
              code: `${permissionPath}.button.detail-issuing-preview`,
              type: 'button',
              meaning: '按钮-明细-开具预览',
            },
          ]}
        >
          {intl.get('hiop.invoiceWorkbench.button.IssuingPreview').d('开具预览')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={
            ['RED_INFO', 'VOID', 'RED_MARK'].includes(invoiceSourceType) || this.isCreatePage
          }
          onClick={() => this.handleCopyOrd()}
          permissionList={[
            {
              code: `${permissionPath}.button.detail-copy-order`,
              type: 'button',
              meaning: '按钮-明细-复制订单',
            },
          ]}
        >
          {intl.get('hiop.invoiceReq.button.copy.copyOrder').d('复制订单')}
        </PermissionButton>
      </>
    );
  };

  // 获取关闭标签的key
  handleBack() {
    const { sourceType, companyId, invoicingOrderHeaderId } = this.props.match.params;
    if (sourceType === 'likeOrder') {
      closeTab(
        `/htc-front-iop/invoice-workbench/edit/likeOrder/${companyId}/${invoicingOrderHeaderId}`
      );
    } else if (sourceType !== ('invoiceOrder' || 'issues')) {
      closeTab(
        `/htc-front-iop/invoice-workbench/edit/invoiceReq/${companyId}/${invoicingOrderHeaderId}`
      );
    }
  }

  render() {
    const { invoiceVarietyOpt, purchaseMark } = this.state;
    const { sourceType } = this.props.match.params;
    let pathname;
    if (['issues', 'invoiceOrder', 'likeOrder'].includes(sourceType)) {
      pathname = '/htc-front-iop/invoice-workbench/list';
    } else {
      const { search } = this.props.location;
      const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
      if (invoiceInfoStr) {
        const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
        pathname = `${invoiceInfo.backPath}${invoiceInfo.backSearch}`;
      }
    }
    return (
      <>
        <Header
          backPath={pathname}
          title={intl.get('hiop.invoiceWorkbench.title.invoiceOrder').d('开票订单')}
          onBack={() => this.handleBack()}
        >
          {this.renderHeaderBts()}
        </Header>
        <Content style={{ background: 'rgb(246,246,246)', padding: '0' }}>
          <Spin dataSet={this.invoiceOrderHeaderDS}>
            <Form
              style={{ background: '#fff', padding: '16px 16px 0px', marginBottom: '8px' }}
              columns={4}
              dataSet={this.invoiceOrderHeaderDS}
              excludeUseColonTagList={['Radio']}
            >
              <TextField name="orderNumber" />
              <Select name="invoiceSourceType" />
              <TextField name="invoiceSourceOrder" />
              <TextField name="invoiceSourceFlag" />

              <Select name="purchaseInvoiceFlag" onChange={this.invoiceFlagChange}>
                {purchaseMark.map((item: any) => (
                  <Option value={item.value} key={item.value}>
                    {item && item.meaning}
                  </Option>
                ))}
              </Select>
              <Select name="invoiceVariety" onChange={this.invoiceVarietyChange}>
                {invoiceVarietyOpt.map((item: any) => (
                  <Option
                    value={item.value}
                    key={item.value}
                    disabled={this.invoiceDisabled(item.value)}
                  >
                    {item && item.meaning}
                  </Option>
                ))}
              </Select>
              <Select name="listFlag" onChange={this.flagChange} />
              <Lov
                name="extNumberObj"
                onChange={value => this.handleTaxRateLovChange('extNumber', value.value)}
              />
            </Form>
            <div style={{ background: '#fff', display: 'flex', padding: '16px' }}>
              <div
                style={{
                  background: 'rgb(0,0,0,0.02)',
                  marginRight: '8px',
                }}
              >
                <h3 style={{ marginLeft: '5px' }}>
                  <b>{intl.get('hiop.invoiceWorkbench.label.buyer').d('购买方')}</b>
                </h3>
                <Form
                  columns={2}
                  dataSet={this.invoiceOrderHeaderDS}
                  excludeUseColonTagList={['Radio']}
                  labelTooltip={Tooltip.overflow}
                >
                  <Select
                    name="buyerName"
                    searchable
                    searchMatcher="buyerName"
                    combo
                    checkValueOnOptionsChange={false}
                    colSpan={2}
                    onChange={(value, oldValue) => this.handleCompanyChange(value, oldValue, 0)}
                    suffix={<Icon type="search" onClick={() => this.handleCompanySearch(0)} />}
                  />
                  <TextField name="buyerTaxpayerNumber" labelWidth={140} />
                  <Select name="buyerCompanyType" />
                  <TextField name="buyerCompanyAddressPhone" colSpan={2} />
                  <TextField name="buyerBankNumber" colSpan={2} />
                </Form>
              </div>
              <div style={{ background: 'rgb(0,0,0,0.02)' }}>
                <h3 style={{ marginLeft: '5px' }}>
                  <b>{intl.get('hiop.invoiceWorkbench.label.seller').d('销售方')}</b>
                </h3>
                <Form
                  columns={2}
                  dataSet={this.invoiceOrderHeaderDS}
                  excludeUseColonTagList={['Radio']}
                  labelTooltip={Tooltip.overflow}
                >
                  <Select
                    name="sellerName"
                    searchable
                    searchMatcher="sellerName"
                    combo
                    colSpan={2}
                    checkValueOnOptionsChange={false}
                    onChange={(value, oldValue) => this.handleCompanyChange(value, oldValue, 1)}
                    suffix={<Icon type="search" onClick={() => this.handleCompanySearch(1)} />}
                  />
                  <TextField name="sellerTaxpayerNumber" labelWidth={140} />
                  <Select name="sellerCompanyType" />
                  <TextField name="sellerCompanyAddressPhone" colSpan={2} />
                  <TextField name="sellerBankNumber" colSpan={2} />
                </Form>
              </div>
            </div>
            <Form
              dataSet={this.invoiceOrderHeaderDS}
              columns={4}
              excludeUseColonTagList={['Radio']}
              labelTooltip={Tooltip.overflow}
              style={{ background: '#fff', paddingRight: '16px' }}
            >
              <TextArea name="userRemark" rows={1} colSpan={2} resize={ResizeType.both} />

              <Select name="orderProgress" />
              <Select name="orderStatus" />

              <Lov name="payeeNameObj" />
              <Lov name="issuerNameObj" labelWidth={140} />
              <Lov name="reviewerNameObj" labelWidth={140} />

              <Currency name="invoiceAmountDifference" />
              {this.invoiceTypeTag()}
              <CheckBox name="nextDefaultFlag" />
              <Lov name="systemCodeObj" />
              <Lov name="documentTypeCodeObj" />
            </Form>
            <Form
              dataSet={this.invoiceOrderHeaderDS}
              columns={6}
              excludeUseColonTagList={['Radio']}
              layout={FormLayout.none}
              labelTooltip={Tooltip.overflow}
              style={{ background: '#fff' }}
              className={styles.customTable}
            >
              <div className={styles.invoiceContainer}>
                <Radio name="billingType" value="1" style={{ color: 'blue' }}>
                  {intl.get('hiop.invoiceWorkbench.label.blueInvoice').d('蓝字发票')}
                </Radio>
                <div className={styles.flex}>
                  <span style={{ color: 'blue' }}>
                    {intl.get('hiop.invoiceWorkbench.label.invoiceCode').d('发票代码：')}
                  </span>
                  <TextField name="blueInvoiceCode" style={{ width: '100px' }} />
                </div>
                <div className={styles.flex}>
                  <span style={{ color: 'blue' }}>
                    {intl.get('hiop.invoiceWorkbench.label.invoiceNumber').d('发票号码：')}
                  </span>
                  <TextField style={{ width: '100px' }} name="blueInvoiceNo" />
                </div>
              </div>
              <div className={styles.invoiceContainer}>
                <Radio name="billingType" value="2" style={{ color: 'red' }}>
                  {intl.get('hiop.invoiceWorkbench.label.redInvoice').d('红字发票')}
                </Radio>
                <div className={styles.flex}>
                  <span style={{ color: 'red' }}>
                    {intl.get('hiop.invoiceWorkbench.label.invoiceCode').d('发票代码：')}
                  </span>
                  <TextField style={{ width: '100px' }} name="invoiceCode" />
                </div>
                <div className={styles.flex}>
                  <span style={{ color: 'red' }}>
                    {intl.get('hiop.invoiceWorkbench.label.invoiceNumber').d('发票号码：')}
                  </span>
                  <TextField name="invoiceNo" style={{ width: '100px' }} />
                </div>
              </div>
            </Form>
          </Spin>
          <Table
            dataSet={this.invoiceOrderLinesDS}
            columns={this.columns}
            buttons={this.lineButton}
            queryBar={this.renderQueryBar}
            style={{ height: 400, background: '#fff', marginTop: '8px', padding: '0px 16px 16px' }}
          />
        </Content>
      </>
    );
  }
}
