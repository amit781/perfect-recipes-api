const aws = require("aws-sdk");
const multerS3 = require('multer-s3');
const multer = require('multer');

const fileFilter = (req, file, cb) => {
	if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		cb(null, true);
	} else {
		cb(new Error('only jpeg or png'), false);
	}
}

// const upload = multer({
// 	storage: storage,
// 	limits: {
// 		fileSize: 1024 * 1024 * 5
// 	},
// 	fileFilter: fileFilter
// });
aws.config.update({
	secretAccessKey: process.env.awsSecretAccessKey,
	accessKeyId: process.env.awsAccessKeyID,
	region: 'us-west-1'
})
const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'perfectrecipesbucket',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      console.log(file);
      cb(null, Object.assign({}, req.body));
    },
    key: function (req, file, cb) {
      console.log(file);
      cb(null, file.filename)
    }
  }),
  limits: {
	fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

module.exports = upload;
