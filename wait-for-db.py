#!/usr/bin/env python3
import socket
import time
import sys

def check_sql_server(host, port=1433, timeout=300):
    """Check if SQL Server is accessible"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((host, port))
            sock.close()
            print(f"✓ SQL Server is accessible on {host}:{port}")
            return True
        except:
            elapsed = int(time.time() - start_time)
            print(f"Waiting for SQL Server... ({elapsed}s)")
            time.sleep(5)
    
    print("✗ SQL Server connection failed")
    return False

if __name__ == "__main__":
    if check_sql_server("sqlserver", 1433):
        print("Database server is ready!")
        sys.exit(0)
    else:
        print("Failed to connect to database server")
        sys.exit(1)
