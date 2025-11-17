import oracledb
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict
import os

#Initialize thick mode
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
    'host': os.getenv("PI_HOST"),
    'port': os.getenv("PI_PORT"),
    'service': os.getenv("PI_SERVICE"),
    'user': os.getenv("PI_USER"),
    'password': os.getenv("PI_PASSWORD")
}


def pullPiData(startDate: str, endDate: str, tag:str) -> List[Dict]:
    """
    Pull PI historian data for a specific tag within a date range.
    
    Parameters:
    -----------
    startDate : str
        Start date in format 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS'
    endDate : str
        End date in format 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS'
    tag : str
        PI tag name to get data (e.g., 'OAK_EST_UP_LVL' or 'OAK_EST_DN_LVL')
    
    Returns:
    --------
    dict
        Dictionary with structure format:
        {
            "source": "EBMUD",
            "meta": {"tag": tag},
            "timeSeries": [{"t": timestamp, "value": value},...]
        }
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
        date_start_clean = startDate.replace('T', ' ')
        date_end_clean = endDate.replace('T', ' ')
        date_start = f"'{date_start_clean}'"
        date_end = f"'{date_end_clean}'"
        
        # Use the specific tag parameter
        tag_string = f"CAST('{tag}' as nvarchar2(40))"

        # Query for 15-minute interpolated data
        sql_interp = f"""SELECT * FROM piinterp@piprd b 
        WHERE (b.\"tag\" = {tag_string}) 
        AND (b.\"time\" >= TO_DATE({date_start}, 'YYYY-MM-DD HH24:MI:SS'))
        AND (b.\"time\" <= TO_DATE({date_end}, 'YYYY-MM-DD HH24:MI:SS'))
        AND b.\"timestep\" = '15m'"""
        
        # Execute query
        df = pd.read_sql_query(sql_interp, con=connection)
        
        # Close connection
        connection.close()
        
        # Process dataframe
        if df.empty:
            print(f"No data returned for tag {tag}")
            return {"source": "EBMUD", "meta": {"tag": tag}, "data": []}
        
        # Select relevant columns and sort by time
        df = df[['tag', 'time', 'value']].sort_values('time')
        
        # Remove duplicates (keep last)
        df = df.drop_duplicates(subset='time', keep='last')
        
        print(f"Successfully pulled {len(df)} records for tag {tag}")
        
        # Convert to format for frontend
        time_series = []
        for _, row in df.iterrows():
            if pd.notna(row['value']):
                time_series.append({
                    "dateTime": row['time'].isoformat(),
                    "reading": round(float(row['value']) * 12 , 2) #convert feet to inches
                })
        return {
            "source": "EBMUD",
            "meta": {"tag": tag},
            "data": time_series
        }
    except Exception as e:
        print(f"Error pulling data for tag {tag}: {str(e)}")
        return {
            "source": "EBMUD",
            "meta": {"tag": tag},
            "data": [],
            "error": str(e)
        }

# data = pullPiData('2025-09-21', '2025-09-22', 'OAK_EST_DN_LVL')
# print('PULLED API Data :', data)

"""

"""