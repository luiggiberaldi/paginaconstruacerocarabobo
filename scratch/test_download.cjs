const https = require('https');
const url = 'https://scontent.cdninstagram.com/v/t51.2885-19/239197174_176664861100963_8071364432078921202_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=103&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=qStdH_2J3lsQ7kNvwHXBs5O&_nc_oc=AdpUe_7mA5RRq5VWQ1hDDG64vts29Twth-TkQwqZ4Ictl5hWQjWmtLSq2fR1ii8rIatnOmNwmauC7S_NsYOs8ep7&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_ss=78689&oh=00_Af4suqMgVuRHP5EN2IkG-1v9XvCOfmsYzpsVFC84_K6zdA&oe=6A170702';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
}).on('error', (err) => {
  console.error('Error:', err);
});
