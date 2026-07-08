import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Button, Textarea } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { editTurnoffSchema } from "@/schemas/turnoff";
import { toast } from "react-toastify";

interface EditTurnoffModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: { id: number; title: string } | null;
  onRefresh: () => void;
}

export function EditTurnoffModal({ open, onClose, selectedDoc, onRefresh }: EditTurnoffModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (currentFileName) {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      setPreviewUrl(`${baseUrl}/upload/turnoff/${currentFileName}`);
    } else {
      setPreviewUrl("");
    }
  }, [file, currentFileName]);

  const [loadingDoc, setLoadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load document details on open
  useEffect(() => {
    if (open && selectedDoc) {
      const fetchDocDetails = async () => {
        try {
          setLoadingDoc(true);
          const res = await axiosInstance.get(`/turnoffdocs/${selectedDoc.id}`);
          const doc = res.data;

          setTitle(doc.title || "");
          setDescription(doc.description || "");
          setStartDate(doc.startDate || "");
          setEndDate(doc.endDate || "");
          setStartTime(doc.startTime || "");
          setEndTime(doc.endTime || "");
          setCurrentFileName(doc.turnoffFile || "");
          setFile(null);
          setErrors({});
        } catch (err) {
          console.error("Failed to load turnoff doc details:", err);
          setErrors({ apiError: "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນເອກະສານໄດ້" });
        } finally {
          setLoadingDoc(false);
        }
      };
      fetchDocDetails();
    }
  }, [open, selectedDoc]);

  const handleEdit = async () => {
    if (!selectedDoc) return;

    const result = editTurnoffSchema.safeParse({
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      file,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      // Update Document Details
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("startDate", new Date(startDate).toISOString());
      formData.append("endDate", new Date(endDate).toISOString());
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
      if (file) {
        formData.append("turnoffFile", file);
      }

      await axiosInstance.put(`/turnoffdocs/${selectedDoc.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("ແກ້ໄຂເອກະສານແຈ້ງການມອດໄຟສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to update outage document:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນ";
      setErrors({ apiError: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ແກ້ໄຂເອກະສານແຈ້ງການມອດໄຟ" size="xl">
      {loadingDoc ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
        </div>
      ) : (
        <div className="space-y-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
          {errors.apiError && (
            <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
              {errors.apiError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Fields Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Input
                    label="ຫົວຂໍ້ *"
                    placeholder="ຫົວຂໍ້ແຈ້ງການມອດໄຟ"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={errors.title}
                  />
                </div>


                <div className="col-span-2">
                  <Textarea
                    label="ລາຍລະອຽດ"
                    placeholder="ລາຍລະອຽດເພີ່ມເຕີມ..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Input
                  type="date"
                  label="ວັນທີເລີ່ມຕົ້ນ *"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  error={errors.startDate}
                />

                <Input
                  type="date"
                  label="ວັນທີສິ້ນສຸດ *"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  error={errors.endDate}
                />

                <Input
                  type="time"
                  label="ເວລາເລີ່ມຕົ້ນ *"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  error={errors.startTime}
                />

                <Input
                  type="time"
                  label="ເວລາສິ້ນສຸດ *"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  error={errors.endTime}
                />

                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
                    ໄຟລ໌ເອກະສານ (ປ່ຽນໄຟລ໌ໃໝ່)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border rounded-xl text-sm bg-theme-bg border-theme focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* PDF Preview Column */}
            <div className="lg:col-span-5 flex flex-col h-full min-h-[400px] lg:min-h-0 border-t lg:border-t-0 lg:border-l border-theme pt-6 lg:pt-0 lg:pl-6">
              <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary mb-2">
                ເບິ່ງຕົວຢ່າງເອກະສານ (PDF Preview)
              </label>
              {previewUrl ? (
                <iframe
                  src={`${previewUrl}#toolbar=0`}
                  className="w-full flex-1 min-h-[400px] lg:h-[450px] rounded-xl border border-theme bg-slate-50 dark:bg-slate-900"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-theme rounded-xl p-6 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 min-h-[300px]">
                  <svg
                    className="w-12 h-12 mb-3 text-slate-350"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  <span className="text-sm font-medium">ບໍ່ມີໄຟລ໌ເອກະສານ ຫຼື ຍັງບໍ່ໄດ້ເລືອກໄຟລ໌</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-theme">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              ຍົກເລີກ
            </Button>
            <Button variant="primary" onClick={handleEdit} loading={saving} className="flex-1">
              ອັບເດດ
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
