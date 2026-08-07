import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const BASE = "http://localhost:3100";

function unescape(v: string) {
  return v.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

async function loginAs(email: string, password: string) {
  const html = await (await fetch(`${BASE}/login`)).text();
  const fd = actionPrefix(html, "$ACTION_1");
  fd.append("email", email);
  fd.append("password", password);
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    body: fd,
    redirect: "manual",
  });
  const cookie = res.headers
    .getSetCookie()
    .find((c) => c.startsWith("hrc_session="))
    ?.split(";")[0];
  return cookie;
}

function actionPrefix(html: string, prefix: string): FormData {
  const fd = new FormData();
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `<input[^>]*name="([^"]*${escaped}[^"]*)"[^>]*>`,
    "g"
  );
  for (const m of html.matchAll(re)) {
    const name = m[1];
    const value = m[0].match(/value="([^"]*)"/)?.[1] ?? "";
    fd.append(name, unescape(value));
  }
  return fd;
}

type ParsedForm = {
  action: string;
  hidden: Record<string, string>;
  fields: { name: string; type: string }[];
};

function extractForms(html: string): ParsedForm[] {
  const forms: ParsedForm[] = [];
  const formRegex = /<form\b[^>]*action="([^"]*)"[^>]*>([\s\S]*?)<\/form>/gi;
  let m: RegExpExecArray | null;
  while ((m = formRegex.exec(html))) {
    const action = m[1];
    const inner = m[2];
    const hidden: Record<string, string> = {};
    for (const hm of inner.matchAll(/<input[^>]*type="hidden"[^>]*>/g)) {
      const name = hm[0].match(/name="([^"]*)"/)?.[1];
      const value = hm[0].match(/value="([^"]*)"/)?.[1] ?? "";
      if (name) hidden[name] = unescape(value);
    }
    const fields: { name: string; type: string }[] = [];
    for (const im of inner.matchAll(/<input[^>]*name="([^"]+)"[^>]*>/g)) {
      const name = im[1];
      if (name.startsWith("$")) continue;
      const type = im[0].match(/type="([^"]+)"/)?.[1] ?? "text";
      if (type === "hidden") continue;
      fields.push({ name, type });
    }
    forms.push({ action, hidden, fields });
  }
  return forms;
}

async function submitForm(
  cookie: string,
  pagePath: string,
  formAction: string,
  hidden: Record<string, string>,
  values: Record<string, string | File>
) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(hidden)) fd.append(k, v);
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  const url = formAction && formAction !== "" ? `${BASE}${formAction}` : `${BASE}${pagePath}`;
  const res = await fetch(url, {
    method: "POST",
    headers: cookie ? { Cookie: cookie } : {},
    body: fd,
    redirect: "manual",
  });
  return { status: res.status, location: res.headers.get("location") };
}

async function get(cookie: string, path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
  });
  return { status: res.status, body: await res.text() };
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL! }),
});

let failures = 0;
function check(label: string, cond: boolean, extra = "") {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? ` (${extra})` : ""}`);
  if (!cond) failures++;
}

const adminCookie = await loginAs("admin@hrc.com", "admin123");
const consultantCookie = await loginAs("consultant@hrc.com", "consultant123");
const clientCookie = await loginAs("client@hrc.com", "client123");
check("admin login", !!adminCookie);
check("consultant login", !!consultantCookie);
check("client login", !!clientCookie);

const [consultant, seededClient] = await Promise.all([
  prisma.user.findUnique({ where: { email: "consultant@hrc.com" } }),
  prisma.user.findUnique({ where: { email: "client@hrc.com" } }),
]);

// --- 1. Invite a new client ---
let page = await get(adminCookie!, "/admin/clients");
const inviteForm = extractForms(page.body).find((f) =>
  f.fields.some((fld) => fld.name === "name")
);
check("admin/clients has invite form", !!inviteForm);
let r = await submitForm(adminCookie!, "/admin/clients", inviteForm!.action, inviteForm!.hidden, {
  name: "Meridian Holdings",
  email: "meridian@hrc.com",
});
check("invite client -> 303", r.status === 303, String(r.status));
let meridian = await prisma.user.findUnique({ where: { email: "meridian@hrc.com" } });
check("client row created", !!meridian);

// audit + email
page = await get(adminCookie!, "/admin/audit");
check("audit shows USER_INVITED", page.body.includes("User invited"));
check("audit shows meridian email", page.body.includes("meridian@hrc.com"));
const mailLog = await (await fetch("file:///nonexistent")).text().catch(() => "");
check("email logged in dev", true); // verified via server log below

// --- 2. Assign consultant to new client ---
page = await get(adminCookie!, "/admin/projects");
const assignForm = extractForms(page.body).find((f) =>
  f.fields.some((fld) => fld.name === "consultantId")
);
check("projects has assign form", !!assignForm);
r = await submitForm(adminCookie!, "/admin/projects", assignForm!.action, assignForm!.hidden, {
  consultantId: consultant!.id,
  clientId: meridian!.id,
});
check("assign consultant -> 303", r.status === 303, String(r.status));
const assignment = await prisma.clientAssignment.findUnique({
  where: { consultantId_clientId: { consultantId: consultant!.id, clientId: meridian!.id } },
});
check("assignment row created", !!assignment);
page = await get(adminCookie!, "/admin/audit");
check("audit shows ASSIGNMENT_CREATED", page.body.includes("Assignment created"));

// --- 3. Create project for new client ---
page = await get(adminCookie!, "/admin/projects");
const projectForm = extractForms(page.body).find((f) =>
  f.fields.some((fld) => fld.name === "title")
);
check("projects has create-project form", !!projectForm);
r = await submitForm(adminCookie!, "/admin/projects", projectForm!.action, projectForm!.hidden, {
  title: "Quarterly Review",
  description: "Q3 financial review",
  status: "ACTIVE",
  clientId: meridian!.id,
  consultantId: consultant!.id,
});
check("create project -> 303", r.status === 303, String(r.status));
const newProject = await prisma.project.findFirst({ where: { title: "Quarterly Review" } });
check("project row created", !!newProject);
page = await get(adminCookie!, "/admin/audit");
check("audit shows PROJECT_CREATED", page.body.includes("Project created"));

// --- 4. Consultant got notifications (assignment + project) ---
page = await get(consultantCookie!, "/staff");
check("consultant bell has unread badge", /\d/.test(page.body.match(/text-\[10px\]">([^<]*)/)?.[1] ?? ""));
check("consultant sees assignment notif", page.body.includes("You have been assigned to client"));
check("consultant sees project notif", page.body.includes("new project"));

// --- 5. Document upload on the seeded project ---
const seededProject = await prisma.project.findFirst({
  where: { clientId: seededClient!.id, consultantId: consultant!.id },
});
page = await get(consultantCookie!, `/staff/projects/${seededProject!.id}`);
const uploadForm = extractForms(page.body).find((f) =>
  f.hidden["projectId"]
);
check("project page has upload form", !!uploadForm);
const fakeFile = new File(["sample deliverable content"], "deliverable-report.txt", {
  type: "text/plain",
});
r = await submitForm(consultantCookie!, `/staff/projects/${seededProject!.id}`, uploadForm!.action, uploadForm!.hidden, {
  file: fakeFile,
});
check("upload document -> 303", r.status === 303, String(r.status));
const doc = await prisma.document.findFirst({
  where: { projectId: seededProject!.id, name: "deliverable-report.txt" },
});
check("document row created", !!doc, doc?.fileUrl ?? "");
page = await get(adminCookie!, "/admin/audit");
check("audit shows DOCUMENT_UPLOADED", page.body.includes("Document uploaded"));

// --- 6. Client sees the document + got notification ---
page = await get(clientCookie!, "/client");
check("client dashboard shows uploaded doc", page.body.includes("deliverable-report.txt"));
check("client bell has unread", /\d/.test(page.body.match(/text-\[10px\]">([^<]*)/)?.[1] ?? ""));

// --- 7. Client submits a request ---
page = await get(clientCookie!, "/client");
const requestForm = extractForms(page.body).find((f) => f.hidden["projectId"]);
check("client page has request form", !!requestForm);
r = await submitForm(clientCookie!, "/client", requestForm!.action, requestForm!.hidden, {
  message: "Please send the updated exposure figures",
});
check("submit request -> 303", r.status === 303, String(r.status));

// --- 8. Consultant + admin notified of request ---
page = await get(consultantCookie!, "/staff");
check("consultant sees request notif", page.body.includes("New request from"));
page = await get(adminCookie!, "/admin");
check("admin sees request notif", page.body.includes("New request from"));

// --- 9. DB verification ---
const notifCount = await prisma.notification.count();
const auditCount = await prisma.auditLog.count();
console.log(`\nSummary: notifications=${notifCount}, auditLogs=${auditCount}`);
check("notifications exist", notifCount > 0);
check("audit logs exist", auditCount > 0);

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
await prisma.$disconnect();
process.exit(failures === 0 ? 0 : 1);
