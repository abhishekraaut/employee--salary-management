-- Enforce the login contract: email uniquely identifies a user.
CREATE INDEX `User_tenantId_idx` ON `User`(`tenantId`);
DROP INDEX `User_tenantId_email_key` ON `User`;
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- Add tenant-aware candidate keys for composite foreign keys.
CREATE UNIQUE INDEX `User_tenantId_id_key` ON `User`(`tenantId`, `id`);
CREATE UNIQUE INDEX `Employee_tenantId_id_key` ON `Employee`(`tenantId`, `id`);
CREATE UNIQUE INDEX `Compensation_tenantId_id_key` ON `Compensation`(`tenantId`, `id`);
CREATE UNIQUE INDEX `AuditLog_tenantId_id_key` ON `AuditLog`(`tenantId`, `id`);

-- Ensure every cross-entity relationship stays within one tenant.
ALTER TABLE `Compensation`
  DROP FOREIGN KEY `Compensation_employeeId_fkey`,
  DROP FOREIGN KEY `Compensation_createdBy_fkey`;

ALTER TABLE `Compensation`
  ADD CONSTRAINT `Compensation_employee_tenant_fkey`
    FOREIGN KEY (`tenantId`, `employeeId`) REFERENCES `Employee`(`tenantId`, `id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `Compensation_creator_tenant_fkey`
    FOREIGN KEY (`tenantId`, `createdBy`) REFERENCES `User`(`tenantId`, `id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `AuditLog`
  DROP FOREIGN KEY `AuditLog_employeeId_fkey`,
  DROP FOREIGN KEY `AuditLog_actorId_fkey`,
  DROP FOREIGN KEY `AuditLog_previousCompensationId_fkey`,
  DROP FOREIGN KEY `AuditLog_newCompensationId_fkey`;

ALTER TABLE `AuditLog`
  ADD CONSTRAINT `AuditLog_employee_tenant_fkey`
    FOREIGN KEY (`tenantId`, `employeeId`) REFERENCES `Employee`(`tenantId`, `id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `AuditLog_actor_tenant_fkey`
    FOREIGN KEY (`tenantId`, `actorId`) REFERENCES `User`(`tenantId`, `id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `AuditLog_previous_compensation_tenant_fkey`
    FOREIGN KEY (`tenantId`, `previousCompensationId`) REFERENCES `Compensation`(`tenantId`, `id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `AuditLog_new_compensation_tenant_fkey`
    FOREIGN KEY (`tenantId`, `newCompensationId`) REFERENCES `Compensation`(`tenantId`, `id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;