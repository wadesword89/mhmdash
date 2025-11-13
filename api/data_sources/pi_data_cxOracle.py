import cx_Oracle
from cx_Oracle import Connection
import pandas as pd
import psycopg2
from datetime import datetime, timedelta
from typing import List, Dict
import os

# PI Configuration
PI_CONFIG = {
    'host': os.getenv("NEXT_PUBLIC_PI_HOST"),
    'port': os.getenv("NEXT_PUBLIC_PI_PORT"),
    'service': os.getenv("NEXT_PUBLIC_PI_SERVICE"),
    'user': os.getenv("NEXT_PUBLIC_PI_USER"),
    'password': os.getenv("NEXT_PUBLIC_PI_PASSWORD")
}

TAGS_TO_MONITOR = [
    'OAK_EST_UP_LVL',
    'OAK_EST_DN_LEVEL'
]

def pullPiData(startDate: str, endDate: str, tags: List[str]) -> List[Dict]:
    """
    Pull PI historian data for multiple tags within a date range.
    
    Parameters:
    -----------
    startDate : str
        Start date in format 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM'
    endDate : str
        End date in format 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM'
    tags : list of str
        List of PI tag names (e.g., ['OAK_EST_UP_LVL', 'OAK_EST_DN_LEVEL'])
    
    Returns:
    --------
    list of dict
        List of flat records: [{timestamp, tag, value}, ...]
    """
    if not tags:
        print("No tags provided")
        return []
    
    try:
        # Establish database connection
        dsnStr = cx_Oracle.makedsn(
            PI_CONFIG['host'], 
            PI_CONFIG['port'], 
            PI_CONFIG['service']
        )
        connection = Connection(
            user=PI_CONFIG['user'], 
            password=PI_CONFIG['password'], 
            dsn=dsnStr
        )
        
        # Format dates for SQL
        date_start = f"'{startDate}'"
        date_end = f"'{endDate}'"
        
        # Create tag string for SQL (handles multiple tags)
        tag_strings = [f"CAST('{tag}' as nvarchar2(40))" for tag in tags]
        tag_string = ', '.join(tag_strings)
        
        # Query for 15-minute interpolated data
        sql_interp = f"""SELECT * FROM piinterp@piprd b 
        WHERE (b.\"tag\" IN ({tag_string})) 
        AND (b.\"time\" >= TO_DATE({date_start}, 'YYYY-MM-DD'))
        AND (b.\"time\" <= TO_DATE({date_end}, 'YYYY-MM-DD hh24:mi'))
        AND b.\"timestep\" = '15m'"""
        
        # Execute query
        df = pd.read_sql_query(sql_interp, con=connection)
        
        # Close connection
        connection.close()
        
        # Process dataframe
        if df.empty:
            print(f"No data returned for tags {tags}")
            return []
        
        # Select relevant columns and sort by time
        df = df[['tag', 'time', 'value']].sort_values(['tag', 'time'])
        
        # Remove duplicates (keep last)
        df = df.drop_duplicates(subset=['tag', 'time'], keep='last')
        
        print(f"Successfully pulled {len(df)} records for {len(tags)} tags")
        
        # Convert to list of dictionaries for database storage
        result = []
        for _, row in df.iterrows():
            result.append({
                'timestamp': row['time'],
                'tag': row['tag'],
                'value': float(row['value']) if pd.notna(row['value']) else None
            })
        
        return result
        
    except Exception as e:
        print(f"Error pulling data for tags {tags}: {str(e)}")
        return []

# data = pullPiData('2025-09-21', '2025-09-22', TAGS_TO_MONITOR)
# print(data)