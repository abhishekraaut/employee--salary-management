import { compensationRepository } from './compensation.repository';
import { CompensationContext, CreateCompensationParams } from './compensation.types';
import { NotFoundError, BadRequestError } from '../../common/errors';

export class CompensationService {
  async getHistory(context: CompensationContext) {
    const history = await compensationRepository.findHistory(context);
    
    if (!history) {
      throw new NotFoundError('Employee not found');
    }

    return history.map(c => ({
      ...c,
      amount: Number(c.amount)
    }));
  }

  async addCompensation(params: CreateCompensationParams) {
    if (params.amount <= 0) {
      throw new BadRequestError('Compensation amount must be strictly positive');
    }

    if (isNaN(params.effectiveDate.getTime())) {
      throw new BadRequestError('Invalid effective date');
    }

    const newComp = await compensationRepository.addCompensationWithAudit(params);

    if (!newComp) {
      throw new NotFoundError('Employee not found');
    }

    return {
      ...newComp,
      amount: Number(newComp.amount)
    };
  }
}

export const compensationService = new CompensationService();