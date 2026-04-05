"use client";

import { useState } from "react";
import {
  User,
  CreditCard,
  Shield,
  Bell,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import type { UserWithSubscription } from "@/types";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "CNY"];

interface SettingsClientProps {
  user: UserWithSubscription;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [tab, setTab] = useState<"profile" | "billing" | "preferences">(
    "profile",
  );
  const [currency, setCurrency] = useState(user.currency);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isPro = user.subscription?.plan === "PRO";

  async function saveCurrency() {
    setSaving(true);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency }),
      });
      toast({ title: "Settings saved!" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "preferences", label: "Preferences", icon: Bell },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Tab bar */}
      <div className="glass rounded-xl p-1 flex gap-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-1">Profile Information</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Manage your identity and login details
          </p>
          <UserProfile
            routing="hash"
            appearance={{
              baseTheme: dark,
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-0 p-0",
                navbar: "hidden",
                pageScrollBox: "p-0",
              },
            }}
          />
        </div>
      )}

      {/* Billing tab */}
      {tab === "billing" && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-1">Current Plan</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Your subscription details
            </p>
            <div
              className={`rounded-xl p-4 border ${isPro ? "border-primary/30 bg-primary/10" : "border-border bg-secondary/30"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isPro
                      ? "$9.99/month • Unlimited everything"
                      : "Limited features • Upgrade for full access"}
                  </p>
                </div>
                {isPro ? (
                  <div className="flex items-center gap-2 text-accent text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> Active
                  </div>
                ) : (
                  <Link href="/pricing">
                    <Button size="sm" className="shadow-glow-sm">
                      Upgrade to Pro
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {isPro && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-1">Manage Subscription</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Update payment method, view invoices, or cancel
              </p>
              <Button
                variant="outline"
                onClick={async () => {
                  const res = await fetch("/api/stripe/portal", {
                    method: "POST",
                  });
                  const { url } = await res.json();
                  if (url) window.location.href = url;
                }}
              >
                Open Billing Portal
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Preferences tab */}
      {tab === "preferences" && (
        <div className="glass rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-1">Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Customize your experience
            </p>
          </div>
          <div>
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="mt-1.5 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1.5">
              Used for displaying all monetary values
            </p>
          </div>
          <Button onClick={saveCurrency} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />} Save
            Preferences
          </Button>
        </div>
      )}
    </div>
  );
}
