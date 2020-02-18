const AWS = require('aws-sdk');

AWS.config.loadFromPath('aws.config.json');
const s3 = new AWS.S3();

const uploadToS3 = (param) => {
    return new Promise((resolve, reject) => {
        s3.upload(param, (error, data) => {
            if (error) {
                console.log('Upload s3 error', error);
                reject(error);
            }
            resolve(data.Location);
        });
    });
};

const transcribe = (jobName, fileName) => {
    return new Promise((resolve, reject) => {
        const languageCode = 'en-US'; // en-US | es-US
        // e.g. "https://s3.amazonaws.com/$BucketName/$KeyName"
        const mediaUri = 'https://s3.amazonaws.com/hyuntaeeom-personal/jiujitsu/john-danaher/open-guard'; // string
        const mediaFormat = 'mp4'; // mp3 | wav | flag | mp4
        const transParams = {
            LanguageCode: languageCode,
            Media: { MediaFileUri: mediaUri },
            MediaFormat: mediaFormat,
            TranscriptionJobName: jobName,
            OutputBucketName: ''
        };
        AWS.Transcribe.startTranscriptionJob(transParams, (error, data) => {
            if (error) {
                console.log('Transcribe error', error);
                reject(error);
            }

            resolve(data);
        });
    });
};

module.exports.uploadToS3 = uploadToS3;
module.exports.transcribe = transcribe;
