const express = require('express');
const cors = require('cors');
const path = require('path');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const app = express();
const PORT = 6161;

// CORS Configuration
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// SQL Server Connection Configuration
const config = {
  server: process.env.DB_SERVER || 'sqlserver',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'NetChi@2024'
    }
  },
  options: {
    database: process.env.DB_NAME || 'NetChiDB',
    rowCollectionOnRequestCompletion: true,
    trustServerCertificate: true,
    encrypt: false,
    connectTimeout: 10000
  }
};

// Master config for creating database
const masterConfig = {
  server: process.env.DB_SERVER || 'sqlserver',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'NetChi@2024'
    }
  },
  options: {
    database: 'master',
    rowCollectionOnRequestCompletion: true,
    trustServerCertificate: true,
    encrypt: false,
    connectTimeout: 10000
  }
};

// Function to initialize database
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const connection = new Connection(masterConfig);
    
    connection.on('connect', (err) => {
      if (err) {
        console.error('Master connection error:', err);
        return reject(err);
      }
      
      const checkDbQuery = `
        IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${process.env.DB_NAME || "NetChiDB"}')
        BEGIN
          CREATE DATABASE [${process.env.DB_NAME || "NetChiDB"}];
        END
      `;
      
      const checkDbRequest = new Request(checkDbQuery, (err) => {
        if (err) {
          console.error('Database creation error:', err);
          connection.close();
          return reject(err);
        }
      });
      
      checkDbRequest.on('requestCompleted', () => {
        connection.close();
        console.log('✓ Database checked/created successfully');
        resolve();
      });
      
      connection.execSql(checkDbRequest);
    });
    
    connection.on('error', (err) => {
      console.error('Connection error:', err);
      reject(err);
    });
    
    connection.connect();
  });
}

// Initialize database on startup
(async () => {
  try {
    await initializeDatabase();
    console.log('✓ Database initialization complete');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
})();

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Database Viewer',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});


// Simple test connection (without database selection)
app.get('/api/test', (req, res) => {
  const testConfig = {
    server: process.env.DB_SERVER || 'sqlserver',
    authentication: {
      type: 'default',
      options: {
        userName: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || 'NetChi@2024'
      }
    },
    options: {
      rowCollectionOnRequestCompletion: true,
      trustServerCertificate: true,
      encrypt: false,
      connectTimeout: 10000
    }
  };
  
  const connection = new Connection(testConfig);
  
  connection.on('connect', (err) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
    
    const request = new Request('SELECT @@VERSION as version', (err) => {
      if (err) {
        console.error('Query error:', err);
        return res.status(500).json({ error: 'Query failed', details: err.message });
      }
    });
    
    let version = '';
    request.on('row', (columns) => {
      version = columns[0].value;
    });
    
    request.on('requestCompleted', () => {
      connection.close();
      res.json({ success: true, version, message: 'Connected to SQL Server' });
    });
    
    connection.execSql(request);
  });
  
  connection.on('error', (err) => {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Connection failed', details: err.message });
  });
  
  connection.connect();
});

// Get All Tables with Column Info
app.get('/api/tables', (req, res) => {
  const connection = new Connection(config);
  
  const query = `
    SELECT 
      TABLE_NAME,
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) as COLUMN_COUNT,
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo') as TABLE_COUNT
    FROM INFORMATION_SCHEMA.TABLES t
    WHERE TABLE_SCHEMA = 'dbo'
    ORDER BY TABLE_NAME
  `;

  connection.on('connect', (err) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Database connection failed', details: err.message });
    }

    const request = new Request(query, (err) => {
      if (err) {
        console.error('Query error:', err);
        return res.status(500).json({ error: 'Query failed', details: err.message });
      }
    });

    const tables = [];
    request.on('row', (columns) => {
      const tableInfo = {
        name: columns[0].value,
        columnCount: columns[1].value,
        tableCount: columns[2].value
      };
      tables.push(tableInfo);
    });

    request.on('requestCompleted', () => {
      connection.close();
      res.json({ success: true, tables, count: tables.length });
    });

    connection.execSql(request);
  });

  connection.on('error', (err) => {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Connection failed', details: err.message });
  });

  connection.connect();
});

// Get Table Structure and Data
app.get('/api/table/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  
  if (!tableName || !/^[A-Za-z0-9_]+$/.test(tableName)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  const connection = new Connection(config);

  connection.on('connect', (err) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Database connection failed', details: err.message });
    }

    // Get table structure
    const structureQuery = `
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}' AND TABLE_SCHEMA = 'dbo'
      ORDER BY ORDINAL_POSITION
    `;

    const structureRequest = new Request(structureQuery, (err) => {
      if (err) {
        console.error('Structure query error:', err);
        return res.status(500).json({ error: 'Structure query failed', details: err.message });
      }
    });

    const columns = [];
    structureRequest.on('row', (cols) => {
      columns.push({
        name: cols[0].value,
        dataType: cols[1].value,
        isNullable: cols[2].value === 'YES',
        defaultValue: cols[3].value || 'None'
      });
    });

    structureRequest.on('requestCompleted', () => {
      // Get row count
      const countQuery = `SELECT COUNT(*) as rowCount FROM [${tableName}]`;
      const countRequest = new Request(countQuery, (err) => {
        if (err) {
          console.error('Count query error:', err);
        }
      });

      let rowCount = 0;
      countRequest.on('row', (cols) => {
        rowCount = cols[0].value;
      });

      countRequest.on('requestCompleted', () => {
        // Get data (TOP 100)
        const dataQuery = `SELECT TOP 100 * FROM [${tableName}]`;
        const dataRequest = new Request(dataQuery, (err) => {
          if (err) {
            console.error('Data query error:', err);
          }
        });

        const rows = [];
        dataRequest.on('row', (cols) => {
          const row = {};
          cols.forEach((col, idx) => {
            const columnName = columns[idx]?.name || `col_${idx}`;
            row[columnName] = col.value;
          });
          rows.push(row);
        });

        dataRequest.on('requestCompleted', () => {
          connection.close();
          res.json({
            success: true,
            table: tableName,
            columns,
            rowCount,
            displayedRows: rows.length,
            rows
          });
        });

        connection.execSql(dataRequest);
      });

      connection.execSql(countRequest);
    });

    connection.execSql(structureRequest);
  });

  connection.on('error', (err) => {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Connection failed', details: err.message });
  });

  connection.connect();
});

// Get Database Statistics
app.get('/api/stats', (req, res) => {
  const connection = new Connection(config);

  connection.on('connect', (err) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Database connection failed', details: err.message });
    }

    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo') as tableCount,
        (SELECT CONVERT(DECIMAL(10,2), SUM(rows)/1024.0/1024.0) FROM sysindexes) as sizeGB
    `;

    const statsRequest = new Request(statsQuery, (err) => {
      if (err) {
        console.error('Stats query error:', err);
        return res.status(500).json({ error: 'Stats query failed', details: err.message });
      }
    });

    let stats = { tableCount: 0, sizeGB: '0.00' };
    statsRequest.on('row', (cols) => {
      stats = {
        tableCount: cols[0].value || 0,
        sizeGB: (cols[1].value || 0).toFixed(2)
      };
    });

    statsRequest.on('requestCompleted', () => {
      connection.close();
      res.json({ success: true, ...stats });
    });

    connection.execSql(statsRequest);
  });

  connection.on('error', (err) => {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Connection failed', details: err.message });
  });

  connection.connect();
});

// Serve modern dashboard from index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Database Viewer running on http://localhost:${PORT}`);
  console.log(`📊 Available at: http://localhost:${PORT}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   GET /health - Health check`);
  console.log(`   GET /api/tables - List all tables`);
  console.log(`   GET /api/table/:tableName - Get table data`);
  console.log(`   GET /api/stats - Database statistics`);
});
