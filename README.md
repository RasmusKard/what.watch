
<div align="center">
<h1 align="center">
<img src="https://i.imgur.com/b21t3Lu.png"/>
</h1>
<h3>◦ Unlock movie magic with IMDb Randomizer!</h3>
<h3>◦ Developed with the software and tools listed below.</h3>

<p align="center">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style&logo=JavaScript&logoColor=black" alt="JavaScript" />
<img src="https://img.shields.io/badge/HTML5-E34F26.svg?style&logo=HTML5&logoColor=white" alt="HTML5" />
<img src="https://img.shields.io/badge/Python-3776AB.svg?style&logo=Python&logoColor=white" alt="Python" />
<img src="https://img.shields.io/badge/pandas-150458.svg?style&logo=pandas&logoColor=white" alt="pandas" />
<img src="https://img.shields.io/badge/Flask-000000.svg?style&logo=Flask&logoColor=white" alt="Flask" />
<img src="https://img.shields.io/badge/Markdown-000000.svg?style&logo=Markdown&logoColor=white" alt="Markdown" />
</p>
<img src="https://img.shields.io/github/languages/top/RasmusKard/IMDb_Randomizer?style&color=5D6D7E" alt="GitHub top language" />
<img src="https://img.shields.io/github/languages/code-size/RasmusKard/IMDb_Randomizer?style&color=5D6D7E" alt="GitHub code size in bytes" />
<img src="https://img.shields.io/github/commit-activity/m/RasmusKard/IMDb_Randomizer?style&color=5D6D7E" alt="GitHub commit activity" />
<img src="https://img.shields.io/github/license/RasmusKard/IMDb_Randomizer?style&color=5D6D7E" alt="GitHub license" />
</div>

---

## 📒 Table of Contents
- [📒 Table of Contents](#-table-of-contents)
- [📍 Overview](#-overview)
- [⚙️ Features](#-features)
- [📂 Project Structure](#project-structure)
- [🧩 Modules](#modules)
- [🚀 Getting Started](#-getting-started)
- [🗺 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👏 Acknowledgments](#-acknowledgments)

---


## 📍 Overview

The IMDb Randomizer project is a Flask web application that allows users to generate and view randomized content from the IMDb database. It provides a user-friendly interface for filtering and sorting movies and TV shows based on criteria such as genre, rating, release year, and more. The project aims to provide an enjoyable and convenient way for users to discover new and interesting content from IMDb, enhancing their entertainment experience.

---

## ⚙️ Features

| Feature                | Description                           |
| ---------------------- | ------------------------------------- |
| **⚙️ Architecture**     | The system follows a client-server architecture. The server is powered by Flask, serving a web application that generates and serves randomized content with stored session-specific data. The system also handles file management, database retrieval, and error conditions.    |
| **📖 Documentation**   | Documentation is absent from the codebase. It would benefit from inline comments, function and module-level docstrings, and a README file to provide instructions for installation, configuration, and usage.    |
| **🔗 Dependencies**    | The system relies on external libraries like Flask for the web framework, pandas for data manipulation, and Beautiful Soup for web scraping IMDb. It also uses IMDb datasets and parquet files for data processing and storage.    |
| **🧩 Modularity**      | The codebase is organized into multiple modules and files. Each file contains code related to a specific task, such as data cleaning, merging, splitting, and web application functionality. The structure could be improved with clearer separation of concerns and better naming conventions.    |
| **✔️ Testing**          | No explicit testing strategy or tools are evident in the codebase. The project would greatly benefit from the inclusion of unit tests and, ideally, an integrated test framework like pytest or unittest.    |
| **⚡️ Performance**      | Performance is data-dependent. The code handles large IMDb datasets and parquet files, which may present performance challenges during data processing and retrieval. Optimization opportunities could include caching, indexing, and parallel processing where applicable. Proper profiling should be done to identify bottlenecks.    |
| **🔐 Security**        | Some security measures are present, such as a whitelist for SSRF protection when scraping IMDb. However, further analysis is required to determine if other security practices are implemented across the system, including data validation, encryption, secure communications, and protection against common web vulnerabilities.    |
| **🔀 Version Control** | The codebase relies on Git for version control, using GitHub as the hosting platform. It is beneficial for collaboration and maintaining a history of code changes. Proper branching and commit practices should be followed for organized version control.    |
| **🔌 Integrations**    | The system integrates with IMDb by scraping IMDb for movie and TV show information. It also integrates with a database for content retrieval, and external services like poster URLs and torrent sites are linked in the web pages. Further integrations, such as APIs for data retrieval and data storage solutions, can be explored to enhance functionality.    |
| **📶 Scalability**     | The system's ability to handle growth might be limited by the performance considerations associated with large IMDb datasets and parquet files. Scalability could be improved by implementing techniques like distributed computing, parallelization, and sharding the database.  |

---


## 📂 Project Structure




---

## 🧩 Modules

<details closed><summary>Root</summary>

| File                                                                                                                 | Summary                                                                                                                                                                                                                                                                                                                                                |
| ---                                                                                                                  | ---                                                                                                                                                                                                                                                                                                                                                    |
| [app.py](https://github.com/RasmusKard/IMDb_Randomizer/blob/main/app.py)                                             | This code snippet defines a Flask web application that serves a randomized content. The application generates and stores session-specific data, retrieves data from the database, and renders HTML templates to display the randomized content. The code also handles error conditions and file management for storing the generated data.             |
| [parquet_file_sort.py](https://github.com/RasmusKard/IMDb_Randomizer/blob/main/parquet_file_sort.py)                 | The code snippet downloads, cleans up, merges, and splits IMDb data files. It removes unnecessary data, merges title and rating data based on matching identifiers, and splits the data based on content type.                                                                                                                                         |
| [del_expired_userdata.py](https://github.com/RasmusKard/IMDb_Randomizer/blob/main/modules\del_expired_userdata.py)   | The code snippet deletes files older than 10 minutes in a given directory. It checks the creation time of each file, calculates its age in seconds, and removes it if it is older than 10 minutes.                                                                                                                                                     |
| [flask_modules.py](https://github.com/RasmusKard/IMDb_Randomizer/blob/main/modules\flask_modules.py)                 | This code snippet includes functions to retrieve and sort data based on user input, retrieve poster URLs and overviews for movies or TV shows using IMDb ID, and scrape IMDb for information about movies or TV shows. There's also a whitelist of allowed domains for SSRF protection.                                                                |
| [parquet_modules.py](https://github.com/RasmusKard/IMDb_Randomizer/blob/main/modules\parquet_modules.py)             | The code snippet provides functionalities to convert raw IMDb.tsv files to sorted.tsv files by data type (e.g., movie, tv show). It includes methods to clean up the title file, merge it with rating data, split it into files by content type, and delete the generated files.                                                                       |
| [sort_by_input.py](https://github.com/RasmusKard/IMDb_Randomizer/blob/main/modules\sort_by_input.py)                 | The provided code snippet is a class called Randomizationparameters that is used to apply user input to sort.parquet files based on specified parameters. It contains functions to sort, filter, and remove data from a pandas dataframe.                                                                                                              |
| [index.html](https://github.com/RasmusKard/IMDb_Randomizer/blob/main/templates\index.html)                           | This code snippet is an HTML template for a web page that allows users to filter and randomize content from IMDb. It includes functionality for selecting content types and genres, setting rating and votes ranges, and filtering by release year. The code also includes a reset feature for all filters and an option to filter content by IMDb ID. |
| [randomized_content.html](https://github.com/RasmusKard/IMDb_Randomizer/blob/main/templates\randomized_content.html) | This code snippet is an HTML template for an IMDb randomizer website. It includes CSS styling for the layout, a background image, and buttons linking to IMDb and torrent sites. It also dynamically scales the text size within a specified container.                                                                                                |

</details>

---

## 🚀 Getting Started

### ✔️ Prerequisites

Before you begin, ensure that you have the following prerequisites installed:
> - `ℹ️ Requirement 1`
> - `ℹ️ Requirement 2`
> - `ℹ️ ...`

### 📦 Installation

1. Clone the IMDb_Randomizer repository:
```sh
git clone https://github.com/RasmusKard/IMDb_Randomizer
```

2. Change to the project directory:
```sh
cd IMDb_Randomizer
```

3. Install the dependencies:
```sh
pip install -r requirements.txt
```

### 🎮 Using IMDb_Randomizer

```sh
python main.py
```

### 🧪 Running Tests
```sh
pytest
```

---


## 🗺 Roadmap

> - [X] `ℹ️  Task 1: Implement X`
> - [ ] `ℹ️  Task 2: Refactor Y`
> - [ ] `ℹ️ ...`


---

## 🤝 Contributing

Contributions are always welcome! Please follow these steps:
1. Fork the project repository. This creates a copy of the project on your account that you can modify without affecting the original project.
2. Clone the forked repository to your local machine using a Git client like Git or GitHub Desktop.
3. Create a new branch with a descriptive name (e.g., `new-feature-branch` or `bugfix-issue-123`).
```sh
git checkout -b new-feature-branch
```
4. Make changes to the project's codebase.
5. Commit your changes to your local branch with a clear commit message that explains the changes you've made.
```sh
git commit -m 'Implemented new feature.'
```
6. Push your changes to your forked repository on GitHub using the following command
```sh
git push origin new-feature-branch
```
7. Create a new pull request to the original project repository. In the pull request, describe the changes you've made and why they're necessary.
The project maintainers will review your changes and provide feedback or merge them into the main branch.

---

## 📄 License

This project is licensed under the `ℹ️  INSERT-LICENSE-TYPE` License. See the [LICENSE](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-license-to-a-repository) file for additional info.

---

## 👏 Acknowledgments

> - `ℹ️  List any resources, contributors, inspiration, etc.`

---
