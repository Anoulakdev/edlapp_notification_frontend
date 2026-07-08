"use client";

import { useState, useEffect } from "react";
import { Bell, Lock, Users, Globe, Save, X } from "lucide-react";

const defaultSettings = {
  notifications: true,
  emailAlerts: true,
  marketingEmails: false,
  twoFactorAuth: true,
  publicProfile: true,
  language: "english",
  timezone: "UTC-5",
  theme: "dark",
};

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState("notifications");
  const [settings, setSettings] = useState(defaultSettings);

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const timer = setTimeout(() => setSettings(parsed), 0);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }));
    setHasChanges(true);
  };

  const handleSelect = (key: keyof typeof settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem("admin-settings", JSON.stringify(settings));
    setHasChanges(false);
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Settings
        </h1>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          Configure your workspace and preferences.
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
              {[
                { icon: Bell, label: "Notifications", id: "notifications" },
                { icon: Lock, label: "Security", id: "security" },
                { icon: Users, label: "Privacy", id: "privacy" },
                { icon: Globe, label: "Preferences", id: "preferences" },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                    style={{
                      background: isActive ? "rgba(var(--brand), 0.1)" : "rgb(var(--card))",
                      border: "1px solid rgb(var(--border))",
                      color: isActive ? "rgb(var(--brand))" : "rgb(var(--text-primary))",
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? "rgb(var(--brand))" : "rgb(var(--text-secondary))" }} />
                    {item.label}
                  </button>
                );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Notifications Section */}
          <div
            className="rounded-2xl p-6 border"
            style={{
              background: "rgb(var(--card))",
              borderColor: "rgb(var(--border))",
            }}
          >
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Notifications
            </h2>
            <div className="space-y-4">
              {[
                { key: "notifications", label: "Push Notifications", description: "Receive push notifications" },
                { key: "emailAlerts", label: "Email Alerts", description: "Get notified via email" },
                { key: "marketingEmails", label: "Marketing Emails", description: "Receive marketing updates" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between pb-4 border-b"
                  style={{ borderColor: "rgb(var(--border))" }}
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "rgb(var(--text-primary))" }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgb(var(--text-secondary))" }}
                    >
                      {item.description}
                    </p>
                  </div>
                  <label className="relative inline-block w-10 h-6">
                    <input
                      type="checkbox"
                      checked={settings[item.key as keyof typeof settings] as boolean}
                      onChange={() => handleToggle(item.key as keyof typeof settings)}
                      className="opacity-0 w-0 h-0"
                    />
                    <span
                      className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all"
                      style={{
                        background: (settings[item.key as keyof typeof settings] as boolean) ? "rgb(var(--brand))" : "rgb(var(--bg))",
                        border: "1px solid rgb(var(--border))",
                      }}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all"
                        style={{
                          background: "white",
                          transform: (settings[item.key as keyof typeof settings] as boolean) ? "translateX(16px)" : "translateX(0)",
                        }}
                      />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Security Section */}
          <div
            className="rounded-2xl p-6 border"
            style={{
              background: "rgb(var(--card))",
              borderColor: "rgb(var(--border))",
            }}
          >
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "rgb(var(--text-primary))" }}
                  >
                    Two-Factor Authentication
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    Enable 2FA for extra security
                  </p>
                </div>
                <label className="relative inline-block w-10 h-6">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={() => handleToggle("twoFactorAuth")}
                    className="opacity-0 w-0 h-0"
                  />
                  <span
                    className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all"
                    style={{
                      background: settings.twoFactorAuth ? "rgb(var(--brand))" : "rgb(var(--bg))",
                      border: "1px solid rgb(var(--border))",
                    }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all"
                      style={{
                        background: "white",
                        transform: settings.twoFactorAuth ? "translateX(16px)" : "translateX(0)",
                      }}
                    />
                  </span>
                </label>
              </div>
              <button
                className="w-full px-4 py-3 rounded-xl text-sm font-medium border"
                style={{
                  background: "rgb(var(--bg))",
                  borderColor: "rgb(var(--border))",
                  color: "rgb(var(--text-primary))",
                }}
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div
            className="rounded-2xl p-6 border"
            style={{
              background: "rgb(var(--card))",
              borderColor: "rgb(var(--border))",
            }}
          >
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSelect("language", e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgb(var(--bg))",
                    border: "1px solid rgb(var(--border))",
                    color: "rgb(var(--text-primary))",
                  }}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="thai">Thai</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSelect("timezone", e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgb(var(--bg))",
                    border: "1px solid rgb(var(--border))",
                    color: "rgb(var(--text-primary))",
                  }}
                >
                  <option value="UTC-8">UTC-8 (PST)</option>
                  <option value="UTC-5">UTC-5 (EST)</option>
                  <option value="UTC">UTC</option>
                  <option value="UTC+1">UTC+1 (CET)</option>
                  <option value="UTC+7">UTC+7 (ICT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all"
                style={{ background: "rgb(var(--brand))" }}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setHasChanges(false);
                  setSettings(defaultSettings);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium border"
                style={{
                  background: "transparent",
                  borderColor: "rgb(var(--border))",
                  color: "rgb(var(--text-secondary))",
                }}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
