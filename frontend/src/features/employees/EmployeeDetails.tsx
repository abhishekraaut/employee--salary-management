import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetEmployeeByIdQuery } from './employeesApi';
import { useGetCompensationsQuery, useCreateCompensationMutation } from '../compensation/compensationApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowLeft, Plus, History } from 'lucide-react';

export function EmployeeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const { data: employee, isLoading, isError } = useGetEmployeeByIdQuery(id!);
  const { data: history, isLoading: historyLoading } = useGetCompensationsQuery(id!);
  
  if (isLoading) return <div className="p-6">Loading employee...</div>;
  if (isError || !employee) return <div className="p-6 text-red-500">Failed to load employee details.</div>;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/employees')}
        className="flex items-center text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Directory
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{employee.firstName} {employee.lastName}</h2>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="bg-slate-100 px-3 py-1 rounded-full">{employee.department}</span>
            <span className="bg-slate-100 px-3 py-1 rounded-full">{employee.country}</span>
            <span className="bg-slate-100 px-3 py-1 rounded-full">Hired {formatDate(employee.hireDate!)}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 font-medium">Current Salary</p>
          <p className="text-3xl font-bold text-blue-600">
            {employee.currentSalary ? formatCurrency(employee.currentSalary, employee.currency) : '-'}
          </p>
        </div>
      </div>

      {/* Compensation History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            Salary History
          </h3>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Update Salary
          </button>
        </div>
        
        <div className="p-6">
          {historyLoading ? (
            <p className="text-slate-500">Loading history...</p>
          ) : history?.data.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No compensation history available.</p>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
              {history?.data.map((comp, idx) => (
                <div key={comp.id} className="relative pl-6">
                  <span className={`absolute -left-2 top-1.5 w-4 h-4 rounded-full border-2 border-white ${idx === 0 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{formatCurrency(comp.amount, comp.currency)}</p>
                      <p className="text-sm text-slate-500">{comp.reason || 'Salary Adjustment'}</p>
                    </div>
                    <div className="text-sm text-slate-500 mt-1 sm:mt-0">
                      Effective {formatDate(comp.effectiveDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && <UpdateSalaryModal employeeId={id!} defaultCurrency={employee.currency || 'USD'} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function UpdateSalaryModal({ employeeId, defaultCurrency, onClose }: { employeeId: string, defaultCurrency: string, onClose: () => void }) {
  const [updateSalary, { isLoading, error }] = useCreateCompensationMutation();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSalary({
        employeeId,
        amount: Number(amount),
        currency,
        effectiveDate,
        reason: reason || undefined
      }).unwrap();
      onClose();
    } catch (err) {
      // Error is handled by UI
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title" className="text-xl font-semibold text-slate-900 mb-4">Update Salary</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Amount</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                $
              </span>
              <input
                type="number"
                id="amount"
                required
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 block w-full px-3 py-2 border border-slate-300 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-700">Currency</label>
              <select
                id="currency"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 border border-slate-300 bg-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
            <div>
              <label htmlFor="effectiveDate" className="block text-sm font-medium text-slate-700">Effective Date</label>
              <input
                type="date"
                id="effectiveDate"
                required
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Reason (Optional)</label>
            <input
              type="text"
              id="reason"
              placeholder="e.g. Annual Promotion"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {error ? (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md">
              {String((error as any)?.data?.error || 'Failed to update salary')}
            </div>
          ) : null}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
