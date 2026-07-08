import { TurnoffAssign } from "@/components/turnoffassign/TurnoffAssign";
import { Suspense } from "react";

export default function TurnoffAssignPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">ກຳລັງໂຫຼດ...</span>
        </div>
      }
    >
      <TurnoffAssign />
    </Suspense>
  );
}

export const metadata = {
  title: "ກຳນົດບ້ານແຈ້ງການມອດໄຟ",
};

