'use strict'

var mockServer = require('graphql-tools').mockServer;
var graphql = require('graphql').graphql;
var debug = require('debug-log')('mockbin');
var utils = require("./util.js");

var casual = require('casual');

module.exports = function (req, res, next) {

   var query = "";
   var schema = ""; 
 
  // Retrieve JSON blob base on uuid from Redis
  this.client.get('bin:' + req.params.uuid, function (err, value) {
    if (err) {
      debug(err)
      throw err
    }

    if (value) {
        res.view = 'bin/view_graphql'

        // Strip the query string off the req from the line
        query = JSON.parse(req.simple.postData.text)["query"];
 
        // Create a schema from the JSON blob
        var schema = utils.schemaFromJSON(value);
	console.log("\nSchema:\n" + schema);

        // Create the mocks here
	//var mocks = utils.mocksFromSchema(schema);

	//const data = "{'books': [{ 'title': 'blah', 'author': 'blah'},{ 'title': 'what', 'author': 'ever'}]}"
	//const typeDefs = 'type Query { getBooks: [Book], getString: String! } type Book { title: String author: String!}'

	// TEMP nice to see the qury in the window
	console.log("\nQuery:\n" + query);

	var index = 0;
	var d = JSON.parse(value);
	//const mocks = { Books: () => ({ title: JSON.stringify(d.books[index++]), author: "aaaa" }) }
	const mocks = { String: () => casual.sentence, Int: () => casual.integer(0, 1000), }
	//const mocks = utils.mocksFromJSON(value);
        console.log(mocks);

	const preserveResolvers = false
	const server = mockServer(schema, mocks, preserveResolvers);
	const variables = {}

        try {
		server.query(query, variables)
  			.then(function(response){  
      				console.log(response);
      				res.status(200).location('/').body = response;
      				next()
     			})

        } catch(e) {
	
		res.status(500).location('/').body = "{ \"error\" : \"Error mocking server\" }";
		next()
	}
    }
  })
}
