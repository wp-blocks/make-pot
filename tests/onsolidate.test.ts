import { describe, expect, test } from "@jest/globals";
import { consolidateTranslations } from "../src/consolidate";
import { TranslationString } from "../src/types";

describe("consolidateTranslations", () => {
  it("should output translation strings with translator comments", () => {
    const translationStrings = [
      {
        msgid: "Hello World",
        raw: ["Hello World", "tl"],
        reference: "#: includes/class-controller.php:1",
      },
      {
        msgid: "asdasdasd",
        raw: ["asdasdasd", "tl"],
        reference: "#: includes/class-controller.php:99",
      },
      {
        msgid: "qweqweqweqwe",
        raw: ["qweqweqweqwe", "tl"],
        reference: "#: includes/class-controller.php:12",
      },
    ];

    const expected = `#: includes/class-controller.php:1
msgid "Hello World"
msgstr ""

#: includes/class-controller.php:99
msgid "asdasdasd"
msgstr ""

#: includes/class-controller.php:12
msgid "qweqweqweqwe"
msgstr ""`;

    const result = consolidateTranslations(translationStrings);

    expect(result).toBe(expected);
  });

  it("should consolidate translation strings with translator comments", () => {
    const translationStrings = [
      {
        msgid: "World",
        raw: ["World", "tl"],
        reference: "#: includes/class-controller.php:1",
      },
      {
        msgid: "World",
        raw: ["World", "tl"],
        reference: "#: includes/class-controller.php:99",
      },
      {
        msgid: "qweqweqweqwe",
        raw: ["qweqweqweqwe", "tl"],
        reference: "#: includes/class-controller.php:12",
      },
    ];

    const expected = `#: includes/class-controller.php:1
#: includes/class-controller.php:99
msgid "World"
msgstr ""

#: includes/class-controller.php:12
msgid "qweqweqweqwe"
msgstr ""`;

    const result = consolidateTranslations(translationStrings);

    expect(result).toBe(expected);
  });
});
