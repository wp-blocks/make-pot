import {describe, expect} from "@jest/globals";
import {makePot} from "../src/makePot";
import { parseFile } from '../src/tree'
// @ts-expect-error
import Js from 'tree-sitter-javascript'
// @ts-expect-error
import Php from 'tree-sitter-php'
// @ts-expect-error
import Ts from 'tree-sitter-typescript'

const argv = {
  sourceDirectory: './sourcedir',
  slug: 'woocommerce',
}

describe('makePot', () => {
  it('Should build pot file', () => {
    makePot({ ...argv });
  })
})

describe('parse PHP file and extract strings', () => {
  it('Should build pot file', async () => {
    const fileParsed = await parseFile({
      filepath: './sourcedir/woocommerce.php',
      language: Php
    });
    console.log(fileParsed)
    expect(fileParsed).toMatchSnapshot();
  });
});
describe('parse JS file and extract strings', () => {
  it('Should parse js file and extract strings', async () => {
    const fileParsed = await parseFile({
      filepath: './sourcedir/javascript.js',
      language: Js
    });
    console.log(fileParsed)
    expect(fileParsed).toMatchSnapshot();
  });
});
describe('parse TSX file and extract strings', () => {
  it('Should parse TSX file and extract strings', async () => {
    const fileParsed = await parseFile({
      filepath: './SvgControls.tsx',
      language: Ts.TSX
    });
    console.log(fileParsed)
    expect(fileParsed).toMatchSnapshot();
  });
});
