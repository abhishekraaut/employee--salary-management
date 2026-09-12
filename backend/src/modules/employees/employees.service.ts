import { employeesRepository, GetEmployeesFilters, SortParams, EmployeeIdContext } from './employees.repository';

export interface GetEmployeesPagination {
  page: number;
  limit: number;
}

export class EmployeesService {
  async getEmployees(
    filters: GetEmployeesFilters,
    pagination: GetEmployeesPagination,
    sort: SortParams
  ) {
    let { page, limit } = pagination;
    
    // Apply defaults and boundaries
    page = page && page > 0 ? page : 1;
    limit = limit && limit > 0 ? limit : 50;
    limit = Math.min(limit, 100);

    const skip = (page - 1) * limit;

    const [total, employees] = await Promise.all([
      employeesRepository.count(filters),
      employeesRepository.findManyWithLatestCompensation(
        filters,
        { skip, take: limit },
        sort
      )
    ]);

    const data = employees.map((emp) => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department,
      country: emp.country,
      currentSalary: emp.compensations[0]?.amount ? Number(emp.compensations[0].amount) : null,
      currency: emp.compensations[0]?.currency || null,
    }));

    return {
      data,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getEmployeeById(context: EmployeeIdContext) {
    return employeesRepository.findById(context);
  }
}

export const employeesService = new EmployeesService();