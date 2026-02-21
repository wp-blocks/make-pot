const { describe, it } = require("node:test");
const assert = require("node:assert");
const { parsePHPFile } = require("../lib/extractors/php.js");

describe("parsePHPFile", () => {
    it("correctly extracts headers from standard docblock (/** ... */)", () => {
        const phpContent = `<?php
/**
 * Plugin Name: My Plugin
 * Description: A basic WordPress plugin template with translation support.
 * Version: 1.0
 * Author: Your Name
 * Text Domain: my-plugin
 * Domain Path: /languages
 */`;
        const result = parsePHPFile(phpContent);
        assert.deepStrictEqual(result, {
            name: "My Plugin",
            description: "A basic WordPress plugin template with translation support.",
            version: "1.0",
            author: "Your Name",
            textDomain: "my-plugin",
            domainPath: "/languages",
        });
    });

    it("correctly extracts headers from simple comment block (/* ... */)", () => {
        const phpContent = `<?php
/*
Plugin Name: My Plugin
Description: A basic WordPress plugin template with translation support.
Version: 1.0
Author: Your Name
Text Domain: my-plugin
Domain Path: /languages
*/`;
        const result = parsePHPFile(phpContent);
        assert.deepStrictEqual(result, {
            name: "My Plugin",
            description: "A basic WordPress plugin template with translation support.",
            version: "1.0",
            author: "Your Name",
            textDomain: "my-plugin",
            domainPath: "/languages",
        });
    });
});
