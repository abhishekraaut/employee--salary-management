import prisma from '../../db';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, tenantId: true, email: true }
    });
  }
}

export const authRepository = new AuthRepository();