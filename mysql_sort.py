def sql_sort(content_types, min_rating, max_rating, min_votes, genres, min_year, max_year, connection_pool,
             watched_content, default_values):
    # Acquire a connection from the pool
    cnx = connection_pool.get_connection()

    placeholders_content_types = ', '.join(['%s'] * len(content_types))
    watched_content_placeholders = ', '.join(['%s'] * len(watched_content))
    genres_string = '|'.join(genres)

    query_parts = [
        'SELECT tconst, titleType, primaryTitle, startYear, averageRating, numVotes, genres',
        'FROM test'
    ]

    conditions = []
    params = []
    if min_rating != default_values['default_min_rating'] or max_rating != default_values['default_max_rating']:
        conditions.append('averageRating BETWEEN %s AND %s')
        params.extend([min_rating, max_rating])

    if min_votes != default_values['default_min_votes']:
        conditions.append('numVotes > %s')
        params.append(min_votes)

    if min_year != default_values['default_min_year'] or max_year != default_values['default_max_year']:
        conditions.append('startYear BETWEEN %s AND %s')
        params.extend([min_year, max_year])

    if sorted(content_types) != sorted(default_values['default_content_types']):
        conditions.append('titleType IN ({})'.format(placeholders_content_types))
        params.extend(content_types)

    if sorted(genres) != sorted(default_values['default_genres']):
        conditions.append('CONCAT(",", genres, ",") REGEXP CONCAT(",", %s, ",")')
        params.append(genres_string)

    if watched_content:
        conditions.append('tconst NOT IN ({})'.format(watched_content_placeholders))
        params.extend(watched_content)

    if conditions:
        query_parts.append('WHERE ' + ' AND '.join(conditions))

    formatted_query = ' '.join(query_parts)
    # Execute the query
    cursor = cnx.cursor()
    cursor.execute(formatted_query, params)
    result = cursor.fetchall()

    cursor.close()
    # Release the connection back to the pool
    cnx.close()

    return result
