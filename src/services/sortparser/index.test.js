const SortParserService = require('.');
const assert = require('assert');

describe('sort parsing service', function() {
    it('takes a valid json and encodes it', function() {
        var json = { time: "asc" };
        assert.deepEqual(SortParserService.parse(JSON.stringify(json)), json);
    });

    it('parses a "+" notation', function() {
        assert.deepEqual(SortParserService.parse("+time"), { time: 1 });
    });

    it('parses a "-" notation', function() {
        assert.deepEqual(SortParserService.parse("-time"), { time: -1 });
    });

    it('parses provided key into asc', function() {
        assert.deepEqual(SortParserService.parse("time"), { time: 1 });
    });
});