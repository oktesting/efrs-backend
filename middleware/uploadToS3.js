const AWS = require("aws-sdk");
const config = require("config");

const ID = config.get("aws_id");
const SECRET = config.get("aws_secret");
// The name of the bucket that you have created
const BUCKET_NAME = config.get("aws_bucket_name");
const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
});
module.exports.uploadEvidences = (file, fire) => {
  // Setting up S3 upload parameters
  const key = `evidences/${fire.userId}/${fire._id}/${Date.now()}_${
    file.originalname
  }`;
  const params = {
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
    console.log(`file is uploaded to ${data.Location}`);
  });
  return `https://efrs.s3.amazonaws.com/${key}`;
};
