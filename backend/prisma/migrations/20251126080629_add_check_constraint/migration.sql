-- Add check constraint to ensure dueDate is after startDate
ALTER TABLE "todos" ADD CONSTRAINT "check_due_date" CHECK ("dueDate" >= "startDate");
