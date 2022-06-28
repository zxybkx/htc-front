/**
 * @Description:全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-07-28 15:03:23
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import intl from 'utils/intl';
import InvoiceDetailHeaderDS from '../stores/InvoiceDetailHeaderDS';
import InvoiceDetailLinesDS from '../stores/InvoiceDetailLinesDS';
import InvoiceHeaderForm from './InvoiceHeaderForm';
import InvoiceHeaderTransferForm from './InvoiceHeaderTransferForm';
import InvoiceHeaderVehicleForm from './InvoiceHeaderVehicleForm';
import InvoiceLinesTable from './InvoiceLinesTable';

const modelCode = 'hcan.invoiceDetail';
const { Panel } = Collapse;

interface InvoiceDetailPageProps {
  backPath: string;
  invoiceHeaderId: any;
  invoiceType: string;
}

@formatterCollections({
  code: [modelCode, 'htc.common', 'hivp.bill'],
})
export default class InvoiceDetailPage extends Component<InvoiceDetailPageProps> {
  // 行DS
  linesDS = new DataSet({
    ...InvoiceDetailLinesDS(),
  });

  // 明细DS
  detailDS = new DataSet({
    autoQuery: true,
    ...InvoiceDetailHeaderDS(this.props.invoiceHeaderId),
    children: {
      invoiceLinesInfoList: this.linesDS,
    },
  });

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
          title={intl.get(`${modelCode}.title.detail`).d('查看全票面信息')}
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
        </Content>
      </>
    );
  }
}
