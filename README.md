- [Ol Data Manager](#ol-data-manager)


# Ol Data Manager
This is a tool that converts Open Library data dumps to TSV files to import into PostgreSQL. The data dumps can be downloaded here: https://openlibrary.org/developers/dumps

Typically the data dump format for Open Library is 5 fields. type, key, revision, last_modified, and then a JSON field of all the data. The format of the JSON is very messy and inconsistent and does not match in the slightest the schema displayed on the website.

This tool inspects the data dump and creates tables based on the structure of the JSON data. Every table will have the same 4 permanent fields:

- record_type (text)
- key (text) (primary key)
- revision (integer)
- last_modified (datetime)

The rest of the fields will be the JSON keys found in the dump. The various field types are:
- text
- jsonb (for true json values)
- text (array)
- boolean
- integer

There is a common pattern in the JSON data where a value will be stored in JSON like this:
"original_languages": [{"key": "/languages/eng"}]

this tool would create a text array column named "original_languages" and the values would be ["languages/eng"]

Another data normalization the tool does is converts a field like this:
"first_sentence": {"type": "/type/text", "value": "Organized religion..."}

into a column named "first_sentence" with a text type and value of "Organized religion...".

# How to Use 

## Install
```bash
npm install ol_data_manager
```

## Process the data and create a tsv
```bash
npx ol-data-manager --type works --input ../ol_dump_works_2023-01-31.txt --action process --output ../ol_dump_works_2023-01-31.tsv
```

## Create the table
```bash
DB_NAME=dbname DB_USER=postgres DB_PASSWORD=password DB_HOST=localhost DB_PORT=6543 npx ol-data-manager --type works --input ../ol_dump_works_2023-01-31.txt --action create --table_name ol_works
```

Keep in mind these files are HUGE and the script will take a very long time to complete. As of 4/2/2023
- Authors takes 27~ minutes
- Works takes 72~ minutes
- Editions takes 153~ minutes

## Import the data
launch psql and use the following command assuming the db is empty.
```bash
\copy table_name FROM '/path/to/file.tsv' WITH DELIMITER E'\t' NULL 'NULLNULL' CSV HEADER;
```

## License

OL Data Manager is [MIT licensed](./LICENSE).