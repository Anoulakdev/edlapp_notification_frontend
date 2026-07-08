import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Button, Textarea } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { createTurnoffSchema } from "@/schemas/turnoff";
import { toast } from "react-toastify";

interface AddTurnoffModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function AddTurnoffModal({ open, onClose, onRefresh }: AddTurnoffModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl("");
    }
  }, [file]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset fields when modal toggled
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setFile(null);
      setErrors({});
    }
  }, [open]);

  const handleAdd = async () => {
    const result = createTurnoffSchema.safeParse({
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
      // Create Document (multipart/form-data upload)
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

      await axiosInstance.post("/turnoffdocs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("ເພີ່ມເອກະສານແຈ້ງການມອດໄຟສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to add outage document:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
      setErrors({ apiError: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ເພີ່ມເອກະສານແຈ້ງການມອດໄຟ" size="xl">
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
                  ໄຟລ໌ເອກະສານ (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border rounded-xl text-sm bg-theme-bg border-theme focus:outline-none"
                />
                {errors.file && <span className="text-xs text-danger">{errors.file}</span>}
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
          <Button variant="primary" onClick={handleAdd} loading={saving} className="flex-1">
            ບັນທຶກ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
