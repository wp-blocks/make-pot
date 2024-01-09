import {describe, expect, test} from '@jest/globals';
import { consolidateTranslations } from '../src/makePot';
import {TranslationString} from "../src/types";

describe('consolidateTranslations', () => {
    it('should consolidate translation strings without context or comments', () => {
        const translationStrings = [{
            msgid: 'Hello World',
            msgstr: 'Bonjour le monde',
            msgctxt: "undefined",
            comments: undefined
        },{
            msgid: 'Hello World',
            msgstr: 'Bonjour le monde'
        }] as TranslationString[];

        const expected = `msgid "Hello World"\nmsgstr "Bonjour le monde"\n`;

        const result = consolidateTranslations(translationStrings);

        expect(result).toBe(expected);
    });

    it('should consolidate translation strings with context', () => {
        const translationStrings = [{
            msgid: 'Hello World',
            msgstr: 'Bonjour le monde',
            msgctxt: 'greeting',
            comments: undefined
        }, {
            msgid: 'Hello World',
            msgstr: 'Bonjour le monde',
            msgctxt: 'greeting'
        }];

        const expected = `msgid "Hello World"\nmsgstr "Bonjour le monde"\nmsgctxt "greeting"\n`;

        const result = consolidateTranslations(translationStrings);


        expect(result).toBe(expected);
    });

    it('should consolidate translation strings with translator comments', () => {
        const translationStrings = [{
            msgid: 'Hello World',
            msgstr: 'Bonjour le monde',
            msgctxt: undefined,
            comments: 'This is a greeting'
        },{
            msgid: 'Hello World',
            msgstr: 'Bonjour le monde',
            msgctxt: undefined,
            comments: 'This is a greeting'
        }];

        const expected = `msgid "Hello World"\nmsgstr "Bonjour le monde"\ncomments "This is a greeting"\n`;

        const result = consolidateTranslations(translationStrings);

        expect(result).toBe(expected);
    });
});
