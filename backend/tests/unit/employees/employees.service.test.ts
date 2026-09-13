import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeesService } from '../../../src/modules/employees/employees.service';
import { employeesRepository } from '../../../src/modules/employees/employees.repository';

vi.mock('../../../src/modules/employees/employees.repository');

describe('EmployeesService', () => {
  let employeesService: EmployeesService;

  beforeEach(() => {
    vi.clearAllMocks();
    employeesService = new EmployeesService();
  });

  describe('getEmployees', () => {
    it('calculates pagination correctly (page 1, limit 10 -> skip 0, take 10)', async () => {
      vi.mocked(employeesRepository.count).mockResolvedValue(100);
      vi.mocked(employeesRepository.findManyWithLatestCompensation).mockResolvedValue([]);

      await employeesService.getEmployees(
        { tenantId: 'tenant-1' },
        { page: 1, limit: 10 },
        { sortBy: 'createdAt', sortOrder: 'desc' }
      );

      expect(employeesRepository.findManyWithLatestCompensation).toHaveBeenCalledWith(
        { tenantId: 'tenant-1' },
        { skip: 0, take: 10 },
        { sortBy: 'createdAt', sortOrder: 'desc' }
      );
    });

    it('calculates pagination correctly for page > 1 (page 3, limit 15 -> skip 30, take 15)', async () => {
      vi.mocked(employeesRepository.count).mockResolvedValue(100);
      vi.mocked(employeesRepository.findManyWithLatestCompensation).mockResolvedValue([]);

      await employeesService.getEmployees(
        { tenantId: 'tenant-1' },
        { page: 3, limit: 15 },
        { sortBy: 'createdAt', sortOrder: 'desc' }
      );

      expect(employeesRepository.findManyWithLatestCompensation).toHaveBeenCalledWith(
        { tenantId: 'tenant-1' },
        { skip: 30, take: 15 },
        { sortBy: 'createdAt', sortOrder: 'desc' }
      );
    });

    it('applies default pagination when limit/page are undefined or invalid', async () => {
      vi.mocked(employeesRepository.count).mockResolvedValue(100);
      vi.mocked(employeesRepository.findManyWithLatestCompensation).mockResolvedValue([]);

      await employeesService.getEmployees(
        { tenantId: 'tenant-1' },
        { page: 0, limit: 0 },
        { sortBy: 'createdAt', sortOrder: 'desc' }
      );

      expect(employeesRepository.findManyWithLatestCompensation).toHaveBeenCalledWith(
        { tenantId: 'tenant-1' },
        { skip: 0, take: 50 }, // fallback to default limit 50
        { sortBy: 'createdAt', sortOrder: 'desc' }
      );
    });

    it('enforces maximum page size (limit > 100 becomes 100)', async () => {
      vi.mocked(employeesRepository.count).mockResolvedValue(100);
      vi.mocked(employeesRepository.findManyWithLatestCompensation).mockResolvedValue([]);

      await employeesService.getEmployees(
        { tenantId: 'tenant-1' },
        { page: 1, limit: 200 },
        { sortBy: 'createdAt', sortOrder: 'desc' }
      );

      expect(employeesRepository.findManyWithLatestCompensation).toHaveBeenCalledWith(
        { tenantId: 'tenant-1' },
        { skip: 0, take: 100 },
        { sortBy: 'createdAt', sortOrder: 'desc' }
      );
    });

    it('propagates tenant context correctly', async () => {
      vi.mocked(employeesRepository.count).mockResolvedValue(0);
      vi.mocked(employeesRepository.findManyWithLatestCompensation).mockResolvedValue([]);

      await employeesService.getEmployees(
        { tenantId: 'tenant-secure-123', search: 'Bob' },
        { page: 1, limit: 10 },
        { sortBy: 'firstName', sortOrder: 'asc' }
      );

      expect(employeesRepository.count).toHaveBeenCalledWith({ tenantId: 'tenant-secure-123', search: 'Bob' });
      expect(employeesRepository.findManyWithLatestCompensation).toHaveBeenCalledWith(
        { tenantId: 'tenant-secure-123', search: 'Bob' },
        { skip: 0, take: 10 },
        { sortBy: 'firstName', sortOrder: 'asc' }
      );
    });
  });

  describe('getEmployeeById', () => {
    it('propagates tenantId strictly and handles not-found behavior', async () => {
      vi.mocked(employeesRepository.findById).mockResolvedValue(null);

      const result = await employeesService.getEmployeeById({ tenantId: 'tenant-1', employeeId: 1 });

      expect(employeesRepository.findById).toHaveBeenCalledWith({ tenantId: 'tenant-1', employeeId: 1 });
      expect(result).toBeNull();
    });

    it('returns the employee if found', async () => {
      const mockEmployee: any = {
        id: 1,
        tenantId: 'tenant-1',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@test.com',
        department: 'Engineering',
        country: 'US',
        joiningDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(), currentSalary: null, currency: null
      };
      
      vi.mocked(employeesRepository.findById).mockResolvedValue(mockEmployee);

      const result = await employeesService.getEmployeeById({ tenantId: 'tenant-1', employeeId: 1 });

      expect(result).toEqual(mockEmployee);
    });
  });
});