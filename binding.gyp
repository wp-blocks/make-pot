{
  "targets": [
    {
      "target_name": "tree_sitter_runtime_binding",
      "dependencies": ["tree_sitter"],
      "sources": [
        "node_modules/tree-sitter/src/binding.cc",
        "node_modules/tree-sitter/src/conversions.cc",
        "node_modules/tree-sitter/src/language.cc",
        "node_modules/tree-sitter/src/logger.cc",
        "node_modules/tree-sitter/src/node.cc",
        "node_modules/tree-sitter/src/parser.cc",
        "node_modules/tree-sitter/src/query.cc",
        "node_modules/tree-sitter/src/tree.cc",
        "node_modules/tree-sitter/src/tree_cursor.cc",
        "node_modules/tree-sitter/src/util.cc"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "node_modules/tree-sitter/vendor/tree-sitter/lib/include",
        "node_modules/tree-sitter/build/Release"
      ],
      'cflags': [
        '-std=c++17'
      ],
      'cflags_cc': [
        '-std=c++17'
      ],
      'conditions': [
        ['OS=="mac"', {
          'xcode_settings': {
            'MACOSX_DEPLOYMENT_TARGET': '10.9',
            'CLANG_CXX_LANGUAGE_STANDARD': 'c++17',
            'CLANG_CXX_LIBRARY': 'libc++',
          },
        }],
        ['OS=="win"', {
          'msvs_settings': {
            'VCCLCompilerTool': {
              'AdditionalOptions': [
                '/std:c++17',
              ],
              'RuntimeLibrary': 0,
            },
          },
        }],
        ['OS == "linux"', {
          'cflags_cc': [
            '-Wno-cast-function-type'
          ]
        }],
        ['runtime=="electron"', {
          'defines': ['NODE_RUNTIME_ELECTRON=1']
        }],
      ],
      'cflags!': ['-fno-exceptions'],
    },
    {
      "target_name": "tree_sitter",
      'type': 'static_library',
      "sources": [
        "node_modules/tree-sitter/vendor/tree-sitter/lib/src/lib.c"
      ],
      "include_dirs": [
        "node_modules/tree-sitter/vendor/tree-sitter/lib/src",
        "node_modules/tree-sitter/vendor/tree-sitter/lib/include",
      ],
      "cflags": [
        "-std=c99"
      ]
    }
  ],
  'variables': {
    'runtime%': 'node',
    'openssl_fips': '',
    'v8_enable_pointer_compression%': 0,
    'v8_enable_31bit_smis_on_64bit_arch%': 0,
  },
  'conditions': [
    ['runtime=="electron"', { 'defines': ['NODE_RUNTIME_ELECTRON=1'] }],
  ]
}
