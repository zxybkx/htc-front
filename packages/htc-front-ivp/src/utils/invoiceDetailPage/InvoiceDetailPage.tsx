/*
 * @Description:全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-07-28 15:03:23
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import intl from 'utils/intl';
import notification from 'utils/notification';
import InvoiceDetailLinesDS from '@htccommon/pages/invoice-common/invoice-detail/stores/InvoiceDetailLinesDS';
import InvoiceHeaderForm from '@htccommon/pages/invoice-common/invoice-detail/detail/InvoiceHeaderForm';
import InvoiceHeaderTransferForm from '@htccommon/pages/invoice-common/invoice-detail/detail/InvoiceHeaderTransferForm';
import InvoiceHeaderVehicleForm from '@htccommon/pages/invoice-common/invoice-detail/detail/InvoiceHeaderVehicleForm';
import InvoiceLinesTable from '@htccommon/pages/invoice-common/invoice-detail/detail/InvoiceLinesTable';
import InvoiceDetailHeaderDS from './stores/InvoiceDetailHeaderDS';
import InvoiceChildSwitchPage from '../invoiceChildSwitch/invoiceChildSwitchPage';

const modelCode = 'hcan.invoiceDetail';
const { Panel } = Collapse;

interface InvoiceDetailPageProps {
  backPath: string;
  invoiceHeaderId: any;
  invoiceType: string;
  entryPoolSource: string;
  companyCode: string;
}

@formatterCollections({
  code: [modelCode, 'hivp.bill', 'htc.common'],
})
export default class InvoiceDetailPage extends Component<InvoiceDetailPageProps> {
  // 行DS
  linesDS = new DataSet({
    ...InvoiceDetailLinesDS(),
  });

  // 明细DS
  detailDS = new DataSet({
    autoQuery: false,
    ...InvoiceDetailHeaderDS(this.props),
    children: {
      invoiceLinesInfoList: this.linesDS,
    },
  });

  componentDidMount(): void {
    const { invoiceHeaderId } = this.props;
    if (invoiceHeaderId === 'undefined' || !invoiceHeaderId) {
      notification.info({
        description: '',
        message: intl.get(`${modelCode}.view.checkDetailMessage`).d('此发票未查验，无全票面信息'),
      });
    } else {
      this.detailDS.query();
    }
  }

  render() {
    const vehicleFlag = ['02', '03', '15'].includes(this.props.invoiceType);
    const customPanelStyle = {
      background: '#fff',
      overflow: 'hidden',
      borderBottom: '8px solid #F6F6F6',
    };
    return (
      <>
        <Header
          title={intl.get(`hcan.invoiceDetail.title.detail`).d('查看全票面信息')}
          backPath={this.props.backPath}
        />
        <Content style={{ background: '#F6F6F6' }}>
          <Spin dataSet={this.detailDS}>
            <Collapse
              bordered={false}
              defaultActiveKey={['HEADER', 'TRANSFER', 'VEHICLE', 'LINES']}
            >
              <Panel
                header={intl.get(`${modelCode}.title.invoiceHeader`).d('发票关键头信息')}
                key="HEADER"
                style={customPanelStyle}
              >
                <InvoiceHeaderForm dataSet={this.detailDS} />
              </Panel>
              {vehicleFlag && (
                <Panel
                  header={intl
                    .get(`${modelCode}.title.invoiceHeaderTransfer`)
                    .d('货物运输发票头信息')}
                  key="TRANSFER"
                  style={customPanelStyle}
                >
                  <InvoiceHeaderTransferForm dataSet={this.detailDS} />
                </Panel>
              )}
              {vehicleFlag && (
                <Panel
                  header={intl
                    .get(`${modelCode}.title.invoiceHeaderVehicle`)
                    .d('机动车、二手车发票头信息')}
                  key="VEHICLE"
                  style={customPanelStyle}
                >
                  <InvoiceHeaderVehicleForm dataSet={this.detailDS} />
                </Panel>
              )}
              <Panel
                header={intl.get(`${modelCode}.view.linesTitle`).d('发票明细信息')}
                key="LINES"
                style={customPanelStyle}
              >
                <InvoiceLinesTable dataSet={this.linesDS} />
              </Panel>
            </Collapse>
          </Spin>
          <InvoiceChildSwitchPage type={0} />
        </Content>
      </>
    );
  }
}
