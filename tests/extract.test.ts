import {describe, expect, test} from '@jest/globals';
import { extractTranslationsFromCode } from '../src/parser';

describe('extractTranslationsFromCode', () => {
    it('should extract translations from code content with no context or translator comments', () => {
        const filename = 'filename';
        const content = `<?php echo __('Hello World'); ?>`;
        const expected = [{
            reference: '#: filename:1',
            msgid: 'Hello World',
            msgstr: "msgid",
            msgctxt: undefined,
            comments: undefined
        }];

        const result = extractTranslationsFromCode(content, filename);

        expect(result).toEqual(expected);
    });

    it('should extract translations with context', () => {
        const filename = 'filename';
        const content = `<?php echo _x('Hello World', 'greeting'); ?>`;
        const expected = [{
            msgid: 'Hello World',
            msgstr: "msgid",
            msgctxt: 'greeting',
            comments: "",
            reference: '#: filename:1'
        }];

        const result = extractTranslationsFromCode(content, filename);

        expect(result).toEqual(expected);
    });

    it('should extract translations with translator comments', () => {
        const filename = 'filename';
        const content = `<?php



      printf(
\t\t\t\t\t/* translators: 1: Site URL, 2: Username, 3: User email address, 4: Lost password URL. */
\t\t\t\t\t__( 'Your site at %1$s is active. You may now log in to your site using your chosen username of &#8220;%2$s&#8221;. Please check your email inbox at %3$s for your password and login instructions. If you do not receive an email, please check your junk or spam folder. If you still do not receive an email within an hour, you can <a href="%4$s">reset your password</a>.' ),
\t\t\t\t\tsprintf( '<a href="http://%1$s%2$s">%1$s%2$s</a>', $signup->domain, $blog_details->path ),
\t\t\t\t\t$signup->user_login,
\t\t\t\t\t$signup->user_email,
\t\t\t\t\twp_lostpassword_url()
\t\t\t\t); ?>`;
        const expected = [{
            msgid: `Your site at %1$s is active. You may now log in to your site using your chosen username of &#8220;%2$s&#8221;. Please check your email inbox at %3$s for your password and login instructions. If you do not receive an email, please check your junk or spam folder. If you still do not receive an email within an hour, you can <a href="%4$s">reset your password</a>.`,
            msgstr: "msgid",
            msgctxt: undefined,
            comments: "1: Site URL, 2: Username, 3: User email address, 4: Lost password URL.",
            reference: "#: filename:23"
        }];

        const result = extractTranslationsFromCode(content, filename);

        expect(result).toEqual(expected);
    });

    it('should extract multiple translations with context', () => {
        const filename = 'filename';
        const content = `<?php echo __('Hello World1', 'greeting');__('Hello World2', 'greeting');
 __('Hello World3', 'greeting');
                            __('Hello World4', 'greeting');

         __('Hello World5', 'greeting');
         ?>`;
        const expected = [{
            msgid: 'Hello World1',
            msgstr: "msgid",
            msgctxt: 'greeting',
            comments: "",
            reference: '#: filename:1'
        },{
            msgid: 'Hello World2',
            msgstr: "msgid",
            msgctxt: 'greeting',
            comments: "",
            reference: '#: filename:1'
        },{
            msgid: 'Hello World3',
            msgstr: "msgid",
            msgctxt: 'greeting',
            comments: "",
            reference: '#: filename:2'
        },{
            msgid: 'Hello World4',
            msgstr: "msgid",
            msgctxt: 'greeting',
            comments: "",
            reference: '#: filename:4'
        },{
            msgid: 'Hello World5',
            msgstr: "msgid",
            msgctxt: 'greeting',
            comments: "",
            reference: '#: filename:5'
        }];

        const result = extractTranslationsFromCode(content, filename);

        expect(result).toEqual(expected);
    });
});
