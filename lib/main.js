"use babel";

export default {
  config: {
    executablePath: {
      title: "Executable path",
      type: "string",
      description: "Path to puppet-lint executable",
      default: "puppet-lint"
    },
    skipRigthToLeftRelationship: {
      title: 'Skip the right_to_left_relationship check',
      type: 'boolean',
      default: false
    },
    skipAutoloaderLayout: {
      title: 'Skip the autoloader_layout check',
      type: 'boolean',
      default: false
    },
    skipNamesContainingDash: {
      title: 'Skip the names_containing_dash check',
      type: 'boolean',
      default: false
    },
    skipClassInherithsFromParamClass: {
      title: 'Skip the class_inherits_from_params_class check',
      type: 'boolean',
      default: false
    },
    skipParameterOrder: {
      title: 'Skip the parameter_order check',
      type: 'boolean',
      default: false
    },
    skipInheritsAcrossNamespaces: {
      title: 'Skip the inherits_across_namespaces check',
      type: 'boolean',
      default: false
    },
    skipNestedClassesOrDefines: {
      title: 'Skip the nested_classes_or_defines check',
      type: 'boolean',
      default: false
    },
    skipVariableScope: {
      title: 'Skip the variable_scope check',
      type: 'boolean',
      default: false
    },
    skipSlashComments: {
      title: 'Skip the slash_comments check',
      type: 'boolean',
      default: false
    },
    skipStarComments: {
      title: 'Skip the star_comments check',
      type: 'boolean',
      default: false
    },
    skipSelectorInsideResource: {
      title: 'Skip the selector_inside_resource check',
      type: 'boolean',
      default: false
    },
    skipCaseWithoutDefault: {
      title: 'Skip the case_without_default check',
      type: 'boolean',
      default: false
    },
    skipDocumentation: {
      title: 'Skip the documentation check',
      type: 'boolean',
      default: false
    },
    skipDoubleQuotedStrings: {
      title: 'Skip the double_quoted_strings check',
      type: 'boolean',
      default: false
    },
    skipOnlyVariableString: {
      title: 'Skip the only_variable_string check',
      type: 'boolean',
      default: false
    },
    skipVariablesNotEnclosed: {
      title: 'Skip the variables_not_enclosed check',
      type: 'boolean',
      default: false
    },
    skipSingleQuoteStringWithVariables: {
      title: 'Skip the single_quote_string_with_variables check',
      type: 'boolean',
      default: false
    },
    skipQuotedBooleans: {
      title: 'Skip the quoted_booleans check',
      type: 'boolean',
      default: false
    },
    skipPuppetUrlWhitoutModules: {
      title: 'Skip the puppet_url_without_modules check',
      type: 'boolean',
      default: false
    },
    skipVariableContainsDash: {
      title: 'Skip the variable_contains_dash check',
      type: 'boolean',
      default: false
    },
    skipHardTabs: {
      title: 'Skip the hard_tabs check',
      type: 'boolean',
      default: false
    },
    skipTrailingWhitespace: {
      title: 'Skip the trailing_whitespace check',
      type: 'boolean',
      default: false
    },
    skip80Chars: {
      title: 'Skip the 80chars check',
      type: 'boolean',
      default: false
    },
    skip2spSoftTabs: {
      title: 'Skip the 2sp_soft_tabs check',
      type: 'boolean',
      default: false
    },
    skipArrowAlignment: {
      title: 'Skip the arrow_alignment check',
      type: 'boolean',
      default: false
    },
    skipUnquotedResourceTitle: {
      title: 'Skip the unquoted_resource_title check',
      type: 'boolean',
      default: false
    },
    skipEnsureFirstParam: {
      title: 'Skip the ensure_first_param check',
      type: 'boolean',
      default: false
    },
    skipDuplicateParams: {
      title: 'Skip the duplicate_params check',
      type: 'boolean',
      default: false
    },
    skipUnquotedFileMode: {
      title: 'Skip the unquoted_file_mode check',
      type: 'boolean',
      default: false
    },
    skipFileMode: {
      title: 'Skip the file_mode check',
      type: 'boolean',
      default: false
    },
    skipEnsureNotSymlinkTarget: {
      title: 'Skip the ensure_not_symlink_target check',
      type: 'boolean',
      default: false
    },
    skipUnquotedNodeName: {
      title: 'Skip the unquoted_node_name check',
      type: 'boolean',
      default: false
    },
  },

  activate: () => {
    // Show the user an error if they do not have an appropriate linter base
    //  package installed from Atom Package Manager. This will not be an issues
    //  after a base linter package is integrated into Atom, in the comming
    //  months.
    // TODO: Remove when Linter Base is integrated into Atom.
    if (!atom.packages.getLoadedPackages("linter")) {
      atom.notifications.addError(
        "Linter package not found.",
        {
          detail: "Please install the `linter` package in your Settings view."
        }
      );
    }
  },

  provideLinter: () => {
    const helpers = require("atom-linter");
    const path    = require("path");

    //puppet_atom_test.pp - ERROR: cosa not in autoload module layout on line 1
    //puppet_atom_test.pp - WARNING: class not documented on line 1
    const regexLine = /\s+-\s(.*):\s+(.*)\son\sline\s(\d+)/;
    const regexFlag = /^skip.*/;

    return {
      grammarScopes: ["source.puppet"],
      scope: "file",
      lintOnFly: false,
      lint: (activeEditor) => {
        const command = atom.config.get("linter-puppet-lint-for-linter-3.executablePath");
        const file    = activeEditor.getPath();
        const cwd     = path.dirname(file);
        const args    = ["--with-filename"]

        optionsMap    = require('./flags.js');
        var config    = atom.config.getAll('linter-puppet-lint-for-linter-3')
        var flags     = config[0]["value"]
        // If the options match /skip.*/ and is true
        // add the flag to the command options
        for(var flag in flags) {
          if (regexFlag.exec(flag) === null) {
            continue
          }
          if (flags[flag] === true) {
            args.push(optionsMap[flag])
          }
        }

        args.push(file)

        return helpers.exec(command, args, {stream: "stdout", cwd: cwd}).then(output => {
          const toReturn = [];
          output.split(/\r?\n/).forEach(function (line) {
            const matches = regexLine.exec(line);
            if (matches === null) {
              return;
            }
            toReturn.push({
              range: helpers.rangeFromLineNumber(activeEditor, Number.parseInt(matches[3]) - 1),
              type: matches[1],
              text: matches[2],
              filePath: file
            });
          });
          return toReturn;
        });
      }
    };
  }
};
