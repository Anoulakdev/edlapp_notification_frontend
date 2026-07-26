"use client";

import { useState, useCallback } from "react";
import { ProblemdocManagement } from "@/components/problemdoc/ProblemdocManagement";
import { RepairProblemdocModal } from "@/components/problemdoc/RepairProblemdocModal";
import { ProblemDoc } from "@/schemas/problemdoc";

export function ProblemdocPageClient() {
  const [repairDoc, setRepairDoc] = useState<ProblemDoc | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRepairRequest = useCallback((doc: ProblemDoc) => {
    setRepairDoc(doc);
  }, []);

  const handleRepairClose = useCallback(() => {
    setRepairDoc(null);
  }, []);

  const handleRepairRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <>
      {/* RepairProblemdocModal rendered at this level — sibling of ProblemdocManagement
          so its re-renders are completely isolated from the TanStack table tree */}
      <RepairProblemdocModal
        open={repairDoc !== null}
        onClose={handleRepairClose}
        selectedDoc={repairDoc}
        onRefresh={handleRepairRefresh}
      />

      <ProblemdocManagement
        key={refreshKey}
        onRepairRequest={handleRepairRequest}
      />
    </>
  );
}
