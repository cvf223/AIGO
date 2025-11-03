-- PostgreSQL Setup Script for Arbitrum Flash Specialist
-- Run this script to create the database and user

-- Create database
CREATE DATABASE arbitrum_flash_specialist;

-- Create user (optional - you can use existing postgres user)
-- CREATE USER arbitrum_agent WITH PASSWORD 'your_secure_password';

-- Grant privileges
-- GRANT ALL PRIVILEGES ON DATABASE arbitrum_flash_specialist TO arbitrum_agent;

-- Connect to the database
\c arbitrum_flash_specialist;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- The application will create the tables automatically
-- This script just sets up the database and extensions

COMMENT ON DATABASE arbitrum_flash_specialist IS 'Database for Arbitrum Flash Loan Specialist AI Agent';

-- 🔥 REAL PRICES TABLE FOR BLOCKCHAIN DATA
CREATE TABLE IF NOT EXISTS real_prices (
    id SERIAL PRIMARY KEY,
    pool_address VARCHAR(42) NOT NULL,
    chain VARCHAR(20) NOT NULL,
    pool_type VARCHAR(10) NOT NULL, -- 'v2' or 'v3'
    price DECIMAL(36, 18) NOT NULL,
    token0_symbol VARCHAR(20),
    token1_symbol VARCHAR(20),
    liquidity DECIMAL(36, 18) DEFAULT 0,
    fee DECIMAL(8, 6) DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_data JSONB,
    UNIQUE(pool_address, chain)
);

-- Index for fast price lookups
CREATE INDEX IF NOT EXISTS idx_real_prices_pool_chain ON real_prices(pool_address, chain);
CREATE INDEX IF NOT EXISTS idx_real_prices_timestamp ON real_prices(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_real_prices_tokens ON real_prices(token0_symbol, token1_symbol); 