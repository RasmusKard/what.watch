from sqlalchemy import create_engine

# Define the connection string
mysql_engine = create_engine('mysql+mysqlconnector://root:1234@localhost:3306/content_data')

# Test the connection
try:
    # Connect to the database
    with mysql_engine.connect() as connection:
        print("Connection successful!")
except Exception as e:
    print(f"Connection failed: {e}")
