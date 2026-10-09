/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Button } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { editActivitySchema, Activity } from "@/schemas/activity";
import { toast } from "react-toastify";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { ASSET_BASE_URL } from "@/lib/utils";
import moment from "moment";

interface EditActivityModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
  selectedDoc: Activity | null;
}

export function EditActivityModal({
  open,
  onClose,
  onRefresh,
  selectedDoc,
}: EditActivityModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && selectedDoc) {
      setTitle(selectedDoc.title || "");
      setContent(selectedDoc.content || "");
      setLocation(selectedDoc.location || "");
      setStartDate(selectedDoc.startDate ? moment(selectedDoc.startDate).format("YYYY-MM-DD") : "");
      setEndDate(selectedDoc.endDate ? moment(selectedDoc.endDate).format("YYYY-MM-DD") : "");
      setCurrentFileName(selectedDoc.actFile || "");
      setFile(null);
      setErrors({});

      if (selectedDoc.actFile) {
        setPreviewUrl(`${ASSET_BASE_URL}/upload/activity/${selectedDoc.actFile}`);
      } else {
        setPreviewUrl("");
      }
    }
  }, [open, selectedDoc]);

  // Handle local file preview if new file selected
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (currentFileName) {
      setPreviewUrl(`${ASSET_BASE_URL}/upload/activity/${currentFileName}`);
    } else {
      setPreviewUrl("");
    }
  }, [file, currentFileName]);

  const handleSubmit = async () => {
    if (!selectedDoc) return;

    const result = editActivitySchema.safeParse({
      title,
      content,
      location,
      startDate,
      endDate,
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
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("location", location);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      if (file) {
        formData.append("actFile", file);
      }

      await axiosInstance.put(`/activities/${selectedDoc.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("ແກ້ໄຂຂໍ້ມູນກິດຈະກຳສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to update activity:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
      setErrors({ apiError: Array.isArray(errMsg) ? errMsg.join(", ") : errMsg });
      toast.error(Array.isArray(errMsg) ? errMsg.join(", ") : errMsg);
    } finally {
      setSaving(false);
    }
  };

  const isImageFile =
    (file && file.type.startsWith("image/")) ||
    (!file && /\.(jpg|jpeg|png|webp|gif)$/i.test(currentFileName));

  const isPdfFile =
    (file && file.type === "application/pdf") ||
    (!file && /\.pdf$/i.test(currentFileName));

  return (
    <Modal open={open} onClose={onClose} title="ແກ້ໄຂກິດຈະກຳ" size="xl">
      <div className="space-y-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {errors.apiError && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
            {errors.apiError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Fields Column */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <Input
                label="ຫົວຂໍ້ກິດຈະກຳ *"
                placeholder="ປ້ອນຫົວຂໍ້ກິດຈະກຳ"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
              />
            </div>

            <div>
              <Textarea
                label="ເນື້ອໃນກິດຈະກຳ *"
                placeholder="ລາຍລະອຽດເນື້ອໃນກິດຈະກຳ..."
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                error={errors.content}
              />
            </div>

            <div>
              <Input
                label="ສະຖານທີ່ *"
                placeholder="ສະຖານທີ່ຈັດກິດຈະກຳ"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={errors.location}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  label="ວັນທີເລີ່ມຕົ້ນ *"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  error={errors.startDate}
                />
              </div>
              <div>
                <Input
                  type="date"
                  label="ວັນທີສິ້ນສຸດ *"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  error={errors.endDate}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
                ໄຟລ໌ຄັດຕິດ (PDF ຫຼື ຮູບພາບ)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="editActFileInput"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="editActFileInput"
                  className="flex items-center justify-between px-4 py-2.5 border rounded-xl text-sm bg-theme-bg border-theme hover:border-brand cursor-pointer transition-colors"
                >
                  <span className="truncate text-slate-600 dark:text-slate-350">
                    {file
                      ? file.name
                      : currentFileName
                        ? `ໄຟລ໌ປັດຈຸບັນ: ${currentFileName}`
                        : "ເລືອກໄຟລ໌ຄັດຕິດ (.jpg, .jpeg, .png)"}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {file && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <Upload className="w-4 h-4 text-slate-400" />
                  </div>
                </label>
              </div>
              <span className="text-[11px] text-slate-400">
                (ຖ້າບໍ່ເລືອກໄຟລ໌ໃໝ່ ລະບົບຈະຮັກສາໄຟລ໌ເກົ່າໄວ້)
              </span>
            </div>
          </div>

          {/* File Preview Column */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-[350px] lg:min-h-0 border-t lg:border-t-0 lg:border-l border-theme pt-6 lg:pt-0 lg:pl-6">
            <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary mb-2 flex items-center gap-1.5">
              <span>ຕົວຢ່າງໄຟລ໌ (Preview)</span>
              {isImageFile && <ImageIcon className="w-3.5 h-3.5 text-blue-500" />}
              {isPdfFile && <FileText className="w-3.5 h-3.5 text-amber-500" />}
            </label>

            {previewUrl ? (
              <div className="flex-1 w-full min-h-[320px] rounded-xl border border-theme bg-slate-50 dark:bg-slate-900 overflow-hidden flex items-center justify-center p-2">
                {isImageFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-[350px] max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <iframe
                    src={`${previewUrl}#toolbar=0`}
                    className="w-full h-full min-h-[350px] rounded-lg"
                    title="Document Preview"
                  />
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-theme rounded-xl p-6 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 min-h-[250px]">
                <FileText className="w-12 h-12 mb-3 text-slate-350" />
                <span className="text-sm font-medium">ບໍ່ມີໄຟລ໌ຄັດຕິດ</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            ຍົກເລີກ
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            ບັນທຶກການປ່ຽນແປງ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
