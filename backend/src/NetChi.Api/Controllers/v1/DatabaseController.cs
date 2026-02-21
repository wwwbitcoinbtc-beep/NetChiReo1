using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using NetChi.Infrastructure.Persistence.Context;
using System.Data;

namespace NetChi.Api.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class DatabaseController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<DatabaseController> _logger;

    public DatabaseController(IConfiguration configuration, ILogger<DatabaseController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet("tables")]
    public async Task<ActionResult> GetAllTables()
    {
        try
        {
            _logger.LogInformation("Fetching all database tables");

            var connectionString = _configuration["ConnectionStrings:DefaultConnection"];
            var tables = new List<object>();

            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                // Get all user tables
                string query = @"
                    SELECT 
                        TABLE_NAME,
                        COLUMN_NAME,
                        DATA_TYPE,
                        IS_NULLABLE,
                        COLUMN_DEFAULT
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = 'dbo'
                    ORDER BY TABLE_NAME, ORDINAL_POSITION";

                using (var command = new SqlCommand(query, connection))
                {
                    command.CommandTimeout = 30;
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var currentTable = "";
                        var currentColumns = new List<object>();

                        while (await reader.ReadAsync())
                        {
                            var tableName = reader["TABLE_NAME"].ToString();

                            if (tableName != currentTable)
                            {
                                if (!string.IsNullOrEmpty(currentTable) && currentColumns.Count > 0)
                                {
                                    tables.Add(new
                                    {
                                        name = currentTable,
                                        columns = currentColumns,
                                        rowCount = await GetTableRowCount(connection, currentTable)
                                    });
                                }

                                currentTable = tableName;
                                currentColumns = new List<object>();
                            }

                            currentColumns.Add(new
                            {
                                name = reader["COLUMN_NAME"].ToString(),
                                dataType = reader["DATA_TYPE"].ToString(),
                                isNullable = reader["IS_NULLABLE"].ToString() == "YES",
                                defaultValue = reader["COLUMN_DEFAULT"]?.ToString() ?? "None"
                            });
                        }

                        // Add last table
                        if (!string.IsNullOrEmpty(currentTable) && currentColumns.Count > 0)
                        {
                            tables.Add(new
                            {
                                name = currentTable,
                                columns = currentColumns,
                                rowCount = await GetTableRowCount(connection, currentTable)
                            });
                        }
                    }
                }
            }

            return Ok(new
            {
                status = "success",
                data = new { tables },
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching database tables");
            return StatusCode(500, new
            {
                status = "error",
                message = "خطا در دریافت اطلاعات جداول",
                error = ex.Message
            });
        }
    }

    [HttpGet("table/{tableName}/data")]
    public async Task<ActionResult> GetTableData(string tableName)
    {
        try
        {
            _logger.LogInformation("Fetching data from table: {TableName}", tableName);

            var connectionString = _configuration["ConnectionStrings:DefaultConnection"];
            var rows = new List<Dictionary<string, object>>();

            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                // Sanitize table name
                if (!IsValidTableName(tableName, connection))
                {
                    return BadRequest(new { error = "جدول معتبر نیست" });
                }

                string query = $"SELECT TOP 100 * FROM [{tableName}]";

                using (var command = new SqlCommand(query, connection))
                {
                    command.CommandTimeout = 30;
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var schema = reader.GetSchemaTable();
                        var columnNames = new List<string>();

                        foreach (DataRow column in schema.Rows)
                        {
                            columnNames.Add(column["ColumnName"].ToString());
                        }

                        while (await reader.ReadAsync())
                        {
                            var row = new Dictionary<string, object>();
                            foreach (var columnName in columnNames)
                            {
                                var value = reader[columnName];
                                row[columnName] = value ?? "NULL";
                            }
                            rows.Add(row);
                        }
                    }
                }
            }

            return Ok(new
            {
                status = "success",
                data = new
                {
                    tableName,
                    rowCount = rows.Count,
                    rows
                },
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching table data");
            return StatusCode(500, new
            {
                status = "error",
                message = "خطا در دریافت داده‌های جدول",
                error = ex.Message
            });
        }
    }

    [HttpGet("stats")]
    public async Task<ActionResult> GetDatabaseStats()
    {
        try
        {
            _logger.LogInformation("Fetching database statistics");

            var connectionString = _configuration["ConnectionStrings:DefaultConnection"];
            var stats = new Dictionary<string, object>();

            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                // Get table count
                string tableCountQuery = @"
                    SELECT COUNT(*) as count 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_SCHEMA = 'dbo'";

                using (var command = new SqlCommand(tableCountQuery, connection))
                {
                    stats["tableCount"] = (int)await command.ExecuteScalarAsync();
                }

                // Get total records
                string totalRecordsQuery = @"
                    SELECT SUM(p.rows) as total_rows
                    FROM sys.tables t
                    JOIN sys.partitions p ON t.object_id = p.object_id
                    WHERE schema_id = 1 AND p.index_id <= 1";

                using (var command = new SqlCommand(totalRecordsQuery, connection))
                {
                    var result = await command.ExecuteScalarAsync();
                    stats["totalRecords"] = result != DBNull.Value ? (long)result : 0;
                }

                // Get database size
                string dbSizeQuery = @"
                    SELECT 
                        CAST(SUM(size) * 8. / 1024 / 1024 AS DECIMAL(15,2)) as SizeInGB
                    FROM sys.master_files
                    WHERE database_id = DB_ID()";

                using (var command = new SqlCommand(dbSizeQuery, connection))
                {
                    var result = await command.ExecuteScalarAsync();
                    stats["sizeGB"] = result != DBNull.Value ? result.ToString() : "0";
                }
            }

            return Ok(new
            {
                status = "success",
                data = stats,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching database statistics");
            return StatusCode(500, new
            {
                status = "error",
                message = "خطا در دریافت آمار database",
                error = ex.Message
            });
        }
    }

    private async Task<int> GetTableRowCount(SqlConnection connection, string tableName)
    {
        try
        {
            string query = $"SELECT COUNT(*) FROM [{tableName}]";
            using (var command = new SqlCommand(query, connection))
            {
                return (int)await command.ExecuteScalarAsync();
            }
        }
        catch
        {
            return 0;
        }
    }

    private bool IsValidTableName(string tableName, SqlConnection connection)
    {
        try
        {
            string query = @"
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = @tableName";

            using (var command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@tableName", tableName);
                var result = (int)command.ExecuteScalar();
                return result > 0;
            }
        }
        catch
        {
            return false;
        }
    }
}
