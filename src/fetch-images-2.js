import https from 'https';
const options = { headers: { 'User-Agent': 'ScriptBot/1.0' } };
['hollow clay brick', 'construction sand', 'rebar construction'].forEach(query => {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&utf8=&format=json`;
  https.get(url, options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      const parsedData = JSON.parse(rawData);
      if (parsedData.query && parsedData.query.search.length > 0) {
        parsedData.query.search.slice(0, 3).forEach(item => {
          console.log(query, '->', item.title);
        });
      }
    });
  });
});
