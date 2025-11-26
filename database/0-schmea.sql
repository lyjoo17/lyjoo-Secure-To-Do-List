-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enum Types
-- Note: Enum values are case-sensitive in PostgreSQL. Matching Prisma Schema values.
CREATE TYPE role_enum AS ENUM ('USER', 'ADMIN');
CREATE TYPE todo_status_enum AS ENUM ('ACTIVE', 'COMPLETED', 'DELETED');

-- Create Update Timestamp Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    role role_enum NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for Users
CREATE INDEX idx_users_role ON users(role);

-- Trigger for Users updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. Todos Table
-- ============================================
CREATE TABLE todos (
    todo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    start_date DATE,
    due_date DATE,
    status todo_status_enum NOT NULL DEFAULT 'ACTIVE',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    -- Foreign Key Constraint
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Check Constraint
    CONSTRAINT check_due_date CHECK (due_date >= start_date)
);

-- Indexes for Todos
CREATE INDEX idx_todos_user_status ON todos(user_id, status);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_deleted_at ON todos(deleted_at);

-- Trigger for Todos updated_at
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. Holidays Table
-- ============================================
CREATE TABLE holidays (
    holiday_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    is_recurring BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for Holidays
CREATE INDEX idx_holidays_date ON holidays(date);

-- Trigger for Holidays updated_at
CREATE TRIGGER update_holidays_updated_at
    BEFORE UPDATE ON holidays
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
