/**
 * @Description:开票订单页面
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-3 16:54:22
 * @LastEditTime: 2021-03-10 17:42:33
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Header, Content } from 'components/Page';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import intl from 'utils/intl';
import queryString from 'query-string';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu, base64toBlob } from '@common/utils/utils';
import {
  Lov,
  Table,
  Button,
  Form,
  DataSet,
  TextField,
  Select,
  Radio,
  Output,
  TextArea,
  CheckBox,
  Spin,
  Icon,
  Modal,
  Currency,
  message,
} from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import {
  employeeInvoiceType,
  batchSave,
  review,
  companyDetailInfo,
  defaultInvoiceInfo,
  lineRemove,
  orderNew,
  employeePurchaseMark,
  exportPrintFile,
} from '@src/services/invoiceOrderService';
import { closeTab } from 'utils/menuTab';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { find, isEmpty, last, replace } from 'lodash';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import notification from 'utils/notification';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import InvoiceQueryTable from '@src/utils/invoice-query/InvoiceQueryTable';
import InvoiceOrderHeaderDS from '../stores/InvoiceOrderHeaderDS';
import InvoiceOrderLinesDS from '../stores/InvoiceOrderLinesDS';

const modelCode = 'hiop.invoice-order';
const tenantId = getCurrentOrganizationId();
const { Option } = Select;
const permissionPath = `${getPresentMenu().name}.ps`;

interface InvoiceOrderPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  match: any;
}

@connect()
export default class InvoiceOrderPage extends Component<InvoiceOrderPageProps> {
  invoiceOrderLinesDS = new DataSet({
    autoQuery: false,
    ...InvoiceOrderLinesDS(),
  });

  invoiceOrderHeaderDS = new DataSet({
    autoQuery: false,
    autoCreate: false,
    ...InvoiceOrderHeaderDS(this.props.match.params),
    children: {
      lines: this.invoiceOrderLinesDS,
    },
  });

  state = {
    invoiceType: [],
    billingType: undefined,
    invoiceVarietyOpt: [],
    isDisabled: false,
    submitDisabled: false,
    orderStatus: undefined,
    addDisabled: false,
    employeeInfo: {} as any,
    purchaseMark: [],
    invoiceVariety: undefined,
  };

  // 获取可用发票类型
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

  // 获取业务类型
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

  // 填充下次默认值
  @Bind()
  async setDefaultValue(params) {
    const defaultRes = getResponse(await defaultInvoiceInfo(params));
    if (!isEmpty(defaultRes)) {
      this.invoiceOrderHeaderDS.current!.set(
        'paperTicketReceiverName',
        defaultRes.paperTicketReceiverName
      );
      this.invoiceOrderHeaderDS.current!.set(
        'paperTicketReceiverPhone',
        defaultRes.paperTicketReceiverPhone
      );
      this.invoiceOrderHeaderDS.current!.set(
        'paperTicketReceiverAddress',
        defaultRes.paperTicketReceiverAddress
      );
      this.invoiceOrderHeaderDS.current!.set('deliveryWay', defaultRes.deliveryWay);
      this.invoiceOrderHeaderDS.current!.set(
        'electronicReceiverInfo',
        defaultRes.electronicReceiverInfo
      );
      this.invoiceOrderHeaderDS.current!.set('nextDefaultFlag', 1);
    }
  }

  // 头信息传给行
  @Bind()
  handleTaxRateLovChange(field, value) {
    if (this.invoiceOrderLinesDS.length > 0) {
      this.invoiceOrderLinesDS.forEach((record) => record.set(field, value));
    }
  }

  @Bind()
  editData(headerId, employeeId) {
    const { sourceType } = this.props.match.params;
    this.invoiceOrderHeaderDS.setQueryParameter('headerId', headerId);
    this.invoiceOrderHeaderDS.setQueryParameter('employeeId', employeeId);
    this.invoiceOrderHeaderDS.query().then((res) => {
      const { billingType, userRemark } = res;
      const { remark } = res;
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
      if (billingType !== 1 && billingType !== 2) {
        this.invoiceOrderHeaderDS.current!.set('billingType', billingType === 5 ? '2' : '1');
      }
      // 判断页面是否可编辑
      const { orderStatus, invoiceSourceType, invoiceVariety, hasPermission } = res;
      this.setState({ orderStatus, billingType, invoiceVariety });
      if (
        (orderStatus === 'N' && billingType === 1) ||
        (orderStatus === 'Q' && (billingType === 1 || billingType === 2))
      ) {
        if (sourceType !== 'invoiceReq' && invoiceSourceType !== 'APPLY') {
          this.setState({ isDisabled: false, submitDisabled: hasPermission && true });
          this.invoiceOrderHeaderDS.current!.set({ readonly: false });
        } else {
          this.setState({ isDisabled: true, submitDisabled: hasPermission && true });
          this.invoiceOrderHeaderDS.current!.set({ readonly: true });
        }
      } else {
        this.setState({ isDisabled: true, submitDisabled: false });
        this.invoiceOrderHeaderDS.current!.set({ readonly: true });
      }
      // this.setState({ submitDisabled: !hasPermission });
      // console.log('!hasPermission', !hasPermission);
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
          companyCode: employeeInfo && employeeInfo.companyCode,
          employeeId: employeeInfo && employeeInfo.employeeId,
          employeeNumber: employeeInfo && employeeInfo.employeeNum,
          employeeName: employeeInfo && employeeInfo.employeeName,
        };
        const newData = getResponse(await orderNew(params));
        if (newData) {
          const { billingType } = newData;
          this.invoiceOrderHeaderDS.create(newData, 0);
          this.setState({ billingType });
        }
      } else {
        // 编辑/查看订单
        const { employeeId } = employeeInfo;
        this.editData(invoicingOrderHeaderId, employeeId);
      }
    }
  }

  @Bind()
  invoiceDisabled(value) {
    const { invoiceType } = this.state;
    const curData: any = this.invoiceOrderHeaderDS.toData();
    const { purchaseInvoiceFlag } = curData;
    let disabled = true;
    if (purchaseInvoiceFlag === '0') {
      if (value === '0' || value === '52') {
        disabled = true;
        return disabled;
      }
    }
    const data = find(invoiceType, (item: any) => item.value === value);
    if (data) disabled = false;
    return disabled;
  }

  // 删除行
  @Bind()
  async handleDeleteLines(record) {
    if (record.get('invoicingOrderHeaderId')) {
      const data = record.toData();
      const params = {
        tenantId,
        invoicingOrderHeaderList: [data],
      };
      Modal.confirm({
        title: intl.get(`${modelCode}.view.deleteTitle`).d('是否确认删除'),
        onOk: async () => {
          const res = getResponse(await lineRemove(params));
          if (res) {
            this.invoiceOrderLinesDS.remove(record);
          } else {
            notification.error({
              description: '',
              message: intl.get(`${modelCode}.view.success`).d('删除失败，请联系管理员'),
            });
          }
        },
      });
    } else {
      this.invoiceOrderLinesDS.delete(record);
    }
  }

  @Bind()
  handleAmount(value, record) {
    const invoiceLineNature = record.get('invoiceLineNature');
    if (value > 0 && invoiceLineNature === '1') {
      message.config({
        top: 300,
      });
      message.error('折扣金额必须小于0！', undefined, undefined, 'top');
      record.set('amount', -value);
    }
  }

  get columns(): ColumnProps[] {
    const { isDisabled } = this.state;
    const adjustEditAble = () => !isDisabled && true;
    const regExp = /(^[1-9]\d*$)/;
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
            >
              {intl.get(`${modelCode}.button.delete`).d('删除')}
            </Button>,
          ];
        },
        lock: ColumnLock.left,
        align: ColumnAlign.center,
      },
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      {
        name: 'invoiceLineNature',
        editor: adjustEditAble() && (
          <Select optionsFilter={(record) => record.get('value') !== '6'} />
        ),
        width: 150,
      },
      { name: 'projectObj', editor: !isDisabled && true, width: 150 },
      {
        name: 'commodityNumberObj',
        editor: (record) =>
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
        editor: (record) =>
          adjustEditAble() && (
            <TextField name="projectNameSuffix" onChange={() => record.set({ projectObj: '' })} />
          ),
        width: 150,
      },
      { name: 'projectName', width: 150 },
      { name: 'model', editor: !isDisabled && true },
      { name: 'projectUnit', editor: !isDisabled && true },
      {
        name: 'quantity',
        editor: !isDisabled && true,
        renderer: ({ value }) => <span>{value}</span>,
      },
      {
        name: 'projectUnitPrice',
        editor: !isDisabled && true,
        renderer: ({ value }) =>
          value && (regExp.test(value) ? value.toFixed(2) : parseFloat(value)),
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'taxIncludedFlag', editor: !isDisabled && true },
      {
        name: 'amount',
        editor: (record) =>
          !isDisabled && <Currency onChange={(value) => this.handleAmount(value, record)} />,
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
        editor: (record) => {
          return this.invoiceOrderLinesDS.indexOf(record) === 0 && !isDisabled && true;
        },
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'zeroTaxRateFlag', editor: !isDisabled && true, width: 180 },
      { name: 'preferentialPolicyFlag' },
      { name: 'specialVatManagement', width: 140 },
    ];
  }

  @Bind()
  handleAddLine() {
    const currentData = this.invoiceOrderHeaderDS.current!.toData(true);
    const lineList = this.invoiceOrderLinesDS.map((record) => record.toData(true));
    if (lineList.length > 1 && lineList[0].deduction && lineList[0].deduction > 0) {
      return notification.error({
        description: '',
        message: intl.get(`${modelCode}.view.newHeader`).d('差额征税最多只能有两行'),
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
          message: intl.get(`${modelCode}.view.newHeader`).d('请先完善头数据'),
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
        message: intl.get(`${modelCode}.view.newHeader`).d('请先新增头数据'),
      });
    }
  }

  // 预览票面
  @Bind()
  previewInvoice() {
    const { invoicingOrderHeaderId: headerId, companyId } = this.props.match.params;
    const { dispatch } = this.props;
    const { employeeId } = this.invoiceOrderHeaderDS.current!.toData(true);
    const pathname = `/htc-front-iop/invoice-workbench/invoice-view/ORDER/${headerId}/${employeeId}`;
    dispatch(
      routerRedux.push({
        pathname,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: `/htc-front-iop/invoice-workbench/edit/invoiceOrder/${companyId}/${headerId}`,
            })
          ),
        }),
      })
    );
  }

  // 下载打印
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
      names.forEach((item) => {
        const blob = new Blob([base64toBlob(res.data)]);
        if (window.navigator.msSaveBlob) {
          try {
            window.navigator.msSaveBlob(blob, item);
          } catch (e) {
            notification.error({
              description: '',
              message: intl.get(`${modelCode}.view.ieUploadInfo`).d('下载失败'),
            });
          }
        } else {
          const aElement = document.createElement('a');
          const blobUrl = window.URL.createObjectURL(blob);
          aElement.href = blobUrl; // 设置a标签路径
          aElement.download = item;
          aElement.click();
          window.URL.revokeObjectURL(blobUrl);
        }
        // const blob = new Blob([res]); // 字节流
        // if (window.navigator.msSaveBlob) {
        //   try {
        //     window.navigator.msSaveBlob(blob, item);
        //   } catch (e) {
        //     notification.error({
        //       description: '',
        //       message: intl.get(`${modelCode}.view.ieUploadInfo`).d('下载失败'),
        //     });
        //   }
        // } else {
        //   const aElement = document.createElement('a');
        //   const blobUrl = window.URL.createObjectURL(blob);
        //   aElement.href = blobUrl; // 设置a标签路径
        //   aElement.download = item;
        //   aElement.click();
        //   window.URL.revokeObjectURL(blobUrl);
        // }
      });
      const printElement = document.createElement('a');
      printElement.href = 'Webshell://'; // 设置a标签路径
      printElement.click();
    }
  }

  // 保存
  @Bind()
  async batchSave(type) {
    const { companyId, invoicingOrderHeaderId } = this.props.match.params;
    const { dispatch } = this.props;
    const { billingType } = this.state;
    const headerData = this.invoiceOrderHeaderDS.current!.toData(true);
    const lineList: any = this.invoiceOrderLinesDS.map((record) => record.toData(true));
    const validateValue = await this.invoiceOrderHeaderDS.validate(false, false);
    const linesValidate = await this.invoiceOrderLinesDS.validate(false, false);
    const { companyType, listFlag, remark, userRemark } = headerData;
    const empRes = await getCurrentEmployeeInfo({
      tenantId,
      companyId: this.props.match.params.companyId,
    });
    const empInfo = empRes && empRes.content[0];
    // 页面校验
    if (!validateValue || !linesValidate) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
      return;
    }
    if (!isEmpty(lineList)) {
      const firstData: any = lineList[0];
      const seconedData: any = lineList[1];
      const { invoiceLineNature, deduction } = firstData;
      // 表格校验首行是否为折扣行
      if (invoiceLineNature === '1') {
        return notification.error({
          description: '',
          message: intl.get(`${modelCode}.view.saveHeader`).d(`折扣行不可在首行录入`),
        });
      }
      // 差额征税最多只能有两行
      if (lineList.length > 2 && lineList[0].deduction && lineList[0].deduction > 0) {
        return notification.error({
          description: '',
          message: intl.get(`${modelCode}.view.newHeader`).d('差额征税最多只能有两行'),
        });
      }
      // 表格校验首行输入扣除额后第二行是否是折扣行
      if (deduction && seconedData) {
        if (seconedData.invoiceLineNature !== '1') {
          return notification.error({
            description: '',
            message: intl
              .get(`${modelCode}.view.saveHeader`)
              .d(`表格第一行有扣除额，第二行只能选择折扣行`),
          });
        }
      }
      // 表格行校验小规模企业不为普通零税率
      if (companyType === '1') {
        const normalZero = find(lineList, (item: any) => item.zeroTaxRateFlag === '3');
        if (normalZero) {
          return notification.error({
            description: '',
            message: intl
              .get(`${modelCode}.view.saveHeader`)
              .d(`小规模企业不允许开具普通零税率发票`),
          });
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
        return notification.error({
          description: '',
          message: intl.get(`${modelCode}.view.saveHeader`).d(`折扣行紧跟在被折扣行之后下一行`),
        });
      }
      // 清单标志选了不用清单，行不可以超过8行
      if (listFlag === '0' && lineList.length > 8) {
        return notification.error({
          description: '',
          message: intl
            .get(`${modelCode}.view.saveHeader`)
            .d(`清单标志选了不用清单，行不可以超过8行`),
        });
      }
    }
    let mark = userRemark;
    if (remark) {
      mark = replace(userRemark, `${remark}`, '');
    }
    const params = {
      ...headerData,
      curEmployeeId: empInfo && empInfo.employeeId,
      // curEmployeeName: empInfo && empInfo.employeeName,
      // curEmployeeNumber: empInfo && empInfo.employeeNum,
      billingType,
      tenantId,
      userRemark: mark,
      lines: lineList,
    };
    // 审核（提交）1
    if (type === 1) {
      // 表格行校验空
      if (isEmpty(lineList)) {
        return notification.error({
          description: '',
          message: intl.get(`${modelCode}.view.saveHeader`).d(`请新增表格行`),
        });
      }
      const res = getResponse(await review(params));
      const { sourceType } = this.props.match.params;
      let pathname;
      let pathSearch;
      if (sourceType === 'invoiceOrder') {
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
        dispatch(routerRedux.push({ pathname, search: pathSearch }));
      }
    }
    // 保存（新建）
    if (type === 0) {
      const res = getResponse(await batchSave(params));
      if (res) {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('保存成功'),
        });
        if (!this.props.match.params.invoicingOrderHeaderId) {
          this.loadData(true);
        }
        dispatch(
          routerRedux.push({
            pathname: `/htc-front-iop/invoice-workbench/invoiceOrder/invoiceOrder/${companyId}`,
          })
        );
      }
    }
    // 保存继续
    if (type === 2) {
      const res = getResponse(await batchSave(params));
      if (res && res[0]) {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('保存成功'),
        });
        if (this.props.match.params.invoicingOrderHeaderId) {
          this.loadData(false);
        }
        dispatch(
          routerRedux.push({
            pathname: `/htc-front-iop/invoice-workbench/edit/invoiceOrder/${companyId}/${res[0].invoicingOrderHeaderId}`,
          })
        );
      }
    }
  }

  get lineButton(): Buttons[] {
    const { isDisabled, addDisabled } = this.state;
    return [
      <Button
        icon="playlist_add"
        key="add"
        onClick={() => this.handleAddLine()}
        disabled={isDisabled || addDisabled}
      >
        {intl.get(`${modelCode}.button.add`).d('新增')}
      </Button>,
    ];
  }

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
      title: intl.get(`${modelCode}.invoiceQuery.title`).d('开票信息查询'),
      destroyOnClose: true,
      closable: true,
      footer: null,
      style: { width: '50%' },
      children: <InvoiceQueryTable {...invoiceQueryProps} onCloseModal={() => modal.close()} />,
    });
  }

  // 公司名称模糊查询赋值
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

  // 收购标志变化回调
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

  @Bind()
  flagChange(value) {
    const { addDisabled } = this.state;
    if (value !== '0' && addDisabled) {
      this.setState({ addDisabled: false });
    }
  }

  // 发票种类联动下次默认值
  @Bind()
  invoiceVarietyChange(value) {
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

  get renderEmployeeDesc() {
    const { employeeInfo } = this.state;
    if (employeeInfo) {
      return `${employeeInfo.companyCode || ''}-${employeeInfo.employeeNum || ''}-${
        employeeInfo.employeeName || ''
      }-${employeeInfo.mobile || ''}`;
    }
    return '';
  }

  render() {
    const {
      employeeInfo,
      invoiceVarietyOpt,
      isDisabled,
      orderStatus,
      invoiceVariety,
      submitDisabled,
      purchaseMark,
    } = this.state;
    const { sourceType, companyId, invoicingOrderHeaderId } = this.props.match.params;
    let pathname;
    if (sourceType === 'invoiceOrder') {
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
          title={intl.get(`${modelCode}.title`).d('开票订单')}
          onBack={() =>
            sourceType !== 'invoiceOrder' &&
            closeTab(
              `/htc-front-iop/invoice-workbench/edit/invoiceReq/${companyId}/${invoicingOrderHeaderId}`
            )
          }
        >
          <PermissionButton
            type="c7n-pro"
            color={ButtonColor.dark}
            disabled={!submitDisabled}
            onClick={() => this.batchSave(1)}
            permissionList={[
              {
                code: `${permissionPath}.detail-submit`,
                type: 'button',
                meaning: '按钮-明细-审核(提交)',
              },
            ]}
          >
            {intl.get(`${modelCode}.submit`).d('审核(提交)')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            color={ButtonColor.dark}
            disabled={isDisabled}
            onClick={() => this.batchSave(0)}
            permissionList={[
              {
                code: `${permissionPath}.detail-save-new`,
                type: 'button',
                meaning: '按钮-明细-保存（新建）',
              },
            ]}
          >
            {intl.get(`${modelCode}.saveNew`).d('保存（新建）')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            disabled={isDisabled}
            onClick={() => this.batchSave(2)}
            permissionList={[
              {
                code: `${permissionPath}.detail-save-continue`,
                type: 'button',
                meaning: '按钮-明细-保存（继续）',
              },
            ]}
          >
            {intl.get(`${modelCode}.saveContinue`).d('保存（继续）')}
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
            {intl.get(`${modelCode}.downloadInvoice`).d('下载打印')}
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
            {intl.get(`${modelCode}.button.previewInvoice`).d('票面预览')}
          </PermissionButton>
        </Header>
        <Content>
          <Spin dataSet={this.invoiceOrderHeaderDS}>
            <Row>
              <Col span={16}>
                <Form columns={4}>
                  <Output
                    label={intl.get(`${modelCode}.view.companyName`).d('所属公司')}
                    value={(employeeInfo && employeeInfo.companyName) || ''}
                    colSpan={2}
                  />
                  <Output
                    label={intl.get(`${modelCode}.view.employeeDesc`).d('登录员工')}
                    colSpan={2}
                    value={this.renderEmployeeDesc}
                  />
                </Form>
              </Col>
              <Col span={8}>
                <Form dataSet={this.invoiceOrderHeaderDS}>
                  <Output name="orderNumber" />
                </Form>
              </Col>
            </Row>
            <Form
              dataSet={this.invoiceOrderHeaderDS}
              columns={6}
              excludeUseColonTagList={['Radio']}
              labelTooltip={Tooltip.overflow}
            >
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
                onChange={(value) => this.handleTaxRateLovChange('extNumber', value.value)}
              />
              <Select name="invoiceSourceType" />
              <TextField name="invoiceSourceOrder" />
              {/*---*/}
              <Select
                name="buyerName"
                colSpan={3}
                searchable
                searchMatcher="buyerName"
                combo
                checkValueOnOptionsChange={false}
                onChange={(value, oldValue) => this.handleCompanyChange(value, oldValue, 0)}
                suffix={<Icon type="search" onClick={() => this.handleCompanySearch(0)} />}
              />
              <Select
                name="sellerName"
                searchable
                searchMatcher="sellerName"
                combo
                checkValueOnOptionsChange={false}
                colSpan={3}
                onChange={(value, oldValue) => this.handleCompanyChange(value, oldValue, 1)}
                suffix={<Icon type="search" onClick={() => this.handleCompanySearch(1)} />}
              />
              {/*---*/}
              <TextField name="buyerTaxpayerNumber" colSpan={2} />
              <Select name="buyerCompanyType" />
              <TextField name="sellerTaxpayerNumber" colSpan={2} />
              <Select name="sellerCompanyType" />
              {/*---*/}
              <TextField name="buyerCompanyAddressPhone" colSpan={3} />
              <TextField name="sellerCompanyAddressPhone" colSpan={3} />
              {/*---*/}
              <TextField name="buyerBankNumber" colSpan={3} />
              <TextField name="sellerBankNumber" colSpan={3} />
              {/*---*/}
              <TextArea name="userRemark" colSpan={3} rowSpan={2} />
              <TextField name="paperTicketReceiverName" />
              <TextField name="paperTicketReceiverPhone" />
              <CheckBox name="nextDefaultFlag" />
              {/*---*/}
              <TextField name="paperTicketReceiverAddress" colSpan={3} />
              {/*---*/}
              <Lov name="payeeNameObj" newLine />
              <Lov name="issuerNameObj" />
              <Lov name="reviewerNameObj" />
              <Select name="deliveryWay" />
              <TextField name="electronicReceiverInfo" colSpan={2} />
              {/*---*/}
              <Radio name="billingType" value="1" newLine style={{ color: 'blue' }}>
                蓝字发票
              </Radio>
              <TextField
                name="blueInvoiceCode"
                label={<span style={{ color: 'blue' }}>发票代码</span>}
              />
              <TextField
                name="blueInvoiceNo"
                label={<span style={{ color: 'blue' }}>发票号码</span>}
              />
              <Select name="orderStatus" />
              <Select name="orderProgress" />
              <Currency name="invoiceAmountDifference" />
              {/*---*/}
              <Radio name="billingType" value="2" newLine style={{ color: 'red' }}>
                红字发票
              </Radio>
              <TextField
                name="invoiceCode"
                label={<span style={{ color: 'red' }}>发票代码</span>}
              />
              <TextField name="invoiceNo" label={<span style={{ color: 'red' }}>发票号码</span>} />
              <Currency name="totalExcludingTaxAmount" />
              <Currency name="totalPriceTaxAmount" />
              <Currency name="totalTax" />
            </Form>
          </Spin>
          <Table
            dataSet={this.invoiceOrderLinesDS}
            columns={this.columns}
            buttons={this.lineButton}
            style={{ height: 200 }}
          />
        </Content>
      </>
    );
  }
}
