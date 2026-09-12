export interface CompensationContext {
  tenantId: string;
  employeeId: string;
}

export interface CreateCompensationParams extends CompensationContext {
  amount: number;
  currency: string;
  effectiveDate: Date;
  reason?: string;
  actorId: string;
}