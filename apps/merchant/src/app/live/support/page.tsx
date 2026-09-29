"use client";
import { LifeBuoy, Phone, MessageSquare, Book, Bug, ChevronDown, Pencil, Plus, Trash2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Btn, Card, Confirm, IconBtn, PageHeader, SlideOver, toast, Pill } from "@/features/live/ui";
import { emailSchema, parseOrToast, tryAsync } from "@/lib/validation";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/axios";
import { usePharmacyOrders } from "@/hooks/usePharmacyQueries";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, Order, OrderStatus } from "@/features/live/data";
import { SupportChatDrawer } from "@/features/live/ui/SupportChatDrawer";
import { ReportIssueModal } from "@/features/live/ui/ReportIssueModal";

// --------------------------- Types & schemas ---------------------------

const contactSchema = z.object({
  callLabel: z.string().trim().min(1, "Label required").max(60),
  callHours: z.string().trim().min(1, "Hours required").max(80),
  callPhone: z.string().trim().min(5, "Phone required").max(30),
  chatLabel: z.string().trim().min(1, "Label required").max(60),
  chatSubtitle: z.string().trim().min(1, "Subtitle required").max(80),
  kbLabel: z.string().trim().min(1, "Label required").max(60),
  kbSubtitle: z.string().trim().min(1, "Subtitle required").max(80),
  kbUrl: z.string().trim().url("Enter a valid URL").max(500),
  escalationEmail: emailSchema,
});
type Contact = z.infer<typeof contactSchema>;

const faqItemSchema = z.object({
  _id: z.string().optional(),
  q: z.string().trim().min(3, "Question too short").max(200),
  a: z.string().trim().min(3, "Answer too short").max(2000),
  sortOrder: z.number().optional(),
});
type FAQItem = z.infer<typeof faqItemSchema>;

const stateSchema = z.object({
  contact: contactSchema,
});
type SupportState = z.infer<typeof stateSchema>;

// --------------------------- Persistence ---------------------------

const STORAGE_KEY = "platino:support:v2";

const DEFAULTS: SupportState = {
  contact: {
    callLabel: "Call partner support",
    callHours: "Mon–Sun · 8 am to 11 pm",
    callPhone: "+91 80 4718 0100",
    chatLabel: "Chat with an expert",
    chatSubtitle: "Avg response 3 min",
    kbLabel: "Knowledge base",
    kbSubtitle: "120+ guides & playbooks",
    kbUrl: "https://docs.platinopharma.com",
    escalationEmail: "safety@platinopharma.com",
  },
};

function loadState(): SupportState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function saveState(s: SupportState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// --------------------------- Route ---------------------------

export default function SupportPage() {
  const [state, setState] = useState<SupportState>(DEFAULTS);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [editContact, setEditContact] = useState(false);
  const [editEscalation, setEditEscalation] = useState(false);
  const [chatOrderInfo, setChatOrderInfo] = useState<{ id: string; displayId: string; status: OrderStatus } | null>(null);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [faqEditor, setFaqEditor] = useState<{ index: number | null } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showSupportQueue, setShowSupportQueue] = useState(false);
  const [activeSupportOrder, setActiveSupportOrder] = useState<Order & { orderNumber: string } | null>(null);

  const { data: apiData } = usePharmacyOrders(100);
  const activeOrders = (apiData?.orders || []).filter((o) => {
    const s = o.orderStatus?.toUpperCase();
    return s !== 'DELIVERED' && s !== 'CANCELLED' && s !== 'REJECTED';
  });

  const fetchFaqs = async () => {
    try {
      const res = await apiGet<{ data: any[] }>('/v1/merchant/faqs');
      if (res.data) {
        setFaqs(res.data.map(f => ({ _id: f._id, q: f.question, a: f.answer, sortOrder: f.sortOrder })));
      }
    } catch (e) {
      console.error('Failed to load FAQs', e);
    }
  };

  useEffect(() => { 
    setState(loadState()); 
    fetchFaqs();
  }, []);

  function update(next: SupportState, msg: string) {
    setState(next);
    saveState(next);
    toast(msg);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Help"
        title="Support & help centre"
        description="Edit your support details, manage FAQs, and reach the partner success team."
        actions={
          <>
            <Btn size="sm" variant="outline" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="size-3.5" /> Reset
            </Btn>
            <Btn size="sm" onClick={() => setIsReportIssueOpen(true)}>
              <Bug className="size-3.5" /> Report issue
            </Btn>
          </>
        }
      />

      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-subtle">Contact channels</div>
        <Btn size="sm" variant="outline" onClick={() => setEditContact(true)}>
          <Pencil className="size-3.5" /> Edit contact
        </Btn>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-start gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-signal/10 text-signal"><Phone className="size-4" /></div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-ink">{state.contact.callLabel}</div>
              <div className="mt-0.5 text-[12px] text-ink-muted">{state.contact.callHours}</div>
              <a href={`tel:${state.contact.callPhone.replace(/\s+/g, "")}`} className="mt-1 block truncate font-mono text-[12px] text-ink hover:text-brand">
                {state.contact.callPhone}
              </a>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-brand/10 text-brand"><MessageSquare className="size-4" /></div>
            <div>
              <div className="text-[13px] font-medium text-ink">{state.contact.chatLabel}</div>
              <div className="mt-0.5 text-[12px] text-ink-muted">{state.contact.chatSubtitle}</div>
              <Btn size="sm" variant="outline" className="mt-2" onClick={() => setShowSupportQueue(true)}>Start chat</Btn>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-ink/5 text-ink-muted"><Book className="size-4" /></div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-ink">{state.contact.kbLabel}</div>
              <div className="mt-0.5 text-[12px] text-ink-muted">{state.contact.kbSubtitle}</div>
              <Btn size="sm" variant="outline" className="mt-2" onClick={() => {
                window.open(state.contact.kbUrl, "_blank", "noopener,noreferrer");
                toast("Opening knowledge base");
              }}>Browse guides</Btn>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Frequently asked"
        padded={false}
        action={
          <Btn size="sm" variant="outline" onClick={() => setFaqEditor({ index: null })}>
            <Plus className="size-3.5" /> Add FAQ
          </Btn>
        }
      >
        {faqs.length === 0 ? (
          <div className="p-6 text-center text-[12px] text-ink-muted">No FAQs yet — add one to help your team.</div>
        ) : (
          <ul className="divide-y divide-line">
            {faqs.map((f, i) => (
              <li key={f._id || i} className="group">
                <div className="flex items-center gap-2 px-4 py-2">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex flex-1 items-center justify-between gap-3 py-1 text-left"
                  >
                    <span className="text-[13px] text-ink">{f.q}</span>
                    <ChevronDown className={`size-4 shrink-0 text-ink-subtle transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  <div className="flex shrink-0 items-center gap-1 opacity-70 group-hover:opacity-100">
                    <IconBtn title="Edit" onClick={() => setFaqEditor({ index: i })}><Pencil className="size-3.5" /></IconBtn>
                    <IconBtn title="Delete" onClick={() => setConfirmDelete(i)}><Trash2 className="size-3.5" /></IconBtn>
                  </div>
                </div>
                {openFaq === i && <div className="px-4 pb-3 text-[12px] text-ink-muted">{f.a}</div>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 text-[12px] text-ink-muted">
            <LifeBuoy className="size-4 shrink-0 text-ink-subtle" />
            <span>
              Escalations for compliance or drug-safety concerns:{" "}
              <a href={`mailto:${state.contact.escalationEmail}`} className="font-mono text-ink hover:text-brand">
                {state.contact.escalationEmail}
              </a>
            </span>
          </div>
          <Btn size="sm" variant="ghost" onClick={() => setEditEscalation(true)}>
            <Pencil className="size-3.5" /> Change
          </Btn>
        </div>
      </Card>

      <ContactEditor
        open={editContact}
        initial={state.contact}
        onClose={() => setEditContact(false)}
        onSave={(c) => {
          update({ ...state, contact: c }, "Contact details updated");
          setEditContact(false);
        }}
      />

      <EscalationEditor
        open={editEscalation}
        initial={state.contact.escalationEmail}
        onClose={() => setEditEscalation(false)}
        onSave={(email) => {
          update({ ...state, contact: { ...state.contact, escalationEmail: email } }, "Escalation email updated");
          setEditEscalation(false);
        }}
      />

      {faqEditor && (
        <FaqEditor
          open
          initial={faqEditor.index === null ? null : faqs[faqEditor.index]}
          onClose={() => setFaqEditor(null)}
          onSave={async (item) => {
            try {
              if (item._id) {
                await apiPut(`/v1/merchant/faqs/${item._id}`, { question: item.q, answer: item.a });
                toast("FAQ updated");
              } else {
                await apiPost(`/v1/merchant/faqs`, { question: item.q, answer: item.a });
                toast("FAQ added");
              }
              await fetchFaqs();
              setFaqEditor(null);
            } catch (e) {
              toast("Failed to save FAQ", "error");
            }
          }}
        />
      )}

      <Confirm
        open={confirmDelete !== null}
        title="Delete FAQ?"
        message="This FAQ will be removed from your help centre."
        confirmLabel="Delete"
        tone="alert"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete === null) return;
          const faqToDelete = faqs[confirmDelete];
          try {
            if (faqToDelete._id) {
              await apiDelete(`/v1/merchant/faqs/${faqToDelete._id}`);
            }
            toast("FAQ deleted");
            await fetchFaqs();
            if (openFaq === confirmDelete) setOpenFaq(null);
            setConfirmDelete(null);
          } catch (e) {
            toast("Failed to delete FAQ", "error");
          }
        }}
      />

      <Confirm
        open={confirmReset}
        title="Reset support page?"
        message="Contact details and FAQs will be restored to defaults."
        confirmLabel="Reset"
        tone="alert"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          update(DEFAULTS, "Support page reset to defaults");
          setConfirmReset(false);
        }}
      />
      <SlideOver open={showSupportQueue} onClose={() => setShowSupportQueue(false)} title="Select Active Order for Support">
        <div className="space-y-4 p-2">
          {activeOrders.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-8">No active orders available for support chat.</div>
          ) : (
            activeOrders.map((o) => (
              <div 
                key={o.id || o.orderNumber || o._id} 
                onClick={() => {
                  setActiveSupportOrder({
                    id: (o._id as string) || (o.id as string),
                    orderNumber: (o.orderNumber as string) || (o._id as string) || (o.id as string),
                    createdAt: (o.createdAt as string) || '',
                    customer: { name: (o.customerName as string) || '', phone: (o.customerPhone as string) || '' },
                    address: (o.deliveryAddress as string) || '',
                    items: (o.items as any[])?.map((i: any) => ({ name: i.medicineName as string, qty: i.quantity as number, price: i.unitPrice as number, rx: i.rxRequired as boolean })) || [],
                    amount: (o.totalAmount as number) || 0,
                    payment: ((o.paymentMethod as string) || 'cod') as any,
                    paymentStatus: ((o.paymentStatus as string)?.toLowerCase() || 'pending') as any,
                    status: ((o.orderStatus as string)?.toLowerCase() === 'placed' ? 'pending' : (o.orderStatus as string)?.toLowerCase() || 'pending') as any,
                  });
                  setShowSupportQueue(false);
                }}
                className="p-4 rounded-lg border border-[#122B1C] bg-[#030B06] hover:bg-[#07170E] cursor-pointer transition-colors flex justify-between items-center"
              >
                <div>
                </div>
                <Pill tone={ORDER_STATUS_TONE[((o.orderStatus as string)?.toLowerCase() === 'placed' ? 'pending' : (o.orderStatus as string)?.toLowerCase()) as keyof typeof ORDER_STATUS_TONE] || "muted"}>
                  {ORDER_STATUS_LABEL[((o.orderStatus as string)?.toLowerCase() === 'placed' ? 'pending' : (o.orderStatus as string)?.toLowerCase()) as keyof typeof ORDER_STATUS_LABEL] || (o.orderStatus as string)}
                </Pill>
              </div>
            ))
          )}
        </div>
      </SlideOver>

      <SupportChatDrawer 
        open={!!activeSupportOrder} 
        onClose={() => setActiveSupportOrder(null)} 
        order={activeSupportOrder} 
      />

      <ReportIssueModal 
        isOpen={isReportIssueOpen} 
        onClose={() => setIsReportIssueOpen(false)} 
      />
    </div>
  );
}

// --------------------------- Editors ---------------------------

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-subtle">{hint}</span>}
    </label>
  );
}

const inputCls = "block w-full rounded-md border border-line bg-paper px-3 py-2 text-[13px] text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/40";

function ContactEditor({ open, initial, onClose, onSave }: {
  open: boolean; initial: Contact; onClose: () => void; onSave: (c: Contact) => void;
}) {
  const [draft, setDraft] = useState<Contact>(initial);
  useEffect(() => { if (open) setDraft(initial); }, [open, initial]);
  const set = <K extends keyof Contact>(k: K, v: Contact[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <SlideOver open={open} onClose={onClose} title="Edit contact channels">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void tryAsync(() => {
            const clean = parseOrToast(contactSchema, draft);
            if (clean) onSave(clean);
          });
        }}
      >
        <div className="space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">Phone</div>
          <Field label="Label"><input className={inputCls} value={draft.callLabel} onChange={(e) => set("callLabel", e.target.value)} /></Field>
          <Field label="Hours"><input className={inputCls} value={draft.callHours} onChange={(e) => set("callHours", e.target.value)} /></Field>
          <Field label="Phone number" hint="Include country code."><input className={inputCls} value={draft.callPhone} onChange={(e) => set("callPhone", e.target.value)} /></Field>
        </div>
        <div className="space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">Chat</div>
          <Field label="Label"><input className={inputCls} value={draft.chatLabel} onChange={(e) => set("chatLabel", e.target.value)} /></Field>
          <Field label="Subtitle"><input className={inputCls} value={draft.chatSubtitle} onChange={(e) => set("chatSubtitle", e.target.value)} /></Field>
        </div>
        <div className="space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">Knowledge base</div>
          <Field label="Label"><input className={inputCls} value={draft.kbLabel} onChange={(e) => set("kbLabel", e.target.value)} /></Field>
          <Field label="Subtitle"><input className={inputCls} value={draft.kbSubtitle} onChange={(e) => set("kbSubtitle", e.target.value)} /></Field>
          <Field label="URL"><input className={inputCls} value={draft.kbUrl} onChange={(e) => set("kbUrl", e.target.value)} placeholder="https://docs.example.com" /></Field>
        </div>
        <div className="space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">Escalations</div>
          <Field label="Safety / compliance email"><input className={inputCls} value={draft.escalationEmail} onChange={(e) => set("escalationEmail", e.target.value)} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit">Save changes</Btn>
        </div>
      </form>
    </SlideOver>
  );
}

function EscalationEditor({ open, initial, onClose, onSave }: {
  open: boolean; initial: string; onClose: () => void; onSave: (email: string) => void;
}) {
  const [value, setValue] = useState(initial);
  useEffect(() => { if (open) setValue(initial); }, [open, initial]);

  return (
    <SlideOver open={open} onClose={onClose} title="Escalation email" width="max-w-md">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const clean = parseOrToast(emailSchema, value);
          if (clean) onSave(clean);
        }}
      >
        <Field label="Email" hint="Compliance and drug-safety issues will be routed here."><input className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} /></Field>
        <div className="flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit">Save</Btn>
        </div>
      </form>
    </SlideOver>
  );
}

function FaqEditor({ open, initial, onClose, onSave }: {
  open: boolean; initial: FAQItem | null; onClose: () => void; onSave: (item: FAQItem) => void;
}) {
  const [q, setQ] = useState(initial?.q ?? "");
  const [a, setA] = useState(initial?.a ?? "");
  useEffect(() => { setQ(initial?.q ?? ""); setA(initial?.a ?? ""); }, [initial, open]);

  return (
    <SlideOver open={open} onClose={onClose} title={initial ? "Edit FAQ" : "Add FAQ"} width="max-w-lg">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const clean = parseOrToast(faqItemSchema, { q, a });
          if (clean) onSave(clean);
        }}
      >
        <Field label="Question"><input className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} maxLength={200} /></Field>
        <Field label="Answer">
          <textarea
            className={`${inputCls} min-h-[140px] resize-y`}
            value={a}
            onChange={(e) => setA(e.target.value)}
            maxLength={2000}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit">{initial ? "Save" : "Add FAQ"}</Btn>
        </div>
      </form>
    </SlideOver>
  );
}
