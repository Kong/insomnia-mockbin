// Utility Lib for GraphQL

function capitalize(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function inspect(object) {
  switch (typeof(object)) {
  case "undefined":
    return "undefined";
  case "string":
    return "\"" + object.replace(/\n/g, "\\n").replace(/\"/g, "\\\"") + "\"";
  case "object":
    if (object == null) {
      return "null";
    }
    var a = [];
    if (object instanceof Array) {
      for (var i in object) {
        a.push(inspect(object[i]));
      };
      return "[" + a.join(", ") + "]";
    } else {
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          a.push(key + ": " + inspect(object[key]));
        }
      };
      return "{" + a.join(", ") + "}";
    }
  default:
    return object.toString();
  }
}

function objFromString(string) {

   var properties = string.split(', ');
   var obj = {};
   properties.forEach(function(property) {
       var tup = property.split(':');
       obj[tup[0]] = tup[1];
   });

   return obj;
}

// Turn the Javascript type into a GraphQL type
function scalarize(input) {

   var type = typeof(input);
   var output = "";

   switch(type) {

      case 'number':
	output = "Int";
        if(input.toString().indexOf('.') != -1)
		output = "float";
        break;
      default:
	output = typeof(input);
        break;
   }

   return output;
}

function getResolverPrimitives(out, jsonObj) {
    

    if( jsonObj !== null && typeof jsonObj == "object" ) {
        for (let cur of Object.entries(jsonObj)) {
            
	    out.push(cur[0].toString() + ":" + scalarize(cur[1]));

	    // If == 1 it's the second member of a list - dedupe!
            if( cur[0] == '1') break;

            getResolverPrimitives(out, cur[1]);
        }
    }
    else {
        // jsonObj is a number or string
    }
    
    return out;
}

function buildSchema(blob, primitives) {
 	
	var types = "";
	var queries = "type Query {";
	var schema = "";
	var split = "";

	var sub = false;
	for(let cur of primitives) {

		split = cur.split(":");
		if(split[1] == "object" || sub) {
			// Array type

			// No text for delimiters
			if(split[0] == "0")
				continue;

			if(split[0] == "1") {
				types += " } ";
				sub = false;
				continue;
			}
			
			if(split[1] == "object") {
				
				types += "type ";
				types += capitalize(split[0]);
				types += " { ";

				queries += split[0];
				queries += ": [";
				queries += capitalize(split[0]);
				queries += "] ";

				// Up the nest count
				sub = true;
			} else {
				types += split[0];
				types += ": ";
				types += capitalize(split[1]);
				types += " ";
			}
			
			
		} else {
			// Scalar type
			queries += split[0];
			queries += ": ";
			queries += capitalize(split[1]);
			queries += " ";
		}
	}

	// Assemble
	schema += types;
	schema += queries + " } ";

	return schema;
}

function buildMocks(blob, primitives) {

        var mocks = "{ \"String\" : \"\"";
        var split = "";

        var sub = false;
        for(let cur of primitives) {

                split = cur.split(":");
                if(split[1] == "object" || sub) {
                        // Array type
			//mocks += "
		}
	
	}

	mocks += "}";

	return objFromString(mocks);
}

exports.objectToString = function ( input ) {

   var out = inspect(input);
   out = out.replace("'"," ");
   return out;
}

exports.schemaFromJSON = function (data) {

   // Get primitives to build
   out = "";
   err = "{'err':'true'}";

   // Validate it's actually JSON
   var blob = "";

   try {
        blob = JSON.parse(data);
   } catch (e) {
	console.log(e);
        return err;
   }
   // Run Through and get all the resolver types
   var primitives = [];
   primitives = getResolverPrimitives(primitives, blob);

   // Build the schema
   out = buildSchema(blob, primitives);
   return out;

}

exports.mocksFromJSON = function (data) {

   var out = "";
   var err = "";
   var blob = "";

   try {
        blob = JSON.parse(data);
   } catch (e) {
        console.log(e);
        return err;
   }

   // Run Through and get all the resolver types
   var primitives = [];
   primitives = getResolverPrimitives(primitives, blob);
   console.log("\nPrims:" + primitives);

   out = buildMocks(blob, primitives);
   return out;

}


