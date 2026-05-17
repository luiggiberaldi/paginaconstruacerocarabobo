import https from 'https';
const options = { headers: { 'User-Agent': 'ScriptBot/1.0' } };
['File:A bunch of rebar up close.jpg', 'File:Mauerziegel 003 2025 09 12.jpg', 'File:Sand for the Construction Industry - geograph.org.uk - 4439476.jpg'].forEach(title => {
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
        console.log(`${title} -> ${ii[0].url}`);
        }
    });
    });
});
