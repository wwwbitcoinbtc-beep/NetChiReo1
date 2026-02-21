-- Create database if it doesn't exist
CREATE DATABASE [NetChiDb];
GO

USE [NetChiDb];
GO

-- Create Users table
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
END
GO

-- Create Orders table
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
END
GO

-- Insert sample data if tables are empty
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users])
BEGIN
    INSERT INTO [dbo].[Users] ([Id], [UserName], [Email], [PasswordHash], [Type], [IsActive])
    VALUES 
        (NEWID(), 'admin', 'admin@example.com', 'hash123', 1, 1),
        (NEWID(), 'user1', 'user1@example.com', 'hash123', 0, 1),
        (NEWID(), 'user2', 'user2@example.com', 'hash123', 0, 1);
        
    INSERT INTO [dbo].[Orders] ([Id], [UserId], [Status], [TotalPrice])
    SELECT 
        NEWID(),
        (SELECT TOP 1 [Id] FROM [dbo].[Users] WHERE [UserName] = 'admin'),
        0,
        150000;
    UNION ALL
    SELECT 
        NEWID(),
        (SELECT TOP 1 [Id] FROM [dbo].[Users] WHERE [UserName] = 'user1'),
        1,
        250000;
    UNION ALL
    SELECT 
        NEWID(),
        (SELECT TOP 1 [Id] FROM [dbo].[Users] WHERE [UserName] = 'user2'),
        2,
        75000;
END
GO

PRINT 'Database setup completed!';
