"use client";

import { useState, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  Camera,
  Save,
  RotateCcw,
  CheckCircle,
  Lock,
  Bell,
  CreditCard,
  ChevronDown,
} from "lucide-react";

const InputField = ({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  required,
  hint,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ElementType;
  required?: boolean;
  hint?: string;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
        style={{ color: "rgb(var(--text-secondary))" }}
      >
        {label}
        {required && <span style={{ color: "rgb(var(--danger))" }}> *</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: focused ? "rgb(var(--brand))" : "rgb(var(--text-secondary))" }}
          >
            <Icon className="w-4 h-4 transition-colors" />
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            paddingLeft: Icon ? "2.5rem" : "0.875rem",
            paddingRight: "0.875rem",
            background: "rgb(var(--bg))",
            border: `1px solid ${focused ? "rgb(var(--brand))" : "rgb(var(--border))"}`,
            boxShadow: focused ? "0 0 0 3px rgba(var(--brand), 0.12)" : "none",
            color: "rgb(var(--text-primary))",
          }}
        />
      </div>
      {hint && (
        <p className="text-xs mt-1" style={{ color: "rgb(var(--text-secondary))" }}>
          {hint}
        </p>
      )}
    </div>
  );
};

const SelectField = ({
  label,
  id,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
        style={{ color: "rgb(var(--text-secondary))" }}
      >
        {label}
        {required && <span style={{ color: "rgb(var(--danger))" }}> *</span>}
      </label>
      <div className="relative w-full">
        <select
          id={id}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full pl-3.5 pr-11 py-2.5 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer"
          style={{
            background: "rgb(var(--bg))",
            border: `1px solid ${focused ? "rgb(var(--brand))" : "rgb(var(--border))"}`,
            boxShadow: focused ? "0 0 0 3px rgba(var(--brand), 0.12)" : "none",
            color: "rgb(var(--text-primary))",
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-theme-secondary">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

const ToggleRow = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <div
    className="flex items-center justify-between py-3.5 border-b last:border-b-0"
    style={{ borderColor: "rgb(var(--border))" }}
  >
    <div>
      <p className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
        {label}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-secondary))" }}>
        {description}
      </p>
    </div>
    <label className="relative inline-block w-10 h-6 shrink-0 ml-4 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="opacity-0 w-0 h-0 absolute"
      />
      <span
        className="absolute inset-0 rounded-full transition-all duration-200"
        style={{
          background: checked ? "rgb(var(--brand))" : "rgb(var(--border))",
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
          style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
        />
      </span>
    </label>
  </div>
);

const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div
    className="rounded-2xl border overflow-hidden"
    style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
  >
    <div
      className="px-6 py-4 border-b flex items-center gap-3"
      style={{ borderColor: "rgb(var(--border))" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(var(--brand), 0.12)" }}
      >
        <Icon className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
      </div>
      <div>
        <h2 className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function FormLayoutView() {
  const [saved, setSaved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prevPhotoRef = useRef<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (prevPhotoRef.current) {
        URL.revokeObjectURL(prevPhotoRef.current);
      }
      const url = URL.createObjectURL(file);
      prevPhotoRef.current = url;
      setPhotoPreview(url);
    }
  };
  const [form, setForm] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 000-0000",
    bio: "Senior product designer with 8+ years of experience.",
    company: "Acme Corp",
    website: "https://johndoe.com",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 4B",
    city: "New York",
    state: "ny",
    zip: "10001",
    country: "us",
    timezone: "utc-5",
    language: "en",
    currency: "usd",
    emailNotif: true,
    pushNotif: true,
    smsNotif: false,
    weeklyDigest: true,
    securityAlerts: true,
    marketingEmails: false,
  });

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setForm({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 000-0000",
      bio: "Senior product designer with 8+ years of experience.",
      company: "Acme Corp",
      website: "https://johndoe.com",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 4B",
      city: "New York",
      state: "ny",
      zip: "10001",
      country: "us",
      timezone: "utc-5",
      language: "en",
      currency: "usd",
      emailNotif: true,
      pushNotif: true,
      smsNotif: false,
      weeklyDigest: true,
      securityAlerts: true,
      marketingEmails: false,
    });
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            Form Layout
          </h1>
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            Manage your account information and preferences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
            style={{
              background: "transparent",
              borderColor: "rgb(var(--border))",
              color: "rgb(var(--text-secondary))",
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: saved ? "rgb(var(--success))" : "rgb(var(--brand))",
              boxShadow: "0 4px 12px rgba(var(--brand), 0.3)",
            }}
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Profile Info */}
          <SectionCard title="Personal Information" subtitle="Update your name and profile details" icon={User}>
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-6 pb-6 border-b" style={{ borderColor: "rgb(var(--border))" }}>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="relative shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                    style={{ background: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-hover)))" }}
                  >
                    {form.firstName[0]}{form.lastName[0]}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center shadow-md text-white transition-all"
                  style={{ background: "rgb(var(--brand))" }}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  Profile Photo
                </p>
                <p className="text-xs mt-0.5 mb-3" style={{ color: "rgb(var(--text-secondary))" }}>
                  JPG, PNG or GIF · Max 2MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-all"
                  style={{
                    borderColor: "rgb(var(--border))",
                    color: "rgb(var(--text-primary))",
                    background: "rgb(var(--bg))",
                  }}
                >
                  Upload Photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <InputField
                label="First Name"
                id="firstName"
                placeholder="John"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                icon={User}
                required
              />
              <InputField
                label="Last Name"
                id="lastName"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                icon={User}
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="bio"
                className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                style={{
                  background: "rgb(var(--bg))",
                  border: "1px solid rgb(var(--border))",
                  color: "rgb(var(--text-primary))",
                }}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Company"
                id="company"
                placeholder="Acme Corp"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                icon={Building2}
              />
              <InputField
                label="Website"
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                icon={Globe}
              />
            </div>
          </SectionCard>

          {/* Contact Info */}
          <SectionCard title="Contact Information" subtitle="How we can reach you" icon={Mail}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Email Address"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                icon={Mail}
                required
              />
              <InputField
                label="Phone Number"
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                icon={Phone}
              />
            </div>
          </SectionCard>

          {/* Address */}
          <SectionCard title="Address" subtitle="Your billing and shipping address" icon={MapPin}>
            <div className="space-y-4">
              <InputField
                label="Address Line 1"
                id="addressLine1"
                placeholder="123 Main St"
                value={form.addressLine1}
                onChange={(e) => set("addressLine1", e.target.value)}
                icon={MapPin}
                required
              />
              <InputField
                label="Address Line 2"
                id="addressLine2"
                placeholder="Apartment, suite, etc."
                value={form.addressLine2}
                onChange={(e) => set("addressLine2", e.target.value)}
                hint="Optional"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <InputField
                    label="City"
                    id="city"
                    placeholder="New York"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    required
                  />
                </div>
                <SelectField
                  label="State"
                  id="state"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  required
                  options={[
                    { value: "ny", label: "NY" },
                    { value: "ca", label: "CA" },
                    { value: "tx", label: "TX" },
                    { value: "fl", label: "FL" },
                    { value: "wa", label: "WA" },
                  ]}
                />
                <InputField
                  label="ZIP Code"
                  id="zip"
                  placeholder="10001"
                  value={form.zip}
                  onChange={(e) => set("zip", e.target.value)}
                  required
                />
              </div>
              <SelectField
                label="Country"
                id="country"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                required
                options={[
                  { value: "us", label: "🇺🇸 United States" },
                  { value: "gb", label: "🇬🇧 United Kingdom" },
                  { value: "ca", label: "🇨🇦 Canada" },
                  { value: "au", label: "🇦🇺 Australia" },
                  { value: "th", label: "🇹🇭 Thailand" },
                  { value: "sg", label: "🇸🇬 Singapore" },
                ]}
              />
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Notifications */}
          <SectionCard title="Notifications" subtitle="Control what you hear about" icon={Bell}>
            <ToggleRow
              label="Email Notifications"
              description="Receive updates via email"
              checked={form.emailNotif}
              onChange={() => set("emailNotif", !form.emailNotif)}
            />
            <ToggleRow
              label="Push Notifications"
              description="Browser & mobile push alerts"
              checked={form.pushNotif}
              onChange={() => set("pushNotif", !form.pushNotif)}
            />
            <ToggleRow
              label="SMS Notifications"
              description="Text messages for important events"
              checked={form.smsNotif}
              onChange={() => set("smsNotif", !form.smsNotif)}
            />
            <ToggleRow
              label="Weekly Digest"
              description="Summary email every Monday"
              checked={form.weeklyDigest}
              onChange={() => set("weeklyDigest", !form.weeklyDigest)}
            />
            <ToggleRow
              label="Security Alerts"
              description="Login attempts and security events"
              checked={form.securityAlerts}
              onChange={() => set("securityAlerts", !form.securityAlerts)}
            />
            <ToggleRow
              label="Marketing Emails"
              description="Product news and special offers"
              checked={form.marketingEmails}
              onChange={() => set("marketingEmails", !form.marketingEmails)}
            />
          </SectionCard>

          {/* Preferences */}
          <SectionCard title="Preferences" subtitle="Localization and display settings" icon={CreditCard}>
            <div className="space-y-4">
              <SelectField
                label="Language"
                id="language"
                value={form.language}
                onChange={(e) => set("language", e.target.value)}
                options={[
                  { value: "en", label: "English" },
                  { value: "th", label: "Thai" },
                  { value: "fr", label: "French" },
                  { value: "de", label: "German" },
                  { value: "ja", label: "Japanese" },
                ]}
              />
              <SelectField
                label="Timezone"
                id="timezone"
                value={form.timezone}
                onChange={(e) => set("timezone", e.target.value)}
                options={[
                  { value: "utc-8", label: "UTC-8 (PST)" },
                  { value: "utc-5", label: "UTC-5 (EST)" },
                  { value: "utc", label: "UTC" },
                  { value: "utc+1", label: "UTC+1 (CET)" },
                  { value: "utc+7", label: "UTC+7 (ICT)" },
                  { value: "utc+8", label: "UTC+8 (SGT)" },
                ]}
              />
              <SelectField
                label="Currency"
                id="currency"
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                options={[
                  { value: "usd", label: "USD ($)" },
                  { value: "eur", label: "EUR (€)" },
                  { value: "gbp", label: "GBP (£)" },
                  { value: "thb", label: "THB (฿)" },
                  { value: "sgd", label: "SGD (S$)" },
                ]}
              />
            </div>
          </SectionCard>

          {/* Security quick actions */}
          <SectionCard title="Security" subtitle="Manage password and sessions" icon={Lock}>
            <div className="space-y-3">
              {[
                { label: "Change Password", desc: "Update your login password" },
                { label: "Two-Factor Auth", desc: "Add an extra layer of security" },
                { label: "Active Sessions", desc: "Manage logged-in devices" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm transition-all group"
                  style={{
                    background: "rgb(var(--bg))",
                    border: "1px solid rgb(var(--border))",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgb(var(--brand))";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgb(var(--border))";
                  }}
                >
                  <div>
                    <p className="font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                      {item.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-secondary))" }}>
                      {item.desc}
                    </p>
                  </div>
                  <span style={{ color: "rgb(var(--brand))" }} className="text-xs font-semibold shrink-0 ml-3">
                    Manage →
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
