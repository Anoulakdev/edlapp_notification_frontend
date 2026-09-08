"use client";

import { useState } from "react";
import { Download, X, Share2, PlusSquare, Smartphone, Check, Monitor, Compass } from "lucide-react";
import Image from "next/image";

interface InstallPromptBannerProps {
  onInstall: () => Promise<void>;
  onDismiss: () => void;
  isIOS: boolean;
  hasDeferredPrompt: boolean;
}

export function InstallPromptBanner({
  onInstall,
  onDismiss,
  isIOS,
  hasDeferredPrompt,
}: InstallPromptBannerProps) {
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(true);
      return;
    }
    if (!hasDeferredPrompt) {
      setShowDesktopGuide(true);
      return;
    }
    setInstalling(true);
    try {
      await onInstall();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      {/* Floating Bottom Banner */}
      <div
        className="fixed bottom-5 right-5 left-5 sm:left-auto sm:w-[420px] z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-blue-500/20 dark:border-blue-500/30 p-4 shadow-2xl shadow-blue-900/20">
          {/* Subtle top brand accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />

          <div className="flex items-start gap-3.5">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 p-1.5 shrink-0 flex items-center justify-center shadow-md">
              <Image
                src="/icons/icon-96x96.png"
                alt="EDL Contact Center"
                width={48}
                height={48}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            {/* Information */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  EDL Contact Center
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                ຕິດຕັ້ງແອັບລົງໃນອຸປະກອນ ເພື່ອການເຂົ້າເຖິງທີ່ວ່ອງໄວ ແລະ ຮັບແຈ້ງເຕືອນທັນໃຈ
              </p>

              {/* Action buttons */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-75"
                >
                  {isIOS ? (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>ວິທີຕິດຕັ້ງເທິງ iOS</span>
                    </>
                  ) : (
                    <>
                      <Download className={`w-3.5 h-3.5 ${installing ? "animate-bounce" : ""}`} />
                      <span>{installing ? "ກຳລັງຕິດຕັ້ງ..." : "ຕິດຕັ້ງແອັບ"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onDismiss}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ໄວ້ເທື່ອໜ້າ
                </button>
              </div>
            </div>

            {/* Dismiss X button */}
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Close install prompt"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
        >
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">ວິທີຕິດຕັ້ງເທິງ iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 my-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-0.5 flex items-center gap-1">
                    ກົດປຸ່ມ Share <Share2 className="w-3.5 h-3.5 text-blue-500 inline" />
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    ຢູ່ແຖບເມນູດ້ານລຸ່ມຂອງ Safari browser
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-0.5 flex items-center gap-1">
                    ເລືອກ &quot;Add to Home Screen&quot; <PlusSquare className="w-3.5 h-3.5 text-blue-500 inline" />
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    ເລື່ອນເມນູລົງມາແລ້ວເລືອກ &quot;ເພີ່ມໃສ່ໜ້າຈໍໂຮມ&quot;
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-0.5 flex items-center gap-1">
                    ກົດ &quot;Add&quot; (&quot;ເພີ່ມ&quot;) <Check className="w-3.5 h-3.5 text-emerald-500 inline" />
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    ຢູ່ມຸມຂວາເທິງຂອງໜ້າຈໍ ແອັບຈະປະກົດຂຶ້ນເທິງໜ້າຈໍໂຮມຂອງທ່ານທັນທີ
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIosGuide(false);
                onDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              ເຂົ້າໃຈແລ້ວ
            </button>
          </div>
        </div>
      )}

      {/* Desktop / Browser Installation Guide Modal */}
      {showDesktopGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Monitor className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">ວິທີຕິດຕັ້ງເທິງ Computer / Browser</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDesktopGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 my-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-0.5">
                    Google Chrome / Microsoft Edge
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    ກົດທີ່ໄອຄອນ <strong>Install (ຕິດຕັ້ງແອັບ)</strong> ຢູ່ແຖບ Address Bar ດ້ານຂວາສຸດ ຫຼື ກົດທີ່ເມນູ 3 ຈຸດ (⋮) &gt; ເລືອກ <strong>&quot;Install EDL Contact Center...&quot;</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="p-1.5 rounded-lg bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-0.5">
                    Apple Safari (macOS Sonoma ຂຶ້ນໄປ)
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    ກົດທີ່ເມນູ <strong>File</strong> ຢູ່ Menu bar ດ້ານເທິງ &gt; ເລືອກ <strong>&quot;Add to Dock...&quot;</strong>
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDesktopGuide(false);
                onDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              ເຂົ້າໃຈແລ້ວ
            </button>
          </div>
        </div>
      )}
    </>
  );
}
