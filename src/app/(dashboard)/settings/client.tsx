"use client";

import { useState } from "react";
import {
  User,
  CreditCard,
  Bell,
  Loader2,
  CheckCircle,
  Sun,
  Moon,
  Monitor,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { UserWithSubscription } from "@/types";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "CNY"];

interface SettingsClientProps {
  user: UserWithSubscription;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [tab, setTab] = useState<"profile" | "billing" | "preferences">("profile");
  const [currency, setCurrency] = useState(user.currency);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
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
    { id: "profile",     label: "Profile",     icon: User },
    { id: "billing",     label: "Billing",     icon: CreditCard },
    { id: "preferences", label: "Preferences", icon: Bell },
  ] as const;

  const themeOptions = [
    { value: "dark",  label: "Dark",   icon: Moon,    desc: "Easy on the eyes at night" },
    { value: "light", label: "Light",  icon: Sun,     desc: "Clean and bright interface" },
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
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t.id
                ? "bg-primary/20 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
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
              className={cn(
                "rounded-xl p-4 border",
                isPro ? "border-primary/30 bg-primary/10" : "border-border bg-secondary/30"
              )}
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
                  const res = await fetch("/api/stripe/portal", { method: "POST" });
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
        <div className="space-y-6">
          {/* Appearance */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Appearance</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Choose how Fintrak AI looks on your device
            </p>
            <div className="grid grid-cols-2 gap-3">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all",
                    theme === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40 hover:bg-secondary/50"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    theme === opt.value ? "bg-primary/20" : "bg-secondary"
                  )}>
                    <opt.icon className={cn(
                      "w-4.5 h-4.5",
                      theme === opt.value ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-semibold",
                      theme === opt.value ? "text-primary" : "text-foreground"
                    )}>{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                  {theme === opt.value && (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Currency</h3>
              <p className="text-sm text-muted-foreground">
                Used for displaying all monetary values
              </p>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Display Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveCurrency} disabled={saving} className="w-fit">
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
