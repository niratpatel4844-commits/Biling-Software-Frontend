import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CrudPage from './CrudPage';
import { purchasesAPI, vendorsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function VendorPaymentsPage() {
  const location = useLocation();
  const [vendors, setVendors] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    vendorsAPI.list({page_size: 1000}).then(res => setVendors(res.data?.items || res.data || []));
    purchasesAPI.list('purchase_bill').then(res => setBills(res.data || []));
  }, []);

  const columns = [
    { key: 'payment_number', label: 'Payment No' },
    { key: 'payment_date', label: 'Date', render: (val) => new Date(val || new Date()).toLocaleDateString() },
    { key: 'vendor_id', label: 'Vendor', render: (val) => {
        const v = vendors.find(x => x.id === val);
        return v ? v.name : val;
    }},
    { key: 'purchase_bill_id', label: 'Bill No', render: (val) => {
        const bill = bills.find(x => x.id === val);
        return bill ? bill.po_number : (val || '-');
    }},
    { key: 'payment_method', label: 'Method' },
    { key: 'reference_number', label: 'Reference' },
    { key: 'amount', label: 'Amount', render: (val) => <span style={{ fontWeight: 600, color: 'var(--success)' }}>₹{Number(val).toLocaleString()}</span> },
  ];

  const formFields = [
    { key: 'vendor_id', label: 'Vendor', type: 'select', options: vendors.map(v => ({ label: v.name, value: v.id })) },
    { 
      key: 'purchase_bill_id', 
      label: 'Purchase Bill (Optional)', 
      type: 'select', 
      options: (form) => [
        { label: 'No Bill / Advance', value: '' },
        ...bills.filter(b => b.payment_status !== 'paid' && (!form.vendor_id || String(b.vendor_id) === String(form.vendor_id))).map(b => ({ label: `${b.po_number} (Due: ₹${b.total_amount - (b.paid_amount || 0)})`, value: b.id }))
      ],
      onChange: (val, form) => {
        if (!val) { form.amount = ''; return form; }
        const bill = bills.find(b => String(b.id) === String(val));
        if (bill) form.amount = bill.total_amount - (bill.paid_amount || 0);
        return form;
      }
    },
    { key: 'amount', label: 'Amount (₹)', type: 'number' },
    { key: 'payment_method', label: 'Payment Method', type: 'select', options: [
      { label: 'Cash', value: 'Cash' },
      { label: 'UPI', value: 'UPI' },
      { label: 'Bank Transfer', value: 'Bank Transfer' },
      { label: 'Card', value: 'Card' },
      { label: 'Cheque', value: 'Cheque' }
    ]},
    { key: 'reference_number', label: 'Transaction Reference' },
    { key: 'notes', label: 'Notes' },
  ];

  const paymentsCrudAPI = {
    list: async () => {
      const res = await purchasesAPI.listPayments();
      return { data: res.data };
    },
    create: async (data) => {
      return purchasesAPI.makePayment(data);
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
    vendor_id: state.vendorId,
    purchase_bill_id: state.billId,
    amount: state.amount || '',
    payment_method: 'Bank Transfer'
  } : null;

  return (
    <CrudPage 
      title="Vendor Payments" 
      subtitle="Record and manage outgoing payments to vendors"
      breadcrumb="Home / Purchases / Payments" 
      apiService={paymentsCrudAPI}
      columns={columns} 
      formFields={formFields} 
      addLabel="Record Payment" 
      initialOpen={state.autoOpen}
      initialForm={initialForm}
    />
  );
}
