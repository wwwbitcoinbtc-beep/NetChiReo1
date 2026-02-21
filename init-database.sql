-- NetChiDb Database Initialization Script
-- This script creates the database and all required tables with sample data

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'NetChiDb')
BEGIN
    CREATE DATABASE [NetChiDb];
    PRINT '✓ Database NetChiDb created';
END
ELSE
BEGIN
    PRINT '✓ Database NetChiDb already exists';
END

USE [NetChiDb];
GO

-- Users Table
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users' AND TABLE_SCHEMA = 'dbo')
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [UserName] nvarchar(256) NOT NULL UNIQUE,
        [Email] nvarchar(256) NOT NULL UNIQUE,
        [PasswordHash] nvarchar(max) NOT NULL,
        [IsActive] bit NOT NULL DEFAULT 1,
        [Type] int NOT NULL DEFAULT 0,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        [LastLoginAt] datetime2 NULL
    );
    CREATE NONCLUSTERED INDEX [IX_Email] ON [dbo].[Users] ([Email]);
    CREATE NONCLUSTERED INDEX [IX_UserName] ON [dbo].[Users] ([UserName]);
    PRINT '✓ Table Users created';
END
ELSE
BEGIN
    PRINT '✓ Table Users already exists';
END
GO

-- Orders Table
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Orders' AND TABLE_SCHEMA = 'dbo')
BEGIN
    CREATE TABLE [dbo].[Orders] (
        [Id] uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [UserId] uniqueidentifier NOT NULL,
        [Status] int NOT NULL DEFAULT 0,
        [TotalPrice] decimal(18, 2) NOT NULL DEFAULT 0,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [FK_Orders_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[Orders] ([UserId]);
    CREATE NONCLUSTERED INDEX [IX_Status] ON [dbo].[Orders] ([Status]);
    PRINT '✓ Table Orders created';
END
ELSE
BEGIN
    PRINT '✓ Table Orders already exists';
END
GO

-- Designs Table
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Designs' AND TABLE_SCHEMA = 'dbo')
BEGIN
    CREATE TABLE [dbo].[Designs] (
        [Id] uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [Title] nvarchar(256) NOT NULL,
        [Description] nvarchar(max) NULL,
        [Category] nvarchar(100) NOT NULL,
        [ImageUrl] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] datetime2 NULL
    );
    PRINT '✓ Table Designs created';
END
ELSE
BEGIN
    PRINT '✓ Table Designs already exists';
END
GO

-- Insert Sample Users
IF (SELECT COUNT(*) FROM [dbo].[Users]) = 0
BEGIN
    INSERT INTO [dbo].[Users] ([Id], [UserName], [Email], [PasswordHash], [Type], [IsActive])
    VALUES 
        ('550e8400-e29b-41d4-a716-446655440001', 'admin_user', 'admin@netchicafe.ir', 'HASH_PASSWORD_123', 1, 1),
        ('550e8400-e29b-41d4-a716-446655440002', 'customer_1', 'customer1@netchicafe.ir', 'HASH_PASSWORD_123', 0, 1),
        ('550e8400-e29b-41d4-a716-446655440003', 'customer_2', 'customer2@netchicafe.ir', 'HASH_PASSWORD_123', 0, 1),
        ('550e8400-e29b-41d4-a716-446655440004', 'provider_1', 'provider@netchicafe.ir', 'HASH_PASSWORD_123', 2, 1);
    PRINT '✓ Sample users inserted';
END
GO

-- Insert Sample Orders
IF (SELECT COUNT(*) FROM [dbo].[Orders]) = 0
BEGIN
    INSERT INTO [dbo].[Orders] ([Id], [UserId], [Status], [TotalPrice], [CreatedAt])
    VALUES 
        ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 0, 150000, DATEADD(day, -7, GETUTCDATE())),
        ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 1, 250000, DATEADD(day, -5, GETUTCDATE())),
        ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 0, 350000, DATEADD(day, -2, GETUTCDATE())),
        ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 1, 175000, DATEADD(hour, -12, GETUTCDATE()));
    PRINT '✓ Sample orders inserted';
END
GO

-- Insert Sample Designs
IF (SELECT COUNT(*) FROM [dbo].[Designs]) = 0
BEGIN
    INSERT INTO [dbo].[Designs] ([Id], [Title], [Description], [Category], [ImageUrl])
    VALUES 
        (NEWID(), 'Modern Cafe Interior', 'Contemporary minimalist cafe design with modern furniture', 'Modern', 'https://via.placeholder.com/400x300?text=Modern+Cafe'),
        (NEWID(), 'Vintage Coffee Shop', 'Traditional vintage style cafe setup with retro elements', 'Vintage', 'https://via.placeholder.com/400x300?text=Vintage+Cafe'),
        (NEWID(), 'Gaming Lounge', 'High-tech gaming cafe with modern gaming stations', 'Gaming', 'https://via.placeholder.com/400x300?text=Gaming+Lounge'),
        (NEWID(), 'Cozy Reading Nook', 'Comfortable cafe space for reading and studying', 'Cozy', 'https://via.placeholder.com/400x300?text=Reading+Nook');
    PRINT '✓ Sample designs inserted';
END
GO

-- Display Statistics
PRINT '====== Database Summary ======'
SELECT 
    'Users' AS TableName, 
    COUNT(*) AS RecordCount 
FROM [dbo].[Users]
UNION ALL
SELECT 
    'Orders' AS TableName, 
    COUNT(*) AS RecordCount 
FROM [dbo].[Orders]
UNION ALL
SELECT 
    'Designs' AS TableName, 
    COUNT(*) AS RecordCount 
FROM [dbo].[Designs];

PRINT '✅ Database initialization complete!'
GO
