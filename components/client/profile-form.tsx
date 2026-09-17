"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  updateClientProfileSection,
  submitProfileForReview,
  type ActionResult,
  type ClientProfileData,
  type ClientOrganizationData,
  type ClientAddressData,
  type ClientContactData,
  type ClientSecondaryContact,
  type ClientScaleData,
  type ClientServicesData,
  type ClientEngagementData,
  type ClientScopeData,
  type ClientCommercialData,
  type ClientComplianceData,
  type ClientAcquisitionData,
  type ClientDeclarationData,
} from "@/app/actions/client-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Building2,
  MapPin,
  User,
  Users,
  BarChart3,
  Headphones,
  Briefcase,
  Target,
  CreditCard,
  Shield,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileData = ClientProfileData;

const STEPS = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "address", label: "Address", icon: MapPin },
  { id: "contacts", label: "Contacts", icon: User },
  { id: "scale", label: "Scale", icon: BarChart3 },
  { id: "services", label: "Services", icon: Headphones },
  { id: "engagement", label: "Engagement", icon: Briefcase },
  { id: "scope", label: "Scope", icon: Target },
  { id: "commercial", label: "Commercial", icon: CreditCard },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "acquisition", label: "Relationship", icon: Users },
  { id: "declaration", label: "Declaration", icon: FileCheck },
];

const CLIENT_TYPES = [
  "Private Company",
  "Public Company",
  "Government Ministry/Agency",
  "Metropolitan/Municipal/District Assembly",
  "NGO / CSO",
  "Development Partner / Donor",
  "Educational / Research Institution",
  "Professional Association",
  "Individual Client",
  "Sole Proprietor / SME",
];

const SECTORS = [
  "Agriculture / Agribusiness",
  "Banking / Finance",
  "Construction / Infrastructure",
  "Education / Training",
  "Energy / Oil & Gas",
  "Health / Pharmaceuticals",
  "Hospitality / Tourism",
  "ICT / Telecom",
  "Manufacturing",
  "Mining / Extractives",
  "Professional Services",
  "Public Administration",
  "Real Estate / Housing",
  "Retail / Commerce",
  "Transport / Logistics",
  "Water / Sanitation",
];

const SERVICES = [
  "Strategy & Business Advisory",
  "Research & Policy Analysis",
  "Project Design / Proposal Development",
  "Project Management",
  "Monitoring, Evaluation & Learning",
  "Training & Capacity Development",
  "Human Resource / Organisational Development",
  "SME / Entrepreneurship Development",
  "Market / Feasibility Study",
  "Data Collection & Analytics",
  "Institutional Strengthening",
  "Community / Local Economic Development",
  "Financial / Business Planning",
  "Technical Advisory",
  "Facilitation / Retreat / Workshop",
];

function CheckboxGroup({
  options,
  value = [],
  onChange,
  otherValue,
  onOtherChange,
  otherPlaceholder,
}: {
  options: string[];
  value?: string[];
  onChange: (v: string[]) => void;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
  otherPlaceholder?: string;
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors cursor-pointer",
              value.includes(opt)
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            )}
          >
            <input
              type="checkbox"
              checked={value.includes(opt)}
              onChange={() => toggle(opt)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {onOtherChange && (
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!otherValue}
              onChange={() => onOtherChange(otherValue ? "" : " ")}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span>Other:</span>
          </label>
          {otherValue !== undefined && (
            <Input
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder={otherPlaceholder || "Specify..."}
              className="flex-1"
            />
          )}
        </div>
      )}
    </div>
  );
}

function OrganizationStep({
  data,
  onSave,
}: {
  data: ProfileData["organization"];
  onSave: (d: ProfileData["organization"]) => void;
}) {
  const [local, setLocal] = useState<ClientOrganizationData>(
    data ?? { orgName: "" }
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Client / Organisation Name *</Label>
          <Input
            value={local.orgName ?? ""}
            onChange={(e) => setLocal({ ...local, orgName: e.target.value })}
            placeholder="Organisation name"
          />
        </div>
        <div className="space-y-2">
          <Label>Trading / Short Name</Label>
          <Input
            value={local.tradingName ?? ""}
            onChange={(e) => setLocal({ ...local, tradingName: e.target.value })}
            placeholder="Short name"
          />
        </div>
        <div className="space-y-2">
          <Label>Legal / Registration Name</Label>
          <Input
            value={local.legalName ?? ""}
            onChange={(e) => setLocal({ ...local, legalName: e.target.value })}
            placeholder="If different"
          />
        </div>
        <div className="space-y-2">
          <Label>Registration / Incorporation No.</Label>
          <Input
            value={local.registrationNo ?? ""}
            onChange={(e) =>
              setLocal({ ...local, registrationNo: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>TIN / Tax Identification No.</Label>
          <Input
            value={local.tin ?? ""}
            onChange={(e) => setLocal({ ...local, tin: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Year Established</Label>
          <Input
            value={local.yearEstablished ?? ""}
            onChange={(e) =>
              setLocal({ ...local, yearEstablished: e.target.value })
            }
            placeholder="YYYY"
          />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input
            value={local.website ?? ""}
            onChange={(e) => setLocal({ ...local, website: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Client Type *</Label>
        <CheckboxGroup
          options={CLIENT_TYPES}
          value={local.clientType ?? []}
          onChange={(v) => setLocal({ ...local, clientType: v })}
          otherValue={local.clientTypeOther}
          onOtherChange={(v) => setLocal({ ...local, clientTypeOther: v })}
        />
      </div>

      <div className="space-y-2">
        <Label>Sector / Industry *</Label>
        <CheckboxGroup
          options={SECTORS}
          value={local.sector ?? []}
          onChange={(v) => setLocal({ ...local, sector: v })}
          otherValue={local.sectorOther}
          onOtherChange={(v) => setLocal({ ...local, sectorOther: v })}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(local)}>Save & Continue</Button>
      </div>
    </div>
  );
}

function AddressStep({
  data,
  onSave,
}: {
  data: ProfileData["address"];
  onSave: (d: ProfileData["address"]) => void;
}) {
  const [local, setLocal] = useState<ClientAddressData>(
    data ?? { digitalAddress: "" }
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Digital Address *</Label>
          <Input
            value={local.digitalAddress ?? ""}
            onChange={(e) =>
              setLocal({ ...local, digitalAddress: e.target.value })
            }
            placeholder="GA-000-0000"
          />
        </div>
        <div className="space-y-2">
          <Label>House / Building / Office No.</Label>
          <Input
            value={local.houseNo ?? ""}
            onChange={(e) => setLocal({ ...local, houseNo: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Street / Area</Label>
          <Input
            value={local.street ?? ""}
            onChange={(e) => setLocal({ ...local, street: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>City / Town</Label>
          <Input
            value={local.city ?? ""}
            onChange={(e) => setLocal({ ...local, city: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>District</Label>
          <Input
            value={local.district ?? ""}
            onChange={(e) => setLocal({ ...local, district: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Region</Label>
          <Input
            value={local.region ?? ""}
            onChange={(e) => setLocal({ ...local, region: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Input
            value={local.country ?? "Ghana"}
            onChange={(e) => setLocal({ ...local, country: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSave(local)}>Save & Continue</Button>
      </div>
    </div>
  );
}

function ContactsStep({
  data,
  secondary,
  onSave,
  onSaveSecondary,
}: {
  data: ProfileData["primaryContact"];
  secondary?: ProfileData["secondaryContact"];
  onSave: (d: ProfileData["primaryContact"]) => void;
  onSaveSecondary: (d: ProfileData["secondaryContact"]) => void;
}) {
  const [local, setLocal] = useState<ClientContactData>(
    data ?? { fullName: "", mobileNo: "", email: "" }
  );
  const [sec, setSec] = useState<ClientSecondaryContact>(secondary ?? {});

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Primary Contact Person</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Select
              value={local.title ?? ""}
              onChange={(e) => setLocal({ ...local, title: e.target.value })}
            >
              <option value="">Select</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Dr">Dr</option>
              <option value="Prof">Prof</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              value={local.fullName ?? ""}
              onChange={(e) => setLocal({ ...local, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Position / Designation</Label>
            <Input
              value={local.position ?? ""}
              onChange={(e) => setLocal({ ...local, position: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Department / Unit</Label>
            <Input
              value={local.department ?? ""}
              onChange={(e) =>
                setLocal({ ...local, department: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Mobile No. *</Label>
            <Input
              value={local.mobileNo ?? ""}
              onChange={(e) => setLocal({ ...local, mobileNo: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Alternative Phone</Label>
            <Input
              value={local.altPhone ?? ""}
              onChange={(e) => setLocal({ ...local, altPhone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email Address *</Label>
            <Input
              type="email"
              value={local.email ?? ""}
              onChange={(e) => setLocal({ ...local, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Preferred Contact Method</Label>
            <Select
              value={local.preferredContact ?? ""}
              onChange={(e) =>
                setLocal({ ...local, preferredContact: e.target.value })
              }
            >
              <option value="">Select</option>
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Other">Other</option>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">
          Secondary / Authorised Contact
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={sec.fullName ?? ""}
              onChange={(e) => setSec({ ...sec, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Position / Designation</Label>
            <Input
              value={sec.position ?? ""}
              onChange={(e) => setSec({ ...sec, position: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Mobile No.</Label>
            <Input
              value={sec.mobileNo ?? ""}
              onChange={(e) => setSec({ ...sec, mobileNo: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={sec.email ?? ""}
              onChange={(e) => setSec({ ...sec, email: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Role in Engagement</Label>
            <div className="flex flex-wrap gap-2">
              {["Decision Maker", "Technical Lead", "Finance", "Procurement"].map(
                (role) => (
                  <label
                    key={role}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm cursor-pointer",
                      sec.roleInEngagement === role
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="secRole"
                      checked={sec.roleInEngagement === role}
                      onChange={() => setSec({ ...sec, roleInEngagement: role })}
                      className="h-3 w-3"
                    />
                    {role}
                  </label>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            onSave(local);
            onSaveSecondary(sec);
          }}
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}

function ScaleStep({
  data,
  onSave,
}: {
  data: ProfileData["scale"];
  onSave: (d: ProfileData["scale"]) => void;
}) {
  const [local, setLocal] = useState<ClientScaleData>(data ?? {});

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Approximate Number of Employees</Label>
          <Select
            value={local.employeeCount ?? ""}
            onChange={(e) =>
              setLocal({ ...local, employeeCount: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="1-5">1-5</option>
            <option value="6-30">6-30</option>
            <option value="31-100">31-100</option>
            <option value="101-500">101-500</option>
            <option value="500+">500+</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Geographic Coverage</Label>
          <Select
            value={local.geographicCoverage ?? ""}
            onChange={(e) =>
              setLocal({ ...local, geographicCoverage: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="District">District</option>
            <option value="Regional">Regional</option>
            <option value="National">National</option>
            <option value="Multi-country / International">
              Multi-country / International
            </option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Annual Revenue / Budget Band</Label>
          <Select
            value={local.annualRevenue ?? ""}
            onChange={(e) =>
              setLocal({ ...local, annualRevenue: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="< GHS 500k">&lt; GHS 500k</option>
            <option value="GHS 500k-2m">GHS 500k-2m</option>
            <option value="GHS 2m-10m">GHS 2m-10m</option>
            <option value="> GHS 10m">&gt; GHS 10m</option>
            <option value="Not disclosed">Not disclosed</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Main Funding Source</Label>
          <Select
            value={local.mainFundingSource ?? ""}
            onChange={(e) =>
              setLocal({ ...local, mainFundingSource: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="Internal Revenue">Internal Revenue</option>
            <option value="Government">Government</option>
            <option value="Donor / Grant">Donor / Grant</option>
            <option value="Investor">Investor</option>
            <option value="Other">Other</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Brief description of the organisation and its principal activities *</Label>
        <textarea
          value={local.briefDescription ?? ""}
          onChange={(e) =>
            setLocal({ ...local, briefDescription: e.target.value })
          }
          rows={4}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Describe what the organisation does..."
        />
      </div>

      <div className="space-y-2">
        <Label>Strategic priorities / current organisational challenges</Label>
        <textarea
          value={local.strategicPriorities ?? ""}
          onChange={(e) =>
            setLocal({ ...local, strategicPriorities: e.target.value })
          }
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(local)}>Save & Continue</Button>
      </div>
    </div>
  );
}

function ServicesStep({
  data,
  onSave,
}: {
  data: ProfileData["services"];
  onSave: (d: ProfileData["services"]) => void;
}) {
  const [local, setLocal] = useState<ClientServicesData>(data ?? {});

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Services / Support Required from HRC</Label>
        <CheckboxGroup
          options={SERVICES}
          value={local.servicesRequired ?? []}
          onChange={(v) => setLocal({ ...local, servicesRequired: v })}
          otherValue={local.servicesOther}
          onOtherChange={(v) => setLocal({ ...local, servicesOther: v })}
        />
      </div>

      <div className="space-y-2">
        <Label>Describe the specific need, problem or opportunity *</Label>
        <textarea
          value={local.specificNeed ?? ""}
          onChange={(e) => setLocal({ ...local, specificNeed: e.target.value })}
          rows={4}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="What does the client need help with?"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(local)}>Save & Continue</Button>
      </div>
    </div>
  );
}

function EngagementStep({
  data,
  onSave,
}: {
  data: ProfileData["engagement"];
  onSave: (d: ProfileData["engagement"]) => void;
}) {
  const [local, setLocal] = useState<ClientEngagementData>(data ?? {});

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Proposed Project / Assignment Title</Label>
          <Input
            value={local.projectTitle ?? ""}
            onChange={(e) =>
              setLocal({ ...local, projectTitle: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Expected Start Date</Label>
          <Input
            type="date"
            value={local.expectedStartDate ?? ""}
            onChange={(e) =>
              setLocal({ ...local, expectedStartDate: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Expected Completion / Duration</Label>
          <Input
            value={local.expectedDuration ?? ""}
            onChange={(e) =>
              setLocal({ ...local, expectedDuration: e.target.value })
            }
            placeholder="e.g. 3 months"
          />
        </div>
        <div className="space-y-2">
          <Label>Location(s) of Assignment</Label>
          <Input
            value={local.locationOfAssignment ?? ""}
            onChange={(e) =>
              setLocal({ ...local, locationOfAssignment: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Estimated Budget / Fee Range (GHS)</Label>
          <Input
            value={local.estimatedBudget ?? ""}
            onChange={(e) =>
              setLocal({ ...local, estimatedBudget: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Procurement / Engagement Method</Label>
          <Select
            value={local.procurementMethod ?? ""}
            onChange={(e) =>
              setLocal({ ...local, procurementMethod: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="Direct Engagement">Direct Engagement</option>
            <option value="RFQ">RFQ</option>
            <option value="RFP / Tender">RFP / Tender</option>
            <option value="Framework Contract">Framework Contract</option>
            <option value="Other">Other</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Funding / Approval Status</Label>
          <Select
            value={local.fundingApprovalStatus ?? ""}
            onChange={(e) =>
              setLocal({ ...local, fundingApprovalStatus: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="Approved">Approved</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Budgeting Stage">Budgeting Stage</option>
            <option value="Exploratory">Exploratory</option>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSave(local)}>Save & Continue</Button>
      </div>
    </div>
  );
}

function ScopeStep({
  data,
  onSave,
}: {
  data: ProfileData["scope"];
  onSave: (d: ProfileData["scope"]) => void;
}) {
  const [local, setLocal] = useState<ClientScopeData>(data ?? {});

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Expected scope of work / key activities *</Label>
        <textarea
          value={local.expectedScope ?? ""}
          onChange={(e) =>
            setLocal({ ...local, expectedScope: e.target.value })
          }
          rows={5}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="space-y-2">
        <Label>Expected deliverables / outputs</Label>
        <textarea
          value={local.expectedDeliverables ?? ""}
          onChange={(e) =>
            setLocal({ ...local, expectedDeliverables: e.target.value })
          }
          rows={4}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="space-y-2">
        <Label>How will the client define a successful engagement?</Label>
        <textarea
          value={local.successDefinition ?? ""}
          onChange={(e) =>
            setLocal({ ...local, successDefinition: e.target.value })
          }
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSave(local)}>Save & Continue</Button>
      </div>
    </div>
  );
}

function CommercialStep({
  data,
  onSave,
}: {
  data: ProfileData["commercial"];
  onSave: (d: ProfileData["commercial"]) => void;
}) {
  const [local, setLocal] = useState<ClientCommercialData>(data ?? {});

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Billing / Finance Contact</Label>
          <Input
            value={local.billingContact ?? ""}
            onChange={(e) =>
              setLocal({ ...local, billingContact: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Billing Email</Label>
          <Input
            type="email"
            value={local.billingEmail ?? ""}
            onChange={(e) =>
              setLocal({ ...local, billingEmail: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Purchase Order Required?</Label>
          <Select
            value={local.purchaseOrderRequired ?? ""}
            onChange={(e) =>
              setLocal({ ...local, purchaseOrderRequired: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="To be confirmed">To be confirmed</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tax / Withholding Requirements</Label>
          <Input
            value={local.taxWithholding ?? ""}
            onChange={(e) =>
              setLocal({ ...local, taxWithholding: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Preferred Payment Terms</Label>
          <Select
            value={local.preferredPaymentTerms ?? ""}
            onChange={(e) =>
              setLocal({ ...local, preferredPaymentTerms: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="Advance / Mobilisation">Advance / Mobilisation</option>
            <option value="Milestones">Milestones</option>
            <option value="Monthly">Monthly</option>
            <option value="On Completion">On Completion</option>
            <option value="Other">Other</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={local.currency ?? ""}
            onChange={(e) => setLocal({ ...local, currency: e.target.value })}
          >
            <option value="">Select</option>
            <option value="GHS">GHS</option>
            <option value="USD">USD</option>
            <option value="Other">Other</option>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Special Invoicing Instructions</Label>
        <textarea
          value={local.specialInvoicing ?? ""}
          onChange={(e) =>
            setLocal({ ...local, specialInvoicing: e.target.value })
          }
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSave(local)}>Save & Continue</Button>
      </div>
    </div>
  );
}

function ComplianceStep({
  data,
  onSave,
}: {
  data: ProfileData["compliance"];
  onSave: (d: ProfileData["compliance"]) => void;
}) {
  const [local, setLocal] = useState<ClientComplianceData>(data ?? {});

  const yesNo = (label: string, key: keyof typeof local) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {["Yes", "No", "Unknown", "To be assessed"].map((opt) => (
          <label
            key={opt}
            className={cn(
              "flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm cursor-pointer",
              local[key] === opt
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            )}
          >
            <input
              type="radio"
              name={key}
              checked={local[key] === opt}
              onChange={() => setLocal({ ...local, [key]: opt })}
              className="h-3 w-3"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {yesNo(
        "Is the engagement subject to a formal procurement process?",
        "formalProcurement"
      )}
      {yesNo(
        "Does the client require confidentiality / NDA?",
        "confidentialityRequired"
      )}
      {yesNo(
        "Does the assignment involve personal or sensitive data?",
        "sensitiveData"
      )}
      {yesNo("Potential of conflict of interest identified?", "conflictOfInterest")}

      {local.conflictOfInterest === "Yes" && (
        <div className="space-y-2">
          <Label>If yes, provide details</Label>
          <textarea
            value={local.conflictDetails ?? ""}
            onChange={(e) =>
              setLocal({ ...local, conflictDetails: e.target.value })
            }
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Special regulatory / professional requirements</Label>
        <Input
          value={local.specialRegulatory ?? ""}
          onChange={(e) =>
            setLocal({ ...local, specialRegulatory: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(local)}>Save & Continue</Button>
      </div>
    </div>
  );
}

function AcquisitionStep({
  data,
  onSave,
}: {
  data: ProfileData["acquisition"];
  onSave: (d: ProfileData["acquisition"]) => void;
}) {
  const [local, setLocal] = useState<ClientAcquisitionData>(data ?? {});
  const hearOptions = [
    "Referral",
    "Existing Relationship",
    "Website / Social Media",
    "Event",
    "Tender Portal",
    "Consultant / Franchisee",
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>How did the client hear about Hedge?</Label>
        <CheckboxGroup
          options={hearOptions}
          value={local.howHeardAbout ?? []}
          onChange={(v) => setLocal({ ...local, howHeardAbout: v })}
          otherValue={local.heardOther}
          onOtherChange={(v) => setLocal({ ...local, heardOther: v })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Referred / Introduced By</Label>
          <Input
            value={local.referredBy ?? ""}
            onChange={(e) =>
              setLocal({ ...local, referredBy: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Existing Hedge Client?</Label>
          <Select
            value={local.existingClient ?? ""}
            onChange={(e) =>
              setLocal({ ...local, existingClient: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Relationship Owner at Hedge</Label>
          <Input
            value={local.relationshipOwner ?? ""}
            onChange={(e) =>
              setLocal({ ...local, relationshipOwner: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Lead Consultant / Account Lead</Label>
          <Input
            value={local.leadConsultant ?? ""}
            onChange={(e) =>
              setLocal({ ...local, leadConsultant: e.target.value })
            }
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSave(local)}>Save & Continue</Button>
      </div>
    </div>
  );
}

function DeclarationStep({
  data,
  onSave,
}: {
  data: ProfileData["declaration"];
  onSave: (d: ProfileData["declaration"]) => void;
}) {
  const [local, setLocal] = useState<ClientDeclarationData>(data ?? {});

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
        I confirm that, to the best of my knowledge, the information provided in
        this Client Profile Form is accurate and complete. I understand that
        Hedge Resource Centre Limited may use this information for client
        onboarding, engagement planning, proposal development, contracting,
        service delivery, billing, compliance and relationship management,
        subject to applicable law and confidentiality obligations.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Name of Authorised Representative *</Label>
          <Input
            value={local.authorisedRepresentative ?? ""}
            onChange={(e) =>
              setLocal({ ...local, authorisedRepresentative: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Position / Designation</Label>
          <Input
            value={local.declarationPosition ?? ""}
            onChange={(e) =>
              setLocal({ ...local, declarationPosition: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={local.declarationDate ?? ""}
            onChange={(e) =>
              setLocal({ ...local, declarationDate: e.target.value })
            }
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSave(local)}>Save</Button>
      </div>
    </div>
  );
}

export function ProfileForm({
  profileId,
  initialData,
  completionPct,
  status,
  isReadOnly = false,
}: {
  profileId: string;
  initialData: ProfileData;
  completionPct: number;
  status: string;
  isReadOnly?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updateClientProfileSection,
    { ok: false }
  );
  const [submitPending, setSubmitPending] = useState(false);
  const [submitResult, setSubmitResult] = useState<ActionResult | null>(null);

  const handleSaveSection = (section: string, data: unknown) => {
    const fd = new FormData();
    fd.append("profileId", profileId);
    fd.append("section", section);
    fd.append("data", JSON.stringify(data));
    formAction(fd);
  };

  const handleSaveAndNext = (section: string, data: unknown) => {
    handleSaveSection(section, data);
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleSubmitForReview = async () => {
    setSubmitPending(true);
    const result = await submitProfileForReview(profileId);
    setSubmitResult(result);
    setSubmitPending(false);
  };

  const currentStep = STEPS[step];
  const Icon = currentStep.icon;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Profile completion</span>
          <span className="text-muted-foreground">{completionPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Step navigation */}
      <div className="flex flex-wrap gap-1">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                i === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <StepIcon className="h-3 w-3" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Current step content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            Step {step + 1}: {currentStep.label}
          </CardTitle>
          <CardDescription>
            {step === 0 && "Organisation and industry information"}
            {step === 1 && "Business address details"}
            {step === 2 && "Primary and secondary contact persons"}
            {step === 3 && "Company size, reach, and revenue"}
            {step === 4 && "Services and support needed from HRC"}
            {step === 5 && "Proposed assignment details"}
            {step === 6 && "Scope, deliverables, and success criteria"}
            {step === 7 && "Billing and payment information"}
            {step === 8 && "Compliance and risk information"}
            {step === 9 && "How the client relationship began"}
            {step === 10 && "Confirm accuracy of information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.ok && (
            <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
              Section saved.
            </p>
          )}
          {state.error && (
            <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          {step === 0 && (
            <OrganizationStep
              data={initialData.organization}
              onSave={(d) => handleSaveAndNext("organization", d)}
            />
          )}
          {step === 1 && (
            <AddressStep
              data={initialData.address}
              onSave={(d) => handleSaveAndNext("address", d)}
            />
          )}
          {step === 2 && (
            <ContactsStep
              data={initialData.primaryContact}
              secondary={initialData.secondaryContact}
              onSave={(d) => handleSaveSection("primaryContact", d)}
              onSaveSecondary={(d) => handleSaveAndNext("secondaryContact", d)}
            />
          )}
          {step === 3 && (
            <ScaleStep
              data={initialData.scale}
              onSave={(d) => handleSaveAndNext("scale", d)}
            />
          )}
          {step === 4 && (
            <ServicesStep
              data={initialData.services}
              onSave={(d) => handleSaveAndNext("services", d)}
            />
          )}
          {step === 5 && (
            <EngagementStep
              data={initialData.engagement}
              onSave={(d) => handleSaveAndNext("engagement", d)}
            />
          )}
          {step === 6 && (
            <ScopeStep
              data={initialData.scope}
              onSave={(d) => handleSaveAndNext("scope", d)}
            />
          )}
          {step === 7 && (
            <CommercialStep
              data={initialData.commercial}
              onSave={(d) => handleSaveAndNext("commercial", d)}
            />
          )}
          {step === 8 && (
            <ComplianceStep
              data={initialData.compliance}
              onSave={(d) => handleSaveAndNext("compliance", d)}
            />
          )}
          {step === 9 && (
            <AcquisitionStep
              data={initialData.acquisition}
              onSave={(d) => handleSaveAndNext("acquisition", d)}
            />
          )}
          {step === 10 && (
            <DeclarationStep
              data={initialData.declaration}
              onSave={(d) => handleSaveSection("declaration", d)}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {step < STEPS.length - 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {!isReadOnly && status !== "APPROVED" && (
            <Button
              onClick={handleSubmitForReview}
              disabled={submitPending || status === "PENDING_REVIEW"}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Send className="h-4 w-4" />
              {status === "PENDING_REVIEW"
                ? "Under Review"
                : "Submit for Review"}
            </Button>
          )}
        </div>
      </div>

      {submitResult?.ok && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Profile submitted for review.
        </p>
      )}
      {submitResult?.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitResult.error}
        </p>
      )}
    </div>
  );
}
