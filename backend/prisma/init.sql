-- Initial SQL setup for MySQL
-- This file is executed on first database initialization

-- Ensure UTF-8 encoding
ALTER DATABASE research_credit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Enable full-text search
SET GLOBAL innodb_ft_min_token_size = 2;
SET GLOBAL innodb_ft_enable_stopword = 0;

