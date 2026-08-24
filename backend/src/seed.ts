import prisma from './db';
import { hash } from 'bcryptjs';

async function main() {
  console.log('Starting seed...');

  // 1. Create two tenants
  const acme = await prisma.tenant.create({
    data: { name: 'ACME Corp' }
  });

  const globex = await prisma.tenant.create({
    data: { name: 'Globex Inc' }
  });

  // 2. Create an HR Manager for ACME
  const passwordHash = await hash('password123', 10);
  const hrManager = await prisma.user.create({
    data: {
      tenantId: acme.id,
      email: 'hr@acme.com',
      passwordHash,
      name: 'Alice HR'
    }
  });

  // Create an HR Manager for Globex
  const hrGlobex = await prisma.user.create({
    data: {
      tenantId: globex.id,
      email: 'hr@globex.com',
      passwordHash,
      name: 'Bob Globex'
    }
  });

  console.log('Seeding employees...');

  // 3. Seed exactly 10,000 employees total (9,000 for ACME, 1,000 for Globex to ensure some distribution)
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
  const countries = ['USA', 'UK', 'India', 'Canada', 'Germany'];
  
  const createEmployees = async (tenantId: string, count: number, hrId: string) => {
    // SQLite limits batch inserts, so we'll do smaller chunks
    const chunkSize = 500;
    for (let i = 0; i < count; i += chunkSize) {
      const chunk = Math.min(chunkSize, count - i);
      const employeesData = Array.from({ length: chunk }).map((_, index) => ({
        tenantId,
        firstName: `First${i + index}`,
        lastName: `Last${i + index}`,
        email: `emp${i + index}_${tenantId.substring(0,4)}@company.com`,
        department: departments[Math.floor(Math.random() * departments.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        hireDate: new Date(Date.now() - Math.random() * 10000000000),
        isActive: true,
      }));
      
      const createdEmployees = await Promise.all(
        employeesData.map(e => prisma.employee.create({ data: e }))
      );

      // Create initial compensation for them
      const compData = createdEmployees.map(e => ({
        tenantId,
        employeeId: e.id,
        amount: Math.floor(Math.random() * 10000000) + 5000000, // Cents ($50k - $150k)
        currency: 'USD',
        effectiveDate: e.hireDate,
        createdBy: hrId,
      }));

      await prisma.compensation.createMany({ data: compData });
      console.log(`Seeded chunk ${i} to ${i + chunk} for tenant ${tenantId}`);
    }
  };

  await createEmployees(acme.id, 9000, hrManager.id);
  await createEmployees(globex.id, 1000, hrGlobex.id);

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
