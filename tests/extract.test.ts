import {describe, expect, test} from '@jest/globals';
import { extractTranslationsFromCode } from '../src/parser';

// Define necessary mock data or functions if there are any dependencies
// Here, we are assuming that `prefixes` is a known object in your codebase
const prefixes = {
    __: ['__'],
    _e: ['_e'],
    _n: ['_n'],
    _x: ['_x'],
    _nx: ['_nx']
};

describe('extractTranslationsFromCode', () => {
    it('should extract translations from code content with no context or translator comments', () => {
        const content = `<?php echo __('Hello World'); ?>`;
        const expected = [{
            msgid: 'Hello World',
            msgstr: undefined,
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
            msgstr: undefined,
            msgctxt: 'greeting',
            comments: ''
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
            msgstr: undefined,
            msgctxt: undefined,
            comments: 'greeting'
        }];

        const result = extractTranslationsFromCode(content);

        expect(result).toEqual(expected);
    });
});
