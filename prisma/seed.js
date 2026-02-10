import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.payRecord.deleteMany();
  await prisma.onboardingItem.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.invoice.deleteMany();

  const employees = await prisma.employee.createMany({
    data: [
      {
        name: "Alicia Park",
        email: "alicia.park@easycrm.dev",
        title: "Operations Lead",
        department: "Operations",
        status: "ACTIVE",
        salaryCents: 9800000
      },
      {
        name: "Marcus Hill",
        email: "marcus.hill@easycrm.dev",
        title: "Sales Manager",
        department: "Sales",
        status: "ACTIVE",
        salaryCents: 8200000
      },
      {
        name: "Devin Brooks",
        email: "devin.brooks@easycrm.dev",
        title: "HR Specialist",
        department: "HR",
        status: "ONBOARDING",
        salaryCents: 6500000
      }
    ]
  });

  const employeeList = await prisma.employee.findMany();
  const [alicia, marcus, devin] = employeeList;

  await prisma.onboardingItem.createMany({
    data: [
      {
        employeeId: devin.id,
        title: "Complete HR policies training",
        status: "IN_PROGRESS",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        employeeId: devin.id,
        title: "Set up payroll profile",
        status: "NOT_STARTED",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  await prisma.invoice.createMany({
    data: [
      {
        customerName: "Nimbus Health",
        customerEmail: "billing@nimbushealth.com",
        amountCents: 156000,
        status: "SENT",
        issuedDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        customerName: "Bridgepoint Labs",
        customerEmail: "ap@bridgepointlabs.com",
        amountCents: 98000,
        status: "PAID",
        issuedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  await prisma.payRecord.createMany({
    data: [
      {
        employeeId: alicia.id,
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        grossPayCents: 408333,
        deductionsCents: 58000,
        netPayCents: 350333,
        status: "PAID"
      },
      {
        employeeId: marcus.id,
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        grossPayCents: 341666,
        deductionsCents: 52000,
        netPayCents: 289666,
        status: "PAID"
      }
    ]
  });

  console.log(`Seeded ${employees.count} employees`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
