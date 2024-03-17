import { describe, expect } from '@jest/globals'
import { doTree } from '../src/parser/tree'
import fs from 'fs'

import path from 'path'

describe('doTree js', () => {
	const filepath = 'tests/fixtures/block/javascript.js'
	let filePath: string
	let fileContent: string
	beforeAll(() => {
		filePath = path.join(process.cwd(), filepath)
		console.log('My file path is: ' + filePath)
		fileContent = fs.readFileSync(filePath, 'utf8')
	})
	test('Should parse TSX file and extract strings', () => {
		const fileParsed = doTree(fileContent, filepath)
		expect(fileParsed).toMatchSnapshot()
	})
})

describe('doTree php', () => {
	const filepath = 'tests/fixtures/sourcedir/file.php'
	let filePath: string
	let fileContent: string
	beforeAll(() => {
		filePath = path.join(process.cwd(), filepath)
		console.log('My file path is: ' + filePath)
		fileContent = fs.readFileSync(filePath, 'utf8')
	})
	test('Should parse TSX file and extract strings', () => {
		const fileParsed = doTree(fileContent, filepath)
		expect(fileParsed).toMatchSnapshot()
	})
})

describe('doTree tsx file', () => {
	const filepath = 'tests/fixtures/block/SvgControls.tsx'
	let filePath: string
	let fileContent: string
	beforeAll(() => {
		filePath = path.join(process.cwd(), filepath)
		console.log('My file path is: ' + filePath)
		fileContent = fs.readFileSync(filePath, 'utf8')
	})
	test('Should parse TSX file and extract strings', () => {
		const fileParsed = doTree(fileContent, filepath)
		expect(fileParsed).toMatchSnapshot()
	})
})

describe('doTree php test file', () => {
	/** see wp cli tests */
	it('should extract translations and comments from code content', () => {
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
      wp.i18n._n( 'wp.i18n._n_single', 'wp.i18n._n_plural', number, 'foo-plugin' );

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

      __( \`This is a \${bug}\`, 'foo-plugin' );

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
      `

		const filename = 'filename.php'

		const r = doTree(content, filename)
		const res = Object.values(r)[0]
		const translations = Object.keys(res)
		const comments = Object.entries(res).filter(
			([x, translation]) => !!translation.comments?.translator
		)

		expect(translations.length).toBeGreaterThanOrEqual(19)
		expect(comments.length).toBeGreaterThanOrEqual(8)
		expect(res).toMatchSnapshot()
	})
})
