
WordNet-RIS
===========

WordNet Reduced Informaton Set (RIS)

<p/>
<img src="https://nodei.co/npm/wordnet-ris.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/wordnet-ris.png" alt=""/>

About
-----

This is a [Node.js](https://nodejs.org) Command-Line Interface
(CLI) and underlying Application Programming Interface (API)
for creating a WordNet-RIS (Reduced Information Set) out of the
[WordNet-LMF](https://github.com/globalwordnet/schemas) (Lexical Markup Framework) information as
provided by the [wordnet-lmf](https://npmjs.com/wordnet-lmf) module.
The WordNet-RIS data structure just contains all lemmas,
their part-of-speech information and their synonyms.

Installation
------------

```shell
$ npm install wordnet-ris
```

Command-Line Interface (CLI)
----------------------------

```sh
$ wordnet-ris -d wordnet-ris-en.json import wordnet-lmf-en.db
$ wordnet-ris -d wordnet-ris-en.json lookup "speaker"
```

Application Programming Interface (API)
---------------------------------------

```js
(async () => {

    const RIS   = require("wordnet-ris")
    const RISen = require("wordnet-ris-en")

    console.log(RISen.name)

    let ris = new RIS(RISen.json)

    let results = await ris.lookup("speaker")
    console.log(results)

})().catch((err) => {
    console.log(`ERROR: ${err}`)
})
```

License
-------

Copyright (c) 2018 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

