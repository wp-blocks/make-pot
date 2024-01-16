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
	it('should extract translations from code content with no context or translator comments', () => {
		const filename = 'filename'
		const content = `<?php echo __('Hello World'); ?>`
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

	it('should extract translations with context', () => {
		const filename = 'filename'
		const content = `<?php echo _x('Hello World', 'greeting'); ?>`
		const expected = [
			{
				reference: '#: filename:1',
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
				reference: '#: filename:9',
				type: 'text_domain',
				raw: [],
			},
		]

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})

	it('should extract translations with translator comments', () => {
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
				reference: '#: filename:3',
				type: 'text_domain',
				raw: [
					'** 4*',
					'* translators: 1: Site URL, 2: Username, 3: User email address, 4: Lost password URL. *',
					'** 5*',
					'_( \'Your site at %1$s is active. You may now log in to your site using your chosen username of &#8220;%2$s&#8221;. Please check your email inbox at %3$s for your password and login instructions. If you do not receive an email, please check your junk or spam folder. If you still do not receive an email within an hour, you can <a href="%4$s">reset your password</a>.\' ',
					'** 6*',
					'printf( \'<a href="http://%1$s%2$s">%1$s%2$s</a>\', $signup->domain, $blog_details->path ',
					'** 7*',
					'signup->user_logi',
					'** 8*',
					'signup->user_emai',
					'** 9*',
					'p_lostpassword_url(',
					'** 10*',
				],
				msgid: '** 4*',
			},
			{
				reference: '#: filename:6',
				type: 'text_domain',
				raw: [
					'<a href="http://%1$s%2$s">%1$s%2$s</a>',
					'signup->domai',
					'blog_details->pat',
				],
				msgid: '<a href="http://%1$s%2$s">%1$s%2$s</a>',
			},
			{
				reference: '#: filename:9',
				type: 'text_domain',
				raw: [],
			},
			{
				reference: '#: filename:15',
				type: 'text_domain',
				raw: [
					'** 16 *',
					'* translators: 1: Site URL, 2: Username, 3: User email address, 4: Lost password URL. *',
					'** 17 *',
					"_( 'aaaaaaa' ",
					'** 18 *',
				],
				msgid: '** 16 *',
			},
		]

		const result = doTree(content, Php as Parser, filename)

		expect(result).toEqual(expected)
	})
})
