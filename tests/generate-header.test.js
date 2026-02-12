const { describe, it } = require("node:test");
const assert = require("node:assert");
const { generateHeader } = require("../lib/extractors/headers");
const process = require("node:process");

describe("generateHeader", () => {
    it("should return default headers when silent is true and fields are missing", async () => {
        const args = {
            slug: "test-slug",
            debug: false,
            domain: "plugin",
            paths: { cwd: process.cwd(), out: "languages" },
            options: { silent: true },
            headers: {
                version: "0.0.1",
                author: "AUTHOR",
                email: "AUTHOR EMAIL"
            },
        };

        const headers = await generateHeader(args);

        assert.ok(headers, "Headers should be generated");
        assert.strictEqual(headers["Project-Id-Version"], "test-slug 0.0.1");
        assert.strictEqual(headers["Last-Translator"], "AUTHOR <AUTHOR EMAIL>");
    });
});
