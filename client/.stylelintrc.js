module.exports = {
  ignoreFiles: ['build/**/*', 'coverage/**/*', '**/icon.fonts.css'],

  // `stylelint-config-recommended` turns on all the "possible errors" rules
  // SEE: Rules: https://stylelint.io/user-guide/rules/list#possible-errors
  // `stylelint-config-standard` enforces common stylistic conventions
  // SEE: CSS: https://github.com/stylelint/stylelint-config-standard#example
  // SEE: Rules: https://github.com/stylelint/stylelint-config-standard/blob/master/index.js
  extends: 'stylelint-config-standard',

  // SEE: https://stylelint.io/user-guide/rules/list
  rules: {
    //
    // POSSIBLE ERRORS
    //

    // COLOR
    // Disallow invalid hex colors.
    // 'color-no-invalid-hex': null,

    // FONT FAMILY
    // Disallow duplicate font family names.
    // 'font-family-no-duplicate-names': null,
    // Disallow missing generic families in lists of font family names.
    // 'font-family-no-missing-generic-family-keyword': null,

    // FUNCTION
    // Disallow an invalid expression within calc functions.
    // 'function-calc-no-invalid': null,
    // Disallow an unspaced operator within calc functions.
    // 'function-calc-no-unspaced-operator': null,
    // Disallow direction values in linear-gradient() calls that are not valid according to the standard syntax.
    // 'function-linear-gradient-no-nonstandard-direction': null,

    // STRING
    // Disallow (unescaped) newlines in strings.
    // 'string-no-newline': null,

    // UNIT
    // Disallow unknown units.
    // 'unit-no-unknown': null,

    // PROPERTY
    // Disallow unknown properties.
    'property-no-unknown': [ true, {
      ignoreProperties: ['composes']
    }],

    // KEYFRAME DECLARATION
    // Disallow !important within keyframe declarations.
    // 'keyframe-declaration-no-important': null,

    // DECLARATION BLOCK
    // Disallow duplicate properties within declaration blocks.
    // 'declaration-block-no-duplicate-properties': null,
    // Disallow shorthand properties that override related longhand properties.
    // 'declaration-block-no-shorthand-property-overrides': null,

    // BLOCK
    // Disallow empty blocks.
    // 'block-no-empty': null,

    // SELECTOR
    // Disallow unknown pseudo-class selectors.
    // 'selector-pseudo-class-no-unknown': null,
    // Disallow unknown pseudo-element selectors.
    // 'selector-pseudo-element-no-unknown': null,
    // Disallow unknown type selectors.
    // 'selector-type-no-unknown': null,

    // MEDIA FEATURE
    // Disallow unknown media feature names.
    // 'media-feature-name-no-unknown': null,

    // AT-RULE
    // Disallow unknown at-rules.
    'at-rule-no-unknown': [ true, {
        ignoreAtRules: [
          // SASS at-rules
          // SEE: https://sass-lang.com/documentation/at-rules
          'use',
          'forward',
          'mixin',
          'include',
          'function',
          'extend',
          'at-root',
          'error',
          'warn',
          'debug',
          'if',
          'each',
          'for',
          'while',
        ]
    } ],

    // COMMENT
    // Disallow empty comments.
    // 'comment-no-empty': null,

    // GENERAL / SHEET
    // Disallow selectors of lower specificity from coming after overriding selectors of higher specificity.
    // 'no-descending-specificity': null,
    // Disallow duplicate @import rules within a stylesheet.
    // 'no-duplicate-at-import-rules': null,
    // Disallow duplicate selectors within a stylesheet.
    'no-duplicate-selectors': null, // TODO: Uncomment to enable this after CSS Modules is heavily used
                                    //       (duplicate selectors can help separate contexts)
    // Disallow empty sources.
    // 'no-empty-source': null,
    // Disallow extra semicolons (Autofixable).
    // 'no-extra-semicolons': null,
    // Disallow double-slash comments (//...) which are not supported by CSS.
    // 'no-invalid-double-slash-comments': null,

    //
    // LIMIT LANGUAGE FEATURES
    //

    // COLOR
    // Require (where possible) or disallow named colors.
    // 'color-named': null,
    // Disallow hex colors.
    // 'color-no-hex': null,

    // FUNCTION
    // Specify a blacklist of disallowed functions.
    // 'function-blacklist': null,
    // Disallow scheme-relative urls.
    // 'function-url-no-scheme-relative': null,
    // Specify a blacklist of disallowed URL schemes.
    // 'function-url-scheme-blacklist': null,
    // Specify a whitelist of allowed URL schemes.
    // 'function-url-scheme-whitelist': null,
    // Specify a whitelist of allowed functions.
    // 'function-whitelist': null,

    // KEYFRAMES
    // Specify a pattern for keyframe names.
    // 'keyframes-name-pattern': null,

    // NUMBER
    // Limit the number of decimal places allowed in numbers.
    // 'number-max-precision': null,

    // TIME
    // Specify the minimum number of milliseconds for time values.
    // 'time-min-milliseconds': null,

    // UNIT
    // Specify a blacklist of disallowed units.
    // 'unit-blacklist': null,
    // Specify a whitelist of allowed units.
    // 'unit-whitelist': null,

    // SHORTHAND PROPERTY
    // Disallow redundant values in shorthand properties (Autofixable).
    // 'shorthand-property-no-redundant-values': null,

    // VALUE
    // Disallow vendor prefixes for values.
    // 'value-no-vendor-prefix': null,

    // CUSTOM PROPERTY
    // Specify a pattern for custom properties.
    // 'custom-property-pattern': null,

    // PROPERTY
    // Specify a blacklist of disallowed properties.
    // 'property-blacklist': null,
    // Disallow vendor prefixes for properties.
    // 'property-no-vendor-prefix': null,
    // Specify a whitelist of allowed properties.
    // 'property-whitelist': null,

    // DECLARATION
    // Disallow longhand properties that can be combined into one shorthand property.
    // 'declaration-block-no-redundant-longhand-properties': null,
    // Disallow !important within declarations.
    // 'declaration-no-important': null,
    // Specify a blacklist of disallowed property and unit pairs within declarations.
    // 'declaration-property-unit-blacklist': null,
    // Specify a whitelist of allowed property and unit pairs within declarations.
    // 'declaration-property-unit-whitelist': null,
    // Specify a blacklist of disallowed property and value pairs within declarations.
    // 'declaration-property-value-blacklist': null,
    // Specify a whitelist of allowed property and value pairs within declarations.
    // 'declaration-property-value-whitelist': null,

    // DECLARATION BLOCK
    // Limit the number of declarations within a single-line declaration block.
    // 'declaration-block-single-line-max-declarations': null,

    // SELECTOR
    // Specify a blacklist of disallowed attribute operators.
    // 'selector-attribute-operator-blacklist': null,
    // Specify a whitelist of allowed attribute operators.
    // 'selector-attribute-operator-whitelist': null,
    // Specify a pattern for class selectors.
    // 'selector-class-pattern': null,
    // Specify a blacklist of disallowed combinators.
    // 'selector-combinator-blacklist': null,
    // Specify a whitelist of allowed combinators.
    // 'selector-combinator-whitelist': null,
    // Specify a pattern for ID selectors.
    // 'selector-id-pattern': null,
    // Limit the number of attribute selectors in a selector.
    // 'selector-max-attribute': null,
    // Limit the number of classes in a selector.
    // 'selector-max-class': null,
    // Limit the number of combinators in a selector.
    // 'selector-max-combinators': null,
    // Limit the number of compound selectors in a selector.
    // 'selector-max-compound-selectors': null,
    // Limit the number of adjacent empty lines within selectors (Autofixable).
    // 'selector-max-empty-lines': null,
    // Limit the number of ID selectors in a selector.
    // 'selector-max-id': null,
    // Limit the number of pseudo-classes in a selector.
    // 'selector-max-pseudo-class': null,
    // Limit the specificity of selectors.
    // 'selector-max-specificity': null,
    // Limit the number of type in a selector.
    // 'selector-max-type': null,
    // Limit the number of universal selectors in a selector.
    // 'selector-max-universal': null,
    // Specify a pattern for the selectors of rules nested within rules.
    // 'selector-nested-pattern': null,
    // Disallow qualifying a selector by type.
    // 'selector-no-qualifying-type': null,
    // Disallow vendor prefixes for selectors.
    // 'selector-no-vendor-prefix': null,
    // Specify a blacklist of disallowed pseudo-class selectors.
    // 'selector-pseudo-class-blacklist': null,
    // Specify a whitelist of allowed pseudo-class selectors.
    // 'selector-pseudo-class-whitelist': null,
    // Specify a blacklist of disallowed pseudo-element selectors.
    // 'selector-pseudo-element-blacklist': null,
    // Specify a whitelist of allowed pseudo-element selectors.
    // 'selector-pseudo-element-whitelist': null,

    // MEDIA FEATURE
    // Specify a blacklist of disallowed media feature names.
    // 'media-feature-name-blacklist': null,
    // Disallow vendor prefixes for media feature names.
    // 'media-feature-name-no-vendor-prefix': null,
    // Specify a whitelist of allowed media feature name and value pairs.
    // 'media-feature-name-value-whitelist': null,
    // Specify a whitelist of allowed media feature names.
    // 'media-feature-name-whitelist': null,

    // CUSTOM MEDIA
    // Specify a pattern for custom media query names.
    // 'custom-media-pattern': null,

    // AT-RULE
    // Specify a blacklist of disallowed at-rules.
    // 'at-rule-blacklist': null,
    // Disallow vendor prefixes for at-rules.
    // 'at-rule-no-vendor-prefix': null,
    // Specify a requirelist of properties for an at-rule.
    // 'at-rule-property-requirelist': null,
    // Specify a whitelist of allowed at-rules.
    // 'at-rule-whitelist': null,

    // COMMENT
    // Specify a blacklist of disallowed words within comments.
    // 'comment-word-blacklist': null,

    // GENERAL / SHEET
    // Limit the depth of nesting.
    // 'max-nesting-depth': null,
    // Disallow unknown animations.
    // 'no-unknown-animations': null,

    //
    // STYLISTIC ISSUES
    //

    // COLORS

    // Specify lowercase or uppercase for hex colors (Autofixable).
    'color-hex-case': null, // TODO: Uncomment later, to reduce scope of changes
                            //       (defaults to 2, because of extended ruleset)
    // Specify short or long notation for hex colors (Autofixable).
    'color-hex-length': 'long',

    // FONT FAMILY
    // Specify whether or not quotation marks should be used around font family names.
    // 'font-family-name-quotes': null,

    // FONT WEIGHT
    // Require numeric or named (where possible) font-weight values. Also, when named values are expected, require only valid names.
    // 'font-weight-notation': null,

    // FUNCTION
    // Require a newline or disallow whitespace after the commas of functions (Autofixable).
    // 'function-comma-newline-after': null,
    // Require a newline or disallow whitespace before the commas of functions (Autofixable).
    // 'function-comma-newline-before': null,
    // Require a single space or disallow whitespace after the commas of functions (Autofixable).
    // 'function-comma-space-after': null,
    // Require a single space or disallow whitespace before the commas of functions (Autofixable).
    // 'function-comma-space-before': null,
    // Limit the number of adjacent empty lines within functions (Autofixable).
    // 'function-max-empty-lines': null,
    // Specify lowercase or uppercase for function names (Autofixable).
    // 'function-name-case': null,
    // Require a newline or disallow whitespace on the inside of the parentheses of functions (Autofixable).
    // 'function-parentheses-newline-inside': null,
    // Require a single space or disallow whitespace on the inside of the parentheses of functions (Autofixable).
    // 'function-parentheses-space-inside': null,
    // Require or disallow quotes for urls.
    // 'function-url-quotes': null,
    // Require or disallow whitespace after functions (Autofixable).
    // 'function-whitespace-after': null,

    // NUMBER
    // Require or disallow a leading zero for fractional numbers less than 1 (Autofixable).
    // 'number-leading-zero': null,
    // Disallow trailing zeros in numbers (Autofixable).
    // 'number-no-trailing-zeros': null,

    // STRING
    // Specify single or double quotes around strings (Autofixable).
    // 'string-quotes': 'single', // TODO: Uncomment later, to reduce scope of changes

    // LENGTH
    // Disallow units for zero lengths (Autofixable).
    // 'length-zero-no-unit': null,

    // UNIT
    // Specify lowercase or uppercase for units (Autofixable).
    // 'unit-case': null,

    // VALUE
    // Specify lowercase or uppercase for keywords values (Autofixable).
    // 'value-keyword-case': null,

    // VALUE LIST
    // Require a newline or disallow whitespace after the commas of value lists (Autofixable).
    'value-list-comma-newline-after': null,
    // Require a newline or disallow whitespace before the commas of value lists.
    // 'value-list-comma-newline-before': null,
    // Require a single space or disallow whitespace after the commas of value lists (Autofixable).
    // 'value-list-comma-space-after': 'always-single-line',
    // Require a single space or disallow whitespace before the commas of value lists (Autofixable).
    // 'value-list-comma-space-before': null,
    // Limit the number of adjacent empty lines within value lists (Autofixable).
    // 'value-list-max-empty-lines': null,

    // CUSTOM PROPERTY
    // Require or disallow an empty line before custom properties (Autofixable).
    'custom-property-empty-line-before': null,

    // PROPERTY
    // Specify lowercase or uppercase for properties (Autofixable).
    // 'property-case': null,

    // DECLARATION
    // Require a single space or disallow whitespace after the bang of declarations (Autofixable).
    // 'declaration-bang-space-after': null,
    // Require a single space or disallow whitespace before the bang of declarations (Autofixable).
    // 'declaration-bang-space-before': null,
    // Require a newline or disallow whitespace after the colon of declarations (Autofixable).
    'declaration-colon-newline-after': null,
    // Require a single space or disallow whitespace after the colon of declarations (Autofixable).
    // 'declaration-colon-space-after': null,
    // Require a single space or disallow whitespace before the colon of declarations (Autofixable).
    // 'declaration-colon-space-before': null,
    // Require or disallow an empty line before declarations (Autofixable).
    'declaration-empty-line-before': null,

    // DECLARATION BLOCK
    // Require a newline or disallow whitespace after the semicolons of declaration blocks (Autofixable).
    // 'declaration-block-semicolon-newline-after': null,
    // Require a newline or disallow whitespace before the semicolons of declaration blocks.
    // 'declaration-block-semicolon-newline-before': null,
    // Require a single space or disallow whitespace after the semicolons of declaration blocks (Autofixable).
    // 'declaration-block-semicolon-space-after': null,
    // Require a single space or disallow whitespace before the semicolons of declaration blocks (Autofixable).
    // 'declaration-block-semicolon-space-before': null,
    // Require or disallow a trailing semicolon within declaration blocks (Autofixable).
    // 'declaration-block-trailing-semicolon': null,

    // BLOCK
    // Require or disallow an empty line before the closing brace of blocks (Autofixable).
    // 'block-closing-brace-empty-line-before': null,
    // Require a newline or disallow whitespace after the closing brace of blocks (Autofixable).
    // 'block-closing-brace-newline-after': 'always',
    // Require a newline or disallow whitespace before the closing brace of blocks (Autofixable).
    // 'block-closing-brace-newline-before': 'always-multi-line',
    // Require a single space or disallow whitespace after the closing brace of blocks.
    // 'block-closing-brace-space-after': null, // Irrelevant, because `'block-closing-brace-newline-after': 'always'`
    // Require a single space or disallow whitespace before the closing brace of blocks (Autofixable).
    // 'block-closing-brace-space-before': 'always-single-line',
    // Require a newline after the opening brace of blocks (Autofixable).
    // 'block-opening-brace-newline-after': 'always-multi-line',
    // Require a newline or disallow whitespace before the opening brace of blocks (Autofixable).
    // 'block-opening-brace-newline-before': 'never-single-line',
    // Require a single space or disallow whitespace after the opening brace of blocks (Autofixable).
    // 'block-opening-brace-space-after': 'always-single-line',
    // Require a single space or disallow whitespace before the opening brace of blocks (Autofixable).
    'block-opening-brace-space-before': null, // FAQ: Allow alignment of related single line rules with different selectors

    // SELECTOR
    // Require a single space or disallow whitespace on the inside of the brackets within attribute selectors (Autofixable).
    // 'selector-attribute-brackets-space-inside': 'never',
    // Require a single space or disallow whitespace after operators within attribute selectors (Autofixable).
    // 'selector-attribute-operator-space-after': 'never',
    // Require a single space or disallow whitespace before operators within attribute selectors (Autofixable).
    // 'selector-attribute-operator-space-before': 'never',
    // Require or disallow quotes for attribute values.
    // 'selector-attribute-quotes': 'always',
    // Require a single space or disallow whitespace after the combinators of selectors (Autofixable).
    // 'selector-combinator-space-after': 'always',
    // Require a single space or disallow whitespace before the combinators of selectors (Autofixable).
    // 'selector-combinator-space-before': 'always',
    // Disallow non-space characters for descendant combinators of selectors (Autofixable).
    // 'selector-descendant-combinator-no-non-space': true,
    // Specify lowercase or uppercase for pseudo-class selectors (Autofixable).
    // 'selector-pseudo-class-case': 'lower',
    // Require a single space or disallow whitespace on the inside of the parentheses within pseudo-class selectors (Autofixable).
    // 'selector-pseudo-class-parentheses-space-inside': 'never',
    // Specify lowercase or uppercase for pseudo-element selectors (Autofixable).
    // 'selector-pseudo-element-case': 'lower',
    // Specify single or double colon notation for applicable pseudo-elements (Autofixable).
    // 'selector-pseudo-element-colon-notation': 'double',
    // Specify lowercase or uppercase for type selectors (Autofixable).
    // 'selector-type-case': null, // WARNING: Do not use, yet (requires regex, has bugs)

    // SELECTOR LIST
    // Require a newline or disallow whitespace after the commas of selector lists (Autofixable).
    // 'selector-list-comma-newline-after': 'always',
    // Require a newline or disallow whitespace before the commas of selector lists (Autofixable).
    // 'selector-list-comma-newline-before': null,
    // Require a single space or disallow whitespace after the commas of selector lists (Autofixable).
    // 'selector-list-comma-space-after': null,
    // Require a single space or disallow whitespace before the commas of selector lists (Autofixable).
    // 'selector-list-comma-space-before': null,

    // RULE
    // Require or disallow an empty line before rules (Autofixable).
    'rule-empty-line-before': null,

    // MEDIA FEATURE
    // Require a single space or disallow whitespace after the colon in media features (Autofixable).
    // 'media-feature-colon-space-after': 'always',
    // Require a single space or disallow whitespace before the colon in media features (Autofixable).
    // 'media-feature-colon-space-before': 'never',
    // Specify lowercase or uppercase for media feature names (Autofixable).
    // 'media-feature-name-case': 'lower',
    // Require a single space or disallow whitespace on the inside of the parentheses within media features (Autofixable).
    // 'media-feature-parentheses-space-inside': 'never', // FAQ: Mirror ESLint for functions
    // Require a single space or disallow whitespace after the range operator in media features (Autofixable).
    // 'media-feature-range-operator-space-after': 'always',
    // Require a single space or disallow whitespace before the range operator in media features (Autofixable).
    // 'media-feature-range-operator-space-before': 'always',

    // MEDIA QUERY LIST
    // Require a newline or disallow whitespace after the commas of media query lists (Autofixable).
    // 'media-query-list-comma-newline-after': null,
    // Require a newline or disallow whitespace before the commas of media query lists.
    // 'media-query-list-comma-newline-before': null,
    // Require a single space or disallow whitespace after the commas of media query lists (Autofixable).
    // 'media-query-list-comma-space-after': 'always',
    // Require a single space or disallow whitespace before the commas of media query lists (Autofixable).
    // 'media-query-list-comma-space-before': 'never-single-line',

    // AT-RULE
    // Require or disallow an empty line before at-rules (Autofixable).
    // 'at-rule-empty-line-before': [ 'always', {
    //     except: [
    //       'after-same-name',
    //       'inside-block',
    //       'blockless-after-same-name-blockless',
    //       'blockless-after-blockless',
    //       'first-nested'
    //     ],
    //     ignore: [
    //       'after-comment',
    //       'first-nested'
    //     ]
    // } ],
    // Specify lowercase or uppercase for at-rules names (Autofixable).
    // 'at-rule-name-case': 'lower',
    // Require a newline after at-rule names.
    // 'at-rule-name-newline-after': null,
    // Require a single space after at-rule names (Autofixable).
    // 'at-rule-name-space-after': 'always',
    // Require a newline after the semicolon of at-rules (Autofixable).
    // 'at-rule-semicolon-newline-after': 'always',
    // Require a single space or disallow whitespace before the semicolons of at-rules.
    // 'at-rule-semicolon-space-before': 'never',

    // COMMENT
    // Require or disallow an empty line before comments (Autofixable).
    'comment-empty-line-before': null,
    // Require or disallow whitespace on the inside of comment markers (Autofixable).
    // 'comment-whitespace-inside': 'always',

    // GENERAL / SHEET
    // Specify indentation (Autofixable).
    indentation: null, // TODO: Uncomment later, to reduce scope of changes
                       //       (defaults to 2, because of extended ruleset)
    // Specify unix or windows linebreaks (Autofixable).
    // linebreaks: null,
    // Limit the number of adjacent empty lines (Autofixable).
    'max-empty-lines': 5,
    // Limit the length of a line.
    'max-line-length': 160, // FAQ: Mirror PyLint
    // Disallow end-of-line whitespace (Autofixable).
    // 'no-eol-whitespace': true,
    // Disallow missing end-of-source newlines (Autofixable).
    // 'no-missing-end-of-source-newline': true,
    // Disallow empty first lines (Autofixable).
    // 'no-empty-first-line': true,
    // Require or disallow Unicode BOM.
    // 'unicode-bom': null
  }
};
