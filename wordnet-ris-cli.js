#!/usr/bin/env node
/*!
**  WordNet-RIS -- WordNet Reduced Information Set (RIS)
**  Copyright (c) 2018 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  internal requirements  */
const fs         = require("mz/fs")

/*  external requirements  */
const yargs      = require("yargs")
const chalk      = require("chalk")
const YAML       = require("js-yaml")

/*  local requirements  */
const RIS        = require("./wordnet-ris-api.js")

;(async () => {
    /*  load my package information  */
    const my = require("./package.json")

    /*  command-line option parsing  */
    let argv = yargs
        /* eslint indent: off */
        .usage("Usage: $0 [option ...] <command> [option ...] [arg ...]")
        .help("h")
            .alias("h", "help")
            .default("h", false)
            .describe("h", "show usage help")
        .number("v")
            .alias("v", "verbose")
            .default("v", 0)
            .describe("v", "level of displaying verbose messages")
        .boolean("V")
            .alias("V", "version")
            .default("V", false)
            .describe("V", "display program version informaton")
        .string("d")
            .alias("d", "database")
            .nargs("d", 1)
            .default("d", null)
            .describe("d", "WordNet JSON file")
        .version(false)
        .strict()
        .showHelpOnFail(true)
        .demandCommand(0)
        .command("import <lmf-db-file>", "import LMF SQLite into Simple Access JSON", (yargs) => {
            yargs
                .positional("lmf-db-file", { describe: "LMF SQLite input file", type: "string" })
        }, async (argv) => {
            try {
                const ris = new RIS(argv.database)
                let m = argv.lmfDbFile.match(/^@(.+)$/)
                if (m !== null)
                    argv.lmfDbFile = require.resolve(m[1])
                await ris.import(argv.lmfDbFile)
                process.exit(0)
            }
            catch (err) {
                process.stderr.write(`wordnet-ris: import: ERROR: ${err.message} ${err.stack}\n`)
                process.exit(1)
            }
        })
        .command("lookup <lemma>", "lookup lemma in Simple Access JSON", (yargs) => {
            yargs
                .positional("lemma", { describe: "one lemma/word to lookup", type: "string" })
                .choices("f", [ "json", "yaml" ])
                    .alias("f", "format")
                    .default("f", "yaml")
                    .describe("f", "output format")
                .string("o")
                    .alias("o", "output")
                    .nargs("o", 1)
                    .default("o", "-")
                    .describe("o", "output file")
        }, async (argv) => {
            try {
                const ris = new RIS(argv.database)
                let result = await ris.lookup(argv.lemma)
                if (result === undefined)
                    throw new Error(`lemma "${argv.lemma}" not found`)
                let output
                if (argv.format === "json")
                    output = JSON.stringify(result, null, "    ")
                else if (argv.format === "yaml")
                    output = YAML.safeDump(result, { indent: 4 })
                if (argv.output === "-")
                    process.stdout.write(output)
                else
                    await fs.writeFile(argv.output, output, { encoding: "utf8" })
                process.exit(0)
            }
            catch (err) {
                process.stderr.write(`wordnet-ris: query: ERROR: ${err.message}\n`)
                process.exit(1)
            }
        })
        .parse(process.argv.slice(2))

    /*  short-circuit processing of "-V" command-line option  */
    if (argv.version) {
        process.stderr.write(`${my.name} ${my.version} <${my.homepage}>\n`)
        process.stderr.write(`${my.description}\n`)
        process.stderr.write(`Copyright (c) 2018 ${my.author.name} <${my.author.url}>\n`)
        process.stderr.write(`Licensed under ${my.license} <http://spdx.org/licenses/${my.license}.html>\n`)
        process.exit(0)
    }

    /*  sanity check usage  */
    if (argv._.length === 0) {
        process.stderr.write("wordnet-ris: ERROR: missing command\n")
        process.exit(1)
    }
})().catch((err) => {
    /*  fatal error  */
    process.stderr.write(`wordnet-ris: ${chalk.red("ERROR:")} ${err.message} ${err.stack}\n`)
    process.exit(1)
})

