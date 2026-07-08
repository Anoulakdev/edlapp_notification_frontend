"use client";

import { useState } from "react";
import {
  CheckCircle2, AlertCircle, Info, AlertTriangle, ArrowRight, Mail, Settings,
  Heart, Share2, Trash2, MoreVertical, Check, CloudUpload, ArrowUpRight,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Play, Image as ImageIcon,
  Link as LinkIcon, X, Search, User, Star, CreditCard
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Button, Badge, Alert, Progress, Spinner, Pagination, Avatar } from "@/components/ui/FormElements";

export function UIElementsView() {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('profile');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);

  const simulateLoading = (id: string) => {
    setLoadingMap(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setLoadingMap((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8 space-y-12 pb-24">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>
          UI Elements
        </h1>
        <p style={{ color: "rgb(var(--text-secondary))" }}>
          A comprehensive curated collection of beautiful, reusable components designed for your application.
        </p>
      </div>

      {/* 1. Buttons & Button Groups */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>Buttons & Button Groups</h2>
          <p className="text-sm mb-6" style={{ color: "rgb(var(--text-secondary))" }}>Interactive elements that trigger actions.</p>
        </div>

        <div className="p-8 rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] hover-card-effect" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Primary Buttons */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Primary</h3>
              <div className="flex flex-col gap-3">
                <Button variant="primary">
                  Primary Button
                </Button>
                <Button
                  variant="primary"
                  onClick={() => simulateLoading('btn-1')}
                  disabled={loadingMap['btn-1']}
                  loading={loadingMap['btn-1']}
                >
                  {!loadingMap['btn-1'] && <Mail className="w-4 h-4" />}
                  {loadingMap['btn-1'] ? 'Processing...' : 'With Icon'}
                </Button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Secondary</h3>
              <div className="flex flex-col gap-3">
                <Button variant="secondary">
                  Secondary Button
                </Button>
                <Button variant="secondary">
                  <Settings className="w-4 h-4 opacity-70" /> Settings
                </Button>
              </div>
            </div>

            {/* Ghost Buttons */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Ghost/Soft</h3>
              <div className="flex flex-col gap-3">
                <Button variant="ghost">
                  Soft Button
                </Button>
                <Button variant="ghost" className="group border-transparent hover:border-transparent">
                  Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>

            {/* Danger Buttons */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Danger</h3>
              <div className="flex flex-col gap-3">
                <Button variant="danger">
                  Destructive Action
                </Button>
                <button className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "rgba(var(--danger), 0.1)", color: "rgb(var(--danger))" }}>
                  Soft Danger
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Icon Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button variant="secondary" size="icon">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Button Group</h3>
                <div className="inline-flex rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: "rgb(var(--border))" }}>
                  <button className="px-4 py-2.5 text-sm font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5 border-r" style={{ background: "rgb(var(--card))", color: "rgb(var(--text-primary))", borderColor: "rgb(var(--border))" }}>
                    Daily
                  </button>
                  <button className="px-4 py-2.5 text-sm font-medium transition-all" style={{ background: "rgba(var(--brand), 0.1)", color: "rgb(var(--brand))" }}>
                    Weekly
                  </button>
                  <button className="px-4 py-2.5 text-sm font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5 border-l" style={{ background: "rgb(var(--card))", color: "rgb(var(--text-primary))", borderColor: "rgb(var(--border))" }}>
                    Monthly
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Links & Typography */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>Links & Typography</h2>
          <p className="text-sm mb-6" style={{ color: "rgb(var(--text-secondary))" }}>Text formatting and navigational elements.</p>
        </div>

        <div className="p-8 rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] hover-card-effect" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
          <div className="flex flex-wrap gap-8 items-center">
            <Link href="#" className="text-sm font-semibold hover:underline" style={{ color: "rgb(var(--brand))" }}>
              Primary Link
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline" style={{ color: "rgb(var(--text-primary))" }}>
              Neutral Link
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline flex items-center gap-1" style={{ color: "rgb(var(--text-secondary))" }}>
              <LinkIcon className="w-3 h-3" /> With Icon
            </Link>
            <Link href="#" className="text-sm font-medium inline-flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: "rgb(var(--brand))" }}>
              External Link <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Badges, Tags & Ribbons */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>Badges, Tags & Ribbons</h2>
          <p className="text-sm mb-6" style={{ color: "rgb(var(--text-secondary))" }}>Visual indicators for statuses and attributes.</p>
        </div>

        <div className="p-8 rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] hover-card-effect" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Soft Badges */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Soft Badges</h3>
              <div className="flex flex-wrap gap-3">
                <Badge color="primary">Primary</Badge>
                <Badge color="success">Completed</Badge>
                <Badge color="warning">Pending</Badge>
                <Badge color="danger">Failed</Badge>
              </div>
            </div>

            {/* Solid Badges */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Solid Badges</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="solid" color="primary">Admin</Badge>
                <Badge variant="solid" color="success">New</Badge>
                <Badge variant="solid" color="warning">Beta</Badge>
                <Badge variant="solid" color="secondary">Draft</Badge>
              </div>
            </div>

            {/* Ribbons */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Ribbons</h3>
              <div className="relative overflow-hidden w-full h-24 rounded-xl border flex items-center justify-center" style={{ background: "rgb(var(--bg))", borderColor: "rgb(var(--border))" }}>
                <div className="absolute top-4 -right-10 w-36 text-center py-1 text-xs font-bold text-white shadow-sm rotate-45" style={{ background: "rgb(var(--danger))" }}>
                  HOT SALE
                </div>
                <span className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Product Card</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Alerts, Notifications & Toasts */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>Alerts & Notifications</h2>
          <p className="text-sm mb-6" style={{ color: "rgb(var(--text-secondary))" }}>Feedback components for communicating success, failure or warnings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alerts */}
          <div className="space-y-4">
            <Alert variant="info" title="Information Update">
              This feature has been updated. Please check the documentation.
            </Alert>
            <Alert variant="danger" title="Connection Error">
              Failed to connect to the server. Please try again later.
            </Alert>
            <Alert variant="success" title="Success">
              Your changes have been saved successfully.
            </Alert>
            <Alert variant="warning" title="Storage Warning">
              You are running out of storage space.
            </Alert>
          </div>

          {/* Toast / Notification */}
          <div className="space-y-4 relative flex flex-col items-center justify-center">
            <div className="flex items-center w-full max-w-sm p-4 space-x-3 rounded-2xl shadow-lg border" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
              <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg" style={{ background: "rgba(var(--success), 0.1)", color: "rgb(var(--success))" }}>
                <Check className="w-4 h-4" />
              </div>
              <div className="ml-3 text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>File successfully uploaded.</div>
              <button type="button" className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5 transition-all" style={{ color: "rgb(var(--text-secondary))" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center w-full max-w-sm p-4 space-x-3 rounded-2xl shadow-lg border" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
              <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg" style={{ background: "rgba(var(--warning), 0.1)", color: "rgb(var(--warning))" }}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="ml-3 text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Disk space running low.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Spinners & Progress Bars */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>Spinners & Progress</h2>
          <p className="text-sm mb-6" style={{ color: "rgb(var(--text-secondary))" }}>Visual indicators for loading tasks and limits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] hover-card-effect" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
          {/* Spinners */}
          <div>
            <h3 className="text-sm font-semibold mb-6 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Loading Spinners</h3>
            <div className="flex items-center gap-6">
              <Spinner size="sm" color="primary" />
              <Spinner size="md" color="primary" />
              <Spinner size="lg" color="primary" />
              <Spinner variant="dots" size="md" color="primary" />
            </div>
          </div>

          {/* Progress Bars */}
          <div>
            <h3 className="text-sm font-semibold mb-6 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Progress Bars</h3>
            <div className="space-y-5">
              <Progress value={45} label="Server Load" color="primary" />
              <Progress value={90} label="Storage Limit" color="danger" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Tabs, Dropdowns, Pagination, Popovers */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>Navigation & Overlays</h2>
          <p className="text-sm mb-6" style={{ color: "rgb(var(--text-secondary))" }}>Components designed to manipulate view states and navigate content.</p>
        </div>

        <div className="p-8 rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] hover-card-effect" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Tabs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Tabs</h3>
              <div className="border-b" style={{ borderColor: "rgb(var(--border))" }}>
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                  <li className="mr-2">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`inline-flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeTab === 'profile' ? 'border-b-2' : 'hover:border-b-2'}`}
                      style={{
                        color: activeTab === 'profile' ? "rgb(var(--brand))" : "rgb(var(--text-secondary))",
                        borderColor: activeTab === 'profile' ? "rgb(var(--brand))" : "transparent"
                      }}
                    >
                      <User className="w-4 h-4" /> Profile
                    </button>
                  </li>
                  <li className="mr-2">
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`inline-flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeTab === 'settings' ? 'border-b-2' : 'hover:border-b-2'}`}
                      style={{
                        color: activeTab === 'settings' ? "rgb(var(--brand))" : "rgb(var(--text-secondary))",
                        borderColor: activeTab === 'settings' ? "rgb(var(--brand))" : "transparent"
                      }}
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                  </li>
                </ul>
              </div>
              <div className="p-3 text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                {activeTab === 'profile' ? "Profile settings panel content goes here." : "Advanced system settings content goes here."}
              </div>
            </div>

            {/* Dropdown & Popover */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Dropdowns & Popovers</h3>
              <div className="flex gap-6">

                {/* Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="inline-flex justify-center items-center gap-2 w-full rounded-xl border shadow-sm px-4 py-2.5 text-sm font-medium transition-all"
                    style={{ background: "rgb(var(--bg))", borderColor: "rgb(var(--border))", color: "rgb(var(--text-primary))" }}
                  >
                    Options <ChevronDown className="w-4 h-4" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 rounded-xl shadow-lg border z-10" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
                      <div className="py-1">
                        <a href="#" className="block px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all" style={{ color: "rgb(var(--text-primary))" }}>Account settings</a>
                        <a href="#" className="block px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all" style={{ color: "rgb(var(--text-primary))" }}>Support</a>
                        <div className="border-t my-1" style={{ borderColor: "rgb(var(--border))" }}></div>
                        <a href="#" className="block px-4 py-2 text-sm transition-all hover:bg-red-50 dark:hover:bg-red-900/10" style={{ color: "rgb(var(--danger))" }}>Delete</a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Popover static display */}
                <div className="relative group">
                  <Button variant="primary" className="w-full">
                    Hover Me (Popover)
                  </Button>
                  <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute z-10 w-64 text-sm border rounded-xl shadow-xl top-14 left-0 transition-all duration-200" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
                    <div className="px-4 py-3 border-b rounded-t-xl" style={{ background: "rgb(var(--bg))", borderColor: "rgb(var(--border))" }}>
                      <h3 className="font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Popover Header</h3>
                    </div>
                    <div className="px-4 py-3" style={{ color: "rgb(var(--text-secondary))" }}>
                      <p>And here&apos;s some amazing content. It&apos;s very engaging. Right?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="space-y-4 md:col-span-2 mt-4 pt-8 border-t" style={{ borderColor: "rgb(var(--border))" }}>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Pagination</h3>
              <Pagination
                currentPage={currentPage}
                totalPages={5}
                onPageChange={setCurrentPage}
              />
            </div>

          </div>
        </div>
      </section>

      {/* 7. Modals & Lists */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>Content Structures</h2>
          <p className="text-sm mb-6" style={{ color: "rgb(var(--text-secondary))" }}>Lists and static modal dialogs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Static Modal */}
          <div className="rounded-2xl border flex flex-col pt-2 shadow-2xl relative overflow-hidden" style={{ background: "rgb(var(--card))", border: "1px solid rgba(100,100,100,0.2)" }}>
            <div className="absolute top-0 left-0 w-full h-2" style={{ background: "rgb(var(--brand))" }}></div>
            <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: "rgb(var(--border))" }}>
              <h3 className="text-lg font-bold" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>Terms of Service</h3>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-all" style={{ color: "rgb(var(--text-secondary))" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>
                Please read and accept our terms before you proceed. This is a static representation of an opened modal dialogue.
              </p>
            </div>
            <div className="flex items-center px-5 py-4 gap-3 justify-end border-t" style={{ background: "rgb(var(--bg))", borderColor: "rgb(var(--border))" }}>
              <Button variant="secondary">
                Decline
              </Button>
              <Button variant="primary">
                I Accept
              </Button>
            </div>
          </div>

          {/* Styled Lists */}
          <div className="p-8 rounded-2xl border flex flex-col justify-center items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] hover-card-effect" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
            <div className="w-full max-w-sm">
              <h3 className="text-sm font-semibold mb-6 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Features List</h3>

              <ul className="space-y-4 w-full">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(var(--brand), 0.1)" }}>
                    <Star className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Premium Features</h4>
                    <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>Access to all tools.</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(var(--brand), 0.1)" }}>
                    <CloudUpload className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Cloud Storage</h4>
                    <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>Up to 100GB of space.</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(var(--brand), 0.1)" }}>
                    <CreditCard className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Secure Payments</h4>
                    <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>Fast and reliable.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Media (Images, Video, Carousel) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>Media & Carousels</h2>
          <p className="text-sm mb-6" style={{ color: "rgb(var(--text-secondary))" }}>Handling images, videos, and galleries.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Images & Video Placeholder */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider pl-2" style={{ color: "rgb(var(--text-secondary))" }}>Images & Videos</h3>
            <div className="relative rounded-3xl overflow-hidden aspect-video shadow-lg group cursor-pointer bg-slate-900">
              <img
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-all duration-500 group-hover:scale-105"
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop"
                alt="Demo Cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white z-10 transition-transform duration-300 group-hover:scale-110 shadow-xl border border-white/30">
                  <Play className="w-6 h-6 ml-1 fill-white" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                <div>
                  <h4 className="text-white font-bold text-lg drop-shadow-md">Retro Setup Tour</h4>
                  <p className="text-white/80 text-xs font-medium">04:20</p>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pl-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Carousel / Slider</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({ left: -260, behavior: 'smooth' });
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full border transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))", color: "rgb(var(--text-primary))" }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({ left: 260, behavior: 'smooth' });
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full border transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))", color: "rgb(var(--text-primary))" }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div ref={carouselRef} className="flex gap-4 overflow-x-auto snap-x scrollbar-thin pb-4 pt-1 px-1" style={{ scrollSnapType: 'x mandatory' }}>
              <div className="shrink-0 w-64 snap-center relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md transition-transform hover:-translate-y-1">
                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop" alt="Code 1" />
              </div>
              <div className="shrink-0 w-64 snap-center relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md transition-transform hover:-translate-y-1">
                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&auto=format&fit=crop" alt="Code 2" />
              </div>
              <div className="shrink-0 w-64 snap-center relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md transition-transform hover:-translate-y-1">
                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop" alt="Code 3" />
              </div>
              <div className="shrink-0 w-64 snap-center relative rounded-2xl overflow-hidden aspect-[4/3] shadow-inner flex flex-col items-center justify-center" style={{ background: "rgb(var(--bg))", border: "2px dashed rgb(var(--border))" }}>
                <ImageIcon className="w-8 h-8 mb-2" style={{ color: "rgb(var(--text-secondary))" }} />
                <span className="text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>Add Image</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 9. Avatars & Existing Tooltip Example */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>Avatars & Tooltips</h2>
          <p className="text-sm mb-6" style={{ color: "rgb(var(--text-secondary))" }}>Representing people and displaying contextual info.</p>
        </div>

        <div className="p-8 rounded-2xl border flex flex-col items-start xl:flex-row gap-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] hover-card-effect" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>

          {/* Avatar Group */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Avatar Group</h3>
            <div className="flex items-center -space-x-4">
              <Avatar initials="A" color="primary" className="w-12 h-12 border-4 hover:-translate-y-2 transition-transform cursor-pointer" />
              <Avatar initials="B" color="success" className="w-12 h-12 border-4 hover:-translate-y-2 transition-transform cursor-pointer" />
              <Avatar initials="C" color="warning" className="w-12 h-12 border-4 hover:-translate-y-2 transition-transform cursor-pointer" />
              <Avatar initials="D" color="danger" className="w-12 h-12 border-4 hover:-translate-y-2 transition-transform cursor-pointer" />
              <Avatar initials="+3" color="secondary" className="w-12 h-12 border-4 hover:-translate-y-2 transition-transform cursor-pointer" />
            </div>
          </div>

          <div className="w-px h-16 bg-gray-200 dark:bg-gray-800 hidden xl:block self-center mx-4"></div>

          {/* Tooltips Explicit */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>Action Tooltips</h3>
            <div className="flex gap-4">
              <div className="relative group">
                <button className="w-12 h-12 rounded-xl flex items-center justify-center border hover:shadow-md transition-all" style={{ background: "rgb(var(--bg))", borderColor: "rgb(var(--border))", color: "rgb(var(--text-primary))" }}>
                  <Share2 className="w-5 h-5" />
                </button>
                <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs text-white font-medium bg-gray-900 shadow-xl transition-all z-20">
                  Share Item
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-gray-900"></div>
                </div>
              </div>

              <div className="relative group">
                <button className="w-12 h-12 rounded-xl flex items-center justify-center border hover:shadow-md transition-all" style={{ background: "rgb(var(--bg))", borderColor: "rgb(var(--border))", color: "rgb(var(--text-primary))" }}>
                  <Heart className="w-5 h-5 fill-rose-500 stroke-rose-500" />
                </button>
                <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs text-white font-medium bg-gray-900 flex items-center gap-1 shadow-xl transition-all z-20">
                  Favorites <span className="opacity-50 ml-1">⌘F</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
