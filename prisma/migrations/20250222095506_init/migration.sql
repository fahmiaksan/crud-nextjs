/*
  Warnings:

  - Added the required column `password` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Student_password_key` ON `student`;

-- AlterTable
ALTER TABLE `teacher` ADD COLUMN `password` VARCHAR(191) NOT NULL;
