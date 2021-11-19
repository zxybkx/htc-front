/**
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-03-08 17:46:52
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  DataSet,
  Button,
  Form,
  TextField,
  Select,
  CheckBox,
  Output,
  Radio,
  Table,
  notification,
  Modal,
  Lov,
  Spin,
  TextArea,
  // Currency,
} from 'choerodon-ui/pro';
import { Icon, Dropdown, Menu } from 'choerodon-ui';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import { forEach, isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import queryString from 'query-string';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import moment from 'moment';
import InvoiceQueryTable from '@src/utils/invoice-query/InvoiceQueryTable';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import {
  reqCopy,
  reqSubmit,
  batchSave,
  getRuleDefaultValue,
  exportPrintFiles,
  exportNotZip,
} from '@src/services/invoiceReqService';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu, base64toBlob } from '@common/utils/utils';
import InvoiceReqDetailDS from '../stores/InvoiceReqDetailDS';
import InvoiceReqLinesDS from '../stores/InvoiceReqLinesDS';

const modelCode = 'hiop.invoice-req-detail';
const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

interface RouterInfo {
  companyId: any;
  headerId: any;
  sourceType: any;
}

interface InvoiceReqDetailPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@connect()
@formatterCollections({
  code: [modelCode],
})
export default class InvoiceReqDetailPage extends Component<InvoiceReqDetailPageProps> {
  state = {
    requestStatus: '',
    deleteFlag: 'N',
    empInfo: {} as any,
    invoiceType: '',
    sourceType: '',
  };

  // receiptNameDS = new DataSet({
  //   autoQuery: false,
  //   ...ReceiptNameDS(this.props.match.params.companyId),
  // });

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

  @Bind()
  async handleQueryNewReq(newFlag: boolean) {
    const empRes = await getCurrentEmployeeInfo({
      tenantId,
      companyId: this.props.match.params.companyId,
    });
    const { sourceType } = this.props.match.params;
    const empInfo = empRes && empRes.content[0];
    if (!newFlag) {
      const showAdjustFlag = this.reqHeaderDS.current?.get('showAdjustFlag') || 'N';
      this.reqLinesDS.setQueryParameter('showAdjustFlag', showAdjustFlag);
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
          requestType: defaultValueRes && defaultValueRes.businessTypeCode,
          requestTypeMeaning: defaultValueRes && defaultValueRes.businessTypeMeaning,
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
   * newFlag: 是否再次新建
   */
  @Bind()
  async handleSaveReq(newFlag: boolean) {
    if (
      this.reqHeaderDS.current!.get('electronicType') === '1' ||
      this.reqHeaderDS.current!.get('invoiceTypeTag') === 'E'
    ) {
      this.reqHeaderDS.current!.getField('emailPhone')!.set('required', true);
    }
    if (
      this.reqHeaderDS.current!.get('requestType') === 'SALES_INVOICE_SUBSCRIBE' ||
      this.reqHeaderDS.current!.get('requestType') === 'PURCHASE_INVOICE_SUBSCRIBE'
    ) {
      if (
        this.reqHeaderDS.current!.get('invoiceType') === '51' ||
        this.reqHeaderDS.current!.get('invoiceType') === '52'
      ) {
        this.reqHeaderDS.current!.getField('emailPhone')!.set('required', false);
      }
    }
    const res = await this.reqHeaderDS.submit();
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.noChange').d('请先修改数据'),
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
        this.props.dispatch(
          routerRedux.push({
            pathname,
          })
        );
      } else {
        const pathname = `/htc-front-iop/invoice-req/detail/${res.content[0].companyId}/${res.content[0].headerId}`;
        this.props.dispatch(
          routerRedux.push({
            pathname,
          })
        );
      }
    }
  }

  /**
   * 复制申请
   * reqFlag true-申请单 false-未开具
   */
  @Bind()
  async handleCopyReq(reqFlag) {
    const submitRes = await this.reqHeaderDS.submit();
    if (submitRes === false) return;
    const { empInfo } = this.state;
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
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
      });
      const pathname = `/htc-front-iop/invoice-req/detail/${res.companyId}/${res.headerId}`;
      this.props.dispatch(
        routerRedux.push({
          pathname,
        })
      );
    }
  }

  // 提交
  @Bind()
  async handleSubmitReq() {
    if (
      this.reqHeaderDS.current!.get('electronicType') === '1' ||
      this.reqHeaderDS.current!.get('invoiceTypeTag') === 'E'
    ) {
      this.reqHeaderDS.current!.getField('emailPhone')!.set('required', true);
    }
    const { empInfo } = this.state;
    const headerData = this.reqHeaderDS.current!.toData(true);
    // const updateLine = filter(this.reqLinesDS, (record) => record && record.get('__dirty'));
    // let lineData: any = [];
    // if (updateLine) {
    //   lineData = updateLine.map((record) => {
    //     const item = {
    //       ...record.toData(true),
    //       _status: 'update',
    //     };
    //     return item;
    //   });
    // }
    const lineData: any = [];
    this.reqLinesDS.forEach((record) => {
      if (record && record.dirty) {
        const item = {
          ...record.toData(true),
          _status: 'update',
        };
        lineData.push(item);
      }
    });
    const pageData = {
      ...headerData,
      _status: 'update',
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
          message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
        });
        this.handleQueryNewReq(false);
      }
    } else {
      notification.success({
        description: '',
        message: saveRes.message,
      });
    }
  }

  // 收票方模糊查询赋值
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

  // 开票信息查询
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
      title: intl.get(`${modelCode}.invoiceQuery.title`).d('开票信息查询'),
      destroyOnClose: true,
      closable: true,
      footer: null,
      style: { width: '50%' },
      children: <InvoiceQueryTable {...invoiceQueryProps} onCloseModal={() => modal.close()} />,
    });
  }

  // 查看订单
  @Bind()
  handleViewOrder() {
    const { dispatch, location } = this.props;
    const { headerId } = this.props.match.params;
    const pathname = `/htc-front-iop/invoice-req/order/${headerId}`;
    // openTab({
    //   key: pathname,
    //   path: pathname,
    //   title: intl.get(`${modelCode}.invoiceReq.order.title`).d('开票订单信息'),
    //   closable: true,
    //   type: 'menu',
    // });
    dispatch(
      routerRedux.push({
        pathname,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: location && `${location.pathname}${location.search}`,
            })
          ),
        }),
      })
    );
  }

  // 行税率受控于头
  @Bind()
  handleTaxRateLovChange(field, value) {
    if (this.reqLinesDS.length > 0) {
      this.reqLinesDS.forEach((line) => line.set(field, value.value));
    }
    this.setState({ invoiceType: value.value });
  }

  /**
   * 新增行
   * @returns
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
          message: intl.get(`${modelCode}.view.newHeader`).d('请先完善头数据'),
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
        message: intl.get(`${modelCode}.view.newHeader`).d('请先新增头数据'),
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
        disabled={
          !(
            ['N', 'Q'].includes(requestStatus) &&
            deleteFlag === 'N' &&
            sourceType !== '8' &&
            urlSourceType !== 'TOBE'
          )
        }
      >
        {intl.get('hzero.common.button.add ').d('新增')}
      </Button>,
    ];
  }

  // 删除行——状态修改
  @Bind()
  async handleDeleteLines(record) {
    if (record.get('lineId')) {
      Modal.confirm({
        title: intl.get(`${modelCode}.view.deleteTitle`).d('是否确认删除'),
        onOk: () => {
          record.validate().then(() => {
            record.set('adjustFlag', 'D');
            this.reqLinesDS.submit().then(() => this.reqLinesDS.query());
          });
        },
      });
    } else {
      this.reqLinesDS.delete(record);
    }
  }

  // 税率选项过滤
  taxRateOptions = (record) => {
    const companyType = this.reqHeaderDS.current?.get('companyType');
    if (companyType === '1') {
      return record.get('tag') === companyType;
    }
    return true;
  };

  get columns(): ColumnProps[] {
    const { sourceType: urlSourceType } = this.props.match.params;
    const { requestStatus, deleteFlag, sourceType } = this.state;
    // 删除行不可修改/【来源类型】=“发票作废”不允许修改/从待开票跳转过来不可改
    const adjustEditAble = (record) =>
      ['N', 'Q'].includes(requestStatus) &&
      deleteFlag === 'N' &&
      !['Y', 'D'].includes(record.get('adjustFlag')) &&
      sourceType !== '8' &&
      urlSourceType !== 'TOBE';
    return [
      { name: 'lineNum' },
      { name: 'projectNumberObj', editor: (record) => adjustEditAble(record), width: 150 },
      { name: 'commodityNumberObj', editor: (record) => adjustEditAble(record), width: 150 },
      { name: 'commodityShortName' },
      {
        name: 'issues',
        editor: (record) =>
          adjustEditAble(record) && (
            <TextField name="issues" onChange={() => record.set({ projectNumberObj: '' })} />
          ),
        width: 300,
      },
      { name: 'projectName', width: 300 },
      { name: 'specificationModel', editor: (record) => adjustEditAble(record), width: 150 },
      { name: 'unit', editor: (record) => adjustEditAble(record) },
      {
        name: 'quantity',
        editor: (record) => adjustEditAble(record),
        width: 150,
        renderer: ({ value }) => <span>{value}</span>,
      },
      {
        name: 'price',
        editor: (record) => adjustEditAble(record),
        width: 150,
        align: ColumnAlign.right,
      },
      {
        name: 'amount',
        editor: (record) =>
          adjustEditAble(record) && !(record.get('quantity') && record.get('price')),
        width: 150,
        align: ColumnAlign.right,
      },
      {
        name: 'discountAmount',
        editor: (record) => adjustEditAble(record),
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'taxIncludedFlag', editor: (record) => adjustEditAble(record), width: 130 },
      {
        name: 'taxRateObj',
        editor: (record) => adjustEditAble(record) && <Lov name="taxRateObj" noCache />,
        width: 120,
        align: ColumnAlign.right,
      },
      {
        name: 'zeroTaxRateFlag',
        editor: (record) =>
          adjustEditAble(record) && record.get('taxRate') && Number(record.get('taxRate')) === 0,
        width: 150,
      },
      { name: 'taxAmount', width: 150, align: ColumnAlign.right },
      {
        name: 'deductionAmount',
        editor: (record) => adjustEditAble(record),
        width: 150,
        align: ColumnAlign.right,
      },
      { name: 'preferentialPolicyFlag' },
      { name: 'sourceLineNum' },
      { name: 'sourceNumber3', width: 120 },
      { name: 'sourceNumber4', width: 120 },
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
              onClick={() => this.handleDeleteLines(record)}
              disabled={!adjustEditAble(record)}
            >
              {intl.get(`${modelCode}.button.delete`).d('删除')}
            </Button>,
          ];
        },
        lock: ColumnLock.left,
        align: ColumnAlign.center,
      },
    ];
  }

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
            message: intl.get(`${modelCode}.view.ieUploadInfo`).d('下载失败'),
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

  // 导出打印文件
  @Bind()
  async handleExportPrintFiles(type) {
    const { empInfo } = this.state;
    const curData = this.reqHeaderDS.current!.toData();
    if (!(curData.completedQuantity > 0)) {
      notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.incompatible`).d('存在未完成的发票，无法导出打印文件'),
      });
      return;
    }
    const params = {
      tenantId,
      companyCode: empInfo && empInfo.companyCode,
      employeeNumber: empInfo && empInfo.employeeNum,
      invoiceRequisitionHeaderIds: curData.headerId,
    };
    // 导出打印(zip)
    if (type === 0) {
      const res = await exportPrintFiles(params);
      if (res && res.status === '1000') {
        const { data } = res;
        if (isEmpty(data.skipList)) {
          // 导出打印
          this.printZip(data.invoiceTypeMap);
        } else {
          Modal.confirm({
            children: `您本次选择的发票${data.skipList.join('、')}存在断号，是否批量导出打印？`,
          }).then((button) => {
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
    } else {
      const res = getResponse(await exportNotZip(params));
      if (res) {
        res.forEach((item) => {
          const blob = new Blob([base64toBlob(item.data)]);
          if (window.navigator.msSaveBlob) {
            try {
              window.navigator.msSaveBlob(blob, item.fileName);
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
  }

  @Bind()
  handleShowAdjustChange(value, oldValue) {
    if (value !== oldValue) {
      this.reqLinesDS.setQueryParameter('showAdjustFlag', value || 'N');
      this.reqLinesDS.query();
    }
  }

  renderHeaderBts = () => {
    const { requestStatus, deleteFlag, invoiceType, sourceType } = this.state;
    const menu = (
      <Menu>
        <Menu.Item key="reqOrder">
          <a onClick={() => this.handleCopyReq(true)}>
            {intl.get(`${modelCode}.button.copy.reqOrder`).d('申请单')}
          </a>
        </Menu.Item>
        {requestStatus === 'E' && (
          <Menu.Item key="unIssue">
            <a onClick={() => this.handleCopyReq(false)}>
              {intl.get(`${modelCode}.button.copy.unIssue`).d('未开具')}
            </a>
          </Menu.Item>
        )}
      </Menu>
    );
    return (
      <>
        <PermissionButton
          type="c7n-pro"
          color={ButtonColor.dark}
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
          {intl.get(`${modelCode}.button.submit`).d('审核(提交)')}
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
          {intl.get(`${modelCode}.button.saveNew`).d('保存(新建)')}
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
          {intl.get(`${modelCode}.button.saveContinue`).d('保存(继续)')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={
            this.isCreatePage || deleteFlag === 'Y' || ['7', '8', '9', '10'].includes(sourceType)
          }
          permissionList={[
            {
              code: `${permissionPath}.button.detail-copy`,
              type: 'button',
              meaning: '按钮-明细-复制申请',
            },
          ]}
        >
          <Dropdown
            disabled={
              this.isCreatePage || deleteFlag === 'Y' || ['7', '8', '9', '10'].includes(sourceType)
            }
            overlay={menu}
            trigger={['click']}
          >
            <span>
              {intl.get(`${modelCode}.button.copy`).d('复制申请')}
              <Icon type="arrow_drop_down" />
            </span>
          </Dropdown>
        </PermissionButton>
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
          {intl.get(`${modelCode}.button.viewOrder`).d('查看订单')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={
            this.isCreatePage ||
            ['51', '52'].includes(invoiceType) ||
            ['N', 'Q'].includes(requestStatus)
          }
          onClick={() => this.handleExportPrintFiles(0)}
          permissionList={[
            {
              code: `${permissionPath}.button.detail-export-print`,
              type: 'button',
              meaning: '按钮-明细-导出打印文件',
            },
          ]}
        >
          {intl.get(`${modelCode}.button.exportPrint`).d('导出打印文件')}
        </PermissionButton>
        <PermissionButton
          type="c7n-pro"
          disabled={
            this.isCreatePage ||
            ['51', '52'].includes(invoiceType) ||
            ['N', 'Q'].includes(requestStatus)
          }
          onClick={() => this.handleExportPrintFiles(1)}
          permissionList={[
            {
              code: `${permissionPath}.button.detail-invoice-print`,
              type: 'button',
              meaning: '按钮-明细-打印发票',
            },
          ]}
        >
          {intl.get(`${modelCode}.button.exportPrint`).d('打印发票')}
        </PermissionButton>
      </>
    );
  };

  get renderCompanyDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.companyName || ''}`;
    }
    return '';
  }

  get renderEmployeeDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.employeeNum || ''}-${
        empInfo.employeeName || ''
      }-${empInfo.mobile || ''}`;
    }
    return '';
  }

  render() {
    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    let pathname = '/htc-front-iop/invoice-req/list';
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      pathname = invoiceInfo.backPath;
    }
    return (
      <PageHeaderWrapper
        title={intl.get(`${modelCode}.title`).d('开票申请单')}
        header={this.renderHeaderBts()}
        headerProps={{ backPath: pathname }}
      >
        <Spin dataSet={this.reqHeaderDS}>
          <Form dataSet={this.reqHeaderDS} columns={4}>
            <Output
              label={intl.get(`${modelCode}.view.companyDesc`).d('所属公司')}
              value={this.renderCompanyDesc}
            />
            <Output
              label={intl.get(`${modelCode}.view.employeeDesc`).d('登录员工')}
              value={this.renderEmployeeDesc}
            />
            <Output name="taxpayerNumber" />
            <Lov name="requestTypeObj" />
          </Form>
          <Form
            dataSet={this.reqHeaderDS}
            columns={12}
            excludeUseColonTagList={['Radio', 'Output']}
          >
            <Select
              name="receiptName"
              colSpan={4}
              searchable
              searchMatcher="receiptName"
              combo
              checkValueOnOptionsChange={false}
              onChange={(value, oldValue) => this.handleReceiptNameChange(value, oldValue)}
              suffix={<Icon type="search" onClick={() => this.handleInvoiceQuery()} />}
            />
            <Lov
              name="invoiceTypeObj"
              colSpan={2}
              onChange={(value) => this.handleTaxRateLovChange('invoiceType', value)}
            />
            <Select name="billFlag" colSpan={2} />
            <TextField name="creationDate" colSpan={2} />
            <TextField name="reviewDate" colSpan={2} />
            {/*----*/}
            <TextField name="receiptTaxNo" colSpan={4} newLine />
            <Select name="receiptType" colSpan={2} />
            <Lov
              name="extNumberObj"
              colSpan={2}
              onChange={(value) => this.handleTaxRateLovChange('extNumber', value)}
            />
            <TextArea name="remark" colSpan={4} rows={1} resize={ResizeType.both} />
            {/*----*/}
            <TextField name="receiptAddressPhone" colSpan={6} />
            <TextField name="progress" colSpan={4} />
            <CheckBox name="showAdjustFlag" colSpan={2} onChange={this.handleShowAdjustChange} />
            {/*----*/}
            <TextField name="receiptAccount" colSpan={4} />
            <TextField name="applicantName" colSpan={2} />
            <TextField name="reviewerName" colSpan={2} />
            <Select name="sourceType" colSpan={2} />
            <Select name="requestStatus" colSpan={2} />
            {/*----*/}
            <TextField name="paperRecipient" colSpan={4} labelWidth={50} />
            <TextField name="paperPhone" colSpan={2} />
            <TextField name="sourceNumber" colSpan={3} />
            <TextField name="requestNumber" colSpan={3} />
            {/*----*/}
            <TextField name="paperAddress" colSpan={4} />
            <CheckBox name="nextDefaultFlag" colSpan={2} />
            <TextField name="sourceNumber1" colSpan={3} />
            <TextField name="sourceNumber2" colSpan={3} />
            {/*----*/}
            <Select name="electronicType" colSpan={2} />
            <TextField name="emailPhone" colSpan={4} />
            <Radio name="billingType" colSpan={2} value="1" style={{ color: 'blue' }}>
              蓝字发票
            </Radio>
            <TextField
              name="blueInvoiceCode"
              colSpan={2}
              label={<span style={{ color: 'blue' }}>发票代码</span>}
            />
            <TextField
              name="blueInvoiceNo"
              colSpan={2}
              label={<span style={{ color: 'blue' }}>发票号码</span>}
            />
            {/*----*/}
            <TextField name="reservationCode" colSpan={6} newLine />
            <Radio name="billingType" colSpan={2} value="2" style={{ color: 'red' }}>
              红字发票
            </Radio>
            <TextField
              name="invoiceCode"
              colSpan={2}
              label={<span style={{ color: 'red' }}>发票代码</span>}
            />
            <TextField
              name="invoiceNo"
              colSpan={2}
              label={<span style={{ color: 'red' }}>发票号码</span>}
            />
          </Form>
        </Spin>
        <Table
          buttons={this.buttons}
          dataSet={this.reqLinesDS}
          columns={this.columns}
          style={{ height: 200 }}
        />
      </PageHeaderWrapper>
    );
  }
}
