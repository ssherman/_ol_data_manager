const {
  basicValue,
  booleanValue,
  basicArrayValue,
  arrayKeyValues,
  basicTextValue,
  basicJsonValue
} = require('./helpers')


// [
//   'publishers',          'physical_format',   'title',
//   'number_of_pages',     'isbn_13',           'isbn_10',
//   'publish_date',        'key',               'authors',
//   'oclc_numbers',        'works',             'type',
//   'subjects',            'source_records',    'latest_revision',
//   'revision',            'created',           'last_modified',
//   'identifiers',         'subject_place',     'covers',
//   'lc_classifications',  'publish_places',    'contributions',
//   'lccn',                'uri_descriptions',  'pagination',
//   'url',                 'notes',             'languages',
//   'dewey_decimal_class', 'publish_country',   'by_statement',
//   'uris',                'ocaid',             'local_id',
//   'subtitle',            'weight',            'series',
//   'physical_dimensions', 'table_of_contents', 'classifications',
//   'other_titles',        'description',       'ia_box_id',
//   'genres',              'edition_name',      'work_title',
//   'subject_time',        'first_sentence',    'copyright_date',
//   'contributors',        'ia_loaded_id',      'isbn_invalid',
//   'purchase_url',        'title_prefix',      'translated_from',
//   'translation_of',      'coverimage',        'location',
//   'scan_records',        'scan_on_demand',    'work_titles',
//   'oclc_number',         'isbn_odd_length',   'full_title',
//   'links',               'create',            'original_isbn',
//   'subject_places',      'subject_people',    'subject_times',
//   'openlibrary',         'providers',         'word_count',
//   'dimensions',          'bookweight',        'isbn',
//   'collections',         'download_url',      'language',
//   'volumes',             'lc_classification', 'remote_ids',
//   'language_code',       'name',              'body',
//   'author_names',        'm',                 'birth_date',
//   'publisher',           'macro',             'price',
//   'coverid',             'edition',           'volume_number',
//   'ia_id',               'by_statements',     'news',
//   'stats',               'code'               'library_of_congress_name',
//   'numer_of_pages',      'oclc'
// ]
function processEditionsLine (line, writeStream) {
  const parts = line.split('\t')

  const type = parts[0]
  const key = parts[1]
  const revision = parts[2]
  const last_modified = parts[3]

  const json = JSON.parse(parts[4])

  const title = json.title
  const title_prefix = json.title_prefix
  const subtitle = json.subtitle
  const other_titles = json.other_titles
  const authors = json.authors
  const by_statement = json.by_statement
  const publish_date = json.publish_date

  const copyright_date = json.copyright_date
  const edition_name = json.edition_name
  const languages = json.languages
  const description = json.description
  const notes = json.notes
  const genres = json.genres
  const table_of_contents = json.table_of_contents;

  const work_titles = json.work_titles
  const series = json.series
  const physical_dimensions = json.physical_dimensions
  const physical_format = json.physical_format
  const number_of_pages = json.number_of_pages
  const subjects = json.subjects
  const pagination = json.pagination
  const lccn = json.lccn
  const ocaid = json.ocaid
  const oclc_numbers = json.oclc_numbers
  const isbn_10 = json.isbn_10
  const isbn_13 = json.isbn_13
  const dewey_decimal_class = json.dewey_decimal_class
  const lc_classifications = json.lc_classifications
  const contributions = json.contributions
  const publish_places = json.publish_places
  const publish_country = json.publish_country
  const publishers = json.publishers
  const distributors = json.distributors
  const first_sentence = json.first_sentence
  const weight = json.weight
  const location = json.location
  const scan_on_demand = json.scan_on_demand

  // collections seems to always be blank
  // const collections = json.collections;
  const uris = json.uris
  const uri_descriptions = json.uri_descriptions
  const translation_of = json.translation_of
  const works = json.works
  const source_records = json.source_records
  const translated_from = json.translated_from
  const scan_records = json.scan_records

  // ignoring volumes for now. it's a weird format and not common
  const volumes = json.volumes;
  const accompanying_material = json.accompanying_material

  const newLine = []
  newLine.push(basicValue(type))
  newLine.push(basicValue(key))
  newLine.push(basicValue(revision))
  newLine.push(basicValue(last_modified))
  newLine.push(basicValue(title))
  newLine.push(basicValue(title_prefix))
  newLine.push(basicValue(subtitle))
  newLine.push(basicArrayValue(other_titles))
  newLine.push(arrayKeyValues(authors))
  newLine.push(basicValue(by_statement))
  newLine.push(basicValue(publish_date))
  newLine.push(basicValue(copyright_date))
  newLine.push(basicValue(edition_name))
  newLine.push(arrayKeyValues(languages))
  newLine.push(basicTextValue(description))
  newLine.push(basicTextValue(notes))
  newLine.push(basicArrayValue(genres))
  newLine.push(basicArrayValue(work_titles))
  newLine.push(basicArrayValue(series))
  newLine.push(basicValue(physical_dimensions))
  newLine.push(basicValue(physical_format))
  newLine.push(basicValue(number_of_pages))
  newLine.push(basicArrayValue(subjects))
  newLine.push(basicValue(pagination))
  newLine.push(basicArrayValue(lccn))
  newLine.push(basicValue(ocaid))
  newLine.push(basicArrayValue(oclc_numbers))
  newLine.push(basicArrayValue(isbn_10))
  newLine.push(basicArrayValue(isbn_13))
  newLine.push(basicArrayValue(dewey_decimal_class))
  newLine.push(basicArrayValue(lc_classifications))
  newLine.push(basicArrayValue(contributions))
  newLine.push(basicArrayValue(publish_places))
  newLine.push(basicValue(publish_country))
  newLine.push(basicArrayValue(publishers))
  newLine.push(basicArrayValue(distributors))
  newLine.push(basicTextValue(first_sentence))
  newLine.push(basicValue(weight))
  newLine.push(basicArrayValue(location))
  newLine.push(booleanValue(scan_on_demand))
  newLine.push(basicArrayValue(uris))
  newLine.push(basicArrayValue(uri_descriptions))
  newLine.push(basicValue(translation_of))
  newLine.push(arrayKeyValues(works))
  newLine.push(basicArrayValue(source_records))
  newLine.push(arrayKeyValues(translated_from))
  newLine.push(arrayKeyValues(scan_records))
  newLine.push(basicValue(accompanying_material))
  newLine.push(basicJsonValue(table_of_contents))
  newLine.push(basicJsonValue(volumes))

  const outputLine = newLine.join('\t')
  writeStream.write(outputLine + '\n')
}

module.exports = {
  processEditionsLine
}
