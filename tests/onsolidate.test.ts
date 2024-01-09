import {describe, expect, test} from '@jest/globals';
import { consolidateTranslations } from '../src/consolidate';
import {TranslationString} from "../src/types";

describe('consolidateTranslations', () => {
    it('should consolidate translation strings without context or comments', () => {
        const translationStrings = [{
            msgid: 'Hello World',
            msgctxt: "undefined",
            reference: "#: includes/class-controller.php:58",
            comments: undefined
        },{
            msgid: 'Hello World',
            msgctxt: "undefined",
            reference: "#: includes/class-controller.php:58",
        }] as TranslationString[];

        const expected = `#: reference-0\n#: reference-1\nmsgctxt "undefined"\nmsgid "Hello World"`;

        const result = consolidateTranslations(translationStrings);

        expect(result).toBe(expected);
    });

    it('should consolidate translation strings with context', () => {
        const translationStrings = [{
            msgid: 'Hello World',
            msgctxt: "1",
            reference: "#: includes/class-controller.php:58",
        }, {
            msgid: 'Hello World',
            msgctxt: "1",
            reference: "#: includes/class-controller.php:100",
        }];

        const expected =  `#: reference-0\n#: reference-1\nmsgctxt "1"\nmsgid "Hello World"`;

        const result = consolidateTranslations(translationStrings);


        expect(result).toBe(expected);
    });

    it('should consolidate translation strings with translator comments', () => {
        const translationStrings = [{
            msgid: 'Hello World',
            msgctxt: "aasdasdsadsadsadasd",
            reference: "#: includes/class-controller.php:1",
        },{
            msgid: 'asdasdasd',
            msgctxt: "1",
            reference: "#: includes/class-controller.php:1",
        }];

        const expected = `#: reference-0\nmsgctxt "aasdasdsadsadsadasd"\nmsgid "Hello World"\n\n#: reference-0\nmsgctxt "1"\nmsgid "asdasdasd"`;

        const result = consolidateTranslations(translationStrings);

        expect(result).toBe(expected);
    });
});
