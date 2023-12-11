
import express from "express"
import ffmpeg from "fluent-ffmpeg"
// Imports the Google Cloud client library
import { Storage, FileMetadata, File } from '@google-cloud/storage';
import fs from 'fs';
import stream from 'stream';
import { spawn } from 'child_process';
import TopicSubscriber from "./TopicSubscriber";
import { VideoStatusManager, VideoProcessingStatus } from "./VideoStatusManager";
import { Message, PubSub } from "@google-cloud/pubsub";
import test from "node:test";
//gcloud storage buckets notifications create gs://uploaded-video-bucket --topic=video-uploaded --event-types=OBJECT_FINALIZE

const UPLOADED_VIDEO_BUCKET_NAME = "uploaded-video-bucket"
const TRANSCODE_VIDEO_BUCKET_NAME = "transcoded-videos-bucket"

const app = express()
//add middleware to handle request converting them to JSON
app.use(express.json())

const storage = new Storage({ keyFilename: 'key.json' });
const videoBucket = storage.bucket(UPLOADED_VIDEO_BUCKET_NAME);
const transcodedVideoBucket = storage.bucket(TRANSCODE_VIDEO_BUCKET_NAME);

function deleteFile(filePath: string) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
    }
}

function uploadTranscodedVideoToBucket(transcodedVideoFileName: string, resolution: number) {
    return new Promise((resolve, reject) => {
        const transcodedVideoFile = transcodedVideoBucket.file(transcodedVideoFileName);
        if (!transcodedVideoFile.exists) {
            reject("File does not exist")
        }
        const readableStream = fs.createReadStream(transcodedVideoFileName)
        readableStream.pipe(transcodedVideoFile.createWriteStream().on('finish', () => {

            transcodedVideoFile.setMetadata({
                metadata: {
                    "resolution": resolution.toString()
                }
            })
            // The file upload is complete
            deleteFile(transcodedVideoFileName)
            let fileURI = transcodedVideoBucket.file(transcodedVideoFileName).publicUrl()
            resolve(fileURI)
        })).on("error", (err) => {
            deleteFile(transcodedVideoFileName)
            reject(err.message)
        })
    })
}


function transcodeVideo(fileName: string, resolution: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const transcodedFileName = `${resolution}_${fileName}`
        ffmpeg(fileName)
            .outputOption("-vf", `scale=-1:${resolution}`)
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


async function writeBucketFileToDisk(fileName: string) {
    return new Promise((resolve, reject) => {
        videoBucket.file(fileName).createReadStream().pipe(
            fs.createWriteStream(fileName))
            .on('finish', () => {
                resolve(fileName)
            }).on("error", () => {
                reject()
            })
    })
}

async function process_video(fileName: string): Promise<Map<number, string>> {
    const videoQualities: Array<number> = [360]
    //read the video file.
    await writeBucketFileToDisk(fileName)
    const transcodeAndUploadPromises: Array<Promise<object>> = []
    for (let resolution of videoQualities) {
        let promise: Promise<object> = new Promise(async (resolve, reject) => {
            try {
                const transcodedVideoFileName = await transcodeVideo(fileName, resolution)
                const fileURI = await uploadTranscodedVideoToBucket(transcodedVideoFileName, resolution)
                resolve({
                    resolution: resolution,
                    fileURI: fileURI
                })
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
        transcodeAndUploadPromises.push(promise)
    }

    let resolutionToFileURI: Map<number, string> = new Map()
    return Promise.allSettled(transcodeAndUploadPromises).then((results) => {
        let isAllFulfilled = results.every(result => result.status == "fulfilled")
        if (isAllFulfilled) {
            results.map((result) => {
                if (result.status == "fulfilled") {
                    let resultValue: any = result.value
                    let resolution: number = resultValue.resolution
                    let fileURI: string = resultValue.fileURI
                    resolutionToFileURI.set(resolution, fileURI)
                }
            })
            deleteFile(fileName)
            return resolutionToFileURI
        } else {
            deleteFile(fileName)
            console.log("ERROR OCCURED")
            throw new Error("Video process failed")
        }
    });
}

app.post("/", async (req, res) => {
    res.send("Hello world")
})


app.post("/process-video", async (req, res) => {
    const fileName: string = req.body.fileName
    //const outputFilePath: string = req.body.outputFilePath

    if (!fileName) {
        res.status(400).send("Bad request.")
    }

    try {
        await process_video(fileName)
        res.status(200).send("Video processing success")
    } catch (err) {
        res.status(500).send("Video processing failed")
    }
})


const videoMetadataManager = new VideoStatusManager()

const topicName = 'video-uploaded';
const subscriptionName = 'video-uploaded-sub';
let videoUploadSubscriber = new TopicSubscriber()

const messageHandler = async (message: Message) => {
    // console.log(`Received message ${message.id}:`);
    // console.log(`\tData: ${message.data}`);
    // console.log(`\tAttributes: ${JSON.stringify(message.attributes)}`);

    let messageData = JSON.parse(message.data.toString('utf-8'));
    let fileName = messageData.name

    console.log("received message ")
    try {
        if (!fileName) {
            console.log("File name not provided")
        }

        // let videoFile = videoBucket.file(fileName)
        // let metadata: any = videoFile.metadata
        // let userId: string = metadata.userId ? metadata.userId : ""
        // let videoName: string = metadata.videoName ? metadata.videoName : ""
        // let description: string = metadata.description ? metadata.description : ""


        console.log("The filename is..." + fileName)
        let status = await videoMetadataManager.getStatus(fileName)
        if (status == VideoProcessingStatus.Processing || status == VideoProcessingStatus.Processed) {
            console.log("Video is already " + status + "ignore the message")
            message.ack()
            return
        }
        console.log("Start processing video, first create metadata document")

        console.log("BEGIN PROCESSING VIDEO")
        let resolutionToFileId: Map<number, string> = await process_video(fileName)
        console.log(resolutionToFileId)
        await videoMetadataManager.saveTranscodedVideoMapping(fileName, resolutionToFileId)
        await videoMetadataManager.updateStatus(fileName, VideoProcessingStatus.Processed)
        message.ack()
    } catch (err) {
        console.log(err)
        console.log("Processing failed, set status to undefined")
        //if processing failed, set status to undefined, and wait for PubSub to send message again.
        videoMetadataManager.updateStatus(fileName, VideoProcessingStatus.Undefined).then(() => {
            console.log("Set status to undefined success")
        }).catch((err: any) => {
            console.log("Set status to undefined failed")
            console.log(err.message)
        })
    }
};

videoUploadSubscriber.subscribeTo(topicName, subscriptionName, messageHandler)

// const pubsub = new PubSub({ keyFilename: 'key.json' });
// const topic = pubsub.topic("video-uploaded")
// const testData = {
//     fileName: ""
// }
// topic.publishMessage({ data: Buffer.from(JSON.stringify(testData)) });


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Video processing service listening at localhost${port}`)
})


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
