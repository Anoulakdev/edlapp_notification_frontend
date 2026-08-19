"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Layers,
  LayoutTemplate,
  Box,
  FileText,
  CalendarDays,
  FolderOpen,
  File,
  FileX,
  LogIn,
  UserPlus,
  KeyRound,
  Component,
  CheckSquare,
  AlertCircle,
  CheckCircle,
  Info,
  Shield,
  AlertTriangle,
  Zap,
  MessageSquare,
  History,
  Building2,
  Wrench,
  FolderCog,
  Bot,
  Star,
  CreditCard,
} from "lucide-react";

export type NavChild = {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
};
export type NavItem =
  | { label: string; href: string; icon: React.ElementType; children?: never }
  | {
      label: string;
      href?: never;
      icon: React.ElementType;
      children: NavChild[];
    };

const ROLE_1_NAV_ITEMS: NavItem[] = [
  { label: "ໜ້າຫຼັກ", href: "/dashboard", icon: LayoutDashboard },
  { label: "ຜູ້ໃຊ້ງານ", href: "/users", icon: Users },
  { label: "ສິດຜູ້ໃຊ້ງານ", href: "/role", icon: Shield },
  { label: "ຊ່ອງທາງຮັບແຈ້ງ", href: "/sourcetype", icon: Layers },
  { label: "ສະຖານະບັນຫາ", href: "/problemstatus", icon: AlertTriangle },
  { label: "ສະຖານະຂໍໝໍ້ນັບໄຟ", href: "/meterstatus", icon: Component },
  { label: "sync ຂໍ້ມູນ", href: "/syncdata", icon: Users },
];

const ROLE_2_NAV_ITEMS: NavItem[] = [
  { label: "ຜູ້ໃຊ້ງານ", href: "/users", icon: Users },
  { label: "ແຈ້ງການມອດໄຟ", href: "/turnoff", icon: FileX },
  { label: "ແຈ້ງການມອດໄຟສຸກເສີນ", href: "/emergency", icon: AlertCircle },
  { label: "ແຈ້ງການຕັດໄຟ", href: "/cutpower", icon: Zap },
  { label: "ແຈ້ງບັນຫາ", href: "/problemdoc", icon: FileX },
  { label: "ຂໍໝໍ້ນັບໄຟໃໝ່", href: "/registermeter", icon: FileText },
  { label: "ສົນທະນາ (Chat)", href: "/chat", icon: MessageSquare },
  { label: "ປະຫວັດການສົນທະນາ", href: "/chathistory", icon: History },
  {
    label: "ຈັດການຂໍ້ມູນ",
    icon: FolderCog,
    children: [
      { label: "ສາຂາແຂວງ", href: "/branch", icon: Building2 },
      { label: "ສູນສ້ອມແປງເມືອງ", href: "/repairdistrict", icon: Wrench },
      { label: "ປະເພດບັນຫາ", href: "/problemtype", icon: Layers },
      { label: "ຫົວຂໍ້ການສົນທະນາ", href: "/topic", icon: Layers },
      { label: "ຂໍ້ຄວາມອັດໂນມັດ", href: "/messageauto", icon: Bot },
    ],
  },
  {
    label: "ລາຍງານ",
    icon: BarChart3,
    children: [
      { label: "ລາຍງານແຈ້ງການມອດໄຟ", href: "/turnoffreport", icon: FileX },
      {
        label: "ລາຍງານແຈ້ງການມອດໄຟສຸກເສີນ",
        href: "/emergencyreport",
        icon: AlertCircle,
      },
      {
        label: "ລາຍງານແຈ້ງການຕັດໄຟ",
        href: "/cutpowerreport",
        icon: Zap,
      },
      {
        label: "ລາຍງານການແຈ້ງບັນຫາ",
        href: "/problemreport",
        icon: AlertTriangle,
      },
      {
        label: "ລາຍງານການຂໍໝໍ້ນັບໄຟໃໝ່",
        href: "/registermeterreport",
        icon: FileText,
      },
      {
        label: "ລາຍງານການປະເມິນຄວາມພໍໃຈ",
        href: "/ratingreport",
        icon: Star,
      },
    ],
  },
];

const ROLE_3_NAV_ITEMS: NavItem[] = [
  { label: "ແຈ້ງການມອດໄຟ", href: "/turnoff", icon: FileX },
  { label: "ແຈ້ງການມອດໄຟສຸກເສີນ", href: "/emergency", icon: AlertCircle },
  { label: "ແຈ້ງການຕັດໄຟ", href: "/cutpower", icon: Zap },
  { label: "ຂໍໝໍ້ນັບໄຟໃໝ່", href: "/registermeter", icon: FileText },
  { label: "ແຈ້ງບັນຫາ", href: "/problemdoc", icon: FileX },
  {
    label: "ຈັດການຂໍ້ມູນ",
    icon: FolderCog,
    children: [
      { label: "ສາຂາແຂວງ", href: "/branch", icon: Building2 },
      { label: "ສູນສ້ອມແປງເມືອງ", href: "/repairdistrict", icon: Wrench },
      { label: "ປະເພດບັນຫາ", href: "/problemtype", icon: Layers },
    ],
  },
  {
    label: "ລາຍງານ",
    icon: BarChart3,
    children: [
      { label: "ລາຍງານແຈ້ງການມອດໄຟ", href: "/turnoffreport", icon: FileX },
      {
        label: "ລາຍງານແຈ້ງການມອດໄຟສຸກເສີນ",
        href: "/emergencyreport",
        icon: AlertCircle,
      },
      {
        label: "ລາຍງານແຈ້ງການຕັດໄຟ",
        href: "/cutpowerreport",
        icon: Zap,
      },
      {
        label: "ລາຍງານການແຈ້ງບັນຫາ",
        href: "/problemreport",
        icon: AlertTriangle,
      },
      {
        label: "ລາຍງານການຂໍໝໍ້ນັບໄຟໃໝ່",
        href: "/registermeterreport",
        icon: FileText,
      },
    ],
  },
];

const ROLE_4_NAV_ITEMS: NavItem[] = [
  { label: "ແຈ້ງການມອດໄຟ", href: "/turnoff", icon: FileX },
  { label: "ແຈ້ງການມອດໄຟສຸກເສີນ", href: "/emergency", icon: AlertCircle },
  { label: "ແຈ້ງການຕັດໄຟ", href: "/cutpower", icon: Zap },
  { label: "ແຈ້ງບັນຫາ", href: "/problemdoc", icon: FileX },
  { label: "ຂໍໝໍ້ນັບໄຟໃໝ່", href: "/registermeter", icon: FileText },
  { label: "ສົນທະນາ (Chat)", href: "/chat", icon: MessageSquare },
  {
    label: "ຈັດການຂໍ້ມູນ",
    icon: FolderCog,
    children: [
      { label: "ປະເພດບັນຫາ", href: "/problemtype", icon: Layers },
      { label: "ຫົວຂໍ້ການສົນທະນາ", href: "/topic", icon: Layers },
      { label: "ຂໍ້ຄວາມອັດໂນມັດ", href: "/messageauto", icon: Bot },
    ],
  },
  {
    label: "ລາຍງານ",
    icon: BarChart3,
    children: [
      { label: "ລາຍງານແຈ້ງການມອດໄຟ", href: "/turnoffreport", icon: FileX },
      {
        label: "ລາຍງານແຈ້ງການມອດໄຟສຸກເສີນ",
        href: "/emergencyreport",
        icon: AlertCircle,
      },
      {
        label: "ລາຍງານແຈ້ງການຕັດໄຟ",
        href: "/cutpowerreport",
        icon: Zap,
      },
      {
        label: "ລາຍງານການແຈ້ງບັນຫາ",
        href: "/problemreport",
        icon: AlertTriangle,
      },
      {
        label: "ລາຍງານການຂໍໝໍ້ນັບໄຟໃໝ່",
        href: "/registermeterreport",
        icon: FileText,
      },
    ],
  },
];

const ROLE_5_NAV_ITEMS: NavItem[] = [
  { label: "ແຈ້ງການມອດໄຟ", href: "/turnoff", icon: FileX },
  { label: "ແຈ້ງການມອດໄຟສຸກເສີນ", href: "/emergency", icon: AlertCircle },
  { label: "ແຈ້ງການຕັດໄຟ", href: "/cutpower", icon: Zap },
  { label: "ແຈ້ງບັນຫາ", href: "/problemdoc", icon: FileX },
  { label: "ຂໍໝໍ້ນັບໄຟໃໝ່", href: "/registermeter", icon: FileText },
  { label: "ລາຍການຊຳລະເງິນ", href: "/payment", icon: CreditCard },
  {
    label: "ລາຍງານ",
    icon: BarChart3,
    children: [
      { label: "ລາຍງານແຈ້ງການມອດໄຟ", href: "/turnoffreport", icon: FileX },
      {
        label: "ລາຍງານແຈ້ງການມອດໄຟສຸກເສີນ",
        href: "/emergencyreport",
        icon: AlertCircle,
      },
      {
        label: "ລາຍງານແຈ້ງການຕັດໄຟ",
        href: "/cutpowerreport",
        icon: Zap,
      },
      {
        label: "ລາຍງານການແຈ້ງບັນຫາ",
        href: "/problemreport",
        icon: AlertTriangle,
      },
      {
        label: "ລາຍງານການຂໍໝໍ້ນັບໄຟໃໝ່",
        href: "/registermeterreport",
        icon: FileText,
      },
    ],
  },
];

const ROLE_6_NAV_ITEMS: NavItem[] = [
  { label: "ແຈ້ງການມອດໄຟ", href: "/turnoff", icon: FileX },
  { label: "ແຈ້ງການມອດໄຟສຸກເສີນ", href: "/emergency", icon: AlertCircle },
  { label: "ແຈ້ງການຕັດໄຟ", href: "/cutpower", icon: Zap },
  { label: "ແຈ້ງບັນຫາ", href: "/problemdoc", icon: FileX },
  { label: "ຂໍໝໍ້ນັບໄຟໃໝ່", href: "/registermeter", icon: FileText },
  {
    label: "ລາຍງານ",
    icon: BarChart3,
    children: [
      { label: "ລາຍງານແຈ້ງການມອດໄຟ", href: "/turnoffreport", icon: FileX },
      {
        label: "ລາຍງານແຈ້ງການມອດໄຟສຸກເສີນ",
        href: "/emergencyreport",
        icon: AlertCircle,
      },
      {
        label: "ລາຍງານແຈ້ງການຕັດໄຟ",
        href: "/cutpowerreport",
        icon: Zap,
      },
      {
        label: "ລາຍງານການແຈ້ງບັນຫາ",
        href: "/problemreport",
        icon: AlertTriangle,
      },
      {
        label: "ລາຍງານການຂໍໝໍ້ນັບໄຟໃໝ່",
        href: "/registermeterreport",
        icon: FileText,
      },
    ],
  },
];

export const navItems: NavItem[] = [];

let authMePromise: Promise<any> | null = null;

function getAuthMeDeduplicated() {
  if (!authMePromise) {
    authMePromise = fetch("/api/auth/me")
      .then(async (res) => {
        authMePromise = null;
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
      .catch(() => {
        authMePromise = null;
        return null;
      });
  }
  return authMePromise;
}

export function useNavItems() {
  const [navItemsState, setNavItemsState] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try to load from localStorage first for instant display
    const cachedRoleId =
      typeof window !== "undefined" ? localStorage.getItem("userRoleId") : null;
    if (cachedRoleId) {
      const roleId = parseInt(cachedRoleId, 10);
      if (roleId === 1) {
        setNavItemsState(ROLE_1_NAV_ITEMS);
      } else if (roleId === 2) {
        setNavItemsState(ROLE_2_NAV_ITEMS);
      } else if (roleId === 3) {
        setNavItemsState(ROLE_3_NAV_ITEMS);
      } else if (roleId === 4) {
        setNavItemsState(ROLE_4_NAV_ITEMS);
      } else if (roleId === 5) {
        setNavItemsState(ROLE_5_NAV_ITEMS);
      } else if (roleId === 6) {
        setNavItemsState(ROLE_6_NAV_ITEMS);
      } else {
        setNavItemsState([]);
      }
      setLoading(false);
    }

    // 2. Fetch from server to validate/revalidate (deduplicated)
    const fetchRole = async () => {
      try {
        const data = await getAuthMeDeduplicated();
        if (data) {
          const roleId = data?.roleId;

          if (roleId !== undefined && roleId !== null) {
            localStorage.setItem("userRoleId", String(roleId));
            if (roleId === 1) {
              setNavItemsState(ROLE_1_NAV_ITEMS);
            } else if (roleId === 2) {
              setNavItemsState(ROLE_2_NAV_ITEMS);
            } else if (roleId === 3) {
              setNavItemsState(ROLE_3_NAV_ITEMS);
            } else if (roleId === 4) {
              setNavItemsState(ROLE_4_NAV_ITEMS);
            } else if (roleId === 5) {
              setNavItemsState(ROLE_5_NAV_ITEMS);
            } else if (roleId === 6) {
              setNavItemsState(ROLE_6_NAV_ITEMS);
            } else {
              setNavItemsState([]);
            }
          } else {
            localStorage.removeItem("userRoleId");
            setNavItemsState([]);
          }
        } else {
          localStorage.removeItem("userRoleId");
          setNavItemsState([]);
        }
      } catch (error) {
        console.error("Failed to revalidate role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return { navItems: navItemsState, loading };
}

export const noticesData = [
  {
    id: 1,
    type: "warning",
    icon: AlertCircle,
    title: "System Update",
    message: "New server update available",
    time: "5m ago",
    color: "245 158 11",
  },
  {
    id: 2,
    type: "success",
    icon: CheckCircle,
    title: "Order Completed",
    message: "Order #12345 has been shipped",
    time: "1h ago",
    color: "34 197 94",
  },
  {
    id: 3,
    type: "info",
    icon: Info,
    title: "New User Signup",
    message: "5 new users registered today",
    time: "2h ago",
    color: "61 109 255",
  },
  {
    id: 4,
    type: "warning",
    icon: AlertCircle,
    title: "Low Inventory",
    message: "Product ABC123 stock is low",
    time: "3h ago",
    color: "239 68 68",
  },
];
