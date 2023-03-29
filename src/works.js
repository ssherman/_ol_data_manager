const {
  basicValue,
  basicArrayValue,
  arrayKeyValues,
  basicTextValue,
  basicJsonValue,
  keyReferenceValue
} = require('./helpers');


// [
//   "authors",
//   "cover_edition",
//   "covers",
//   "created",
//   "description",
//   "dewey_number",
//   "excerpts",
//   "first_publish_date",
//   "first_sentence",
//   "key",
//   "last_modified",
//   "latest_revision",
//   "lc_classifications",
//   "links","location",
//   "notes",
//   "notifications",
//   "number_of_editions",
//   "original_languages",
//   "other_titles",
//   "remote_ids",
//   "revision",
//   "series",
//   "subject_people",
//   "subject_places",
//   "subject_times",
//   "subjects",
//   "subtitle",
//   "table_of_contents",
//   "title",
//   "translated_titles",
//   "type",
//   "works"
// ]
function processWorksLine(line, writeStream) {
  const parts = line.split('\t');

  const type = parts[0];
  const key = parts[1];
  const revision = parts[2];
  const last_modified = parts[3];

  const json = JSON.parse(parts[4]);

  const title = json.title;
  const subtitle = json.subtitle;
  const authors = json.authors;
  const translated_titles = json.translated_titles;
  const subjects = json.subjects;
  const subject_places = json.subject_places;
  const subject_times = json.subject_times;
  const subject_people = json.subject_people;
  const description = json.description;
  const dewey_number = json.dewey_number;
  const lc_classifications = json.lc_classifications;
  const first_sentence = json.first_sentence;
  const original_languages = json.original_languages;
  const other_titles = json.other_titles;
  const first_publish_date = json.first_publish_date;
  const links = json.links;
  const notes = json.notes;
  const cover_edition = json.cover_edition;
  const covers = json.covers;

  let newLine = []
  newLine.push(basicValue(key));
  newLine.push(basicValue(revision));
  newLine.push(basicValue(last_modified));
  newLine.push(basicValue(title));
  newLine.push(basicValue(subtitle));
  newLine.push(basicJsonValue(authors));
  newLine.push(basicJsonValue(translated_titles));
  newLine.push(basicArrayValue(subjects));
  newLine.push(basicArrayValue(subject_places));
  newLine.push(basicArrayValue(subject_times));
  newLine.push(basicArrayValue(subject_people));
  newLine.push(basicTextValue(description));
  newLine.push(basicArrayValue(dewey_number));
  newLine.push(basicArrayValue(lc_classifications));
  newLine.push(basicTextValue(first_sentence));
  newLine.push(arrayKeyValues(original_languages));
  newLine.push(basicArrayValue(other_titles));
  newLine.push(basicValue(first_publish_date));
  newLine.push(basicJsonValue(links));
  newLine.push(basicTextValue(notes));
  newLine.push(keyReferenceValue(cover_edition));
  newLine.push(basicArrayValue(covers));
  newLine.push(basicValue(type));

  let outputLine = newLine.join("\t");
  writeStream.write(outputLine + "\n");
}

module.exports = {
  processWorksLine
};