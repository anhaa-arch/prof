-- University Research & Credit Management System
-- Database Setup Script

-- Database үүсгэх
CREATE DATABASE IF NOT EXISTS research_credit_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Database сонгох
USE research_credit_db;

-- Хэрэглэгч үүсгэх (Optional - хэрэв root биш бусад хэрэглэгч хэрэгтэй бол)
-- CREATE USER IF NOT EXISTS 'urcs_user'@'localhost' IDENTIFIED BY 'urcs_password';
-- GRANT ALL PRIVILEGES ON research_credit_db.* TO 'urcs_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Амжилттай үүссэн эсэхийг шалгах
SELECT 'Database research_credit_db амжилттай үүслээ!' AS status;
SHOW DATABASES LIKE 'research_credit_db';

