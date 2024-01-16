import { describe, expect } from '@jest/globals'
import { getStrings } from '../src/parser'
import { doTree } from '../src/extractors'
// @ts-expect-error
import Js from 'tree-sitter-javascript'
// @ts-expect-error
import Php from 'tree-sitter-php'
// @ts-expect-error
import Ts from 'tree-sitter-typescript'
import Parser from 'tree-sitter'

describe('getStrings', () => {
	it('should extract translations with context', () => {
		const filename = 'filename'
		const content = `<?php echo _x('Hello World', 'greeting'); ?>`
		const expected = [
			{
				comments: undefined,
				reference: '#: filename:1',
				type: 'text_context_domain',
				raw: ['Hello World', 'greeting'],
				msgid: 'Hello World',
			},
		]

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})
	it('should extract translations from code content with no context or translator comments', () => {
		const filename = 'filename'
		const content = `<?php _e('Hello World'); ?>`
		const expected = [
			{
				reference: '#: filename:1',
				type: 'text_domain',
				raw: ['Hello World'],
				msgid: 'Hello World',
			},
		]

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})

	it('should extract translations with comments', () => {
		const filename = 'filename'
		const content = `/** translators: ciao! */
		<?php echo _x('Hello World', 'greeting'); ?>`
		const expected = [
			{
				comments: 'translators: ciao!',
				reference: '#: filename:2',
				type: 'text_context_domain',
				raw: ['Hello World', 'greeting'],
				msgid: 'Hello World',
			},
		]

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})

	it('should extract translations with comments reporting the right position', () => {
		const filename = 'filename'
		const content = `



/** line 5*/




		<?php echo _x('Hello World', 'greeting'); ?>`
		const expected = [
			{
				reference: '#: filename:10',
				type: 'text_context_domain',
				raw: ['Hello World', 'greeting'],
				msgid: 'Hello World',
			},
		]

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})

	it('should extract translations inside a sprint', () => {
		const filename = 'filename'
		const content = ` <?php
$url = 'http://example.com';
$link = sprintf( wp_kses( __( 'Check out this link to my <a href="%s">website</a> made with WordPress.', 'my-text-domain' ), array(  'a' => array( 'href' => array() ) ) ), esc_url( $url ) );
echo $link;`
		const expected = [
			{
				msgid: 'Check out this link to my <a href="%s">website</a> made with WordPress.',
				raw: [
					'Check out this link to my <a href="%s">website</a> made with WordPress.',
					'my-text-domain',
				],
				reference: '#: filename:3',
				type: 'text_domain',
			},
		]

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})

	it('should extract translations with translator comments inside the formatting hell', () => {
		const filename = 'filename'
		const content = ` <?php /** 1*/
/** 2*/
/** 3*/		printf(
/** 4*/			/* translators: 1: Site URL, 2: Username, 3: User email address, 4: Lost password URL. */
		__( 'Your site at %1$s is active. You may now log in to your site using your chosen username of &#8220;%2$s&#8221;. Please check your email inbox at %3$s for your password and login instructions. If you do not receive an email, please check your junk or spam folder. If you still do not receive an email within an hour, you can <a href="%4$s">reset your password</a>.' ),
/** 6*/			sprintf( '<a href="http://%1$s%2$s">%1$s%2$s</a>', $signup->domain, $blog_details->path ),
/** 7*/			$signup->user_login,
/** 8*/			$signup->user_email,
/** 9*/			wp_lostpassword_url()
/** 10*/		);

/** 11*/		echo __( 'aaaaaaa' );
/** 12*/		echo __( 'aaaaaaa' );
/** 13 */		echo __( 'aaaaaaa' );
/** 14 */
/** 15 */      printf(
\t\t\t\t/* translators: 1: Site URL, 2: Username, 3: User email address, 4: Lost password URL. */
\t\t\n\t\t__( 'aaaaaaa' ),
/** 18 */\t\t\t\t);`
		const expected = [
			{
				msgid: 'Your site at %1$s is active. You may now log in to your site using your chosen username of &#8220;%2$s&#8221;. Please check your email inbox at %3$s for your password and login instructions. If you do not receive an email, please check your junk or spam folder. If you still do not receive an email within an hour, you can <a href="%4$s">reset your password</a>.',
				raw: [
					'Your site at %1$s is active. You may now log in to your site using your chosen username of &#8220;%2$s&#8221;. Please check your email inbox at %3$s for your password and login instructions. If you do not receive an email, please check your junk or spam folder. If you still do not receive an email within an hour, you can <a href="%4$s">reset your password</a>.',
				],
				reference: '#: filename:5',
				type: 'text_domain',
			},
			{
				msgid: 'aaaaaaa',
				raw: ['aaaaaaa'],
				reference: '#: filename:12',
				type: 'text_domain',
			},
			{
				msgid: 'aaaaaaa',
				raw: ['aaaaaaa'],
				reference: '#: filename:13',
				type: 'text_domain',
			},
			{
				msgid: 'aaaaaaa',
				raw: ['aaaaaaa'],
				reference: '#: filename:14',
				type: 'text_domain',
			},
			{
				msgid: 'aaaaaaa',
				raw: ['aaaaaaa'],
				reference: '#: filename:19',
				type: 'text_domain',
			},
		]

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})
})
