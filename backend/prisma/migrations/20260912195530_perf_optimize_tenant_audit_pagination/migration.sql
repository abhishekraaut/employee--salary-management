-- DropForeignKey
ALTER TABLE `auditlog` DROP FOREIGN KEY `AuditLog_actor_tenant_fkey`;

-- DropForeignKey
ALTER TABLE `auditlog` DROP FOREIGN KEY `AuditLog_employee_tenant_fkey`;

-- DropForeignKey
ALTER TABLE `auditlog` DROP FOREIGN KEY `AuditLog_new_compensation_tenant_fkey`;

-- DropForeignKey
ALTER TABLE `auditlog` DROP FOREIGN KEY `AuditLog_previous_compensation_tenant_fkey`;

-- DropForeignKey
ALTER TABLE `compensation` DROP FOREIGN KEY `Compensation_creator_tenant_fkey`;

-- DropForeignKey
ALTER TABLE `compensation` DROP FOREIGN KEY `Compensation_employee_tenant_fkey`;

-- DropIndex
DROP INDEX `AuditLog_actorId_fkey` ON `auditlog`;

-- DropIndex
DROP INDEX `AuditLog_employeeId_fkey` ON `auditlog`;

-- DropIndex
DROP INDEX `AuditLog_newCompensationId_fkey` ON `auditlog`;

-- DropIndex
DROP INDEX `AuditLog_previousCompensationId_fkey` ON `auditlog`;

-- DropIndex
DROP INDEX `Compensation_createdBy_fkey` ON `compensation`;

-- DropIndex
DROP INDEX `Compensation_employeeId_fkey` ON `compensation`;

-- CreateIndex
CREATE INDEX `AuditLog_tenantId_createdAt_idx` ON `AuditLog`(`tenantId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `Compensation` ADD CONSTRAINT `Compensation_tenantId_employeeId_fkey` FOREIGN KEY (`tenantId`, `employeeId`) REFERENCES `Employee`(`tenantId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Compensation` ADD CONSTRAINT `Compensation_tenantId_createdBy_fkey` FOREIGN KEY (`tenantId`, `createdBy`) REFERENCES `User`(`tenantId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_tenantId_employeeId_fkey` FOREIGN KEY (`tenantId`, `employeeId`) REFERENCES `Employee`(`tenantId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_tenantId_actorId_fkey` FOREIGN KEY (`tenantId`, `actorId`) REFERENCES `User`(`tenantId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_tenantId_previousCompensationId_fkey` FOREIGN KEY (`tenantId`, `previousCompensationId`) REFERENCES `Compensation`(`tenantId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_tenantId_newCompensationId_fkey` FOREIGN KEY (`tenantId`, `newCompensationId`) REFERENCES `Compensation`(`tenantId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;
