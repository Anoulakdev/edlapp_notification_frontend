import { Suspense } from "react";
import FcmTokenView from "@/components/fcmtoken/FcmTokenView";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "FCM Token ຜູ້ໃຊ້ງານ",
};

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgb(var(--brand))" }} />
    </div>
  );
}

export default function FcmTokenPage() {
  return (
    <Suspense fallback={<Loading />}>
      <FcmTokenView />
    </Suspense>
  );
}
