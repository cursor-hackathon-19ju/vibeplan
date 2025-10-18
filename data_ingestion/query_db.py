#!/usr/bin/env python3
"""
Simple script to query the SQLite database and show all tables and data.
"""

import sqlite3
import pandas as pd
from src.storage.database import db_manager


def show_tables():
    """Show all tables in the database."""
    conn = sqlite3.connect("data_ingestion.db")
    cursor = conn.cursor()

    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    print("📊 Database Tables:")
    for table in tables:
        print(f"  • {table[0]}")

    conn.close()
    return [table[0] for table in tables]


def show_table_schema(table_name):
    """Show schema for a specific table."""
    conn = sqlite3.connect("data_ingestion.db")
    cursor = conn.cursor()

    print(f"\n🔍 Schema for '{table_name}':")
    cursor.execute(f"PRAGMA table_info({table_name});")
    columns = cursor.fetchall()

    for col in columns:
        print(f"  • {col[1]} ({col[2]}) - {'NOT NULL' if col[3] else 'NULL'}")

    conn.close()


def show_table_data(table_name, limit=10):
    """Show sample data from a table."""
    conn = sqlite3.connect("data_ingestion.db")

    # Get row count
    cursor = conn.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
    count = cursor.fetchone()[0]

    print(f"\n📋 Data from '{table_name}' ({count} total rows):")

    if count > 0:
        # Get sample data
        df = pd.read_sql_query(f"SELECT * FROM {table_name} LIMIT {limit};", conn)
        print(df.to_string(index=False))

        if count > limit:
            print(f"... and {count - limit} more rows")
    else:
        print("  (No data)")

    conn.close()


def main():
    """Main function to show database contents."""
    print("🗄️  Data Ingestion Service Database Explorer")
    print("=" * 50)

    # Show all tables
    tables = show_tables()

    # Show schema and data for each table
    for table in tables:
        show_table_schema(table)
        show_table_data(table, limit=5)
        print("\n" + "-" * 50)


if __name__ == "__main__":
    main()
