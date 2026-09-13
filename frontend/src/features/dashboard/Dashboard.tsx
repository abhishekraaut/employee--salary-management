import { useMemo } from 'react';
import { useGetCompensationSummaryQuery } from '../analytics/analyticsApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Dashboard() {
  const { data: deptData, isLoading: isLoadingDept, error: deptError } = useGetCompensationSummaryQuery('department');
  const { data: countryData, isLoading: isLoadingCountry, error: countryError } = useGetCompensationSummaryQuery('country');

  const totalHeadcount = useMemo(() => {
    return deptData?.data.reduce((acc, curr) => acc + curr.headcount, 0) || 0;
  }, [deptData]);

  const totalPayroll = useMemo(() => {
    return deptData?.data.reduce((acc, curr) => acc + curr.totalPayroll, 0) || 0;
  }, [deptData]);

  const baseCurrency = deptData?.data[0]?.currency || 'USD';

  if (isLoadingDept || isLoadingCountry) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">Loading dashboard metrics...</div>;
  if (deptError || countryError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">Failed to load dashboard metrics.</div>;
  if (!deptData?.data || deptData.data.length === 0) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">No data available for your organization.</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Finance overview</p>
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Organization compensation dashboard</h2>
            <p className="mt-2 text-sm text-slate-500">Monitor workforce size, payroll spend, and regional compensation distribution in one view.</p>
          </div>
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Updated today
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
          <p className="text-sm font-medium text-slate-500">Total Employees</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{totalHeadcount.toLocaleString()}</p>
          <p className="mt-3 text-sm text-slate-500">Across all departments and countries</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
          <p className="text-sm font-medium text-slate-500">Total Annual Payroll</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{formatCurrency(totalPayroll, baseCurrency)}</p>
          <p className="mt-3 text-sm text-slate-500">Current annualized compensation spend</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-violet-100 p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
          <p className="text-sm font-medium text-slate-500">Avg Org Salary</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {totalHeadcount > 0 ? formatCurrency(totalPayroll / totalHeadcount, baseCurrency) : '-'}
          </p>
          <p className="mt-3 text-sm text-slate-500">Average employee compensation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Headcount by Department</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{deptData.data.length} teams</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData.data} margin={{ top: 18, right: 8, left: 0, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 16px 32px rgba(15,23,42,0.09)' }}
                />
                <Bar dataKey="headcount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Payroll by Country</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{countryData?.data.length || 0} regions</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryData?.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="totalPayroll"
                  nameKey="group"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {countryData?.data.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name: any, props: any) => [formatCurrency(Number(value), props.payload.currency), String(name)]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
