const path = require("node:path");
const fs = require("node:fs");
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { doTree } = require("../lib/");

describe("doTree js", () => {
	const filepath = "tests/fixtures/block/javascript.js";
	const filePath = path.join(process.cwd(), filepath);
	const fileContent = fs.readFileSync(filePath, "utf8");
	it("Should parse TSX file and extract strings", () => {
		const fileParsed = doTree(fileContent, filepath);
		assert.deepEqual(fileParsed.blocks[0], {
			comments: {
				reference: ["tests\\fixtures\\block\\javascript.js:7"],
				translator: undefined,
			},
			msgctxt: undefined,
			msgid: "Simple Block",
			msgid_plural: undefined,
			msgstr: [""],
		});
	});
});

describe("doTree php", () => {
	const filepath = "tests/fixtures/plugin/plugin.php";
	const filePath = path.join(process.cwd(), filepath);
	const fileContent = fs.readFileSync(filePath, "utf8");
	it("Should parse TSX file and extract strings", () => {
		const fileParsed = doTree(fileContent, filepath);
		assert.deepEqual(fileParsed.blocks[1], {
			comments: {
				reference: ["tests\\fixtures\\plugin\\plugin.php:65"],
				translator: undefined,
			},
			msgctxt: undefined,
			msgid: "You\\'re a silly monkey",
			msgid_plural: undefined,
			msgstr: [""],
		});
	});
});

describe("doTree tsx file", () => {
	const filepath = "tests/fixtures/block/SvgControls.tsx";
	const filePath = path.join(process.cwd(), filepath);
	const fileContent = fs.readFileSync(filePath, "utf8");
	it("Should parse TSX file and extract strings", () => {
		const fileParsed = doTree(fileContent, filepath);
		assert.deepEqual(fileParsed.blocks[2], {
			comments: {
				reference: ["tests\\fixtures\\block\\SvgControls.tsx:107"],
				translator: undefined,
			},
			msgctxt: undefined,
			msgid: "Replace SVG",
			msgid_plural: undefined,
			msgstr: [""],
		});
	});
});

describe("doTree php test file", async () => {
	/** see wp cli tests */
	it("should extract translations and comments from code content", () => {
		const content = `<?php

      // translators: Foo Bar Comment
      __( 'Foo Bar', 'foo-plugin' );

      // TrANslAtORs: Bar Baz Comment
      __( 'Bar Baz', 'foo-plugin' );

      // translators: Software name
      const string = __( 'WordPress', 'foo-plugin' );

      // translators: So much space

      __( 'Spacey text', 'foo-plugin' );

      /* translators: Long comment
      spanning multiple
      lines */
      const string = __( 'Short text', 'foo-plugin' );

      ReactDOM.render(
        <h1>{__( 'Hello JSX', 'foo-plugin' )}</h1>,
        document.getElementById('root')
      );

      wp.i18n.__( 'wp.i18n.__', 'foo-plugin' );

      const translate = wp.i18n;
      translate.__( 'translate.__', 'foo-plugin' );

      Object(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__["__"])( 'webpack.__', 'foo-plugin' );
      Object(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__[/* __ */ "a"])( 'webpack.mangle.__', 'foo-plugin' );

      Object(u.__)( 'minified.__', 'foo-plugin' );
      Object(j._x)( 'minified._x', 'minified._x_context', 'foo-plugin' );

      /* translators: babel */
      (0, __)( 'babel.__', 'foo-plugin' );
      (0, _i18n.__)( 'babel-i18n.__', 'foo-plugin' );
      (0, _i18n._x)( 'babel-i18n._x', 'babel-i18n._x_context', 'foo-plugin' );

      eval( "__( 'Hello Eval World', 'foo-plugin' );" );

      __( "ASDASDASD', 'foo-plugin' );

      /**
       * Plugin Name: Plugin name
       */

      /* translators: Translators 1! */
      _e( 'hello world', 'foo-plugin' );

      /* Translators: Translators 2! */
      $foo = __( 'foo', 'foo-plugin' );

      /* translators: localized date and time format, see https://secure.php.net/date */
      __( 'F j, Y g:i a', 'foo-plugin' );

      // translators: let your ears fly!
      __( 'on', 'foo-plugin' );

      /*
       * Translators: If there are characters in your language that are not supported
       * by Lato, translate this to 'off'. Do not translate into your own language.
       */
       __( 'off', 'foo-plugin' );

      /* translators: this should get extracted. */ $foo = __( 'baba', 'foo-plugin' );

      /* translators: boo */ /* translators: this should get extracted too. */ /* some other comment */ $bar = g( __( 'bubu', 'foo-plugin' ) );

      {TAB}/*
      {TAB} * translators: this comment block is indented with a tab and should get extracted too.
      {TAB} */
      {TAB}__( 'yolo', 'foo-plugin' );

      /* translators: This is a comment */
      __( 'Plugin name', 'foo-plugin' );

      /* Translators: This is another comment! */
      __( 'https://example.com', 'foo-plugin' );
      `;

		const filename = "filename.php";

		const r = doTree(content, filename).blocks;
		const res = Object.values(r)[0];

		assert.strictEqual(r.map((block) => block).length, 11);
		assert.strictEqual(r.filter((block) => block.comments).length, 11);
	});
});
