#!/bin/bash

# اتصال کردن به SQL Server و ایجاد database
echo "🔧 در حال initialize کردن Database..."

docker exec netchi-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'NetChi@2024' << 'EOF'
-- Check if database exists
IF DB_ID('NetChiDb') IS NULL
BEGIN
    CREATE DATABASE [NetChiDb];
    PRINT 'Database NetChiDb ایجاد شد ✓';
END
ELSE
BEGIN
    PRINT 'Database NetChiDb از قبل وجود دارد';
END
GO

USE [NetChiDb];
GO

-- ایجاد جدول Users
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] [uniqueidentifier] NOT NULL PRIMARY KEY,
        [UserName] [nvarchar](256) NOT NULL,
        [Email] [nvarchar](256) NOT NULL,
        [PasswordHash] [nvarchar](max) NOT NULL,
        [IsActive] [bit] NOT NULL DEFAULT 1,
        [Type] [int] NOT NULL DEFAULT 0,
        [CreatedAt] [datetime2] NOT NULL DEFAULT GETUTCDATE(),
        [LastLoginAt] [datetime2] NULL
    );
    
    CREATE NONCLUSTERED INDEX [IX_Email] ON [dbo].[Users] ([Email]);
    CREATE NONCLUSTERED INDEX [IX_UserName] ON [dbo].[Users] ([UserName]);
    PRINT 'جدول Users ایجاد شد ✓';
END
GO

-- ایجاد جدول Orders
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Orders')
BEGIN
    CREATE TABLE [dbo].[Orders] (
        [Id] [uniqueidentifier] NOT NULL PRIMARY KEY,
        [UserId] [uniqueidentifier] NOT NULL,
        [Status] [int] NOT NULL DEFAULT 0,
        [TotalPrice] [decimal](18, 2) NOT NULL DEFAULT 0,
        [CreatedAt] [datetime2] NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] [datetime2] NULL,
        CONSTRAINT [FK_Orders_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
    );
    
    CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[Orders] ([UserId]);
    CREATE NONCLUSTERED INDEX [IX_Status] ON [dbo].[Orders] ([Status]);
    PRINT 'جدول Orders ایجاد شد ✓';
END
GO

-- Insert نمونه داده‌ها
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users])
BEGIN
    DECLARE @UserId1 UNIQUEIDENTIFIER = NEWID();
    DECLARE @UserId2 UNIQUEIDENTIFIER = NEWID();
    DECLARE @UserId3 UNIQUEIDENTIFIER = NEWID();
    
    INSERT INTO [dbo].[Users] ([Id], [UserName], [Email], [PasswordHash], [Type], [IsActive])
    VALUES 
        (@UserId1, 'admin', 'admin@netchireo.com', 'hash123', 1, 1),
        (@UserId2, 'user1', 'user1@netchireo.com', 'hash123', 0, 1),
        (@UserId3, 'user2', 'user2@netchireo.com', 'hash123', 0, 1);
    
    INSERT INTO [dbo].[Orders] ([Id], [UserId], [Status], [TotalPrice])
    VALUES 
        (NEWID(), @UserId1, 0, 150000),
        (NEWID(), @UserId2, 1, 250000),
        (NEWID(), @UserId3, 2, 75000);
    
    PRINT 'نمونه داده‌ها وارد شدند ✓';
END
GO

PRINT '✅ Database initialization مکمل شد!';
PRINT '📊 تعداد کاربران: ' + CAST((SELECT COUNT(*) FROM [dbo].[Users]) AS varchar);
PRINT '📋 تعداد سفارشات: ' + CAST((SELECT COUNT(*) FROM [dbo].[Orders]) AS varchar);
EOF

echo "✅ Database Ready!"
