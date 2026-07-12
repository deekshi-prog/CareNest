const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('DNS server override failed, using default system DNS:', err.message);
}

const connectDB = async () => {
  try {
    const connURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flora_assist';
    console.log(`Connecting to MongoDB at: ${connURI}`);
    const conn = await mongoose.connect(connURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
