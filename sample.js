
(async () => {

    const WNS = require(".")

    let wns = new WNS("test.json")

    let results = await wns.lookup("speaker")
    console.log(results)

})().catch((err) => {
    console.log(`ERROR: ${err.stack}`)
})

