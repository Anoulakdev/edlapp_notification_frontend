import { Suspense } from "react";
import SyncDataView from "@/components/syncdata/SyncDataView";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Sync ຂໍ້ມູນ",
};

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgb(var(--brand))" }} />
    </div>
  );
}

export default function SyncDataPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SyncDataView />
    </Suspense>
  );
}
