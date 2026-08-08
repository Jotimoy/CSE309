import os
import sqlite3
from pathlib import Path

DB_PATH = Path(os.getenv('DB_PATH', Path(__file__).parent.parent.parent / 'warehouse.db')).resolve()

def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    return connection

def initialize_database() -> None:
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TEXT NOT NULL
        )
        '''
    )

    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS auth_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        '''
    )

    # Inventory tables
    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            type TEXT,
            created_at TEXT NOT NULL
        )
        '''
    )

    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            description TEXT,
            unit TEXT,
            created_at TEXT NOT NULL
        )
        '''
    )

    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            location_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE,
            FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE,
            UNIQUE(item_id, location_id)
        )
        '''
    )

    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS stock_movements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            from_location INTEGER,
            to_location INTEGER,
            quantity INTEGER NOT NULL,
            reason TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE,
            FOREIGN KEY(from_location) REFERENCES locations(id) ON DELETE SET NULL,
            FOREIGN KEY(to_location) REFERENCES locations(id) ON DELETE SET NULL
        )
        '''
    )

    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            location_id INTEGER,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            is_resolved INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE,
            FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE SET NULL
        )
        '''
    )

    connection.commit()
    connection.close()
