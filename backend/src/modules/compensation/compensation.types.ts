export interface CompensationContext {
  tenantId: string;
  employeeId: number;
}

export interface CreateCompensationParams extends CompensationContext {
  amount: number;
  currency: string;
  effectiveDate: Date;
  reason?: string;
  actorId: string;
}