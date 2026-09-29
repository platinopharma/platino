import { useState } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/axios";
import { SlideOver, Btn, Card, IconBtn, toast } from "@/features/live/ui";
import { z } from "zod";
import { parseOrToast } from "@/lib/validation";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const issueSchema = z.object({
  category: z.enum(["PAYMENT_PAYOUT", "ORDER_DISPATCH", "PRESCRIPTION_COMPLIANCE", "TECHNICAL_BUG", "INVENTORY_SYNC", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  relatedOrderId: z.string().optional(),
});

type IssueForm = z.infer<typeof issueSchema>;

export function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
  const [form, setForm] = useState<IssueForm>({
    category: "OTHER",
    priority: "MEDIUM",
    subject: "",
    description: "",
    relatedOrderId: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parseOrToast(issueSchema, form)) return;

    setLoading(true);
    try {
      const res = await apiPost<{ data: { issueId: string } }>('/v1/merchant/issues', form);
      toast(`Issue reported successfully. Ticket ID: ${res.data.issueId}`, "success");
      setForm({
        category: "OTHER",
        priority: "MEDIUM",
        subject: "",
        description: "",
        relatedOrderId: "",
      });
      onClose();
    } catch (error: any) {
      toast(error.message || "Failed to report issue", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SlideOver open={isOpen} onClose={onClose} title="Report an Issue">
      <div className="flex flex-col flex-1 h-full max-h-full overflow-y-auto p-4 bg-[#05110A] text-zinc-300">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Card className="p-4 bg-[#0A1A10] border-emerald-950/50">
            <h3 className="text-sm font-medium text-emerald-400 mb-4 flex items-center gap-2">
              <AlertCircle size={16} />
              Issue Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full bg-[#05110A] border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-700"
                >
                  <option value="PAYMENT_PAYOUT">Payment & Payout</option>
                  <option value="ORDER_DISPATCH">Order Dispatch</option>
                  <option value="PRESCRIPTION_COMPLIANCE">Prescription Compliance</option>
                  <option value="INVENTORY_SYNC">Inventory Sync</option>
                  <option value="TECHNICAL_BUG">Technical Bug</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                  className="w-full bg-[#05110A] border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-700"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Related Order ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ORD-12345"
                  value={form.relatedOrderId}
                  onChange={(e) => setForm({ ...form, relatedOrderId: e.target.value })}
                  className="w-full bg-[#05110A] border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-700 placeholder-zinc-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Subject *</label>
                <input
                  type="text"
                  placeholder="Brief summary of the issue"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-[#05110A] border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-700 placeholder-zinc-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description *</label>
                <textarea
                  placeholder="Provide as much detail as possible..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#05110A] border border-zinc-800 rounded-md px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:border-emerald-700 placeholder-zinc-700 resize-y"
                  required
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3 mt-4">
            <Btn variant="ghost" onClick={onClose} type="button">
              Cancel
            </Btn>
            <Btn
              variant="solid"
              type="submit"
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-600 text-white min-w-[120px]"
            >
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Submit Issue"}
            </Btn>
          </div>
        </form>
      </div>
    </SlideOver>
  );
}
