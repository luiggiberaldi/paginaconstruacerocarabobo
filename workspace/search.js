import https from 'https';

function searchWikimedia(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
  https.get(url, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        const titles = parsedData.query.search.map(s => s.title);
        
        let count = 0;
        titles.slice(0, 3).forEach(title => {
            const imgUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
            https.get(imgUrl, (res2) => {
                let rawData2 = '';
                res2.on('data', (chunk) => { rawData2 += chunk; });
                res2.on('end', () => {
                    const parsedData2 = JSON.parse(rawData2);
                    const pages = parsedData2.query.pages;
                    Object.keys(pages).forEach(key => {
                        const ii = pages[key].imageinfo;
                        if (ii && ii.length > 0) {
                            console.log(query, "=>", ii[0].url);
                        }
                    });
                });
            });
        });

      } catch (e) {
        console.error(e.message);
      }
    });
  });
}

const queries = ['rebar', 'cement bag', 'hollow clay brick', 'steel mesh', 'sand construction'];
queries.forEach(q => searchWikimedia(q));
