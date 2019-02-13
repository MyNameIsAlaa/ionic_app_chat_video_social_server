require('dotenv').config();
const Config = {
  http: {
    domain: process.env.domain || 'http://18.218.141.139',
    port: process.env.PORT || 9090
  },
  JWT: {
    'secretOrKey': process.env.JWT_secretOrKey || 'NineVisionsDotCom'
  },
  MongoDB: {
    URL: process.env.mongoURL || "mongodb://alaa:alaa123@cluster0-shard-00-00-lk6ns.mongodb.net:27017,cluster0-shard-00-01-lk6ns.mongodb.net:27017,cluster0-shard-00-02-lk6ns.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"
  }
};

module.exports = Config;



