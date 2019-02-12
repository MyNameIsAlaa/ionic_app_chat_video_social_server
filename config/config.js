config = {};

config.mlab = {
  // "URL": "mongodb://alaa:123456@ds129143.mlab.com:29143/selim_test"
  "URL": "mongodb://alaa:alaa123@cluster0-shard-00-00-n8ntj.mongodb.net:27017,cluster0-shard-00-01-n8ntj.mongodb.net:27017,cluster0-shard-00-02-n8ntj.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"
};

config.app = {
  name: "Happy Chat",
  upload_url: "http://192.168.56.101:3000/uploads/"
}

module.exports = config;

