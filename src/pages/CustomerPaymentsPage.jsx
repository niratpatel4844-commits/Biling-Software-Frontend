import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CrudPage from './CrudPage';
import { salesAPI, customersAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function CustomerPaymentsPage() {
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    customersAPI.list().then(res => setCustomers(res.data?.items || res.data || []));
    salesAPI.list('invoice').then(res => setInvoices(res.data || []));
  }, []);

  const columns = [
    { key: 'receipt_number', label: 'Receipt No' },
    { key: 'payment_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'customer_id', label: 'Customer', render: (val) => {
        const c = customers.find(x => x.id === val);
        return c ? c.name : val;
    }},
    { key: 'invoice_id', label: 'Invoice No', render: (val) => {
        const inv = invoices.find(x => x.id === val);
        return inv ? inv.invoice_number : (val || '-');
    }},
    { key: 'payment_method', label: 'Method' },
    { key: 'reference_number', label: 'Reference' },
    { key: 'amount', label: 'Amount', render: (val) => <span style={{ fontWeight: 600, color: 'var(--success)' }}>₹{Number(val).toLocaleString()}</span> },
  ];

  const formFields = [
    { key: 'customer_id', label: 'Customer', type: 'select', options: customers.map(c => ({ label: c.name, value: c.id })) },
    { 
      key: 'invoice_id', 
      label: 'Invoice', 
      type: 'select', 
      options: (form) => invoices.filter(i => !form.customer_id || String(i.customer_id) === String(form.customer_id)).map(i => ({ label: `${i.invoice_number} (Due: ₹${i.due_amount})`, value: i.id })),
      onChange: (val, form) => {
        const inv = invoices.find(i => String(i.id) === String(val));
        if (inv) {
          form.amount = inv.due_amount;
        } else {
          form.amount = '';
        }
        return form;
      }
    },
    { key: 'amount', label: 'Amount (₹)', type: 'number' },
    { key: 'payment_method', label: 'Payment Method', type: 'select', options: [
      { label: 'Cash', value: 'Cash' },
      { label: 'UPI', value: 'UPI' },
      { label: 'Card', value: 'Card' },
      { label: 'Bank Transfer', value: 'Bank Transfer' },
      { label: 'Cheque', value: 'Cheque' }
    ]},
    { key: 'reference_number', label: 'Transaction Reference' },
    { key: 'notes', label: 'Notes' },
  ];

  // We need to implement a custom API wrapper for CustomerPayments because the API endpoint is different
  const paymentsCrudAPI = {
    list: async () => {
      const res = await salesAPI.listPayments();
      return { data: res.data };
    },
    create: async (data) => {
      return salesAPI.receivePayment(data);
    },
    update: async () => {
      throw { response: { data: { detail: 'Payments cannot be edited once recorded.' } } };
    },
    delete: async () => {
      throw { response: { data: { detail: 'Payments cannot be deleted once recorded.' } } };
    }
  };

  const state = location.state || {};
  const initialForm = state.autoOpen ? {
    customer_id: state.customerId,
    invoice_id: state.invoiceId,
    amount: state.amount || '',
    payment_method: 'Bank Transfer'
  } : null;

  return (
    <CrudPage 
      title="Customer Payments" 
      subtitle="Record and manage received payments from customers"
      breadcrumb="Home / Operations / Sales / Customer Payments" 
      apiService={paymentsCrudAPI}
      columns={columns} 
      formFields={formFields} 
      addLabel="Record Payment" 
      initialOpen={state.autoOpen}
      initialForm={initialForm}
    />
  );
}
