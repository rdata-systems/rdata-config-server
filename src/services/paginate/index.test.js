const paginateService = require('.');
const assert = require('assert');
const querystring = require('querystring');

describe('pagination service', function() {
    it('calculates skip parameter for the previous page', function() {
        assert.equal(paginateService.prev(0, 5), null);
        assert.equal(paginateService.prev(5, 5), 0);
        assert.equal(paginateService.prev(10, 5), 5);
        assert.equal(paginateService.prev(3, 5), 0);
        assert.equal(paginateService.prev(13, 5), 8);
        assert.equal(paginateService.prev(0, 5), null);

        assert.equal(paginateService.prev(2, 5), 0);
        assert.equal(paginateService.prev(5, 0), 5);
        assert.equal(paginateService.prev(0, 0), null);
    });

    it('calculates skip parameter for the next page', function() {
        assert.equal(paginateService.next(5, 5, 10), null);
        assert.equal(paginateService.next(4, 2, 10), 6);
        assert.equal(paginateService.next(10, 3, 20), 13);
        assert.equal(paginateService.next(15, 5, 17), null);
        assert.equal(paginateService.next(0, 5, 10), 5);
        assert.equal(paginateService.next(5, 5, 20), 10);

        assert.equal(paginateService.next(5, 0, 10), null);
        assert.equal(paginateService.next(5, 5, 0), null);
        assert.equal(paginateService.next(5, -1, 100), null);
    });

    it('calculates skip parameter for the last page', function() {
        assert.equal(paginateService.last(5, 10), 5);
        assert.equal(paginateService.last(3, 10), 6);
        assert.equal(paginateService.last(1, 15), 14);
        assert.equal(paginateService.last(1, 15), 14);

        assert.equal(paginateService.last(0, 15), null);
        assert.equal(paginateService.last(10, 0), 0);
        assert.equal(paginateService.last(-1, 50), null);
    });

    it('gets the page links object', function(){
        var q = { skip: 5, limit: 5, totalCount:20 };
        var url = "/?" + querystring.stringify(q);
        assert.deepEqual(paginateService.getPageLinks(q.skip, q.limit, q.totalCount, url),
            {
                prev: "/?skip=0&limit=5&totalCount=20",
                next: "/?skip=10&limit=5&totalCount=20",
                last: "/?skip=15&limit=5&totalCount=20"
            });
    });
});