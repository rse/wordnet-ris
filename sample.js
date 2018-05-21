
(async () => {

    const WNRIS = require(".")

    let wnris = new WNRIS("../wordnet-ris-en/wordnet-ris-en.db")

    let result = wnris.lookup("speaker")
    console.log(result)
    result = wnris.lookup("speaker")
    console.log(result)

})().catch((err) => {
    console.log(`ERROR: ${err.stack}`)
})

