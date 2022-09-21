import React, { createContext, useState } from 'react';

const InvoiceCategoryContext = createContext(null as any);
const { Provider } = InvoiceCategoryContext;

export function CategoryProvider(props) {
  const [invoiceCategory, setInvoiceCategory] = useState('01');
  return <Provider value={{ invoiceCategory, setInvoiceCategory }}>{props.children}</Provider>;
}

export default InvoiceCategoryContext;
