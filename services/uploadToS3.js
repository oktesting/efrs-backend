/* const AWS = require("aws-sdk");

const ID = process.env.aws_id;
const SECRET = process.env.aws_secret;
// The name of the bucket that you have created
const BUCKET_NAME = process.env.aws_bucket_name;
const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
}); */

module.exports.uploadAvatar = (avatar, user) => {
  const key = `avatar/${user._id}/${avatar.originalname}`;
  return uploadFile(key, avatar);
};

module.exports.uploadEvidence = (evidence, fire) => {
  // Setting up S3 upload parameters
  const key = `evidences/${fire.user}/${fire._id}/${Date.now()}_${
    evidence.originalname
  }`;
  return uploadFile(key, evidence);
};

function uploadFile(key, file) {
  // TODO: change upload file to server uploads folder or in mongodb
  /* const params = {
    Bucket: BUCKET_NAME,
    Key: key, // File name you want to save as in S3
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentLength: file.size
  };
  // Uploading files to the bucket

  s3.upload(params, function(err, data) {
    if (err) {
      throw err;
    }
    // console.log(`file is uploaded to ${data.Location}`);
  });
  return `https://efrs.s3.${process.env.aws_bucket_region}.amazonaws.com/${key}`; */
}
