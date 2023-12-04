import { error } from "console"
import express from "express"
import ffmpeg from "fluent-ffmpeg"
// Imports the Google Cloud client library
import { Storage, FileMetadata, File } from '@google-cloud/storage';
import fs from 'fs';
import stream from 'stream';
const { spawn } = require('child_process');

const UPLOADED_VIDEO_BUCKET_NAME = "uploaded-video-bucket"

const app = express()
//add middleware to handle request converting them to JSON
app.use(express.json())

const storage = new Storage({ keyFilename: 'key.json' });
const videoBucket = storage.bucket(UPLOADED_VIDEO_BUCKET_NAME);

type Resolution = {
    width: number,
    height: number
};

function uploadVideoToBucket(transcodedVideoFileName: string, resolution: Resolution) {
    // Create a pass through stream from a string
    return new Promise((resolve, reject) => {
        const transcodedVideoFile = videoBucket.file(transcodedVideoFileName);
        const readableStream = fs.createReadStream(transcodedVideoFileName)
        readableStream.pipe(transcodedVideoFile.createWriteStream().on('finish', () => {

            transcodedVideoFile.setMetadata({
                metadata: {
                    "resolutionWidth": resolution.width.toString(),
                    "resolutionHeight": resolution.height.toString()
                }
            })
            // The file upload is complete
            fs.unlinkSync(transcodedVideoFileName)
            resolve("FILE UPLOAD TO BUCKET IS COMPLETED")
        })).on("error", (err) => {
            fs.unlinkSync(transcodedVideoFileName)
            reject(err.message)
        })
    })
}

// function transcodeVideoPipe(videoFile: File, resolution: Resolution): Promise<string> {
//     return new Promise((resolve, reject) => {
//         const TRANSCODED_VIDEO_FILE_NAME = `${resolution.height}_${videoFile.name}`

//         const ffmpegProcess = spawn('ffmpeg', [
//             '-i', 'pipe:0', // Input from stdin (pipe:0)
//             '-vf', `scale=-1:${resolution.height}`,
//             TRANSCODED_VIDEO_FILE_NAME
//         ]);

//         ffmpegProcess.on('error', (error: any) => {
//             console.error('FFmpeg process error:', error.message);
//             reject(`Error while processing video ${error.message}`)
//         });

//         ffmpegProcess.stderr.on('data', (data: any) => {
//             console.error(`FFmpeg stderr: ${data.toString()}`);
//         });

//         ffmpegProcess.on('close', (code: number) => {
//             if (code === 0) {
//                 console.log("TRANSCODE SUCCESS")
//                 resolve(TRANSCODED_VIDEO_FILE_NAME)
//             } else {
//                 console.error('FFmpeg process exited with code', code);
//                 fs.unlinkSync(TRANSCODED_VIDEO_FILE_NAME)
//                 reject(`Error while processing video`)
//             }
//         });

//         //pipe file data from the cloud to ffmpegProcess for video transcoding
//         videoFile.createReadStream().pipe(
//             ffmpegProcess.stdin
//         )
//     })
// }

function transcodeVideo(fileName: string, resolution: Resolution): Promise<string> {
    return new Promise((resolve, reject) => {
        const transcodedFileName = `${resolution.height}_${fileName}`
        ffmpeg(fileName)
            .outputOption("-vf", `scale=-1:${resolution.height}`)
            .on('progress', function (progress) {
                console.log('Processing: ' + progress.percent + '% done');
            })
            .on("end", () => {
                resolve(transcodedFileName)
            }).on("error", (err) => {
                console.log("GOT ERROR")
                console.log(err)
                reject(err)
            }).save(transcodedFileName)
    })
}


app.post("/process-video", async (req, res) => {
    const fileName: string = req.body.fileName
    //const outputFilePath: string = req.body.outputFilePath

    if (!fileName) {
        res.status(400).send("Bad request. Missing vide URI")
    }
    const videoQualities: Array<Resolution> = [{ width: 640, height: 360 },
    { width: 1280, height: 720 }]

    //read the video file.
    videoBucket.file(fileName).createReadStream().pipe(
        fs.createWriteStream(fileName))
        .on('finish', () => {
            // when video file finishes reading and is written to disk, start transcoding.
            const transcodePromises: Array<Promise<string>> = []
            for (let resolution of videoQualities) {
                let promise: Promise<string> = new Promise(async (resolve, reject) => {
                    try {
                        const transcodedVideoFileName = await transcodeVideo(fileName, resolution)
                        await uploadVideoToBucket(transcodedVideoFileName, resolution)

                        resolve(transcodedVideoFileName)
                    } catch (err) {
                        console.log(err)
                        reject(err)
                    }
                })
                transcodePromises.push(promise)
            }

            Promise.allSettled(transcodePromises).then((results) => {
                let isAllFulfilled = results.every(result => result.status == "fulfilled")
                if (isAllFulfilled) {
                    fs.unlinkSync(fileName)
                    res.status(200).send("Transcoding video complete")
                } else {
                    fs.unlinkSync(fileName)
                    res.status(500).send("Transcoding video failed")
                }
            });
        });
})


//Incomplete 
app.post("/process-video-v2", async (req, res) => {
    const fileName: string = req.body.fileName
    if (!fileName) {
        res.status(400).send("Bad request. Missing vide URI")
    }
    videoBucket.file(fileName).createReadStream().pipe(
        fs.createWriteStream(fileName))
        .on('finish', () => {

        });
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Video processing service listening at localhost${port}`)
})