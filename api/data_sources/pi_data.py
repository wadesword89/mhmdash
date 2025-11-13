import oracledb
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict
import os

#Initialize thicke mode
try:
    oracle_client_lib = os.getenv("ORACLE_CLIENT_LIB")
    if oracle_client_lib:
        oracledb.init_oracle_client(lib_dir=oracle_client_lib)
        print(f"Oracle client initialized from {oracle_client_lib}")
    else:
        oracledb.init_oracle_client()
        print("Oracle client initialized from system PATH")
except Exception as e:
    print(f"Error initializing Oracle client: {str(e)}")

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

def pullPiData(startDate: str, endDate: str) -> List[Dict]:
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
    
    try:
        # Establish database connection
        dsn = oracledb.makedsn(
            host=PI_CONFIG['host'],
            port=int(PI_CONFIG['port']),
            sid=PI_CONFIG['service']
        )
        connection = oracledb.connect(
            user = PI_CONFIG['user'],
            password = PI_CONFIG['password'],
            dsn = dsn
        )
        
        # Format dates for SQL
        date_start = f"'{startDate}'"
        date_end = f"'{endDate}'"
        
        # Create tag string for SQL (handles multiple tags)
        tag_strings = [f"CAST('{tag}' as nvarchar2(40))" for tag in TAGS_TO_MONITOR]
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
            print(f"No data returned for tags {TAGS_TO_MONITOR}")
            return []
        
        # Select relevant columns and sort by time
        df = df[['tag', 'time', 'value']].sort_values(['tag', 'time'])
        
        # Remove duplicates (keep last)
        df = df.drop_duplicates(subset=['tag', 'time'], keep='last')
        
        print(f"Successfully pulled {len(df)} records for {len(TAGS_TO_MONITOR)} tags")
        
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
        print(f"Error pulling data for tags {TAGS_TO_MONITOR}: {str(e)}")
        return []

data = pullPiData('2025-09-21', '2025-09-21')
print('pulled Data', data)

"""
DN_LEVEL?
[
{'timestamp': Timestamp('2025-09-21 00:00:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.1880174}, 
{'timestamp': Timestamp('2025-09-21 00:15:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.1788547}, 
{'timestamp': Timestamp('2025-09-21 00:30:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.1696918}, 
{'timestamp': Timestamp('2025-09-21 00:45:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.1605289}, 
{'timestamp': Timestamp('2025-09-21 01:00:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.1513662}, 
{'timestamp': Timestamp('2025-09-21 01:15:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.1422033}, 
{'timestamp': Timestamp('2025-09-21 01:30:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.1330407}, 
{'timestamp': Timestamp('2025-09-21 01:45:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.1217463}, 
{'timestamp': Timestamp('2025-09-21 02:00:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.1094439}, 
{'timestamp': Timestamp('2025-09-21 02:15:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.0971415}, 
{'timestamp': Timestamp('2025-09-21 02:30:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.0848391}, 
{'timestamp': Timestamp('2025-09-21 02:45:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.0725367}, 
{'timestamp': Timestamp('2025-09-21 03:00:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.0602343}, 
{'timestamp': Timestamp('2025-09-21 03:15:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.0479319}, 
{'timestamp': Timestamp('2025-09-21 03:30:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.0356295}, 
{'timestamp': Timestamp('2025-09-21 03:45:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.0233271}, 
{'timestamp': Timestamp('2025-09-21 04:00:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.0110247}, 
{'timestamp': Timestamp('2025-09-21 04:15:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 1.9987223}, 
{'timestamp': Timestamp('2025-09-21 04:30:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 1.9864199}, 
{'timestamp': Timestamp('2025-09-21 04:45:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 1.9741175}, 
{'timestamp': Timestamp('2025-09-21 05:00:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 1.9618151}, 
{'timestamp': Timestamp('2025-09-21 05:15:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 1.9495127}, 
{'timestamp': Timestamp('2025-09-21 05:30:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 1.9372103}, 
{'timestamp': Timestamp('2025-09-21 05:45:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 1.9249079}, 
{'timestamp': Timestamp('2025-09-21 06:00:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 1.9126055},
...,
{'timestamp': Timestamp('2025-09-22 00:00:00'), 'tag': 'OAK_EST_UP_LVL', 'value': 2.3076696}
]
"""