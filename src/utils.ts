import { Call, AppConfig, ApiLogEntry } from './types';

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateExternalId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function safeDate(value: Date | string | undefined | null): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${(date.getMilliseconds()).toString().padStart(3, '0')}`;
}

export function computeMD5Signature(secret: string, srcNumber: string, destNumber: string, uid: string): string {
  // В реальности это MD5 от конкатенации secret + srcNumber + destNumber + uid
  // Для тестирования используем простую хеш-функцию
  const input = secret + srcNumber + destNumber + uid;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(32, '0');
}

export function buildCallRequest(call: Partial<Call>): any {
  const request: any = {
    externalId: call.externalId || generateExternalId(),
    number: call.number,
    isIncoming: call.isIncoming,
    startTime: call.startTime || formatDateTime(new Date()),
  };

  if (call.extension) request.extension = call.extension;
  if (call.comment) request.comment = call.comment;
  if (call.counterparty) request.counterparty = call.counterparty;
  if (call.employee) request.employee = call.employee;
  if (call.endTime) request.endTime = call.endTime;
  if (call.duration !== undefined) request.duration = call.duration;
  if (call.recordUrl) request.recordUrl = call.recordUrl;
  if (call.events) request.events = call.events;

  return request;
}

export function buildCallUpdateRequest(updates: Partial<Call>): any {
  const request: any = {};

  if (updates.extension) request.extension = updates.extension;
  if (updates.employee) request.employee = updates.employee;
  if (updates.endTime) request.endTime = updates.endTime;
  if (updates.duration !== undefined) request.duration = updates.duration;
  if (updates.recordUrl) request.recordUrl = updates.recordUrl;
  if (updates.comment !== undefined) request.comment = updates.comment;
  if (updates.events) request.events = updates.events;

  return request;
}

export function buildEventRequest(eventType: string, extension: string, sequence: number): any {
  return {
    eventType,
    extension,
    sequence,
  };
}

export function createApiLogEntry(
  direction: 'outgoing' | 'incoming',
  method: string,
  url: string,
  headers: Record<string, string>,
  body: any
): ApiLogEntry {
  return {
    id: generateUUID(),
    timestamp: new Date(),
    direction,
    method,
    url,
    headers,
    body,
    status: 'pending',
  };
}

export function getAuthHeaders(config: AppConfig): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip',
    'Lognex-Phone-Auth-Token': config.authToken,
  };
}

export function getCallbackHeaders(config: AppConfig, body: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Lognex-Content-MD5': computeMD5Signature(config.callbackSecret, '', '', ''),
  };
}
