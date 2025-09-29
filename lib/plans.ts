import { PlanId } from './types';

export const PLAN_LIMITS: Record<PlanId, number | 'unlimited'> = {
  starter: 50,
  pro: 250,
  business: 'unlimited',
};

export function getPlanLimit(plan: PlanId | undefined): number | 'unlimited' {
  if (!plan) return 50;
  return PLAN_LIMITS[plan];
}

