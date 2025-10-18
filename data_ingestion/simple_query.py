#!/usr/bin/env python3
"""
Simple database query script.
"""

import sqlite3

def query_database():
    """Query the database and show results."""
    conn = sqlite3.connect('data_ingestion.db')
    cursor = conn.cursor()
    
    print("🗄️  Database Tables:")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    for table in tables:
        table_name = table[0]
        print(f"\n📋 Table: {table_name}")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        print(f"   Rows: {count}")
        
        if count > 0:
            # Show first few rows
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3;")
            rows = cursor.fetchall()
            
            # Get column names
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = [col[1] for col in cursor.fetchall()]
            print(f"   Columns: {', '.join(columns)}")
            
            print("   Sample data:")
            for row in rows:
                print(f"     {row}")
    
    conn.close()

if __name__ == "__main__":
    query_database()
