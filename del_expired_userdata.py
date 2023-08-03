import os
import datetime


def delete_old_files(directory_path):
    for file_name in os.listdir(directory_path):
        file_path = os.path.join(directory_path, file_name)
        if os.path.isfile(file_path):
            creation_time = os.path.getctime(file_path)
            age_in_seconds = datetime.datetime.now().timestamp() - creation_time
            if age_in_seconds > 600:  # 15 minutes in seconds
                os.remove(file_path)

delete_old_files('')
