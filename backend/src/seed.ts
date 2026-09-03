import prisma from './db';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log('Starting seed...');
  
  // Clean up if running repeatedly
  await prisma.auditLog.deleteMany();
  await prisma.compensation.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // 1. Create two tenants
  const acmeId = uuidv4();
  const globexId = uuidv4();

  await prisma.tenant.createMany({
    data: [
      { id: acmeId, name: 'ACME Corp' },
      { id: globexId, name: 'Globex Inc' }
    ]
  });

  // 2. Create HR Managers
  const passwordHash = await hash('password123', 10);
  const acmeHrId = uuidv4();
  const globexHrId = uuidv4();
  
  await prisma.user.createMany({
    data: [
      { id: acmeHrId, tenantId: acmeId, email: 'abhishek.hr@abhitech.com', passwordHash, name: 'Abhishek Raut' },
      { id: globexHrId, tenantId: globexId, email: 'hr@globex.com', passwordHash, name: 'Susmita HR' }
    ]
  });

  console.log('Seeding 10,000 employees total (MySQL batch insert)...');

  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
  const countries = ['USA', 'UK', 'India', 'Canada', 'Germany'];
  
  const createEmployees = async (tenantId: string, count: number, hrId: string, startIndex: number) => {
    const chunkSize = 2000;
    
    for (let i = 0; i < count; i += chunkSize) {
      const chunk = Math.min(chunkSize, count - i);
      const employees = [];
      const compensations = [];

      for (let j = 0; j < chunk; j++) {
        const empId = uuidv4();
        const hireDate = new Date(Date.now() - (Math.random() * 5 * 365 * 24 * 60 * 60 * 1000));
        
        employees.push({
          id: empId,
          tenantId,
          firstName: `First${startIndex + i + j}`,
          lastName: `Last${startIndex + i + j}`,
          email: `emp${startIndex + i + j}_${tenantId.substring(0,4)}@company.com`,
          department: departments[(i + j) % departments.length],
          country: countries[(i + j) % countries.length],
          hireDate,
          isActive: true,
        });

        compensations.push({
          id: uuidv4(),
          tenantId,
          employeeId: empId,
          amount: 50000 + ((i + j) % 50000), // deterministic salary
          currency: 'USD',
          effectiveDate: hireDate,
          createdBy: hrId,
        });
      }

      await prisma.$transaction([
        prisma.employee.createMany({ data: employees }),
        prisma.compensation.createMany({ data: compensations })
      ]);

      console.log(`Seeded chunk ${i} to ${i + chunk} for tenant ${tenantId}`);
    }
  };

  await createEmployees(acmeId, 8000, acmeHrId, 0);
  await createEmployees(globexId, 2000, globexHrId, 8000);

  const empCount = await prisma.employee.count();
  console.log(`Seed completed successfully! Total Employees: ${empCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
