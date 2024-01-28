# make-pot

A node.js module that generates the pot file for your WordPress plugin or theme.

```
npx @wp-blocks/make-pot -h
Usage: index.js <source> [destination] [options]

Positionals:
  sourceDirectory  Source directory                                     [string]
  destination      Destination directory                                [string]

Options:
      --version           Show version number                          [boolean]
  -h                      Show help                                    [boolean]
      --slug              Plugin or theme slug                          [string]
      --domain            Text domain to look for in the source code    [string]
      --skip-js           Skip JavaScript files                        [boolean]
      --skip-php          Skip PHP files                               [boolean]
      --skip-blade        Skip Blade files                             [boolean]
      --skip-block-json   Skip block.json files                        [boolean]
      --skip-theme-json   Skip theme.json files                        [boolean]
      --skip-audit        Skip auditing of strings                     [boolean]
      --headers           Headers                                       [string]
      --file-comment      File comment                                  [string]
      --package-name      Package name                                  [string]
      --location          Include location information                 [boolean]
      --ignore-domain     Ignore text domain                           [boolean]
      --mergePaths        Merge with existing POT file(s)               [string]
      --subtractPaths     Subtract strings from existing POT file(s)    [string]
      --subtractAndMerge  Subtract and merge strings from existing POT file(s)
                                                                       [boolean]
      --include           Include specific files                        [string]
      --exclude           Exclude specific files                        [string]
      --silent            No output to stdout                          [boolean]
      --json              Output the json gettext data                 [boolean]
      --output            Output the gettext data                      [boolean]
```

