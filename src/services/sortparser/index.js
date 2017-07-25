'use strict';

/**
 * Provides a function to parse sorting from query url format to json format
 * Supports providing a direct json object
 * @constructor
 */
function SortParserService() {
    var self = this;
    this.parse = function parse(str){
        try { return JSON.parse(str); } catch (e) {} // If the query is a json object, return it
        var result = {};
        if(str.startsWith("-")){
            result[str.substr(1)] = -1;
            return result;
        }
        if(str.startsWith("+")){
            result[str.substr(1)] = 1;
            return result;
        }

        // Otherwise, sort by the provided key asc
        result[str] = 1;
        return result;
    }
}

module.exports = new SortParserService();