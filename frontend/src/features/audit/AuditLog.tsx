import { useState } from 'react';
import { useGetAuditLogsQuery } from './auditApi';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function AuditLog() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useGetAuditLogsQuery({ page, limit: 10 });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-slate-900">System Audit Log</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-medium">
              <tr>
                <th scope="col" className="px-6 py-4">Timestamp</th>
                <th scope="col" className="px-6 py-4">Actor</th>
                <th scope="col" className="px-6 py-4">Action</th>
                <th scope="col" className="px-6 py-4">Target Employee</th>
                <th scope="col" className="px-6 py-4">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading || isFetching ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading audit records...</td></tr>
              ) : isError ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-red-500">Error loading audit logs.</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No audit records found.</td></tr>
              ) : (
                data?.data.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{log.actorName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                      {log.reason && <p className="text-xs text-slate-500 mt-1">{log.reason}</p>}
                    </td>
                    <td className="px-6 py-4">{log.employeeName}</td>
                    <td className="px-6 py-4">
                      {log.previousSalary !== null && log.newSalary !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 line-through">{formatCurrency(log.previousSalary, log.previousCurrency || "USD")}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-medium text-green-600">{formatCurrency(log.newSalary, log.newCurrency || "USD")}</span>
                        </div>
                      ) : log.newSalary !== null ? (
                        <span className="font-medium text-green-600">Set to {formatCurrency(log.newSalary, log.newCurrency || "USD")}</span>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing page <span className="font-medium text-slate-900">{data.meta.page}</span> of <span className="font-medium text-slate-900">{data.meta.totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
