require('dotenv').config();
const Config = {
  http: {
    domain: process.env.domain || 'http://13.58.246.198',
    port: process.env.port || 9988
  },
  JWT: {
    'secretOrKey': process.env.JWT_secretOrKey || 'NineVisionsDotCom'
  },
  MongoDB: {
    URL: process.env.mongoURL || "mongodb://alaa:alaa123@cluster0-shard-00-00-n8ntj.mongodb.net:27017,cluster0-shard-00-01-n8ntj.mongodb.net:27017,cluster0-shard-00-02-n8ntj.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"
  }
};

module.exports = Config;



