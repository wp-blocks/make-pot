import { describe, expect } from '@jest/globals'
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
		const expected = {
			'': {
				'Hello World': {
					comments: {
						reference: 'filename:1',
					},
					msgid: 'Hello World',
					msgstr: [],
				},
			},
		}

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})
	it('should extract translations from code content with no context or translator comments', () => {
		const filename = 'filename'
		const content = `<?php _e('Hello World'); ?>`
		const expected = {
			'': {
				'Hello World': {
					comments: {
						reference: 'filename:1',
					},
					msgid: 'Hello World',
					msgstr: [],
				},
			},
		}

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})

	it('should extract translations with comments', () => {
		const filename = 'filename'
		const content = `
		<?php /** translators: ciao! */ echo _x('Hello World', 'greeting'); ?>`
		const expected = {
			'': {
				'Hello World': {
					comments: {
						reference: 'filename:2',
						translator: 'ciao!',
					},
					msgid: 'Hello World',
					msgstr: [],
				},
			},
		}

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})

	it('should extract translations with comments reporting the right position', () => {
		const filename = 'filename'
		const content = `



/** line 5*/




		<?php echo _x('Hello World', 'greeting'); ?>`
		const expected = {
			'': {
				'Hello World': {
					comments: {
						reference: 'filename:10',
					},
					msgid: 'Hello World',
					msgstr: [],
				},
			},
		}

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})

	it('should extract translations inside a sprint', () => {
		const filename = 'filename'
		const content = ` <?php
$url = 'http://example.com';
$link = sprintf( wp_kses( __( 'Check out this link to my <a href="%s">website</a> made with WordPress.', 'my-text-domain' ), array(  'a' => array( 'href' => array() ) ) ), esc_url( $url ) );
echo $link;`
		const expected = {
			'': {
				'Check out this link to my <a href="%s">website</a> made with WordPress.':
					{
						comments: {
							reference: 'filename:3',
						},
						msgid: 'Check out this link to my <a href="%s">website</a> made with WordPress.',
						msgstr: [],
					},
			},
		}

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})

	it('should extract translations with translator comments inside the formatting hell', () => {
		const filename = 'filename'
		const content = `<?php /** 1*/
/** 2*/ /** translators: 1: Site URL, 2: Username, 3: User email address, 4: Lost password URL. */
                sprintf(__( 'Your site at %1$s is active. You may now log in to your site using your chosen username of &#8220;%2$s&#8221;. Please check your email inbox at %3$s for your password and login instructions. If you do not receive an email, please check your junk or spam folder. If you still do not receive an email within an hour, you can <a href="%4$s">reset your password</a>.' ),
/** 6*/\t\t\tsprintf( '<a href="http://%1$s%2$s">%1$s%2$s</a>', $signup->domain, $blog_details->path ),
/** 7*/\t\t\t$signup->user_login,
/** 8*/\t\t\t$signup->user_email,
/** 9*/\t\t\twp_lostpassword_url()
/** 10*/\t\t);

/** 11*/\t\techo __( 'aaaaaaa' );
/** 12*/\t\techo __( 'aaaaaaa' );
/** 13 */\t\techo __( 'aaaaaaa' );
/** 14 */
/** 15 */      printf(
\t\t\t\t/* translators: 1: Site URL, 2: Username, 3: User email address, 4: Lost password URL. */
\t\t\t__( 'aaaaaaa' ),
/** 18 */\t\t\t\t);
/** translators:aaaa */
echo __( 'Your site at %1$s' )

/** translators:aaaa */
_e( 'Your site at %1$s' )`
		const expected = [
			{
				'': {
					'Your site at %1$s is active. You may now log in to your site using your chosen username of &#8220;%2$s&#8221;. Please check your email inbox at %3$s for your password and login instructions. If you do not receive an email, please check your junk or spam folder. If you still do not receive an email within an hour, you can <a href="%4$s">reset your password</a>.':
						{
							comments: {
								reference: 'filename:3',
							},
							msgid: 'Your site at %1$s is active. You may now log in to your site using your chosen username of &#8220;%2$s&#8221;. Please check your email inbox at %3$s for your password and login instructions. If you do not receive an email, please check your junk or spam folder. If you still do not receive an email within an hour, you can <a href="%4$s">reset your password</a>.',
							msgstr: [],
						},
				},
			},
			{
				'': {
					aaaaaaa: {
						comments: {
							reference: 'filename:10',
						},
						msgid: 'aaaaaaa',
						msgstr: [],
					},
				},
			},
			{
				'': {
					aaaaaaa: {
						comments: {
							reference: 'filename:11',
						},
						msgid: 'aaaaaaa',
						msgstr: [],
					},
				},
			},
			{
				'': {
					aaaaaaa: {
						comments: {
							reference: 'filename:12',
						},
						msgid: 'aaaaaaa',
						msgstr: [],
					},
				},
			},
			{
				'': {
					aaaaaaa: {
						comments: {
							reference: 'filename:16',
							translator: '',
						},
						msgid: 'aaaaaaa',
						msgstr: [],
					},
				},
			},
			{
				'': {
					'Your site at %1$s': {
						comments: {
							reference: 'filename:19',
						},
						msgid: 'Your site at %1$s',
						msgstr: [],
					},
				},
			},
		]

		const result = doTree(content, Php as Parser, filename)

		//expect(result).toEqual(expected)
	})
})
