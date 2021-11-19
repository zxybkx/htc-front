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
import InvoiceDetailLinesDS from '@common/pages/invoice-common/invoice-detail/stores/InvoiceDetailLinesDS';
import InvoiceHeaderForm from '@common/pages/invoice-common/invoice-detail/detail/InvoiceHeaderForm';
import InvoiceHeaderTransferForm from '@common/pages/invoice-common/invoice-detail/detail/InvoiceHeaderTransferForm';
import InvoiceHeaderVehicleForm from '@common/pages/invoice-common/invoice-detail/detail/InvoiceHeaderVehicleForm';
import InvoiceLinesTable from '@common/pages/invoice-common/invoice-detail/detail/InvoiceLinesTable';
import InvoiceDetailHeaderDS from './stores/InvoiceDetailHeaderDS';

const modelCode = 'hcan.invoice-detail';
const { Panel } = Collapse;

interface InvoiceDetailPageProps {
  backPath: string;
  invoiceHeaderId: any;
  invoiceType: string;
  entryPoolSource: string;
  companyCode: string;
}

@formatterCollections({
  code: [modelCode],
})
export default class InvoiceDetailPage extends Component<InvoiceDetailPageProps> {
  // 行DS
  linesDS = new DataSet({
    ...InvoiceDetailLinesDS(),
  });

  // 明细DS
  detailDS = new DataSet({
    autoQuery: true,
    ...InvoiceDetailHeaderDS(this.props),
    children: {
      invoiceLinesInfoList: this.linesDS,
    },
  });

  render() {
    const vehicleFlag = ['02', '03', '15'].includes(this.props.invoiceType);
    return (
      <>
        <Header
          title={intl.get(`${modelCode}.title.detail`).d('查看全票面信息')}
          backPath={this.props.backPath}
        />
        <Content>
          <Spin dataSet={this.detailDS}>
            <Collapse
              bordered={false}
              defaultActiveKey={['HEADER', 'TRANSFER', 'VEHICLE', 'LINES']}
            >
              <Panel
                header={intl.get(`${modelCode}.title.invoiceHeader`).d('发票关键头信息')}
                key="HEADER"
              >
                <InvoiceHeaderForm dataSet={this.detailDS} />
              </Panel>
              {vehicleFlag && (
                <Panel
                  header={intl
                    .get(`${modelCode}.title.invoiceHeaderTransfer`)
                    .d('货物运输发票头信息')}
                  key="TRANSFER"
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
                >
                  <InvoiceHeaderVehicleForm dataSet={this.detailDS} />
                </Panel>
              )}
              <Panel
                header={intl.get(`${modelCode}.view.LinesTitle`).d('发票明细信息')}
                key="LINES"
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
