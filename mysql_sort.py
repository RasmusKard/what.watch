import pandas as pd
import mysql.connector.pooling
import mysql.connector

# Create a connection pool to the MySQL database


def sql_sort(content_types, min_rating, max_rating, min_votes, genres, min_year, max_year, connection_pool):
    # Acquire a connection from the pool
    cnx = connection_pool.get_connection()

    query = '''
        SELECT tconst, titleType, primaryTitle, startYear, averageRating, numVotes, genres
        FROM content_data.test
        WHERE averageRating BETWEEN %s AND %s
          AND numVotes > %s
          AND startYear BETWEEN %s AND %s
          AND titleType IN ({placeholders_content_types})
          AND CONCAT(",", genres, ",") REGEXP CONCAT(",", %s, ",");
    '''

    # Generate placeholders for genres and content types
    placeholders_content_types = ', '.join(['%s'] * len(content_types))

    genres = '|'.join(genres)

    # Construct the query with the generated placeholders
    formatted_query = query.format(placeholders_content_types=placeholders_content_types)

    # Execute the query and fetch the results directly into a DataFrame
    df = pd.read_sql_query(formatted_query, cnx, params=(min_rating, max_rating, min_votes, min_year, max_year, *content_types, genres))

    # Release the connection back to the pool
    cnx.close()

    return df