const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('DNS server override failed, using default system DNS:', err.message);
}

const connectDB = async () => {
  try {
    const connURI = process.env.MONGODB_URI || 'mongodb+srv://flora_user:flora_password@cluster0.96o1pmf.mongodb.net/flora_assist?retryWrites=true&w=majority';
    console.log(`Connecting to MongoDB at: ${connURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    const conn = await mongoose.connect(connURI, {
      serverSelectionTimeoutMS: 7500, // Timeout after 7.5s instead of hanging indefinitely
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
