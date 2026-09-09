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

  if (isLoadingDept || isLoadingCountry) return <div className="p-4 text-slate-500">Loading dashboard metrics...</div>;
  if (deptError || countryError) return <div className="p-4 text-red-500">Failed to load dashboard metrics.</div>;
  if (!deptData?.data || deptData.data.length === 0) return <div className="p-4 text-slate-500">No data available for your organization.</div>;

  return (
    <div className="space-y-6">
      {/* High Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500">Total Employees</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalHeadcount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500">Total Annual Payroll</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(totalPayroll, baseCurrency)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500">Avg Org Salary</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalHeadcount > 0 ? formatCurrency(totalPayroll / totalHeadcount, baseCurrency) : '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Payroll */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Headcount by Department</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="group" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="headcount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Payroll by Country</h3>
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
