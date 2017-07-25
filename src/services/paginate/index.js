'use strict';
const merge = require('merge');
const querystring = require('querystring');
const url = require('url');

function PaginateService() {
    var self = this;

    this.prev = function prev(skip, limit){
        if(skip > limit)
            return skip - limit;
        else if(skip === 0)
            return null;
        else
            return 0;
    };

    this.next = function next(skip, limit, totalCount){
        if(limit > 0 && skip + limit < totalCount)
            return skip + limit;
        else
            return null;
    };

    this.last = function last(limit, totalCount){
        if(limit <= 0) return null;
        return Math.max(Math.floor(totalCount / limit) - 1, 0) * limit;
    };

    this.getPageLinks = function(skip, limit, totalCount, reqUrl){
        var urlParsed = url.parse(reqUrl);
        var query = querystring.parse(urlParsed.query);
        var links = {};
        var skipPrev = this.prev(skip, limit);
        var skipNext = this.next(skip, limit, totalCount);
        var skipLast = this.last(limit, totalCount);

        if(skipPrev !== null)
            links.prev = urlParsed.pathname + "?" + querystring.stringify(merge.recursive(true, query, { skip: skipPrev }));

        if(skipNext !== null)
            links.next = urlParsed.pathname + "?" + querystring.stringify(merge.recursive(true, query, { skip: skipNext }));

        if(skipLast !== null)
            links.last = urlParsed.pathname + "?" + querystring.stringify(merge.recursive(true, query, { skip: skipLast }));
        return links;
    }
}

module.exports = new PaginateService();