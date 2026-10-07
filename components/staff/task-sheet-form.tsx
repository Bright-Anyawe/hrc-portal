"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  CloudUpload,
  Copy,
  Keyboard,
  Ban,
  History,
  Layers,
  Zap,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  Handshake,
  IdCard,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Plus,
  Save,
  Send,
  Stethoscope,
  Target,
  Trash2,
} from "lucide-react";
import {
  deleteDraftTaskSheet,
  saveTaskSheet,
  submitTaskSheet,
} from "@/app/actions/task-sheets";
import {
  ACTION_STATUSES,
  CLIENT_RESPONSES,
  COMMERCIAL_IMPLICATIONS,
  DIAGNOSTIC_STATUSES,
  EFFECT_AREAS,
  ESCALATION_TARGETS,
  EVIDENCE_SOURCES,
  INTERACTION_TYPES,
  INTERVENTION_TYPES,
  METHODOLOGY_STAGES,
  PHRASES,
  PRIORITIES,
  QUICK_STEPS,
  RATINGS,
  TASK_STATUSES,
  missingForSubmit,
  stepProgress,
  type TaskSheetData,
} from "@/lib/task-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormAlert } from "@/components/ui/form-alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Identification", sections: "A", icon: IdCard, description: "Client & engagement identification" },
  { label: "Purpose & issue", sections: "B–C", icon: MessageSquare, description: "Why we met and the client's presenting issue" },
  { label: "Evidence", sections: "D", icon: FileSearch, description: "Evidence and information reviewed" },
  { label: "Diagnosis", sections: "E", icon: Stethoscope, description: "Professional analysis — not a repetition of what the client said" },
  { label: "Definition", sections: "F", icon: Target, description: "What precisely needs to be done" },
  { label: "Intervention", sections: "G–H", icon: Lightbulb, description: "Recommendation, intervention and methodology stage" },
  { label: "Actions", sections: "I–J", icon: ListChecks, description: "Agreed action plan, decisions and agreements" },
  { label: "Commitments", sections: "K–L", icon: Handshake, description: "What the client and HRC have each committed to" },
  { label: "Escalation", sections: "M–O", icon: AlertTriangle, description: "Escalation, client feedback and professional notes" },
  { label: "Follow-up", sections: "P–R", icon: CalendarClock, description: "Opportunities, next interaction and task status" },
  { label: "Certification", sections: "S–T", icon: ClipboardCheck, description: "Consultant certification and continuity record" },
];

const textareaClass =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70";

const FormCtx = createContext<{ readOnly: boolean }>({ readOnly: false });

// Adds a phrase to a text value: first phrase replaces empty text, later
// ones go on a new line (or "; " for single-line fields).
function appendPhrase(current: string | undefined, phrase: string, sep = "\n") {
  const text = (current ?? "").trimEnd();
  if (!text) return phrase;
  if (text.split(/\n|; /).some((p) => p.trim() === phrase)) return text;
  return text + sep + phrase;
}

function Chips({
  options,
  onPick,
}: {
  options: readonly string[];
  onPick: (phrase: string) => void;
}) {
  const { readOnly } = useContext(FormCtx);
  if (readOnly) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onPick(opt)}
          className="rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-foreground"
        >
          + {opt}
        </button>
      ))}
    </div>
  );
}

const PEOPLE_LIST = "ts-people";

function isoDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type Shortcut = "today" | "yesterday" | "1w" | "2w" | "eom";
const SHORTCUT_LABEL: Record<Shortcut, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "1w": "+1 week",
  "2w": "+2 weeks",
  eom: "End of month",
};
function shortcutDate(s: Shortcut) {
  const d = new Date();
  if (s === "yesterday") d.setDate(d.getDate() - 1);
  if (s === "1w") d.setDate(d.getDate() + 7);
  if (s === "2w") d.setDate(d.getDate() + 14);
  if (s === "eom") d.setMonth(d.getMonth() + 1, 0);
  return isoDate(d);
}
const PAST_DATES: Shortcut[] = ["today", "yesterday"];
const FUTURE_DATES: Shortcut[] = ["today", "1w", "2w", "eom"];

function DateField({
  value,
  onChange,
  shortcuts = FUTURE_DATES,
  compact = false,
}: {
  value?: string;
  onChange: (v: string) => void;
  shortcuts?: Shortcut[];
  compact?: boolean;
}) {
  const { readOnly } = useContext(FormCtx);
  return (
    <div className="space-y-1.5">
      <Input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      {!readOnly && (
        <div className="flex flex-wrap gap-1">
          {(compact ? shortcuts.filter((s) => s !== "today") : shortcuts).map((s) => {
            const v = shortcutDate(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange(v)}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[11px] transition-colors",
                  value === v ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {SHORTCUT_LABEL[s]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const PILL_TONES: Record<string, string> = {
  "Not Started": "border-slate-300 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  "In Progress": "border-sky-300 bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  Completed: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  Deferred: "border-amber-300 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  Cancelled: "border-red-300 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  Low: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  Medium: "border-amber-300 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  High: "border-red-300 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

// One-tap coloured options (action status, risk likelihood/impact).
function Pills({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? "" : opt)}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all",
            value === opt
              ? cn(PILL_TONES[opt] ?? "border-primary bg-primary/10", "ring-2 ring-offset-1")
              : "border-border text-muted-foreground hover:bg-muted"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

type QuickAction = { label: string; icon?: "copy" | "none"; onClick: () => void; hidden?: boolean };

// "Same as last time" / "None" one-tap buttons shown above a section.
function QuickFill({ actions }: { actions: QuickAction[] }) {
  const { readOnly } = useContext(FormCtx);
  const shown = actions.filter((a) => !a.hidden);
  if (readOnly || shown.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={a.onClick}
          className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
        >
          {a.icon === "none" ? <Ban className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {a.label}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Area({
  value,
  onChange,
  rows = 3,
  placeholder,
  suggestions,
}: {
  value?: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  suggestions?: readonly string[];
}) {
  return (
    <div className="space-y-1.5">
      {suggestions && (
        <Chips options={suggestions} onPick={(p) => onChange(appendPhrase(value, p))} />
      )}
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={textareaClass}
      />
    </div>
  );
}

function Checks({
  options,
  value = [],
  onChange,
  otherValue,
  onOtherChange,
  columns = 2,
}: {
  options: string[];
  value?: string[];
  onChange: (v: string[]) => void;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
  columns?: 2 | 3;
}) {
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);

  return (
    <div className="space-y-2">
      <div className={cn("grid gap-2", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        {options.map((opt) => (
          <label
            key={opt}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
              value.includes(opt) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
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
        <Input
          value={otherValue ?? ""}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Other (specify)..."
        />
      )}
    </div>
  );
}

function Choice({
  options,
  value,
  onChange,
}: {
  options: string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? "" : opt)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed",
            value === opt
              ? "border-primary bg-primary text-primary-foreground"
              : "hover:bg-muted/50"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

type Column<Row> = {
  key: keyof Row & string;
  label: string;
  type?: "text" | "date" | "select" | "pills";
  options?: readonly string[];
  list?: string;
  wide?: boolean;
};

function RowsEditor<Row extends Record<string, string | undefined>>({
  columns,
  rows,
  onChange,
  addLabel,
  minRows = 1,
}: {
  columns: Column<Row>[];
  rows?: Row[];
  onChange: (rows: Row[]) => void;
  addLabel: string;
  minRows?: number;
}) {
  const list: Row[] =
    rows && rows.length >= minRows
      ? rows
      : [...(rows ?? []), ...Array.from({ length: minRows - (rows?.length ?? 0) }, () => ({}) as Row)];

  const setCell = (i: number, key: keyof Row, v: string) =>
    onChange(list.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));

  return (
    <div className="space-y-2">
      {list.map((row, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>#{i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(list.filter((_, idx) => idx !== i))}
              className="inline-flex items-center gap-1 hover:text-destructive"
              aria-label={`Remove row ${i + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((col) => (
              <div key={col.key} className={cn("space-y-1", col.wide && "sm:col-span-2 lg:col-span-3")}>
                <span className="text-xs text-muted-foreground">{col.label}</span>
                {col.type === "pills" ? (
                  <Pills options={col.options ?? []} value={row[col.key]} onChange={(v) => setCell(i, col.key, v)} />
                ) : col.type === "date" ? (
                  <DateField compact value={row[col.key]} onChange={(v) => setCell(i, col.key, v)} />
                ) : col.type === "select" ? (
                  <Select
                    value={row[col.key] ?? ""}
                    onChange={(e) => setCell(i, col.key, e.target.value)}
                  >
                    <option value="">—</option>
                    {col.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    list={col.list}
                    value={row[col.key] ?? ""}
                    onChange={(e) => setCell(i, col.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...list, {} as Row])}
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}

type ObjectSection = {
  [K in keyof TaskSheetData]-?: NonNullable<TaskSheetData[K]> extends unknown[]
    ? never
    : NonNullable<TaskSheetData[K]> extends object
      ? K
      : never;
}[keyof TaskSheetData];

export type TaskSheetReviewInfo = {
  reviewerName?: string;
  reviewedAt?: string;
  comments?: string | null;
};

export function TaskSheetForm({
  sheetId,
  initialData,
  readOnly = false,
  canDelete = false,
  backHref,
  review,
  previous,
}: {
  sheetId: string;
  initialData: TaskSheetData;
  readOnly?: boolean;
  canDelete?: boolean;
  backHref?: string;
  review?: TaskSheetReviewInfo;
  previous?: TaskSheetData | null;
}) {
  const router = useRouter();
  const [data, setData] = useState<TaskSheetData>(initialData);
  const [step, setStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const latest = useRef(data);
  latest.current = data;
  const editVersion = useRef(0);

  // Admin/read-only views always show every section.
  const mode = readOnly ? "full" : (data.meta?.mode ?? "full");
  const visibleSteps = mode === "quick" ? QUICK_STEPS : STEPS.map((_, i) => i);
  const progress = stepProgress(data);
  const doneCount = visibleSteps.filter((i) => progress[i].filled === progress[i].total).length;
  const pos = visibleSteps.indexOf(step);
  const prevStep = pos > 0 ? visibleSteps[pos - 1] : null;
  const nextStep = pos >= 0 && pos < visibleSteps.length - 1 ? visibleSteps[pos + 1] : null;

  // Autosave 1.5s after the last edit. Edits made while a save is in flight
  // bump the version, so that stale result leaves the form dirty and the
  // next timer saves again.
  useEffect(() => {
    if (readOnly || !dirty) return;
    const version = ++editVersion.current;
    const timer = setTimeout(async () => {
      setSaveState("saving");
      const res = await saveTaskSheet(sheetId, JSON.stringify(latest.current));
      if (version !== editVersion.current) return;
      if (res.ok) {
        setDirty(false);
        setSaveState("saved");
      } else {
        setSaveState("error");
        setMessage({ ok: false, text: res.error ?? "Autosave failed." });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [data, dirty, readOnly, sheetId]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function upd<K extends ObjectSection>(key: K, patch: Partial<NonNullable<TaskSheetData[K]>>) {
    setData((d) => ({ ...d, [key]: { ...(d[key] as object), ...patch } }));
    setDirty(true);
  }
  function put<K extends keyof TaskSheetData>(key: K, value: TaskSheetData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }

  const save = () =>
    startTransition(async () => {
      editVersion.current++;
      const res = await saveTaskSheet(sheetId, JSON.stringify(data));
      if (res.ok) {
        setDirty(false);
        setSaveState("saved");
      }
      setMessage(res.ok ? { ok: true, text: "Draft saved." } : { ok: false, text: res.error ?? "Save failed." });
    });

  const goTo = (i: number) => {
    setMessage(null);
    setStep(i);
  };

  const setMode = (m: "quick" | "full") => {
    put("meta", { ...data.meta, mode: m });
    if (m === "quick" && !QUICK_STEPS.includes(step)) setStep(QUICK_STEPS[0]);
  };

  const submit = () => {
    const missing = missingForSubmit(data);
    if (missing.length > 0) {
      setStep(missing[0].step);
      setMessage({ ok: false, text: `Please complete: ${missing.map((m) => m.label).join(", ")}.` });
      return;
    }
    startTransition(async () => {
      editVersion.current++;
      const res = await submitTaskSheet(sheetId, JSON.stringify(data));
      if (res.ok) {
        setDirty(false);
        setMessage({ ok: true, text: "Task sheet submitted for review." });
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error ?? "Submit failed." });
      }
    });
  };

  // Ctrl/Cmd+S saves, Ctrl/Cmd+Enter moves to the next step.
  const keys = useRef({ save, next: () => nextStep !== null && goTo(nextStep) });
  keys.current = { save, next: () => nextStep !== null && goTo(nextStep) };
  useEffect(() => {
    if (readOnly) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        keys.current.save();
      } else if (e.key === "Enter") {
        e.preventDefault();
        keys.current.next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [readOnly]);

  const remove = () => {
    if (!confirm("Delete this draft task sheet? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteDraftTaskSheet(sheetId);
      if (res.ok && backHref) router.push(backHref);
      else setMessage({ ok: false, text: res.error ?? "Delete failed." });
    });
  };

  const id = data.identification ?? {};
  const issue = data.presentingIssue ?? {};
  const ev = data.evidence ?? {};
  const dx = data.diagnosis ?? {};
  const def = data.definition ?? {};
  const iv = data.intervention ?? {};
  const meth = data.methodology ?? {};
  const dec = data.decisions ?? {};
  const cc = data.clientCommitments ?? {};
  const hc = data.consultantCommitments ?? {};
  const esc = data.escalation ?? {};
  const fb = data.feedback ?? {};
  const opp = data.opportunities ?? {};
  const next = data.nextInteraction ?? {};
  const ts = data.taskStatus ?? {};
  const cert = data.certification ?? {};
  const cont = data.continuity ?? {};
  const decisionItems = dec.items && dec.items.length >= 3 ? dec.items : [...(dec.items ?? []), "", "", ""].slice(0, 3);

  const people = [
    ...new Set(
      [id.consultantName, id.leadConsultant, id.contactPerson, cert.consultantName, id.clientName, "Client", "HRC"]
        .map((p) => p?.trim())
        .filter((p): p is string => !!p)
    ),
  ];
  const prev = previous ?? null;

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <FormCtx.Provider value={{ readOnly }}>
    <div className="space-y-6">
      <datalist id={PEOPLE_LIST}>
        {people.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      {!readOnly && data.meta?.carriedFrom && (
        <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-900 dark:border-sky-800/50 dark:bg-sky-900/30 dark:text-sky-100">
          <History className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Carried forward from <strong>{data.meta.carriedFrom}</strong>: evidence, diagnosis, task definition,
            intervention, action plan and commitments. Review and update what changed — no need to retype.
          </span>
        </div>
      )}

      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border p-0.5 text-sm">
            <button
              type="button"
              onClick={() => setMode("quick")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors",
                mode === "quick" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              Quick log
            </button>
            <button
              type="button"
              onClick={() => setMode("full")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors",
                mode === "full" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              Full sheet
            </button>
          </div>
          <span className="text-xs text-muted-foreground">
            {mode === "quick"
              ? "Essentials only (A, B–C, I–J, P–R, S–T). Other sections are kept, just hidden."
              : "All sections A–T."}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {doneCount} of {visibleSteps.length} sections complete
          </span>
          {!readOnly && (
            <span className="flex items-center gap-1">
              {saveState === "saving" || pending ? (
                <>
                  <CloudUpload className="h-3.5 w-3.5 animate-pulse" /> Saving…
                </>
              ) : dirty ? (
                "Unsaved changes"
              ) : saveState === "saved" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> All changes saved
                </>
              ) : saveState === "error" ? (
                <span className="text-destructive">Autosave failed</span>
              ) : null}
            </span>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.round((doneCount / visibleSteps.length) * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {visibleSteps.map((i) => {
          const s = STEPS[i];
          const StepIcon = s.icon;
          const p = progress[i];
          const complete = p.filled === p.total;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => goTo(i)}
              title={`${s.sections}. ${s.label} — ${p.filled}/${p.total} key fields`}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                i === step
                  ? "bg-primary text-primary-foreground"
                  : complete
                    ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {complete ? <Check className="h-3 w-3" /> : <StepIcon className="h-3 w-3" />}
              <span className="hidden sm:inline">{s.label}</span>
              {!complete && p.filled > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-label="partly filled" />
              )}
            </button>
          );
        })}
        {mode === "quick" && (
          <button
            type="button"
            onClick={() => setMode("full")}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-primary hover:underline"
          >
            + {STEPS.length - QUICK_STEPS.length} more sections
          </button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {current.sections}. {current.label}
          </CardTitle>
          <CardDescription>{current.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="mb-4">
              <FormAlert variant={message.ok ? "success" : "error"}>{message.text}</FormAlert>
            </div>
          )}

          <fieldset disabled={readOnly || pending} className="space-y-5">
            {step === 0 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Client / Organisation">
                    <Input value={id.clientName ?? ""} onChange={(e) => upd("identification", { clientName: e.target.value })} />
                  </Field>
                  <Field label="Client ID">
                    <Input value={id.clientCode ?? ""} onChange={(e) => upd("identification", { clientCode: e.target.value })} />
                  </Field>
                  <Field label="Project / Assignment">
                    <Input value={id.project ?? ""} onChange={(e) => upd("identification", { project: e.target.value })} />
                  </Field>
                  <Field label="Project Code">
                    <Input value={id.projectCode ?? ""} onChange={(e) => upd("identification", { projectCode: e.target.value })} />
                  </Field>
                  <Field label="Senior / Principal / Lead Consultant">
                    <Input list={PEOPLE_LIST} value={id.leadConsultant ?? ""} onChange={(e) => upd("identification", { leadConsultant: e.target.value })} />
                  </Field>
                  <Field label="Consultant Completing Task Sheet">
                    <Input list={PEOPLE_LIST} value={id.consultantName ?? ""} onChange={(e) => upd("identification", { consultantName: e.target.value })} />
                  </Field>
                  <Field label="Client Contact Person">
                    <Input value={id.contactPerson ?? ""} onChange={(e) => upd("identification", { contactPerson: e.target.value })} />
                  </Field>
                  <Field label="Contact Person's Position">
                    <Input value={id.contactPosition ?? ""} onChange={(e) => upd("identification", { contactPosition: e.target.value })} />
                  </Field>
                  <Field label="Date of Interaction *">
                    <DateField shortcuts={PAST_DATES} value={id.interactionDate} onChange={(v) => upd("identification", { interactionDate: v })} />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Start Time">
                      <Input type="time" value={id.startTime ?? ""} onChange={(e) => upd("identification", { startTime: e.target.value })} />
                    </Field>
                    <Field label="End Time">
                      <Input type="time" value={id.endTime ?? ""} onChange={(e) => upd("identification", { endTime: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Interaction No.">
                    <Input value={id.interactionNo ?? ""} onChange={(e) => upd("identification", { interactionNo: e.target.value })} />
                  </Field>
                  <Field label="Location / Platform">
                    <Input value={id.location ?? ""} onChange={(e) => upd("identification", { location: e.target.value })} placeholder="e.g. Client office, Accra / Zoom" />
                  </Field>
                </div>
                <Field label="Interaction Type">
                  <Checks
                    columns={3}
                    options={INTERACTION_TYPES}
                    value={id.interactionType}
                    onChange={(v) => upd("identification", { interactionType: v })}
                    otherValue={id.interactionTypeOther}
                    onOtherChange={(v) => upd("identification", { interactionTypeOther: v })}
                  />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Complete a new Task Sheet for every substantive client interaction. Sheets are numbered sequentially under the project.
                </p>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="B. Purpose of this interaction *">
                  <Area suggestions={PHRASES.purpose}
                    value={data.purpose}
                    onChange={(v) => put("purpose", v)}
                    placeholder="State the specific purpose. Avoid vague entries such as 'meeting with client'."
                  />
                </Field>
                <QuickFill
                  actions={[
                    {
                      label: "Same issue as last time",
                      hidden: !prev?.presentingIssue,
                      onClick: () => put("presentingIssue", JSON.parse(JSON.stringify(prev?.presentingIssue ?? {}))),
                    },
                  ]}
                />
                <Field label="C. Client's account of the problem, need, opportunity, concern or request *">
                  <Area suggestions={PHRASES.presentingIssue} rows={4} value={issue.account} onChange={(v) => upd("presentingIssue", { account: v })} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="When did the issue arise?">
                    <Area suggestions={PHRASES.whenArose} rows={2} value={issue.whenArose} onChange={(v) => upd("presentingIssue", { whenArose: v })} />
                  </Field>
                  <Field label="What has changed?">
                    <Area suggestions={PHRASES.whatChanged} rows={2} value={issue.whatChanged} onChange={(v) => upd("presentingIssue", { whatChanged: v })} />
                  </Field>
                </div>
                <Field label="Effect on the organisation">
                  <Checks
                    columns={3}
                    options={EFFECT_AREAS}
                    value={issue.effects}
                    onChange={(v) => upd("presentingIssue", { effects: v })}
                    otherValue={issue.effectsOther}
                    onOtherChange={(v) => upd("presentingIssue", { effectsOther: v })}
                  />
                </Field>
                <Field label="Details">
                  <Area value={issue.effectDetails} onChange={(v) => upd("presentingIssue", { effectDetails: v })} />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="Evidence / information reviewed">
                  <Checks
                    columns={3}
                    options={EVIDENCE_SOURCES}
                    value={ev.sources}
                    onChange={(v) => upd("evidence", { sources: v })}
                    otherValue={ev.sourcesOther}
                    onOtherChange={(v) => upd("evidence", { sourcesOther: v })}
                  />
                </Field>
                <Field label="Key evidence / observations">
                  <Area suggestions={PHRASES.keyObservations} rows={4} value={ev.keyObservations} onChange={(v) => upd("evidence", { keyObservations: v })} />
                </Field>
                <Field label="Documents received">
                  <RowsEditor
                    addLabel="Add document"
                    rows={ev.documents}
                    onChange={(rows) => upd("evidence", { documents: rows })}
                    columns={[
                      { key: "document", label: "Document" },
                      { key: "dateVersion", label: "Date / Version" },
                      { key: "receivedFrom", label: "Received From", list: PEOPLE_LIST },
                      { key: "followUp", label: "Follow-Up Required" },
                    ]}
                  />
                </Field>
                <Field label="Information still required">
                  <Area suggestions={PHRASES.stillRequired} value={ev.stillRequired} onChange={(v) => upd("evidence", { stillRequired: v })} />
                </Field>
              </>
            )}

            {step === 3 && (
              <>
                <Field label="1. Presenting problem — What appears to be happening?">
                  <Area value={dx.presentingProblem} onChange={(v) => upd("diagnosis", { presentingProblem: v })} />
                </Field>
                <Field label="2. Probable underlying / root cause(s) — Why does it appear to be happening?">
                  <Area suggestions={PHRASES.rootCauses} rows={4} value={dx.rootCauses} onChange={(v) => upd("diagnosis", { rootCauses: v })} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="3. Contributing factors">
                    <Area value={dx.contributingFactors} onChange={(v) => upd("diagnosis", { contributingFactors: v })} />
                  </Field>
                  <Field label="4. Constraints">
                    <Area suggestions={PHRASES.constraints} value={dx.constraints} onChange={(v) => upd("diagnosis", { constraints: v })} />
                  </Field>
                </div>
                <Field label="5. Opportunities identified">
                  <Area suggestions={PHRASES.opportunities} value={dx.opportunities} onChange={(v) => upd("diagnosis", { opportunities: v })} />
                </Field>
                <Field label="6. Risks identified">
                  <RowsEditor
                    addLabel="Add risk"
                    rows={dx.risks}
                    onChange={(rows) => upd("diagnosis", { risks: rows })}
                    columns={[
                      { key: "risk", label: "Risk" },
                      { key: "likelihood", label: "Likelihood", type: "pills", options: RATINGS },
                      { key: "impact", label: "Impact", type: "pills", options: RATINGS },
                      { key: "response", label: "Proposed Response" },
                    ]}
                  />
                </Field>
                <Field label="Diagnostic status">
                  <Checks options={DIAGNOSTIC_STATUSES} value={dx.status} onChange={(v) => upd("diagnosis", { status: v })} />
                </Field>
              </>
            )}

            {step === 4 && (
              <>
                <Field label="Task statement — What precisely needs to be done?">
                  <Area suggestions={PHRASES.taskStatement} rows={4} value={def.taskStatement} onChange={(v) => upd("definition", { taskStatement: v })} />
                </Field>
                <Field label="Desired result">
                  <Area suggestions={PHRASES.desiredResult} value={def.desiredResult} onChange={(v) => upd("definition", { desiredResult: v })} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Scope — Included">
                    <Area value={def.scopeIncluded} onChange={(v) => upd("definition", { scopeIncluded: v })} />
                  </Field>
                  <Field label="Scope — Excluded">
                    <Area value={def.scopeExcluded} onChange={(v) => upd("definition", { scopeExcluded: v })} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Priority">
                    <Choice options={PRIORITIES} value={def.priority} onChange={(v) => upd("definition", { priority: v })} />
                  </Field>
                  <Field label="Target completion date">
                    <DateField value={def.targetDate} onChange={(v) => upd("definition", { targetDate: v })} />
                  </Field>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <Field label="G. Consultant's professional recommendation">
                  <Area suggestions={PHRASES.recommendation} rows={4} value={iv.recommendation} onChange={(v) => upd("intervention", { recommendation: v })} />
                </Field>
                <Field label="Proposed intervention">
                  <Checks
                    columns={3}
                    options={INTERVENTION_TYPES}
                    value={iv.types}
                    onChange={(v) => upd("intervention", { types: v })}
                    otherValue={iv.typesOther}
                    onOtherChange={(v) => upd("intervention", { typesOther: v })}
                  />
                </Field>
                <Field label="Rationale — Why is this intervention appropriate?">
                  <Area suggestions={PHRASES.rationale} value={iv.rationale} onChange={(v) => upd("intervention", { rationale: v })} />
                </Field>
                <Field label="H. Current methodology stage">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {METHODOLOGY_STAGES.map((s, i) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => upd("methodology", { stage: meth.stage === s.id ? "" : s.id })}
                        className={cn(
                          "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                          meth.stage === s.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        )}
                      >
                        <span className="font-medium">
                          {i + 1}. {s.id}
                        </span>
                        <span className="block text-xs text-muted-foreground">{s.hint}</span>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Method / tool used during this interaction">
                  <Area suggestions={PHRASES.methodUsed} value={meth.methodUsed} onChange={(v) => upd("methodology", { methodUsed: v })} />
                </Field>
              </>
            )}

            {step === 6 && (
              <>
                <Field label="I. Agreed action plan">
                  <RowsEditor
                    addLabel="Add action"
                    minRows={3}
                    rows={data.actionPlan}
                    onChange={(rows) => put("actionPlan", rows)}
                    columns={[
                      { key: "action", label: "Action / Task" },
                      { key: "responsible", label: "Responsible Person", list: PEOPLE_LIST },
                      { key: "dueDate", label: "Due Date", type: "date" },
                      { key: "expectedOutput", label: "Expected Output" },
                      { key: "status", label: "Status", type: "pills", options: ACTION_STATUSES, wide: true },
                    ]}
                  />
                </Field>
                <Field label="J. Decisions & agreements reached">
                  <div className="space-y-2">
                    {decisionItems.map((item, i) => (
                      <Input
                        key={i}
                        value={item}
                        placeholder={`${i + 1}.`}
                        onChange={(e) =>
                          upd("decisions", {
                            items: decisionItems.map((d, idx) => (idx === i ? e.target.value : d)),
                          })
                        }
                      />
                    ))}
                  </div>
                </Field>
                <QuickFill
                  actions={[
                    {
                      label: "No scope or commercial changes",
                      icon: "none",
                      onClick: () =>
                        upd("decisions", { scopeChanged: "No", scopeChangeDetails: "", commercialImplication: "None" }),
                    },
                  ]}
                />
                <Field label="Changes to previously agreed scope?">
                  <Choice options={["No", "Yes"]} value={dec.scopeChanged} onChange={(v) => upd("decisions", { scopeChanged: v })} />
                </Field>
                {dec.scopeChanged === "Yes" && (
                  <Field label="If yes, describe the change">
                    <Area value={dec.scopeChangeDetails} onChange={(v) => upd("decisions", { scopeChangeDetails: v })} />
                  </Field>
                )}
                <Field label="Commercial implication">
                  <Choice
                    options={COMMERCIAL_IMPLICATIONS}
                    value={dec.commercialImplication}
                    onChange={(v) => upd("decisions", { commercialImplication: v })}
                  />
                </Field>
              </>
            )}

            {step === 7 && (
              <>
                <h3 className="text-sm font-semibold">K. Client commitments</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Information / documents client must provide">
                    <Area suggestions={PHRASES.clientInformation} value={cc.information} onChange={(v) => upd("clientCommitments", { information: v })} />
                  </Field>
                  <Field label="Client personnel required">
                    <Area suggestions={PHRASES.clientPersonnel} value={cc.personnel} onChange={(v) => upd("clientCommitments", { personnel: v })} />
                  </Field>
                  <Field label="Client approvals required">
                    <Area suggestions={PHRASES.clientApprovals} value={cc.approvals} onChange={(v) => upd("clientCommitments", { approvals: v })} />
                  </Field>
                  <Field label="Other client obligations">
                    <Area value={cc.other} onChange={(v) => upd("clientCommitments", { other: v })} />
                  </Field>
                </div>
                <h3 className="border-t pt-4 text-sm font-semibold">L. Consultant commitments</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Work consultant has agreed to undertake">
                    <Area suggestions={PHRASES.consultantWork} value={hc.work} onChange={(v) => upd("consultantCommitments", { work: v })} />
                  </Field>
                  <Field label="Deliverable(s)">
                    <Area suggestions={PHRASES.deliverables} value={hc.deliverables} onChange={(v) => upd("consultantCommitments", { deliverables: v })} />
                  </Field>
                  <Field label="Responsible consultant(s)">
                    <Input list={PEOPLE_LIST} value={hc.responsible ?? ""} onChange={(e) => upd("consultantCommitments", { responsible: e.target.value })} />
                  </Field>
                  <Field label="Due date">
                    <DateField value={hc.dueDate} onChange={(v) => upd("consultantCommitments", { dueDate: v })} />
                  </Field>
                </div>
              </>
            )}

            {step === 8 && (
              <>
                <QuickFill
                  actions={[
                    {
                      label: "No escalation",
                      icon: "none",
                      onClick: () => put("escalation", { to: ["No"], issue: "", recommendedAction: "" }),
                    },
                    {
                      label: "Same escalation as last time",
                      hidden: !(prev?.escalation?.to ?? []).some((t) => t !== "No"),
                      onClick: () => put("escalation", JSON.parse(JSON.stringify(prev?.escalation ?? {}))),
                    },
                  ]}
                />
                <Field label="M. Issues requiring escalation">
                  <Checks
                    columns={3}
                    options={["No", ...ESCALATION_TARGETS]}
                    value={esc.to}
                    onChange={(v) => upd("escalation", { to: v })}
                  />
                </Field>
                {(esc.to ?? []).some((t) => t !== "No") && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Issue requiring escalation">
                      <Area suggestions={PHRASES.escalationIssue} value={esc.issue} onChange={(v) => upd("escalation", { issue: v })} />
                    </Field>
                    <Field label="Recommended action">
                      <Area value={esc.recommendedAction} onChange={(v) => upd("escalation", { recommendedAction: v })} />
                    </Field>
                    <p className="text-xs text-muted-foreground sm:col-span-2">
                      Administrators are notified of the escalation when this sheet is submitted.
                    </p>
                  </div>
                )}
                <Field label="N. Client feedback / response">
                  <Choice options={CLIENT_RESPONSES} value={fb.response} onChange={(v) => upd("feedback", { response: v })} />
                </Field>
                <Field label="Comments">
                  <Area suggestions={PHRASES.feedbackComments} value={fb.comments} onChange={(v) => upd("feedback", { comments: v })} />
                </Field>
                <Field label="O. Consultant's professional notes">
                  <Area suggestions={PHRASES.professionalNotes}
                    rows={5}
                    value={data.professionalNotes}
                    onChange={(v) => put("professionalNotes", v)}
                    placeholder="Record relevant professional observations objectively. Avoid derogatory, speculative or inappropriate personal comments."
                  />
                </Field>
              </>
            )}

            {step === 9 && (
              <>
                <QuickFill
                  actions={[
                    {
                      label: "Same as last time",
                      hidden: !prev?.opportunities?.additionalNeed,
                      onClick: () => put("opportunities", JSON.parse(JSON.stringify(prev?.opportunities ?? {}))),
                    },
                  ]}
                />
                <Field label="P. Additional client need identified?">
                  <Choice options={["No", "Yes"]} value={opp.additionalNeed} onChange={(v) => upd("opportunities", { additionalNeed: v })} />
                </Field>
                {opp.additionalNeed === "Yes" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Potential opportunity">
                      <Area value={opp.potentialOpportunity} onChange={(v) => upd("opportunities", { potentialOpportunity: v })} />
                    </Field>
                    <Field label="Recommended follow-up">
                      <Area value={opp.recommendedFollowUp} onChange={(v) => upd("opportunities", { recommendedFollowUp: v })} />
                    </Field>
                    <Field label="Relevant Hedge service">
                      <Input value={opp.relevantService ?? ""} onChange={(e) => upd("opportunities", { relevantService: e.target.value })} />
                    </Field>
                    <Field label="Requires separate proposal?">
                      <Choice
                        options={["Yes", "No", "To be assessed"]}
                        value={opp.separateProposal}
                        onChange={(v) => upd("opportunities", { separateProposal: v })}
                      />
                    </Field>
                  </div>
                )}
                <h3 className="border-t pt-4 text-sm font-semibold">Q. Next interaction / follow-up</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Next action">
                    <Chips options={PHRASES.nextAction} onPick={(p) => upd("nextInteraction", { nextAction: appendPhrase(next.nextAction, p, "; ") })} />
                    <Input value={next.nextAction ?? ""} onChange={(e) => upd("nextInteraction", { nextAction: e.target.value })} />
                  </Field>
                  <Field label="Next meeting / interaction date">
                    <DateField value={next.date} onChange={(v) => upd("nextInteraction", { date: v })} />
                  </Field>
                  <Field label="Purpose of next interaction">
                    <Chips options={PHRASES.nextPurpose} onPick={(p) => upd("nextInteraction", { purpose: appendPhrase(next.purpose, p, "; ") })} />
                    <Input value={next.purpose ?? ""} onChange={(e) => upd("nextInteraction", { purpose: e.target.value })} />
                  </Field>
                  <QuickFill
                    actions={[
                      {
                        label: "Same next steps as last time",
                        hidden: !prev?.nextInteraction?.nextAction,
                        onClick: () =>
                          upd("nextInteraction", {
                            nextAction: prev?.nextInteraction?.nextAction,
                            consultantResponsible: prev?.nextInteraction?.consultantResponsible,
                          }),
                      },
                    ]}
                  />
                  <Field label="Consultant responsible">
                    <Input
                      list={PEOPLE_LIST}
                      value={next.consultantResponsible ?? ""}
                      onChange={(e) => upd("nextInteraction", { consultantResponsible: e.target.value })}
                    />
                  </Field>
                </div>
                <QuickFill
                  actions={[
                    {
                      label: "Same status as last time",
                      hidden: !prev?.taskStatus?.statuses?.length,
                      onClick: () => put("taskStatus", JSON.parse(JSON.stringify(prev?.taskStatus ?? {}))),
                    },
                  ]}
                />
                <Field label="R. Task status at end of interaction">
                  <Checks columns={3} options={TASK_STATUSES} value={ts.statuses} onChange={(v) => upd("taskStatus", { statuses: v })} />
                </Field>
                <Field label="Overall completion (%)" className="max-w-40">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={ts.overallCompletion ?? ""}
                    onChange={(e) => upd("taskStatus", { overallCompletion: e.target.value })}
                  />
                </Field>
              </>
            )}

            {step === 10 && (
              <>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm">
                  <input
                    type="checkbox"
                    checked={!!cert.certified}
                    onChange={(e) =>
                      upd("certification", {
                        certified: e.target.checked,
                        date: e.target.checked ? new Date().toISOString().slice(0, 10) : "",
                      })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-gray-300"
                  />
                  <span>
                    I confirm that this Task Sheet represents, to the best of my knowledge, an accurate professional record of the
                    material matters arising from this client interaction. *
                  </span>
                </label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Consultant">
                    <Input list={PEOPLE_LIST} value={cert.consultantName ?? ""} onChange={(e) => upd("certification", { consultantName: e.target.value })} />
                  </Field>
                  <Field label="Signature (type your full name) *">
                    <Input
                      value={cert.signature ?? ""}
                      onChange={(e) => upd("certification", { signature: e.target.value })}
                      placeholder={cert.consultantName || "Full name"}
                      className="font-serif italic"
                    />
                  </Field>
                  <Field label="Date">
                    <DateField shortcuts={["today"]} value={cert.date} onChange={(v) => upd("certification", { date: v })} />
                  </Field>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Principal / Lead Consultant review (completed by reviewer, where required)
                  </p>
                  <dl className="grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-muted-foreground">Reviewed by</dt>
                      <dd className="font-medium">{review?.reviewerName ?? "Pending review"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground">Review comments</dt>
                      <dd className="whitespace-pre-line">{review?.comments || "—"}</dd>
                    </div>
                    <div className="sm:col-span-3">
                      <dt className="text-xs text-muted-foreground">Reviewer signature / date</dt>
                      <dd>
                        {cert.reviewerSignature ? (
                          <>
                            <span className="font-serif italic">{cert.reviewerSignature}</span>
                            {review?.reviewedAt && (
                              <span className="text-muted-foreground">
                                {" "}
                                · {new Date(review.reviewedAt).toLocaleDateString()}
                              </span>
                            )}
                          </>
                        ) : (
                          "—"
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
                <h3 className="border-t pt-4 text-sm font-semibold">T. Continuity record</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Previous Task Sheet No.">
                    <Input value={cont.previousSheetNo ?? ""} onChange={(e) => upd("continuity", { previousSheetNo: e.target.value })} />
                  </Field>
                  <Field label="Current Task Sheet No.">
                    <Input value={cont.currentSheetNo ?? ""} onChange={(e) => upd("continuity", { currentSheetNo: e.target.value })} />
                  </Field>
                  <Field label="Next Task Sheet No.">
                    <Input value={cont.nextSheetNo ?? ""} onChange={(e) => upd("continuity", { nextSheetNo: e.target.value })} />
                  </Field>
                  <Field label="Client File / Project Code">
                    <Input value={cont.clientFile ?? ""} onChange={(e) => upd("continuity", { clientFile: e.target.value })} />
                  </Field>
                </div>
              </>
            )}
          </fieldset>
        </CardContent>
      </Card>

      {!readOnly && (
        <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <Keyboard className="h-3.5 w-3.5" />
          <kbd className="rounded border px-1">Ctrl</kbd>+<kbd className="rounded border px-1">S</kbd> save ·
          <kbd className="rounded border px-1">Ctrl</kbd>+<kbd className="rounded border px-1">Enter</kbd> next step
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="outline" onClick={() => prevStep !== null && goTo(prevStep)} disabled={prevStep === null}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex flex-wrap gap-2">
          {!readOnly && canDelete && (
            <Button type="button" variant="ghost" onClick={remove} disabled={pending}>
              <Trash2 className="h-4 w-4" />
              Delete draft
            </Button>
          )}
          {!readOnly && (
            <Button type="button" variant="outline" onClick={save} loading={pending}>
              <Save className="h-4 w-4" />
              Save draft
            </Button>
          )}
          {nextStep !== null ? (
            <Button type="button" variant="outline" onClick={() => goTo(nextStep)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            !readOnly && (
              <Button
                type="button"
                onClick={submit}
                loading={pending}
                className="bg-emerald-600 from-emerald-600 to-emerald-600 hover:bg-emerald-700"
              >
                <Send className="h-4 w-4" />
                Submit for review
              </Button>
            )
          )}
        </div>
      </div>
    </div>
    </FormCtx.Provider>
  );
}
