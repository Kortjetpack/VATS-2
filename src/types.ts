export interface CallEvent {
  eventType: 'SHOW' | 'STARTTIME' | 'HIDE' | 'HIDE_ALL';
  extension: string;
  sequence: number;
  employee?: {
    href: string;
    type: string;
    mediaType: string;
  };
}

export interface Call {
  id?: string;
  externalId: string;
  number: string;
  counterparty?: {
    href: string;
    type: string;
    mediaType: string;
  };
  counterpartyowner?: {
    extention: string;
    meta: {
      href: string;
      type: string;
      mediaType: string;
    };
  };
  extension?: string;
  employee?: {
    href: string;
    type: string;
    mediaType: string;
  };
  isIncoming: boolean;
  startTime: string;
  endTime?: string | null;
  duration?: number | null;
  recordUrl?: string[];
  comment?: string;
  events?: CallEvent[];
}

export interface OutgoingCallRequest {
  srcNumber: string;
  destNumber: string;
  uid: string;
}

export interface Employee {
  meta: {
    href: string;
    type: string;
    mediaType: string;
  };
  extention: string;
}

export interface ApiLogEntry {
  id: string;
  timestamp: Date;
  direction: 'outgoing' | 'incoming';
  method: string;
  url: string;
  headers: Record<string, string>;
  body: any;
  response?: {
    status: number;
    body: any;
  };
  status: 'success' | 'error' | 'pending';
}

export interface AppConfig {
  authToken: string;
  apiBaseUrl: string;
  callbackUrl: string;
  callbackSecret: string;
}
