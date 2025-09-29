import { Invoice, Reminder, Settings } from './types';

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
const nextWeekday = (d: Date) => {
  const dd = new Date(d);
  while (isWeekend(dd)) dd.setDate(dd.getDate() + 1);
  return dd;
};

const fmtMoney = (amount: number, currency: string = 'ZAR') => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount / 100);
  } catch {
    return `R ${(amount / 100).toFixed(2)}`;
  }
};

export function buildPaymentLink(template: string | undefined, invoice: Invoice) {
  if (!template) return invoice.paymentLink || '';
  return template
    .replace(/\{\{invoiceNumber\}\}/g, invoice.invoiceNumber)
    .replace(/\{\{amount\}\}/g, fmtMoney(invoice.amount, invoice.currency));
}

export function interpolate(text: string, invoice: Invoice, settings: Settings, whenLabel: string) {
  return text
    .replace(/\{\{clientName\}\}/g, invoice.clientName)
    .replace(/\{\{invoiceNumber\}\}/g, invoice.invoiceNumber)
    .replace(/\{\{amount\}\}/g, fmtMoney(invoice.amount, invoice.currency))
    .replace(/\{\{when\}\}/g, whenLabel)
    .replace(/\{\{paymentLink\}\}/g, buildPaymentLink(settings.paymentLinkTemplate, invoice))
    .replace(/\{\{yourName\}\}/g, settings.businessName || 'Accounts');
}

export function scheduleReminders(invoices: Invoice[], settings: Settings): Reminder[] {
  const result: Reminder[] = [];
  const now = new Date();
  const rules = settings.rules;

  for (const inv of invoices) {
    if (inv.paid) continue;
    const due = new Date(inv.dueDate + 'T09:00:00');
    const schedule: { when: Date; kind: 'before' | 'on' | 'after'; label: string }[] = [];
    for (const d of rules.beforeDays || []) {
      const dt = new Date(due);
      dt.setDate(due.getDate() - d);
      const adj = rules.weekdaysOnly ? nextWeekday(dt) : dt;
      schedule.push({ when: adj, kind: 'before', label: `${d} day(s) before due date` });
    }
    if (rules.onDue) {
      const adj = rules.weekdaysOnly ? nextWeekday(due) : due;
      schedule.push({ when: adj, kind: 'on', label: 'on the due date' });
    }
    for (const d of rules.afterDays || []) {
      const dt = new Date(due);
      dt.setDate(due.getDate() + d);
      const adj = rules.weekdaysOnly ? nextWeekday(dt) : dt;
      schedule.push({ when: adj, kind: 'after', label: `${d} day(s) after due date` });
    }

    for (const s of schedule) {
      if (s.when < now) continue; // only future reminders
      const id = `${inv.id}-${toISODate(s.when)}-${s.kind}`;
      result.push({
        id,
        invoiceId: inv.id,
        when: s.when.toISOString(),
        kind: s.kind,
        to: inv.clientEmail,
        subject: interpolate(settings.subject, inv, settings, s.label),
        body: interpolate(settings.body, inv, settings, s.label),
      });
    }
  }

  // sort by date
  return result.sort((a, b) => a.when.localeCompare(b.when));
}

export function nextReminderDate(invoice: Invoice, settings: Settings): Date | null {
  if (invoice.paid) return null;
  const all = scheduleReminders([invoice], settings);
  return all.length ? new Date(all[0].when) : null;
}
