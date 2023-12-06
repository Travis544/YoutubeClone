
import express from "express"
import ffmpeg from "fluent-ffmpeg"
// Imports the Google Cloud client library
import { Storage, FileMetadata, File } from '@google-cloud/storage';
import fs from 'fs';
import stream from 'stream';
import { spawn } from 'child_process';
import TopicSubscriber from "./TopicSubscriber";
import { VideoMetadataManager, VideoProcessingStatus, VideoMetadata } from "./VideoMetadataManager";
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

type Resolution = {
    width: number,
    height: number
};

function uploadTranscodedVideoToBucket(transcodedVideoFileName: string, resolution: Resolution) {
    return new Promise((resolve, reject) => {
        const transcodedVideoFile = transcodedVideoBucket.file(transcodedVideoFileName);
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


async function process_video(fileName: string, videoQualities: Array<Resolution>): Promise<void> {
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
                        await uploadTranscodedVideoToBucket(transcodedVideoFileName, resolution)
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
                } else {
                    fs.unlinkSync(fileName)
                    throw new Error("Video process failed")
                }
            });
        });
}


app.post("/process-video", async (req, res) => {
    const fileName: string = req.body.fileName
    //const outputFilePath: string = req.body.outputFilePath

    if (!fileName) {
        res.status(400).send("Bad request. Missing vide URI")
    }
    const videoQualities: Array<Resolution> = [{ width: 640, height: 360 }]
    try {
        await process_video(fileName, videoQualities)
        res.status(200).send("Video processing success")
    } catch (err) {
        res.status(500).send("Video processing failed")
    }
})


const videoMetadataManager = new VideoMetadataManager()

const topicName = 'video-uploaded';
const subscriptionName = 'video-uploaded-sub';
let videoUploadSubscriber = new TopicSubscriber()

const messageHandler = async (message: Message) => {
    const videoQualities: Array<Resolution> = [{ width: 640, height: 360 }]
    // console.log(`Received message ${message.id}:`);
    console.log(`\tData: ${message.data}`);
    console.log(`\tAttributes: ${JSON.stringify(message.attributes)}`);
    let messageData = JSON.parse(message.data.toString('utf-8'));
    let fileName = messageData.name
    let videoFile = videoBucket.file(fileName)
    let metadata: any = videoFile.metadata
    let userId: string = metadata.userId
    let videoName: string = metadata.videoName
    if (!fileName || !userId || !videoName) {
        message.ack()
        return
    }

    try {
        let status = await videoMetadataManager.getStatus(fileName)
        if (status == VideoProcessingStatus.Processing || status == VideoProcessingStatus.Processed) {
            message.ack()
            return
        }

        await videoMetadataManager.saveVideoMetadata(fileName, {
            userId: userId,
            videoName: videoName,
            status: VideoProcessingStatus.Processing
        })
        await process_video(fileName, videoQualities)
        await videoMetadataManager.updateStatus(fileName, VideoProcessingStatus.Processed)
        message.ack()
    } catch (err) {
        //if processing failed, set status to undefined, and wait for PubSub to send message again.
        await videoMetadataManager.updateStatus(fileName, VideoProcessingStatus.Undefined)
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
