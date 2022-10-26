import React, { createContext, useState } from 'react';

const InvoiceCategoryContext = createContext(null as any);
const { Provider } = InvoiceCategoryContext;

export function CategoryProvider(props) {
  const [invoiceCategory, setInvoiceCategory] = useState('01');
  const [immediatePeriod, setImmediatePeriod] = useState<object>();
  return (
    <Provider value={{ invoiceCategory, setInvoiceCategory, immediatePeriod, setImmediatePeriod }}>
      {props.children}
    </Provider>
  );
}

export default InvoiceCategoryContext;
