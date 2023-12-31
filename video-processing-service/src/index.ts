
import express from "express"
import ffmpeg from "fluent-ffmpeg"
// Imports the Google Cloud client library
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import TopicSubscriber from "./TopicSubscriber";
import { VideoStatusManager, VideoProcessingStatus } from "./VideoStatusManager";
import { Message, PubSub } from "@google-cloud/pubsub";

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
        console.log("Begin transcoding video...")
        console.log(resolution)
        ffmpeg(fileName)
            .outputOption("-vf", `scale=-1:${resolution}`)
            // .on('progress', function (progress) {
            //     console.log('Processing: ' + progress.percent + '% done');
            // })
            .on("end", () => {
                resolve(transcodedFileName)
                console.log("Transcoding video succeeded")
            }).on("error", (err) => {
                console.log("Error while transcoding video")
                console.log(err)
                reject(err)
            }).save(transcodedFileName)
    })
}


async function writeBucketFileToDisk(fileName: string) {
    let doesExist = await videoBucket.file(fileName).exists()

    return new Promise((resolve, reject) => {
        if (!(doesExist[0])) {
            console.log("file does not exist")
            reject()
        } else {
            videoBucket.file(fileName).createReadStream().pipe(
                fs.createWriteStream(fileName))
                .on('finish', () => {
                    resolve(fileName)
                }).on("error", () => {
                    reject()
                })
        }
    })
}

async function process_video(fileName: string): Promise<Map<number, string>> {
    const videoQualities: Array<number> = [360]
    //read the video file.

    console.log("write to disk")
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
    console.log(fileName)
    try {
        if (!fileName) {
            console.log("File name not provided")
        }

        console.log("The filename is..." + fileName)

        let status = await videoMetadataManager.getStatus(fileName)
        console.log("VIDEO STATUS" + status)
        if (status == VideoProcessingStatus.Processing || status == VideoProcessingStatus.Processed) {
            console.log("Video is already " + status + "ignore the message")
            message.ack()
            return
        }

        console.log("Start processing video, first create metadata document")

        console.log("BEGIN PROCESSING VIDEO")
        await videoMetadataManager.updateStatus(fileName, VideoProcessingStatus.Processing)
        let resolutionToFileId: Map<number, string> = await process_video(fileName)
        // console.log(resolutionToFileId)
        await videoMetadataManager.saveTranscodedVideoMapping(fileName, resolutionToFileId)
        await videoMetadataManager.updateStatus(fileName, VideoProcessingStatus.Processed)
        console.log("video processing suceeded")
        message.ack()
    } catch (err) {
        console.log(err)
        console.log("Processing failed, set status to undefined")
        message.ack()
        videoMetadataManager.updateStatus(fileName, VideoProcessingStatus.Undefined).then(() => {
            console.log("Set status to undefined success")

        }).catch((err: any) => {
            console.log("Set status to undefined failed")
            console.log(err.message)

        })
    }
};

videoUploadSubscriber.subscribeTo(topicName, subscriptionName, messageHandler)
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Video processing service listening at localhost${port}`)
})
