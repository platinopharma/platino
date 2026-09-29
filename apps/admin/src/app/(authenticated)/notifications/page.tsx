"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Bell, Mail, MessageSquare, Calendar, Users, MapPin, Store, User } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";



const TARGETS = [
  { key: "all", label: "All Users", icon: Users },
  { key: "city", label: "Specific City", icon: MapPin },
  { key: "pharmacy", label: "Specific Pharmacy", icon: Store },
  { key: "customer", label: "Specific Customer", icon: User },
];
const CHANNELS = [
  { key: "push", label: "Push", icon: Bell },
  { key: "email", label: "Email", icon: Mail },
  { key: "sms", label: "SMS", icon: MessageSquare },
];

function Notifications() {
  const [target, setTarget] = useState("all");
  const [channels, setChannels] = useState<string[]>(["push"]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [schedule, setSchedule] = useState(false);

  const send = () => {
    if (!title.trim() || !body.trim()) return toast.error("Title and message are required");
    toast.success(schedule ? "Notification scheduled" : `Broadcast sent via ${channels.join(", ")}`);
    setTitle(""); setBody("");
  };

  return (
    <>
      <PageHeader title="Notifications" subtitle="Broadcast announcements across channels." />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Audience</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TARGETS.map((t) => (
                  <button key={t.key} onClick={() => setTarget(t.key)} className={cn("flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors", target === t.key ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted/50")}>
                    <t.icon className="h-5 w-5" />{t.label}
                  </button>
                ))}
              </div>
              {target !== "all" && <Input className="mt-3" placeholder={`Enter ${target} name or ID…`} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Message</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label className="mb-1.5 block">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" /></div>
              <div><Label className="mb-1.5 block">Body</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Write your message…" /></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Channels</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {CHANNELS.map((c) => {
                const on = channels.includes(c.key);
                return (
                  <button key={c.key} onClick={() => setChannels((p) => on ? p.filter((x) => x !== c.key) : [...p, c.key])} className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-sm transition-colors", on ? "border-primary bg-primary/5" : "hover:bg-muted/50")}>
                    <c.icon className="h-4 w-4" /><span className="flex-1 text-left">{c.label}</span>
                    <span className={cn("h-4 w-4 rounded-full border-2", on ? "border-primary bg-primary" : "border-muted-foreground/40")} />
                  </button>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <button onClick={() => setSchedule((s) => !s)} className="flex w-full items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" /><span className="flex-1 text-left">Schedule for later</span>
                <span className={cn("relative h-5 w-9 rounded-full transition-colors", schedule ? "bg-primary" : "bg-muted")}><span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", schedule ? "left-4" : "left-0.5")} /></span>
              </button>
              {schedule && <Input type="datetime-local" className="mt-3" />}
              <Button className="mt-4 w-full" onClick={send}><Send className="mr-2 h-4 w-4" />{schedule ? "Schedule" : "Send Broadcast"}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default Notifications;
