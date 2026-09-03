import { useState, useMemo } from 'react';
import { useGetCompensationSummaryQuery } from './analyticsApi';
import { formatCurrency } from '../../utils/formatters';

export function Analytics() {
  const { data: deptData, isLoading, isError } = useGetCompensationSummaryQuery('department');

  if (isLoading) return <div className="p-4 text-slate-500">Loading analytics...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading analytics.</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Department Compensation Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-medium">
              <tr>
                <th scope="col" className="px-6 py-4">Department</th>
                <th scope="col" className="px-6 py-4">Headcount</th>
                <th scope="col" className="px-6 py-4">Average Salary</th>
                <th scope="col" className="px-6 py-4">Total Payroll</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {deptData?.data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.group}</td>
                  <td className="px-6 py-4">{row.headcount.toLocaleString()}</td>
                  <td className="px-6 py-4">{formatCurrency(row.averageSalary, row.currency)}</td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(row.totalPayroll, row.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
