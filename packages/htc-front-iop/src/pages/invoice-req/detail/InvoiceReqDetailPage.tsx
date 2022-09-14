/**
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-12-07 15:39:52
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  Button,
  CheckBox,
  Currency,
  DataSet,
  Form,
  Lov,
  Modal,
  notification,
  Radio,
  Select,
  Spin,
  Table,
  TextArea,
  TextField,
} from 'choerodon-ui/pro';
import { Card, Icon } from 'choerodon-ui';
import { Header } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import intl from 'utils/intl';
import { forEach, isEmpty } from 'lodash';
import { closeTab } from 'utils/menuTab';
import { FormLayout } from 'choerodon-ui/pro/lib/form/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import queryString from 'query-string';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import moment from 'moment';
import InvoiceQueryTable from '@src/utils/invoice-query/InvoiceQueryTable';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import {
  batchSave,
  exportNotZip,
  exportPrintFiles,
  getRuleDefaultValue,
  reqCopy,
  reqNextDefault,
  reqSubmit,
} from '@src/services/invoiceReqService';
import { Button as PermissionButton } from 'components/Permission';
import { base64toBlob, getPresentMenu } from '@htccommon/utils/utils';
import InvoiceReqDetailDS from '../stores/InvoiceReqDetailDS';
import InvoiceReqLinesDS from '../stores/InvoiceReqLinesDS';
import styles from '../../invoice-workbench/invoiceWorkbench.module.less';

const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

interface RouterInfo {
  companyId: any;
  headerId: any;
  sourceType: any;
  billFlag: any;
}

interface InvoiceReqDetailPageProps extends RouteComponentProps<RouterInfo> {}

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
export default class InvoiceReqDetailPage extends Component<InvoiceReqDetailPageProps> {
  state = {
    requestStatus: '',
    deleteFlag: 'N',
    empInfo: {} as any,
    invoiceType: '',
    sourceType: '',
  };

  reqLinesDS = new DataSet({
    ...InvoiceReqLinesDS(),
  });

  reqHeaderDS = new DataSet({
    autoQuery: false,
    autoCreate: false,
    ...InvoiceReqDetailDS(this.props.match.params),
    children: {
      requisitionLines: this.reqLinesDS,
    },
  });

  /**
   * 判断是否新建
   */
  get isCreatePage() {
    const { match } = this.props;
    const { headerId } = match.params;
    return !headerId;
  }

  async componentDidMount() {
    this.handleQueryNewReq(this.isCreatePage);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.match.params.headerId &&
      prevProps.match.params.headerId !== this.props.match.params.headerId
    ) {
      this.reqHeaderDS = new DataSet({
        autoQuery: false,
        autoCreate: false,
        ...InvoiceReqDetailDS(this.props.match.params),
        children: {
          requisitionLines: this.reqLinesDS,
        },
      });
      this.handleQueryNewReq(false);
    }
  }

  /**
   * 查询
   * @params {boolean} newFlag-是否新建
   */
  @Bind()
  async handleQueryNewReq(newFlag: boolean) {
    const empRes = await getCurrentEmployeeInfo({
      tenantId,
      companyId: this.props.match.params.companyId,
    });
    const { sourceType, billFlag } = this.props.match.params;
    const empInfo = empRes && empRes.content[0];
    if (!newFlag) {
      const showAdjustFlag = this.reqHeaderDS.current?.get('showAdjustFlag') || 'N';
      this.reqLinesDS.setQueryParameter('showAdjustFlag', showAdjustFlag);
      this.reqLinesDS.setQueryParameter('billFlag', billFlag);
      await this.reqHeaderDS.query().then(() =>
        this.reqHeaderDS.current!.set({
          employeeId: empInfo && empInfo.employeeId,
          showAdjustFlag,
        })
      );
      if (sourceType === 'TOBE') {
        this.reqHeaderDS.current!.set('readonly', true);
      }
    } else if (empInfo) {
      const defaultValueRes = await getRuleDefaultValue({
        tenantId,
        companyId: this.props.match.params.companyId,
        employeeId: empInfo.employeeId,
      });
      this.reqHeaderDS.create(
        {
          companyCode: empInfo.companyCode,
          companyName: empInfo.companyName,
          companyId: this.props.match.params.companyId,
          taxpayerNumber: empInfo.taxpayerNumber,
          employeeId: empInfo.employeeId,
          applicantId: empInfo.employeeId,
          applicantNumber: empInfo.employeeNum,
          applicantName: empInfo.employeeName,
          requestType: defaultValueRes && defaultValueRes.requestType,
          requestTypeMeaning: defaultValueRes && defaultValueRes.requestTypeMeaning,
          invoiceType: defaultValueRes && defaultValueRes.invoiceTypeCode,
          invoiceTypeMeaning: defaultValueRes && defaultValueRes.invoiceTypeMeaning,
          invoiceTypeTag: defaultValueRes && defaultValueRes.invoiceTypeTag,
          extNumber: defaultValueRes && defaultValueRes.extNumber,
          companyType: defaultValueRes && defaultValueRes.companyType,
          electronicType: defaultValueRes && defaultValueRes.electronicType,
        },
        0
      );
    }
    this.setState({
      requestStatus: this.reqHeaderDS.current!.get('requestStatus'),
      deleteFlag: this.reqHeaderDS.current!.get('deleteFlag'),
      invoiceType: this.reqHeaderDS.current!.get('invoiceType'),
      sourceType: this.reqHeaderDS.current!.get('sourceType'),
      empInfo,
    });
  }

  /**
   * 处理保存事件
   * @params {boolean} newFlag: 是否再次新建
   */
  @Bind()
  async handleSaveReq(newFlag: boolean) {
    const { history } = this.props;
    const { billFlag } = this.props.match.params;
    const invoiceTypeTag = this.reqHeaderDS.current!.get('invoiceTypeTag');
    const requestType = this.reqHeaderDS.current!.get('requestType');
    if (['SALES_INVOICE_SUBSCRIBE', 'PURCHASE_INVOICE_SUBSCRIBE'].includes(requestType)) {
      this.reqHeaderDS.current!.getField('emailPhone')!.set('required', false);
    } else {
      this.reqHeaderDS.current!.getField('emailPhone')!.set('required', invoiceTypeTag === 'E');
    }
    const res = await this.reqHeaderDS.submit();
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get('htc.common.notification.noChange').d('请先修改数据'),
      });
    } else if (res === false) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
    } else if (res && res.content && res.content[0]) {
      if (this.isCreatePage === newFlag) {
        this.handleQueryNewReq(newFlag);
      } else if (newFlag) {
        const pathname = `/htc-front-iop/invoice-req/create/${this.props.match.params.companyId}`;
        history.push(pathname);
      } else {
        const pathname = `/htc-front-iop/invoice-req/detail/${res.content[0].companyId}/${res.content[0].headerId}/${billFlag}`;
        history.push(pathname);
      }
    }
  }

  /**
   * 复制申请
   * @params {boolean} reqFlag true-申请单 false-未开具
   */
  @Bind()
  async handleCopyReq(reqFlag) {
    const { history } = this.props;
    const submitRes = await this.reqHeaderDS.submit();
    if (submitRes === false) return;
    const { empInfo } = this.state;
    const { billFlag } = this.props.match.params;
    const params = {
      tenantId,
      headerId: this.props.match.params.headerId,
      copyType: reqFlag ? '0' : '1',
      employeeId: empInfo && empInfo.employeeId,
    };
    const res = getResponse(await reqCopy(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      const pathname = `/htc-front-iop/invoice-req/detail/${res.companyId}/${res.headerId}/${billFlag}`;
      history.push(pathname);
    }
  }

  /**
   * 提交
   */
  @Bind()
  async handleSubmitReq() {
    const invoiceTypeTag = this.reqHeaderDS.current!.get('invoiceTypeTag');
    this.reqHeaderDS.current!.getField('emailPhone')!.set('required', invoiceTypeTag === 'E');
    const validateValue = await this.reqHeaderDS.validate(false, false);
    const linesValidate = await this.reqLinesDS.validate(false, false);
    // 页面校验
    if (!validateValue || !linesValidate) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
      return;
    }
    const { empInfo } = this.state;
    const headerData = this.reqHeaderDS.current!.toData(true);
    const lineData = this.reqLinesDS.map(record => record.toData(true));
    const pageData = {
      ...headerData,
      // _status: 'update',
      requisitionLines: lineData,
    };
    const saveRes = await batchSave(pageData);
    if (saveRes && !saveRes.failed) {
      const params = {
        tenantId,
        reviewerId: empInfo.employeeId,
        companyCode: empInfo.companyCode,
        requisitionHeaders: [this.props.match.params.headerId],
      };
      const res = getResponse(await reqSubmit(params));
      if (res) {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        this.handleQueryNewReq(false);
      }
    } else {
      notification.error({
        description: '',
        message: saveRes.message,
      });
    }
  }

  /**
   * 收票方模糊查询赋值
   * @params {object} value-当前值
   * @params {object} oldValue 旧值
   */
  @Bind()
  handleReceiptNameChange(value, oldValue) {
    if (value === oldValue) return;
    const receiptNameField = this.reqHeaderDS.current?.getField('receiptName');
    if (receiptNameField) {
      const receiptName = receiptNameField.getText(value) || receiptNameField.getValue();
      const receiptObj: any = receiptNameField.getLookupData(value);
      this.reqHeaderDS.current!.set({
        receiptName,
        receiptObj: receiptObj.receiptName ? receiptObj : { receiptName },
      });
    }
  }

  /**
   * 开票信息查询
   */
  @Bind()
  handleInvoiceQuery() {
    const { requestStatus, deleteFlag, empInfo } = this.state;
    if (!(['N', 'Q'].includes(requestStatus) && deleteFlag === 'N')) {
      return;
    }
    const curHeader = this.reqHeaderDS.current!.toData();
    const invoiceQueryProps = {
      invoiceType: curHeader.invoiceType,
      enterpriseName: curHeader.receiptName,
      sourceRecord: this.reqHeaderDS.current,
      sourceField: 'receiptObj',
      companyCode: empInfo && empInfo.companyCode,
      employeeNum: empInfo && empInfo.employeeNum,
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
   * 查看订单
   */
  @Bind()
  handleViewOrder() {
    const { history } = this.props;
    const { headerId, billFlag, companyId } = this.props.match.params;
    const pathname = `/htc-front-iop/invoice-req/order/${headerId}`;
    history.push({
      pathname,
      search: queryString.stringify({
        invoiceInfo: encodeURIComponent(
          JSON.stringify({
            backPath: `/htc-front-iop/invoice-req/detail/${companyId}/${headerId}/${billFlag}`,
          })
        ),
      }),
    });
  }

  /**
   * 行税率受控于头
   * @params {string} field-标签名
   * @params {object} value-标签值
   */
  @Bind()
  handleTaxRateLovChange(field, value) {
    if (this.reqLinesDS.length > 0) {
      this.reqLinesDS.forEach(line => line.set(field, value.value));
    }
    this.setState({ invoiceType: value.value });
  }

  /**
   * 购买方/销售方受控于发票种类
   * @params {object} value-发票种类
   */
  async invoiceVarietyChange(value) {
    const receiptName = this.reqHeaderDS.current!.get('receiptName');
    const invoiceType = this.reqHeaderDS.current!.get('invoiceType');
    const invoiceTypeTag = (value && value.tag) || '';
    if (receiptName && invoiceType) {
      const params = {
        tenantId,
        receiptName,
        companyId: this.props.match.params.companyId,
        invoiceVariety: invoiceType,
      };
      const res = await reqNextDefault(params);
      if (res && res.nextDefaultFlag === 1) {
        if (invoiceTypeTag === 'E') {
          this.reqHeaderDS.current!.set({
            paperRecipient: '',
            paperPhone: '',
            nextDefaultFlag: res.nextDefaultFlag,
            paperAddress: '',
            // electronicType: res.electronicType,
            emailPhone: res.emailPhone,
          });
        } else {
          this.reqHeaderDS.current!.set({
            paperRecipient: res.paperRecipient,
            paperPhone: res.paperPhone,
            nextDefaultFlag: res.nextDefaultFlag,
            paperAddress: res.paperAddress,
            // electronicType: '',
            emailPhone: '',
          });
        }
      }
    }
    this.handleTaxRateLovChange('invoiceType', value);
  }

  /**
   * 新增行
   */
  @Bind()
  handleAddLine() {
    const currentData = this.reqHeaderDS.current;
    if (currentData) {
      const {
        headerId,
        companyId,
        companyCode,
        extNumber,
        invoiceType,
        requestType,
        receiptName,
      } = currentData.toData();
      if (
        !receiptName &&
        !['SALES_INVOICE_SUBSCRIBE', 'PURCHASE_INVOICE_SUBSCRIBE'].includes(requestType)
      ) {
        notification.info({
          description: '',
          message: intl.get('htc.common.validation.completeData').d('请先完善头数据'),
        });
        return;
      }
      this.reqLinesDS.create({
        headerId,
        companyId,
        companyCode,
        extNumber,
        invoiceType,
        adjustFlag: this.isCreatePage ? 'N' : 'A',
      });
    } else {
      notification.info({
        description: '',
        message: intl.get('htc.common.validation.addHeader').d('请先新增头数据'),
      });
    }
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const { sourceType: urlSourceType } = this.props.match.params;
    const { requestStatus, deleteFlag, sourceType } = this.state;
    return [
      <Button
        icon="playlist_add"
        key="add"
        onClick={() => this.handleAddLine()}
        funcType={FuncType.link}
        style={{ marginLeft: 10 }}
        disabled={
          !(
            ['N', 'Q'].includes(requestStatus) &&
            deleteFlag === 'N' &&
            sourceType !== '8' &&
            urlSourceType !== 'TOBE'
          )
        }
      >
        {intl.get('hzero.common.add').d('新增')}
      </Button>,
    ];
  }

  /**
   * 计算行金额
   * @params {object} value-当前值
   * @params {object} record-当前行
   */
  @Bind()
  handleAmount(value, record) {
    const quantity = record.get('quantity');
    const price = record.get('price');
    const _quantity = Number(quantity) || 0;
    const _price = Number(price) || 0;
    const _amount = Number(value) || 0;
    if (quantity && _amount !== 0 && _quantity !== 0) {
      const calPrice = _amount / _quantity;
      if (calPrice.toString().length > 8) {
        record.set({
          price: calPrice.toFixed(8),
        });
      } else {
        record.set({ price: calPrice });
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
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    const { sourceType: urlSourceType } = this.props.match.params;
    const { requestStatus, deleteFlag, sourceType } = this.state;
    const toNonExponential = num => {
      const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
      return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
    };
    const regExp = /(^\d*.[0]*$)/;
    // 删除行不可修改/【来源类型】=“发票作废”不允许修改/从待开票跳转过来不可改
    const adjustEditAble = record =>
      ['N', 'Q'].includes(requestStatus) &&
      deleteFlag === 'N' &&
      !['Y', 'D'].includes(record.get('adjustFlag')) &&
      sourceType !== '8' &&
      urlSourceType !== 'TOBE';
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'projectNumberObj', editor: record => adjustEditAble(record), width: 150 },
      { name: 'commodityNumberObj', editor: record => adjustEditAble(record), width: 150 },
      { name: 'commodityShortName' },
      {
        name: 'issues',
        editor: record =>
          adjustEditAble(record) && (
            <TextField name="issues" onChange={() => record.set({ projectNumberObj: '' })} />
          ),
        width: 300,
      },
      { name: 'projectName', width: 300 },
      { name: 'specificationModel', editor: record => adjustEditAble(record), width: 150 },
      { name: 'unit', editor: record => adjustEditAble(record) },
      {
        name: 'quantity',
        editor: record => adjustEditAble(record),
        width: 150,
        renderer: ({ value }) => <span>{value}</span>,
      },
      {
        name: 'price',
        editor: record => adjustEditAble(record),
        renderer: ({ value }) =>
          value &&
          (regExp.test(value) ? Number(value).toFixed(2) : toNonExponential(Number(value))),
        width: 150,
        align: ColumnAlign.right,
      },
      {
        name: 'amount',
        editor: record =>
          adjustEditAble(record) && (
            <Currency onChange={value => this.handleAmount(value, record)} />
          ),
        width: 150,
        align: ColumnAlign.right,
      },
      {
        name: 'discountAmount',
        editor: record => adjustEditAble(record),
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'taxIncludedFlag', editor: record => adjustEditAble(record), width: 130 },
      {
        name: 'taxRateObj',
        editor: record => adjustEditAble(record) && <Lov name="taxRateObj" noCache />,
        width: 120,
        align: ColumnAlign.right,
      },
      {
        name: 'zeroTaxRateFlag',
        editor: record =>
          adjustEditAble(record) && record.get('taxRate') && Number(record.get('taxRate')) === 0,
        width: 150,
      },
      { name: 'taxAmount', width: 150, align: ColumnAlign.right },
      {
        name: 'deductionAmount',
        editor: record => adjustEditAble(record),
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'preferentialPolicyFlag' },
      { name: 'sourceLineNum' },
      {
        name: 'sourceNumber3',
        width: 120,
        editor: record => adjustEditAble(record) && ['1', '3', '4', '5', '6'].includes(sourceType),
      },
      {
        name: 'sourceNumber4',
        width: 120,
        editor: record => adjustEditAble(record) && ['1', '3', '4', '5', '6'].includes(sourceType),
      },
      { name: 'adjustFlag' },
      { name: 'adjustLineId' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          return [
            <Button
              key="delete"
              funcType={FuncType.link}
              onClick={() => this.reqLinesDS.delete(record)}
              disabled={!adjustEditAble(record)}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 导出打印
   * @params {[]} list-文件列表
   */
  @Bind()
  printZip(list) {
    forEach(list, (item, key) => {
      const date = moment().format('YYYY-MM-DD HH:mm:ss');
      const zipName = `${date}-${key}`;
      const blob = new Blob([base64toBlob(item)]);
      if (window.navigator.msSaveBlob) {
        try {
          window.navigator.msSaveBlob(blob, `${zipName}.zip`);
        } catch (e) {
          notification.error({
            description: '',
            message: intl.get('hzero.common.notification.download.error').d('下载失败'),
          });
        }
      } else {
        const aElement = document.createElement('a');
        const blobUrl = window.URL.createObjectURL(blob);
        aElement.href = blobUrl; // 设置a标签路径
        aElement.download = `${zipName}.zip`;
        aElement.click();
        window.URL.revokeObjectURL(blobUrl);
      }
    });
  }

  @Bind()
  async exportInterface(params) {
    const res = await exportPrintFiles(params);
    if (res && res.status === '1000') {
      const { data } = res;
      if (isEmpty(data.skipList)) {
        // 导出打印
        this.printZip(data.invoiceTypeMap);
      } else {
        Modal.confirm({
          children: `您本次选择的发票${data.skipList.join('、')}存在断号，是否批量导出打印？`,
        }).then(button => {
          if (button === 'ok') {
            // 导出打印
            this.printZip(data.invoiceTypeMap);
          }
        });
      }
    } else {
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  }

  @Bind()
  async printInvoiceInterface(params) {
    const res = getResponse(await exportNotZip(params));
    if (res) {
      res.forEach(item => {
        const blob = new Blob([base64toBlob(item.data)]);
        if (window.navigator.msSaveBlob) {
          try {
            window.navigator.msSaveBlob(blob, item.fileName);
          } catch (e) {
            notification.error({
              description: '',
              message: intl.get('hzero.common.notification.error').d('下载失败'),
            });
          }
        } else {
          const aElement = document.createElement('a');
          const blobUrl = window.URL.createObjectURL(blob);
          aElement.href = blobUrl; // 设置a标签路径
          aElement.download = item.fileName;
          aElement.click();
          window.URL.revokeObjectURL(blobUrl);
        }
      });
      const printElement = document.createElement('a');
      printElement.href = 'Webshell://'; // 设置a标签路径
      printElement.click();
    }
  }

  /**
   * 导出打印文件
   * @params {boolean} type 0-导出打印 1-打印发票
   * @params {string} printType-打印类型
   */
  @Bind()
  async handleExportPrintFiles(type, printType) {
    const { empInfo } = this.state;
    const curData = this.reqHeaderDS.current!.toData();
    const tips = type === 0 ? '无法导出打印文件' : '打印发票';
    if (curData.completedQuantity <= 0) {
      notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceWorkbench.notification.error.status.batchExport', { tips })
          .d('存在未完成的发票，无法导出打印文件'),
      });
      return;
    }
    const params = {
      tenantId,
      companyCode: empInfo && empInfo.companyCode,
      employeeNumber: empInfo && empInfo.employeeNum,
      invoiceRequisitionHeaderIds: curData.headerId,
      printType,
    };
    // 导出打印(zip)
    if (type === 0) {
      this.exportInterface(params);
    } else {
      this.printInvoiceInterface(params);
    }
  }

  /**
   * 显示调整记录回调
   * @params {object} value-当前值
   * @params {object} oldValue-旧值
   */
  @Bind()
  handleShowAdjustChange(value, oldValue) {
    if (value !== oldValue) {
      this.reqLinesDS.setQueryParameter('showAdjustFlag', value || 'N');
      this.reqLinesDS.query();
    }
  }

  /**
   * 渲染头按钮
   */
  renderHeaderBts = () => {
    const { requestStatus, deleteFlag, invoiceType, sourceType } = this.state;
    return (
      <>
        <PermissionButton
          type="c7n-pro"
          // color={ButtonColor.dark}
          disabled={this.isCreatePage || !['N', 'Q'].includes(requestStatus) || deleteFlag === 'Y'}
          onClick={() => this.handleSubmitReq()}
          permissionList={[
            {
              code: `${permissionPath}.button.detail-submit`,
              type: 'button',
              meaning: '按钮-明细-审核(提交)',
            },
          ]}
        >
          {intl.get('hzero.common.button.submit').d('审核(提交)')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={!['N', 'Q'].includes(requestStatus) || deleteFlag === 'Y'}
          onClick={() => this.handleSaveReq(true)}
          permissionList={[
            {
              code: `${permissionPath}.button.detail-save-new`,
              type: 'button',
              meaning: '按钮-明细-保存(新建)',
            },
          ]}
        >
          {intl.get('hiop.invoiceWorkbench.button.saveCreate').d('保存(新建)')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={!['N', 'Q'].includes(requestStatus) || deleteFlag === 'Y'}
          onClick={() => this.handleSaveReq(false)}
          permissionList={[
            {
              code: `${permissionPath}.button.detail-save-continue`,
              type: 'button',
              meaning: '按钮-明细-保存(继续)',
            },
          ]}
        >
          {intl.get('hiop.invoiceWorkbench.button.saveContinue').d('保存(继续)')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={
            this.isCreatePage || deleteFlag === 'Y' || ['7', '8', '9', '10'].includes(sourceType)
          }
          onClick={() => this.handleCopyReq(true)}
          permissionList={[
            {
              code: `${permissionPath}.button.detail-req-order`,
              type: 'button',
              meaning: '按钮-明细-复制申请',
            },
          ]}
        >
          {intl.get('hiop.invoiceReq.button.copy.reqOrder').d('复制申请')}
        </PermissionButton>
        {requestStatus === 'E' && (
          <PermissionButton
            type="c7n-pro"
            disabled={
              this.isCreatePage || deleteFlag === 'Y' || ['7', '8', '9', '10'].includes(sourceType)
            }
            onClick={() => this.handleCopyReq(false)}
            permissionList={[
              {
                code: `${permissionPath}.button.detail-unissue`,
                type: 'button',
                meaning: '按钮-明细-复制未开',
              },
            ]}
          >
            {intl.get('hiop.invoiceReq.button.copy.unissue').d('复制未开')}
          </PermissionButton>
        )}
        <PermissionButton
          type="c7n-pro"
          disabled={!['C', 'F', 'E'].includes(requestStatus)}
          onClick={this.handleViewOrder}
          permissionList={[
            {
              code: `${permissionPath}.button.detail-view-order`,
              type: 'button',
              meaning: '按钮-明细-查看订单',
            },
          ]}
        >
          {intl.get('hiop.invoiceReq.button.viewOrder').d('查看订单')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={
            this.isCreatePage ||
            ['51', '52'].includes(invoiceType) ||
            ['N', 'Q'].includes(requestStatus)
          }
          onClick={() => this.handleExportPrintFiles(0, 'null')}
          permissionList={[
            {
              code: `${permissionPath}.button.detail-export-print`,
              type: 'button',
              meaning: '按钮-明细-导出打印文件',
            },
          ]}
        >
          {intl.get('hiop.invoiceWorkbench.button.export').d('导出打印文件')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={
            this.isCreatePage ||
            ['51', '52'].includes(invoiceType) ||
            ['N', 'Q'].includes(requestStatus)
          }
          onClick={() => this.handleExportPrintFiles(1, 'INVOICE')}
          permissionList={[
            {
              code: `${permissionPath}.button.detail-invoice-print`,
              type: 'button',
              meaning: '按钮-明细-打印发票',
            },
          ]}
        >
          {intl.get('hiop.invoiceWorkbench.button.invoicePrint').d('打印发票')}
        </PermissionButton>
      </>
    );
  };

  /**
   * 公司信息
   */
  get renderCompanyDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.companyName || ''}`;
    }
    return '';
  }

  /**
   * 员工信息
   */
  get renderEmployeeDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.employeeNum || ''}-${empInfo.employeeName ||
        ''}-${empInfo.mobile || ''}`;
    }
    return '';
  }

  /**
   * 行查询条
   */
  @Bind()
  renderQueryBar(props) {
    const { buttons } = props;
    return (
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ display: 'inline' }}>
          <b>{intl.get('hiop.invoiceWorkbench.title.commodityInfo').d('商品信息')}</b>
        </h3>
        {buttons}
      </div>
    );
  }

  render() {
    const { search } = this.props.location;
    const { companyId, headerId, billFlag } = this.props.match.params;
    const { invoiceType } = this.state;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    let pathname = '/htc-front-iop/invoice-req/list';
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      pathname = invoiceInfo.backPath;
    }
    const paperInvoice: JSX.Element[] = [
      <TextField name="paperRecipient" />,
      <TextField name="paperPhone" />,
      <TextField name="paperAddress" />,
    ];
    const electronicInvoice: JSX.Element[] = [
      <Select name="electronicType" />,
      <TextField name="emailPhone" colSpan={2} />,
    ];
    return (
      <>
        <Header
          backPath={pathname}
          title={intl.get('hiop.invoiceReq.title.billApply').d('开票申请单')}
          onBack={() =>
            closeTab(`/htc-front-iop/invoice-req/detail/${companyId}/${headerId}/${billFlag}`)
          }
        >
          {this.renderHeaderBts()}
        </Header>
        <div style={{ overflow: 'auto' }}>
          <Card style={{ marginTop: 10 }}>
            <div style={{ marginBottom: 20 }}>
              <h3>
                <b>{intl.get('hiop.invoiceReq.title.companyInfo').d('公司信息')}</b>
              </h3>
            </div>
            <Spin dataSet={this.reqHeaderDS}>
              <Form dataSet={this.reqHeaderDS} columns={4} labelTooltip={Tooltip.overflow}>
                <TextField
                  label={intl.get('htc.common.modal.companyName').d('所属公司')}
                  value={this.renderCompanyDesc}
                />
                <TextField name="taxpayerNumber" />
                <TextField
                  label={intl.get('htc.common.modal.employeeDesc').d('登录员工')}
                  value={this.renderEmployeeDesc}
                />
                <Lov
                  name="extNumberObj"
                  onChange={value => this.handleTaxRateLovChange('extNumber', value)}
                />
                {/*---*/}
                <Select name="receiptType" />
                <Lov name="invoiceTypeObj" onChange={value => this.invoiceVarietyChange(value)} />
                <Select name="billFlag" />
                <Lov name="requestTypeObj" />
                {/*---*/}
                <Select
                  name="receiptName"
                  searchable
                  searchMatcher="receiptName"
                  combo
                  checkValueOnOptionsChange={false}
                  onChange={(value, oldValue) => this.handleReceiptNameChange(value, oldValue)}
                  suffix={<Icon type="search" onClick={() => this.handleInvoiceQuery()} />}
                />
                <TextArea name="remark" colSpan={2} rows={1} resize={ResizeType.both} />
                <CheckBox name="nextDefaultFlag" />
                <TextField name="receiptTaxNo" />
                {['51', '52'].includes(invoiceType) ? electronicInvoice : paperInvoice}
                {/*----*/}
                <TextArea name="receiptAccount" rows={1} resize={ResizeType.both} newLine />
                <TextField name="applicantName" />
                <TextField name="creationDate" />
                <TextField name="requestNumber" />
                {/*---*/}
                <TextArea name="receiptAddressPhone" rows={1} resize={ResizeType.both} />
                <Select name="requestStatus" />
                <TextField name="reviewerName" />
                <TextField name="reviewDate" />
                {/*---*/}
                <TextField name="progress" />
                <Select name="sourceType" />
                <Lov name="systemCodeObj" />
                <Lov name="documentTypeCodeObj" />
                {/*----*/}
                <TextField name="sourceNumber" />
                <TextField name="sourceNumber1" />
                <TextField name="sourceNumber2" />
                <CheckBox name="showAdjustFlag" onChange={this.handleShowAdjustChange} />
              </Form>
              <Form
                columns={6}
                dataSet={this.reqHeaderDS}
                excludeUseColonTagList={['Radio']}
                className={styles.customTable}
                layout={FormLayout.none}
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
          </Card>
          <Card style={{ marginTop: 10 }}>
            <Table
              buttons={this.buttons}
              dataSet={this.reqLinesDS}
              columns={this.columns}
              style={{ height: 400 }}
              queryBar={this.renderQueryBar}
            />
          </Card>
        </div>
      </>
    );
  }
}
