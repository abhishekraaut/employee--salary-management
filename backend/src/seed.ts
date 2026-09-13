import prisma from './config/database';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Simple deterministic PRNG
function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
const random = mulberry32(12345);
function randRange(min: number, max: number) { return Math.floor(random() * (max - min + 1)) + min; }
function randElement(arr: any[]) { return arr[Math.floor(random() * arr.length)]; }

const indianFirstNames = ["Aarav", "Aditya", "Ananya", "Priya", "Rahul", "Neha", "Rohan", "Sneha", "Karan", "Pooja", "Vikram", "Riya", "Arjun", "Kavya", "Siddharth", "Ishita"];
const indianLastNames = ["Sharma", "Patel", "Singh", "Mehta", "Verma", "Gupta", "Shah", "Iyer", "Rao", "Jain", "Nair", "Desai", "Reddy", "Chopra", "Bose"];
const globalFirstNames = ["John", "Emma", "Michael", "Sarah", "David", "Jessica", "James", "Emily", "Robert", "Olivia", "William", "Sophia", "Thomas", "Ava", "Charles", "Mia"];
const globalLastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"];

const countryCurrencies = {
  'India': 'INR',
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'Germany': 'EUR',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Singapore': 'SGD',
  'UAE': 'AED'
};

const otherCountries = Object.keys(countryCurrencies).filter(c => c !== 'India');

const departments = [
  { name: 'Engineering', weight: 40 },
  { name: 'Sales', weight: 18 },
  { name: 'Operations', weight: 12 },
  { name: 'Product', weight: 10 },
  { name: 'Marketing', weight: 7 },
  { name: 'Finance', weight: 8 },
  { name: 'HR', weight: 5 }
];

function getDepartment() {
  const roll = random() * 100;
  let sum = 0;
  for (const dept of departments) {
    sum += dept.weight;
    if (roll <= sum) return dept.name;
  }
  return 'Engineering';
}

function generateSalary(country: string, dept: string) {
  let base = 50000;
  if (dept === 'Engineering' || dept === 'Product') base = 80000;
  else if (dept === 'HR' || dept === 'Operations') base = 40000;

  const multiplier = (random() * 0.5) + 0.8; // 0.8 to 1.3
  const converted = base * multiplier;

  switch (country) {
    case 'India': return Math.floor(converted * 83); // rough USD to INR
    case 'United Kingdom': return Math.floor(converted * 0.75);
    case 'Germany': return Math.floor(converted * 0.9);
    case 'Canada': return Math.floor(converted * 1.35);
    case 'Australia': return Math.floor(converted * 1.5);
    case 'Singapore': return Math.floor(converted * 1.34);
    case 'UAE': return Math.floor(converted * 3.67);
    default: return Math.floor(converted);
  }
}

async function main() {
  console.log('Starting seed...');
  const existingCount = await prisma.tenant.count();
  if (existingCount > 0) {
    console.log('Data is already seeded (tenants exist). Skipping seed process.');
    return;
  }

  const acmeId = uuidv4();
  const globexId = uuidv4();

  await prisma.tenant.createMany({
    data: [
      { id: acmeId, name: 'ACME Corp' },
      { id: globexId, name: 'Globex Inc' }
    ]
  });

  const passwordHash = await hash('abhi@123', 10);
  const acmeHrId = uuidv4();
  const globexHrId = uuidv4();

  await prisma.user.createMany({
    data: [
      { id: acmeHrId, tenantId: acmeId, email: 'abhishek.hr@abhitech.com', passwordHash, name: 'Abhishek Raut' },
      { id: globexHrId, tenantId: globexId, email: 'hr@globex.com', passwordHash, name: 'Susmita HR' }
    ]
  });

  console.log('Seeding 10,000 employees...');

  let idCounter = 1;

  const createEmployeesForTenant = async (tenantId: string, count: number, hrId: string, isIndiaHeavy: boolean) => {
    const chunkSize = 2000;

    for (let i = 0; i < count; i += chunkSize) {
      const chunk = Math.min(chunkSize, count - i);
      const employees = [];
      const compensations = [];
      const audits = [];

      for (let j = 0; j < chunk; j++) {
        const isIndia = isIndiaHeavy ? random() < 0.8 : random() < 0.2;
        const country = isIndia ? 'India' : randElement(otherCountries);
        const currency = countryCurrencies[country as keyof typeof countryCurrencies];
        const department = getDepartment();
        const firstName = isIndia ? randElement(indianFirstNames) : randElement(globalFirstNames);
        const lastName = isIndia ? randElement(indianLastNames) : randElement(globalLastNames);
        
        const joinYear = randRange(2018, 2024);
        const joinMonth = randRange(0, 11);
        const joinDay = randRange(1, 28);
        const joiningDate = new Date(joinYear, joinMonth, joinDay);
        
        const empId = idCounter++;
        const salary = generateSalary(country, department);
        
        employees.push({
          id: empId,
          tenantId,
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${empId}@company.com`,
          department,
          country,
          joiningDate,
          isActive: true,
        });

        const compId = uuidv4();
        compensations.push({
          id: compId,
          tenantId,
          employeeId: empId,
          amount: salary,
          currency,
          effectiveDate: joiningDate,
          createdBy: hrId,
        });

        audits.push({
          id: uuidv4(),
          tenantId,
          employeeId: empId,
          actorId: hrId,
          action: 'SALARY_UPDATE',
          entity: 'COMPENSATION',
          previousCompensationId: null,
          newCompensationId: compId,
          reason: 'Initial Salary',
          createdAt: joiningDate
        });
      }

      await prisma.$transaction([
        prisma.employee.createMany({ data: employees }),
        prisma.compensation.createMany({ data: compensations }),
        prisma.auditLog.createMany({ data: audits })
      ]);

      console.log(`Seeded ${i + chunk}/${count} for tenant ${tenantId}`);
    }
  };

  // Target: ~7500 India total.
  // ACME: 8000 total. 85% India = 6800
  // Globex: 2000 total. 35% India = 700
  await createEmployeesForTenant(acmeId, 8000, acmeHrId, true);
  await createEmployeesForTenant(globexId, 2000, globexHrId, false);

  const empCount = await prisma.employee.count();
  console.log(`Seed completed successfully! Total Employees: ${empCount}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
