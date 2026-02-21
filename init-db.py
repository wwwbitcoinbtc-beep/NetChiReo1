#!/usr/bin/env python3
import pyodbc
import os
import time

def init_database():
    """SQL Server database رو initialize کنید"""
    
    server = 'localhost'
    database = 'master'
    username = 'sa'
    password = 'NetChi@2024'
    
    connection_string = f'Driver={{ODBC Driver 17 for SQL Server}};Server={server};Database={database};UID={username};PWD={password};TrustServerCertificate=yes;'
    
    try:
        print("🔧 داره تلاش می‌کند به SQL Server متصل بشه...")
        conn = pyodbc.connect(connection_string, timeout=10)
        cursor = conn.cursor()
        print("✅ اتصال به SQL Server موفق بود!")
        
        # ایجاد DATABASE
        print("📦 Database NetChiDb رو ایجاد می‌کند...")
        cursor.execute("""
        IF DB_ID('NetChiDb') IS NULL
            CREATE DATABASE [NetChiDb];
        """)
        conn.commit()
        
        # تغییر database
        cursor.close()
        conn.close()
        
        database = 'NetChiDb'
        connection_string = f'Driver={{ODBC Driver 17 for SQL Server}};Server={server};Database={database};UID={username};PWD={password};TrustServerCertificate=yes;'
        conn = pyodbc.connect(connection_string, timeout=10)
        cursor = conn.cursor()
        
        # ایجاد جدول Users
        print("👤 جدول Users رو ایجاد می‌کند...")
        cursor.execute("""
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
        BEGIN
            CREATE TABLE [dbo].[Users] (
                [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                [UserName] NVARCHAR(256) NOT NULL,
                [Email] NVARCHAR(256) NOT NULL,
                [PasswordHash] NVARCHAR(MAX) NOT NULL,
                [IsActive] BIT NOT NULL DEFAULT 1,
                [Type] INT NOT NULL DEFAULT 0,
                [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                [LastLoginAt] DATETIME2 NULL
            );
            
            CREATE NONCLUSTERED INDEX [IX_Email] ON [dbo].[Users] ([Email]);
            CREATE NONCLUSTERED INDEX [IX_UserName] ON [dbo].[Users] ([UserName]);
        END
        """)
        conn.commit()
        
        # ایجاد جدول Orders
        print("📋 جدول Orders رو ایجاد می‌کند...")
        cursor.execute("""
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Orders')
        BEGIN
            CREATE TABLE [dbo].[Orders] (
                [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                [UserId] UNIQUEIDENTIFIER NOT NULL,
                [Status] INT NOT NULL DEFAULT 0,
                [TotalPrice] DECIMAL(18, 2) NOT NULL DEFAULT 0,
                [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                [UpdatedAt] DATETIME2 NULL,
                CONSTRAINT [FK_Orders_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
            );
            
            CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[Orders] ([UserId]);
            CREATE NONCLUSTERED INDEX [IX_Status] ON [dbo].[Orders] ([Status]);
        END
        """)
        conn.commit()
        
        # Insert نمونه داده‌ها
        print("📊 نمونه داده‌ها رو وارد می‌کند...")
        cursor.execute("""
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Users])
        BEGIN
            INSERT INTO [dbo].[Users] ([UserName], [Email], [PasswordHash], [Type])
            VALUES 
                ('admin', 'admin@netchireo.com', 'hash123', 1),
                ('user1', 'user1@netchireo.com', 'hash123', 0),
                ('user2', 'user2@netchireo.com', 'hash123', 0);
            
            INSERT INTO [dbo].[Orders] ([UserId], [Status], [TotalPrice])
            SELECT TOP 3 [Id], 0, 150000 FROM [dbo].[Users];
        END
        """)
        conn.commit()
        
        # نمایش آمار
        cursor.execute("SELECT COUNT(*) FROM [dbo].[Users]")
        user_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM [dbo].[Orders]")
        order_count = cursor.fetchone()[0]
        
        print(f"✅ Database initialization کامل شد!")
        print(f"👥 تعداد کاربران: {user_count}")
        print(f"📦 تعداد سفارشات: {order_count}")
        
        cursor.close()
        conn.close()
        
    except pyodbc.OperationalError as e:
        print(f"❌ خطای اتصال: {e}")
        return False
    except Exception as e:
        print(f"❌ خطا: {e}")
        return False
    
    return True

if __name__ == "__main__":
    # منتظر شوید تا SQL Server آماده شود
    max_retries = 10
    for i in range(max_retries):
        try:
            if init_database():
                break
        except:
            print(f"⏳ تلاش {i+1}/{max_retries}... منتظر SQL Server")
            time.sleep(5)
