function getAuthType() {
  var response = { type: 'NONE' };
  return response;
}

function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

    config.newInfo()
    .setId('spJsonUrlInstructions')
    .setText('Enter the URL for the SubjectsPlus Guides JSON file');

   config.newTextInput()
    .setId('spJsonUrl')
    .setName('Enter the URL')
    .setHelpText('e.g. https://filegenerator.library.miami.edu/guides/guides.json')

  return config.build();
}

function getFields(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;

  fields.newDimension()
    .setId('title')
    .setType(types.TEXT);

  fields.newDimension()
    .setId('description')
    .setType(types.TEXT);

  fields.newDimension()
    .setId('url')
    .setType(types.URL);

  fields.newDimension()
    .setId('authors')
    .setType(types.TEXT);

  fields.newDimension()
    .setId('shortform')
    .setType(types.TEXT);

  return fields;
}

function getSchema(request) {
  var fields = getFields(request).build();
  return { schema: fields };
}

function responseToRows(requestedFields, response) {
  // Transform parsed data and filter for requested fields
  return response.map(function(guide) {
    var row = [];
    requestedFields.asArray().forEach(function (field) {
      switch (field.getId()) {
        case 'title':
          return row.push(guide.title);
        case 'description':
          return row.push(guide.description);
        case 'url':
          return row.push(guide.url);
        case 'authors':
          return row.push(guide.authors);
        case 'shortform':
          return row.push(guide.shortform);
        default:
          return row.push('');
      }
    });
    return { values: row };
  });
}

function getData(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields().forIds(requestedFieldIds);
  // Fetch and parse data from API
  var response = UrlFetchApp.fetch(request.configParams.spJsonUrl);
  var parsedResponse = JSON.parse(response);
  var rows = responseToRows(requestedFields, parsedResponse);

  return {
    schema: requestedFields.build(),
    rows: rows
  };
}