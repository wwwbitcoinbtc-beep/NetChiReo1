const express = require('express');
const cors = require('cors');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const app = express();
const PORT = 6161;

// CORS Configuration
app.use(cors());
app.use(express.json());

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

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Database Viewer',
    port: PORT,
    timestamp: new Date().toISOString()
  });
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

// Serve HTML Dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SQL Server Database Viewer</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
        }
        .header {
          background: white;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 {
          color: #1e3c72;
          margin-bottom: 10px;
          font-size: 32px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: center;
        }
        .stat-card h3 {
          color: #666;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .stat-card .value {
          color: #1e3c72;
          font-size: 32px;
          font-weight: bold;
        }
        .tables-container {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .table-header {
          background: #f8f9fa;
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
        }
        .table-header h2 {
          color: #1e3c72;
          font-size: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 15px;
          text-align: right;
          border-bottom: 1px solid #e9ecef;
        }
        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #1e3c72;
        }
        tr:hover {
          background: #f8f9fa;
        }
        .btn {
          background: #2a5298;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.3s;
        }
        .btn:hover {
          background: #1e3c72;
        }
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        .error {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 SQL Server Database Viewer</h1>
          <p>پورت 6161 - نمایش اطلاعات SQL Server</p>
        </div>

        <div id="stats" class="stats"></div>
        <div id="error"></div>
        <div id="content" class="tables-container">
          <div class="table-header">
            <h2>جداول Database</h2>
          </div>
          <div id="tables" class="loading">در حال بارگذاری...</div>
        </div>
      </div>

      <script>
        async function loadData() {
          try {
            // Load Stats
            const statsRes = await fetch('/api/stats');
            const statsData = await statsRes.json();
            if (statsData.success) {
              document.getElementById('stats').innerHTML = \`
                <div class="stat-card">
                  <h3>تعداد جداول</h3>
                  <div class="value">\${statsData.tableCount}</div>
                </div>
                <div class="stat-card">
                  <h3>حجم Database</h3>
                  <div class="value">\${statsData.sizeGB} GB</div>
                </div>
              \`;
            }

            // Load Tables
            const tablesRes = await fetch('/api/tables');
            const tablesData = await tablesRes.json();
            if (tablesData.success) {
              let html = '<table><thead><tr><th>نام جدول</th><th>تعداد ستون‌ها</th><th>عملیات</th></tr></thead><tbody>';
              tablesData.tables.forEach(table => {
                html += \`<tr>
                  <td>\${table.name}</td>
                  <td>\${table.columnCount}</td>
                  <td><button class="btn" onclick="viewTable('\${table.name}')">مشاهده</button></td>
                </tr>\`;
              });
              html += '</tbody></table>';
              document.getElementById('tables').innerHTML = html;
            }
          } catch (error) {
            document.getElementById('error').innerHTML = '<div class="error">خطا در بارگذاری اطلاعات: ' + error.message + '</div>';
            console.error('Error:', error);
          }
        }

        async function viewTable(tableName) {
          try {
            const res = await fetch('/api/table/' + tableName);
            const data = await res.json();
            if (data.success) {
              let html = '<table><thead><tr>';
              data.columns.forEach(col => {
                html += '<th>' + col.name + '<br><small>' + col.dataType + '</small></th>';
              });
              html += '</tr></thead><tbody>';
              data.rows.forEach(row => {
                html += '<tr>';
                data.columns.forEach(col => {
                  html += '<td>' + (row[col.name] || '-') + '</td>';
                });
                html += '</tr>';
              });
              html += '</tbody></table>';
              
              document.getElementById('tables').innerHTML = '<div class="table-header"><h2>جدول: ' + tableName + ' (' + data.rowCount + ' رکورد)</h2></div>' + html;
            }
          } catch (error) {
            console.error('Error loading table:', error);
          }
        }

        loadData();
      </script>
    </body>
    </html>
  `);
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Database Viewer running on http://localhost:${PORT}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   GET /health - Health check`);
  console.log(`   GET /api/tables - List all tables`);
  console.log(`   GET /api/table/:tableName - Get table data`);
  console.log(`   GET /api/stats - Database statistics`);
});
