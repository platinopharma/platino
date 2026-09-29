'use client';
import Link from 'next/link';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  User,
  MapPin,
  Package,
  Heart,
  Store,
  Star,
  Ticket,
  Wallet,
  Bell,
  Settings,
  ShieldCheck,
  Users,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/stores";
import { useAddresses } from "@/stores/addresses";
import { useLegalAcceptance } from "@/stores/consent";
import { LEGAL_VERSION } from "@/lib/legal-content";
import { AddressManager } from "@/components/addresses/address-manager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useAuth } from "@/stores/auth";
import { useLogoutMutation, useDeactivateAccountMutation } from "@/hooks/useAuthQueries";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { queryKeys } from "@/lib/query-keys";
import { accountService } from "@/services";

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountPageContent />
    </AuthGuard>
  );
}

function formatPlural(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function AccountPageContent() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const logoutMutation = useLogoutMutation();
  const deactivateMutation = useDeactivateAccountMutation();

  const { data: summary, isLoading } = useQuery({
    queryKey: queryKeys.account.summary(),
    queryFn: () => accountService.getSummary(),
    staleTime: 15000,
  });

  const wishProductCount = useWishlist((s) => s.productIds.length);
  const savedPharmacyCount = useWishlist((s) => s.pharmacyIds.length);
  const localAddresses = useAddresses((s) => s.addresses);

  const legalCurrent = useLegalAcceptance((s) => s.isCurrent());
  const acceptedAt = useLegalAcceptance((s) => s.acceptedAt);
  const acceptedVersion = useLegalAcceptance((s) => s.acceptedVersion);
  const accept = useLegalAcceptance((s) => s.accept);

  const [addressOpen, setAddressOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  // Dynamic counts calculations
  const ordersCount = summary?.ordersCount ?? 0;
  const wishCount = wishProductCount;
  const savedPharmaciesCount = savedPharmacyCount;
  const addressesCount = summary?.addressesCount ?? localAddresses.length;

  let addressHint = "0 saved · Add an address";
  if (addressesCount > 0) {
    const defaultLabel = summary?.defaultAddressLabel || localAddresses.find((a) => a.isDefault)?.label || localAddresses[0]?.label || "Home";
    addressHint = `${addressesCount} saved · ${defaultLabel}`;
  }

  const dependentsCount = summary?.dependentsCount ?? 0;
  const activeRemindersCount = summary?.activeMedicationRemindersCount ?? 0;
  const reviewsCount = summary?.reviewsCount ?? 0;
  const availableCouponsCount = summary?.availableCouponsCount ?? 0;
  const unreadNotificationsCount = summary?.unreadNotificationsCount ?? 0;

  const displayName = summary?.user?.name || user?.name || "Customer";
  const displayEmail = summary?.user?.email || user?.email || "No email provided";
  const displayPhone = summary?.user?.phone || user?.phone || "";

  const cards: {
    icon: typeof MapPin;
    title: string;
    hint: string;
    to?: "/orders" | "/wishlist" | "/account" | "/family" | "/medications";
    onClick?: () => void;
  }[] = [
    {
      icon: Bell,
      title: "Medication Reminders",
      hint: formatPlural(activeRemindersCount, "active reminder", "active reminders"),
      to: "/medications",
    },
    {
      icon: Users,
      title: "Family & Dependents",
      hint: dependentsCount === 0 ? "0 profiles" : formatPlural(dependentsCount, "member", "members"),
      to: "/family",
    },
    {
      icon: MapPin,
      title: "Addresses",
      hint: addressHint,
      onClick: () => setAddressOpen(true),
    },
    {
      icon: Package,
      title: "Order history",
      hint: formatPlural(ordersCount, "order", "orders"),
      to: "/orders",
    },
    {
      icon: Heart,
      title: "Wishlist",
      hint: formatPlural(wishCount, "item saved", "items saved"),
      to: "/wishlist",
    },
    {
      icon: Store,
      title: "Saved pharmacies",
      hint: formatPlural(savedPharmaciesCount, "saved", "saved"),
      to: "/wishlist",
    },
    {
      icon: Star,
      title: "Your reviews",
      hint: formatPlural(reviewsCount, "review", "reviews"),
      to: "/account",
    },
    {
      icon: Ticket,
      title: "Coupons & credits",
      hint: formatPlural(availableCouponsCount, "available", "available"),
      to: "/account",
    },
    {
      icon: Wallet,
      title: "Payment methods",
      hint: "UPI, cards",
      to: "/account",
    },
    {
      icon: Bell,
      title: "Notifications",
      hint: unreadNotificationsCount > 0 ? formatPlural(unreadNotificationsCount, "unread", "unread") : "No new updates",
      to: "/account",
    },
    {
      icon: Settings,
      title: "Settings",
      hint: "Preferences & privacy",
      to: "/account",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">Account</span>
      </nav>

      <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border border-border bg-surface-elevated p-5 sm:p-6">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground sm:h-16 sm:w-16">
          <User className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-medium sm:text-2xl">
            Hello, {displayName}
          </h1>
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
            {displayEmail}{displayPhone ? ` · ${displayPhone}` : ""}
          </p>
        </div>
        <button className="col-span-2 h-10 rounded-full border border-border bg-surface-elevated px-4 text-sm font-medium hover:border-primary sm:col-auto sm:col-start-3 sm:row-start-1 sm:justify-self-end">
          Edit profile
        </button>
      </div>

      {legalCurrent ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.05] p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1 text-[13px] leading-relaxed">
            <p className="font-semibold text-foreground">
              You accepted our Terms &amp; Privacy Policy ({acceptedVersion}).
            </p>
            <p className="text-muted-foreground">
              {acceptedAt
                ? `Accepted on ${new Date(acceptedAt).toLocaleDateString()}. `
                : ""}
              You'll be asked to re-accept only if the terms are updated.
            </p>
          </div>
          <Link
            href="/legal"
            className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-primary hover:underline"
          >
            View
          </Link>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-foreground">
                Action required: accept our Terms &amp; Privacy Policy
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                To finish setting up your account, please confirm you agree to the{" "}
                <Link href="/legal/terms" className="font-semibold text-primary hover:underline">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="font-semibold text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                ({LEGAL_VERSION}). You'll need this before placing an order.
              </p>
              <button
                type="button"
                onClick={() => {
                  accept();
                  toast.success("Thanks — your acceptance has been recorded.");
                }}
                className="mt-3 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground hover:opacity-95"
              >
                I accept the Terms &amp; Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const inner = (
            <>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <c.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="font-medium">{c.title}</div>
                {isLoading && c.title !== "Wishlist" && c.title !== "Saved pharmacies" && c.title !== "Payment methods" && c.title !== "Settings" ? (
                  <div className="mt-1 h-3.5 w-20 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                ) : (
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{c.hint}</div>
                )}
              </div>
            </>
          );
          const cls =
            "group flex items-start gap-3 rounded-2xl border border-border bg-surface-elevated p-5 text-left hover:border-primary";
          if (c.onClick) {
            return (
              <button key={c.title} type="button" onClick={c.onClick} className={cls}>
                {inner}
              </button>
            );
          }
          return (
            <Link key={c.title} href={c.to!} className={cls}>
              {inner}
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center sm:justify-start">
        <button
          onClick={() => {
            logoutMutation.mutate(undefined, {
              onSuccess: () => {
                toast.success("Logged out successfully");
                router.push("/login");
              },
              onError: () => {
                toast.error("Failed to log out. Please try again.");
              },
            });
          }}
          disabled={logoutMutation.isPending}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-destructive/30 bg-destructive/[0.06] px-6 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Log out"}
        </button>
      </div>

      <div className="mt-6 flex justify-center sm:justify-start">
        <button
          type="button"
          onClick={() => setDeactivateOpen(true)}
          disabled={deactivateMutation.isPending}
          className="inline-flex h-9 items-center gap-2 px-4 text-xs font-medium text-destructive transition-colors hover:underline disabled:opacity-50"
        >
          Deactivate Account
        </button>
      </div>

      <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your addresses</DialogTitle>
            <DialogDescription>
              Add, edit, or set a default delivery address for future orders.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <AddressManager />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-destructive">Deactivate your account?</DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your account will be deactivated and you will be signed out. Your account data and order history may be retained where required for legal and operational compliance.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setDeactivateOpen(false)}
              disabled={deactivateMutation.isPending}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-surface-elevated px-5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deactivateMutation.isPending}
              onClick={() => {
                deactivateMutation.mutate(undefined, {
                  onSuccess: () => {
                    toast.success("Your account has been deactivated.");
                    setDeactivateOpen(false);
                    router.push("/login");
                  },
                  onError: (err: any) => {
                    const msg =
                      err?.response?.data?.detail ||
                      err?.response?.data?.message ||
                      err?.response?.data?.error ||
                      err?.message ||
                      "Unable to deactivate your account. Please try again.";
                    toast.error(msg);
                  },
                });
              }}
              className="inline-flex h-10 items-center justify-center rounded-full bg-destructive px-5 text-xs font-bold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
            >
              {deactivateMutation.isPending ? "Deactivating..." : "Deactivate Account"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
