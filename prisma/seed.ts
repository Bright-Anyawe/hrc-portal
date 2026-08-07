import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const consultantPassword = await bcrypt.hash("consultant123", 10);
  const clientPassword = await bcrypt.hash("client123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@hrc.com" },
    update: {},
    create: {
      name: "HRC Admin",
      email: "admin@hrc.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const consultant = await prisma.user.upsert({
    where: { email: "consultant@hrc.com" },
    update: {},
    create: {
      name: "Aisha Patel",
      email: "consultant@hrc.com",
      passwordHash: consultantPassword,
      role: "CONSULTANT",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@hrc.com" },
    update: {},
    create: {
      name: "Northwind Trading",
      email: "client@hrc.com",
      passwordHash: clientPassword,
      role: "CLIENT",
    },
  });

  await prisma.clientAssignment.upsert({
    where: {
      consultantId_clientId: {
        consultantId: consultant.id,
        clientId: client.id,
      },
    },
    update: {},
    create: {
      consultantId: consultant.id,
      clientId: client.id,
    },
  });

  const existingProject = await prisma.project.findFirst({
    where: { createdById: admin.id },
  });

  if (!existingProject) {
    const project = await prisma.project.create({
      data: {
        title: "Hedge Fund Risk Dashboard",
        description:
          "Quarterly risk analytics dashboard and reporting pipeline for Northwind Trading.",
        status: "ACTIVE",
        createdById: admin.id,
        consultantId: consultant.id,
        clientId: client.id,
        tasks: {
          create: [
            {
              title: "Ingest portfolio data feeds",
              isCompleted: true,
              dueDate: new Date("2026-08-05"),
            },
            {
              title: "Build risk exposure charts",
              isCompleted: false,
              dueDate: new Date("2026-08-15"),
            },
            {
              title: "Client review session",
              isCompleted: false,
              dueDate: new Date("2026-08-20"),
            },
          ],
        },
        documents: {
          create: [
            {
              name: "Project-Plan.pdf",
              fileUrl: "/documents/project-plan.pdf",
              uploadedById: admin.id,
            },
            {
              name: "Data-Dictionary.xlsx",
              fileUrl: "/documents/data-dictionary.xlsx",
              uploadedById: consultant.id,
            },
          ],
        },
      },
    });

    console.log("Created linked project:", project.title);
  }

  console.log("Seed complete:");
  console.log("  Admin       - admin@hrc.com / admin123");
  console.log("  Consultant  - consultant@hrc.com / consultant123");
  console.log("  Client      - client@hrc.com / client123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
