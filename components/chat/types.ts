export interface Topic {
  id: number;
  name: string;
  unreadCount?: number;
}

export interface ExternalUser {
  id: number;
  name: string;
  tel: string;
}

export interface Conversation {
  id: number;
  externalUserId: number;
  topicId: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadExternalCount: number;
  unreadAgentCount: number;
  createdAt: string;
  updatedAt: string;
  externalUser: ExternalUser;
}

export interface Message {
  id: number;
  conversationId: number;
  senderType: "edlapp" | "callcenter";
  edlappId: number | null;
  agentId: number | null;
  mType: "text" | "image" | "audio" | "location";
  content: string | null;
  fileImg: string | null;
  fileAudio: string | null;
  lat: number | null;
  lng: number | null;
  status: "sent" | "delivered" | "seen";
  seenAt: string | null;
  createdAt: string;
  updatedAt: string;
  edlappUser?: { id: number; name: string } | null;
  agentUser?: {
    id: number;
    employee: { first_name: string; last_name: string };
  } | null;
}
