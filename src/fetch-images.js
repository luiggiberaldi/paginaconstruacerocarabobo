import https from 'https';

const queries = ['rebar steel', 'cement bag', 'clay block hollow', 'steel mesh wire', 'sand pile construction'];

const options = {
  headers: {
    'User-Agent': 'ScriptBot/1.0 (luiggiberaldi94@gmail.com) Node.js'
  }
};

queries.forEach(query => {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&utf8=&format=json`;
  https.get(url, options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        if (parsedData.query && parsedData.query.search.length > 0) {
          const title = parsedData.query.search[0].title;
          const imgUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
          https.get(imgUrl, options, (res2) => {
            let rawData2 = '';
            res2.on('data', (chunk) => { rawData2 += chunk; });
            res2.on('end', () => {
              const parsedData2 = JSON.parse(rawData2);
              const pages = parsedData2.query.pages;
              const pageId = Object.keys(pages)[0];
              const ii = pages[pageId].imageinfo;
              if (ii && ii.length > 0) {
                console.log(`${query} -> ${ii[0].url}`);
              }
            });
          });
        }
      } catch (e) {
          console.error(e.message);
      }
    });
  });
});
