import express from "express"
import ffmeg from "fluent-ffmpeg"

const app = express()
const port = 3000

app.get("/", (req, res) => {

})

app.listen(port, () => {
    console.log(`Video processing service listening at localhost${port}`)
})