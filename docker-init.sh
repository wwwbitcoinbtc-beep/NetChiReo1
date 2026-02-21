WAIT_FOR_IT_TIMEOUT=60
WAIT_FOR_IT_STRICT_MODE=1

wait_for() {
    local timeout=$1
    local host=$2
    local port=$3
    
    echo "Waiting for $host:$port..."
    
    end=$((SECONDS + timeout))
    while [ $SECONDS -lt $end ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            echo "$host:$port is available!"
            return 0
        fi
        echo "Waiting for $host:$port..."
        sleep 2
    done
    
    echo "Timeout waiting for $host:$port"
    return 1
}

# Wait for SQL Server
if wait_for "$WAIT_FOR_IT_TIMEOUT" "sqlserver" "1433"; then
    echo "SQL Server is ready"
    
    # Wait a bit more for the database engine to be fully ready
    sleep 5
    
    # Create initial database and tables using sqlcmd
    /opt/mssql-tools/bin/sqlcmd -S sqlserver,1433 -U sa -P "$SA_PASSWORD" <<EOF
    CREATE DATABASE [NetChiDb];
    GO
    USE [NetChiDb];
    GO
    CREATE TABLE [dbo].[AspNetUsers] (
        [Id] [uniqueidentifier] NOT NULL,
        [UserName] [nvarchar](255) NULL,
        [Email] [nvarchar](255) NULL,
        [PasswordHash] [nvarchar](max) NULL,
        [IsActive] [bit] NOT NULL DEFAULT 1,
        [Type] [int] NOT NULL DEFAULT 0,
        [CreatedAt] [datetime2] NOT NULL DEFAULT GETUTCDATE(),
        [LastLoginAt] [datetime2] NULL,
        CONSTRAINT [PK_AspNetUsers] PRIMARY KEY CLUSTERED ([Id])
    );
    GO
    CREATE TABLE [dbo].[Orders] (
        [Id] [uniqueidentifier] NOT NULL,
        [UserId] [uniqueidentifier] NOT NULL,
        [Status] [int] NOT NULL DEFAULT 0,
        [TotalPrice] [decimal](18, 2) NOT NULL DEFAULT 0,
        [CreatedAt] [datetime2] NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] [datetime2] NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY CLUSTERED ([Id])
    );
    GO
    INSERT INTO [dbo].[AspNetUsers] ([Id], [UserName], [Email], [PasswordHash], [Type])
    VALUES 
        (NEWID(), 'admin', 'admin@netchireo.com', 'hash123', 1),
        (NEWID(), 'user1', 'user1@netchireo.com', 'hash123', 0);
    GO
    INSERT INTO [dbo].[Orders] ([Id], [UserId], [Status], [TotalPrice])
    SELECT TOP 2 [Id], [Id], 0, 150000 FROM [dbo].[AspNetUsers];
    GO
EOF
    echo "Database initialized successfully"
else
    echo "Failed to connect to SQL Server"
    exit 1
fi

# Keep the container running
exec /opt/mssql/bin/sqlservr
