// This repository is public, so the owner's personal address must not be in any of its files.
// The pattern is built from parts so this file doesn't contain the address itself.
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var ROOT = path.join(__dirname, '..');
var SKIP = { '.git': true, 'node_modules': true };
var TEXT_FILE = /\.(md|js|json|html|css|less|txt|yml|xml)$/;
var USER = ['ea', 'beliuk'].join('');
var PERSONAL = new RegExp(USER + '(@|%40|&#64;)gmail', 'i');

function textFiles(dir) {
    return fs.readdirSync(dir).reduce(function(found, name) {
        if (SKIP[name]) return found;
        var full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) return found.concat(textFiles(full));
        return TEXT_FILE.test(name) ? found.concat([full]) : found;
    }, []);
}

describe('Personal address', function () {
    it('the pattern catches the plain and URL-encoded forms', function() {
        assert.ok(PERSONAL.test(USER + '@gmail.com'));
        assert.ok(PERSONAL.test(USER + '%40gmail.com'));
        assert.ok(!PERSONAL.test('samypesse@gmail.com'));
    });

    it('is not in any file of this public repository', function() {
        var offenders = textFiles(ROOT).filter(function(file) {
            return PERSONAL.test(fs.readFileSync(file, 'utf8'));
        });
        assert.deepEqual(offenders.map(function(file) { return path.relative(ROOT, file); }), []);
    });

    it('still credits the author by name', function() {
        var authors = fs.readFileSync(path.join(ROOT, 'AUTHORS.md'), 'utf8');
        assert.ok(/^- Eduardo Abeliuk$/m.test(authors));
    });
});
