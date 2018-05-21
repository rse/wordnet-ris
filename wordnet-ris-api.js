/*
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
const path          = require("path")
const fs            = require("fs")
const zlib          = require("zlib")

/*  external requirements  */
const LMF           = require("wordnet-lmf")

/*  define the API class  */
class API {
    constructor (filename) {
        this.filename = filename
        this.database = null
        if (fs.existsSync(this.filename)) {
            let filename = path.resolve(process.cwd(), this.filename)
            let data = fs.readFileSync(filename, { encoding: null })
            data = zlib.gunzipSync(data)
            this.database = JSON.parse(data)
        }
    }
    async import (lmfFile) {
        /*  query LMF DB file  */
        let lmf = new LMF({ database: lmfFile })
        await lmf.open()
        let results = await lmf.query(`
            SELECT    l.writtenForm  AS writtenForm,
                      l.partOfSpeech AS partOfSpeech,
                      GROUP_CONCAT(s.synset, ";") AS synset
            FROM      Lemma l
            LEFT JOIN Sense s
            ON        s.lexicalEntryId = l.lexicalEntryId
            GROUP BY  l.writtenForm
        `, { format: "raw" })
        await lmf.close()

        /*  build JSON database  */
        let database = { lemma: {}, synset: [] }
        let synCnt = 0
        let synMap = {}
        results.forEach((result) => {
            let synset = result.synset !== null ? result.synset.split(";") : []
            synset = synset
                .filter((value, index) => {
                    return synset.indexOf(value) === index
                })
                .map((synset) => {
                    let value = synMap[synset]
                    if (synMap[synset] === undefined) {
                        value = synCnt++
                        synMap[synset] = value
                    }
                    return value
                })
            synset.forEach((synset) => {
                if (database.synset[synset] === undefined)
                    database.synset[synset] = []
                if (database.synset[synset].indexOf(result.writtenForm) < 0)
                    database.synset[synset].push(result.writtenForm)
            })
            database.lemma[result.writtenForm] = { pos: result.partOfSpeech, syn: synset }
        })

        /*  write compressed JSON  */
        let data = JSON.stringify(database)
        data = zlib.gzipSync(data, { level: 9 })
        fs.writeFileSync(this.filename, data, { encoding: null })

        /*  replace internals  */
        this.database = database
    }
    lookup (lemma) {
        if (this.database.lemma[lemma] === undefined)
            return undefined
        let synSet = new Set()
        this.database.lemma[lemma].syn.forEach((synset) => {
            this.database.synset[synset].forEach((word) => {
                if (word !== lemma)
                    synSet.add(word)
            })
        })
        let result = {
            pos: this.database.lemma[lemma].pos,
            syn: [...synSet.values()].sort()
        }
        return result
    }
}

/*  export the API class  */
module.exports = API

