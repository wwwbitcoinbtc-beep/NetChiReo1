import React, { useState, useEffect } from 'react';
import { Database, Table, ChevronDown, ChevronRight, RefreshCw, Download } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface Column {
  name: string;
  dataType: string;
  isNullable: boolean;
  defaultValue: string;
}

interface TableInfo {
  name: string;
  columns: Column[];
  rowCount: number;
}

interface TableData {
  tableName: string;
  rowCount: number;
  rows: Array<Record<string, any>>;
}

interface DatabaseStats {
  tableCount: number;
  totalRecords: number;
  sizeGB: string;
}

const DatabaseManager: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const { fetchAPI } = useApi();

  // Fetch tables and stats on mount
  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const loadDatabaseInfo = async () => {
    setLoading(true);
    try {
      // Get tables
      const tablesRes = await fetchAPI('/database/tables');
      if (tablesRes?.data?.tables) {
        setTables(tablesRes.data.tables);
      }

      // Get stats
      const statsRes = await fetchAPI('/database/stats');
      if (statsRes?.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading database info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName: string) => {
    try {
      setSelectedTable(tableName);
      const res = await fetchAPI(`/database/table/${tableName}/data`);
      if (res?.data) {
        setTableData(res.data);
      }
    } catch (error) {
      console.error('Error loading table data:', error);
    }
  };

  const toggleTableExpand = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const downloadAsCSV = () => {
    if (!tableData) return;

    const headers = Object.keys(tableData.rows[0]);
    const rows = tableData.rows.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableData.tableName}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Database className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-gray-600">در حال بارگذاری اطلاعات Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">SQL Server Manager</h1>
            </div>
            <button
              onClick={loadDatabaseInfo}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              تازه کردن
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">تعداد جداول</div>
                <div className="text-2xl font-bold text-blue-400">{stats.tableCount}</div>
              </div>
              <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">کل رکورد‌ها</div>
                <div className="text-2xl font-bold text-emerald-400">{stats.totalRecords?.toLocaleString()}</div>
              </div>
              <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">حجم Database</div>
                <div className="text-2xl font-bold text-orange-400">{stats.sizeGB} GB</div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tables List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Table className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">جداول</h2>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tables.map(table => (
                  <div key={table.name}>
                    <div
                      onClick={() => loadTableData(table.name)}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        selectedTable === table.name
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-600/50 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{table.name}</div>
                          <div className="text-xs opacity-75 mt-1">{table.rowCount} رکورد</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTableExpand(table.name);
                          }}
                          className="ml-2"
                        >
                          {expandedTables.has(table.name) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Expanded Columns */}
                      {expandedTables.has(table.name) && (
                        <div className="mt-3 pt-3 border-t border-slate-500">
                          <div className="space-y-2">
                            {table.columns.map(col => (
                              <div key={col.name} className="text-xs">
                                <div className="font-mono text-blue-300">{col.name}</div>
                                <div className="text-gray-400">{col.dataType} {col.isNullable ? '(NULL)' : '(NOT NULL)'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Grid */}
          <div className="lg:col-span-2">
            {tableData ? (
              <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">{tableData.tableName}</h2>
                  <button
                    onClick={downloadAsCSV}
                    className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition"
                  >
                    <Download className="w-4 h-4" />
                    دانلود CSV
                  </button>
                </div>

                <div className="text-sm text-gray-400 mb-4">
                  {tableData.rowCount} رکورد (نمایش تا 100)
                </div>

                {tableData.rows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-600">
                          {Object.keys(tableData.rows[0]).map(key => (
                            <th
                              key={key}
                              className="px-4 py-3 text-right font-semibold text-blue-300 whitespace-nowrap"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.rows.map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-slate-600 hover:bg-slate-600/30 transition"
                          >
                            {Object.values(row).map((value, colIdx) => (
                              <td
                                key={colIdx}
                                className="px-4 py-3 text-gray-300 text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-xs"
                                title={String(value)}
                              >
                                {value === 'NULL' ? (
                                  <span className="text-gray-500 italic">NULL</span>
                                ) : typeof value === 'boolean' ? (
                                  <span className={value ? 'text-emerald-400' : 'text-red-400'}>
                                    {value ? 'بله' : 'خیر'}
                                  </span>
                                ) : (
                                  String(value)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    هیچ داده‌ای یافت نشد
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-8 flex items-center justify-center h-96">
                <div className="text-center text-gray-400">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>یک جدول را انتخاب کنید تا داده‌های آن نمایش داده شود</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;
