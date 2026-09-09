import { useDeferredValue, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetEmployeesQuery } from './employeesApi';
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

type EmployeeSortField = 'firstName' | 'lastName' | 'hireDate' | 'createdAt';

export function EmployeeList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [sortBy, setSortBy] = useState<EmployeeSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [country, setCountry] = useState('');
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading, isFetching, isError } = useGetEmployeesQuery({
    page,
    limit: 10,
    search: deferredSearch || undefined,
    department: department || undefined,
    country: country || undefined,
    sortBy,
    sortOrder
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleSort = (field: EmployeeSortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees by name..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by department"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setPage(1); }}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by country"
          >
            <option value="">All Countries</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="India">India</option>
            <option value="Canada">Canada</option>
            <option value="Germany">Germany</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-medium">
              <tr>
                <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('firstName')}>
                  <div className="flex items-center gap-1">Name <ArrowUpDown className="h-4 w-4 text-slate-400"/></div>
                </th>
                <th scope="col" className="px-6 py-4">Department</th>
                <th scope="col" className="px-6 py-4">Country</th>
                <th scope="col" className="px-6 py-4">Current Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Loading employees...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-red-500">
                    Error loading employees. Please try again.
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No employees found matching your criteria.
                  </td>
                </tr>
              ) : (
                data?.data.map((employee) => (
                  <tr
                    key={employee.id}
                    onClick={() => navigate(`/employees/${employee.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-blue-600">
                      {employee.firstName} {employee.lastName}
                    </td>
                    <td className="px-6 py-4">{employee.department}</td>
                    <td className="px-6 py-4">{employee.country}</td>
                    <td className="px-6 py-4 font-medium">
                      {employee.currentSalary != null ? formatCurrency(employee.currentSalary, employee.currency) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
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
