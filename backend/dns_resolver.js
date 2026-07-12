const https = require('https');

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', (err) => reject(err));
  });
};

const resolveConnection = async () => {
  console.log('Resolving MongoDB Atlas DNS via HTTPS...');
  try {
    // 1. Fetch SRV records (shards hosts)
    const srvData = await fetchJson('https://dns.google/resolve?name=_mongodb._tcp.cluster0.qsdbeks.mongodb.net&type=SRV');
    if (!srvData.Answer || srvData.Answer.length === 0) {
      throw new Error('No SRV records found. Check your cluster name.');
    }

    const shards = srvData.Answer.map(item => {
      // SRV data format is "priority weight port target."
      const parts = item.data.split(' ');
      const port = parts[2];
      const host = parts[3].replace(/\.$/, ''); // remove trailing dot
      return `${host}:${port}`;
    }).join(',');

    // 2. Fetch TXT records (replica set details)
    const txtData = await fetchJson('https://dns.google/resolve?name=cluster0.qsdbeks.mongodb.net&type=TXT');
    let replicaSet = 'atlas-qsdbeks-shard-0'; // safe fallback
    if (txtData.Answer && txtData.Answer.length > 0) {
      const txtRecord = txtData.Answer[0].data;
      const match = txtRecord.match(/replicaSet=([^&"\s]+)/);
      if (match) {
        replicaSet = match[1];
      }
    }

    console.log('\n=========================================');
    console.log('✓ RESOLVED CONNECTION STRING');
    console.log('=========================================');
    console.log('Please copy the connection string below and paste it in your backend/.env file:');
    console.log('\nMONGODB_URI=mongodb://flora_user:flora123@' + shards + '/flora_assist?ssl=true&replicaSet=' + replicaSet + '&authSource=admin&retryWrites=true&w=majority');
    console.log('=========================================\n');

  } catch (error) {
    console.error('Error resolving DNS:', error.message);
  }
};

resolveConnection();
