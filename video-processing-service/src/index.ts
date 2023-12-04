import { error } from "console"
import express from "express"
import ffmpeg from "fluent-ffmpeg"
// Imports the Google Cloud client library
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import stream from 'stream';
const { spawn } = require('child_process');

const UPLOADED_VIDEO_BUCKET_NAME = "uploaded-video-bucket"

const app = express()
//add middleware to handle request converting them to JSON
app.use(express.json())

const storage = new Storage({ keyFilename: 'key.json' });
const videoBucket = storage.bucket(UPLOADED_VIDEO_BUCKET_NAME);

app.get("/", (req, res) => {
    res.send("HELLO WORLD")
})

async function uploadVideoToBucket(transcodedVideoFileName: string) {
    // Create a pass through stream from a string
    return new Promise((resolve, reject) => {
        const transcodedVideoFile = videoBucket.file(transcodedVideoFileName);
        const readableStream = fs.createReadStream(transcodedVideoFileName)
        readableStream.pipe(transcodedVideoFile.createWriteStream().on('finish', () => {
            fs.unlinkSync(transcodedVideoFileName)
            // The file upload is complete
            resolve("FILE UPLOAD TO BUCKET IS COMPLETED")
        })).on("error", (err) => {
            fs.unlinkSync(transcodedVideoFileName)
            reject(err.message)
        })
    })
}


app.post("/process-video", async (req, res) => {
    const fileName: string = req.body.fileName
    //const outputFilePath: string = req.body.outputFilePath

    if (!fileName) {
        res.status(400).send("Bad request. Missing vide URI")
    }

    const TRANSCODED_VIDEO_FILE_NAME = "360_" + fileName

    const ffmpegProcess = spawn('ffmpeg', [
        '-i', 'pipe:0', // Input from stdin (pipe:0)
        '-vf', 'scale=-1:360', // Video filter for scaling
        TRANSCODED_VIDEO_FILE_NAME
    ]);

    ffmpegProcess.on('error', (error: any) => {
        console.error('FFmpeg process error:', error.message);
        res.status(500).send("Processing video failed")
    });

    ffmpegProcess.on('close', (code: number) => {
        if (code === 0) {
            console.log('FFmpeg process finished successfully');
            uploadVideoToBucket(TRANSCODED_VIDEO_FILE_NAME)
                .then((message) => {
                    res.status(200).send(message)
                })
                .catch((err) => {
                    res.status(500).send(err.message)
                })
        } else {
            console.error('FFmpeg process exited with code', code);
            res.status(500).send("Processing video failed")
        }
    });
    //pipe file data from the cloud to ffmpegProcess for video transcoding
    videoBucket.file(fileName).createReadStream().pipe(
        ffmpegProcess.stdin
    )
})

//Incomplete 
app.post("/process-video-v2", async (req, res) => {
    res.status(403).send("Forbidden")
    const fileName: string = req.body.fileName
    if (!fileName) {
        res.status(400).send("Bad request. Missing vide URI")
    }
    videoBucket.file(fileName).createReadStream().pipe(
        fs.createWriteStream(fileName))
        .on('finish', () => {
            console.log("Finish reading video, now transcoding it...")
            const transcodedVideoFile = videoBucket.file("360p_" + fileName);
            ffmpeg("robloxapp-20231101-1337215.wmv")
                .outputOption("-vf", "scale=-1:360")
                .on('progress', function (progress) {
                    console.log('Processing: ' + progress.percent + '% done');
                })
                .on("end", () => {
                    res.status(200).send(`Video processed successfully`)
                }).on("error", (err) => {
                    res.status(500).send(`Internal Server Error: ${err.message}`)
                }).save(transcodedVideoFile.name)
        });
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Video processing service listening at localhost${port}`)
})