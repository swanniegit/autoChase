export type PlanId = 'starter' | 'pro' | 'business';

export type Invoice = {
  id: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  amount: number; // in cents
  currency?: string; // e.g., ZAR
  dueDate: string; // ISO date
  paid?: boolean;
  paymentLink?: string;
  createdAt: string; // ISO
};

export type Settings = {
  sender: string;
  subject: string;
  body: string;
  rules: Rules;
  businessName?: string;
  paymentLinkTemplate?: string; // e.g. https://pay.example.com/{{invoiceNumber}}
  plan?: PlanId;
};

export type Rules = {
  beforeDays: number[]; // e.g., [3]
  onDue: boolean;
  afterDays: number[]; // e.g., [7]
  weekdaysOnly: boolean;
};

export type Reminder = {
  id: string;
  invoiceId: string;
  when: string; // ISO datetime scheduled
  kind: 'before' | 'on' | 'after';
  sentAt?: string; // ISO
  to: string;
  subject: string;
  body: string;
};
