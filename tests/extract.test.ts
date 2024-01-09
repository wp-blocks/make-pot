import {describe, expect, test} from '@jest/globals';
import { extractTranslationsFromCode } from '../src/parser';

describe('extractTranslationsFromCode', () => {
    it('should extract translations from code content with no context or translator comments', () => {
        const content = `<?php echo __('Hello World'); ?>`;
        const expected = [{
            msgid: 'Hello World',
            msgstr: "msgid",
            msgctxt: undefined,
            comments: ''
        }];

        const result = extractTranslationsFromCode(content);

        expect(result).toEqual(expected);
    });

    it('should extract translations with context', () => {
        const content = `<?php echo _x('Hello World', 'greeting'); ?>`;
        const expected = [{
            msgid: 'Hello World',
            msgstr: "msgid",
            msgctxt: 'greeting',
            comments: ""
        }];

        const result = extractTranslationsFromCode(content);

        expect(result).toEqual(expected);
    });

    it('should extract translations with translator comments', () => {
        const content = `<?php
      /* translators: greeting */
      echo __('Hello World');
    ?>`;
        const expected = [{
            msgid: 'Hello World',
            msgstr: "msgid",
            msgctxt: undefined,
            comments: ""
        }];

        const result = extractTranslationsFromCode(content);

        expect(result).toEqual(expected);
    });
});
