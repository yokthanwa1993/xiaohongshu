const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 80;

const axiosConfig = {
  headers: {
    'authority': 'www.xiaohongshu.com',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
    'sec-ch-ua': '"Brave";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'sec-gpc': '1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    'cookie': 'xhsTrackerId=d2c0b76d-3165-4a0e-a041-7efff221c8de; xhsTrackerId.sig=FSBtjOO6y6vbT51KbAr1JiWjYfWPRWwk-_9C3xcdP5Y; xhsTracker=url=explore&xhsshare=CopyLink; xhsTracker.sig=wmLdXV__wbETiz1qUgqoiY8swj2zGxC5B-xOV9HIhWg; cache_feeds=[]; webBuild=2.8.6; xsecappid=xhs-pc-web; a1=1887af064ae1pumct8q52tax1e5iv34ol1e7f3tjs30000133520; webId=f32bd76d4b7b9d05251fc01cf88031a3; gid=yYYW0i8KKq1WyYYW0i8K4yq90dyU76S9YA2JdVM90Cyd2Wq83hq4li888yqq2J882J0DS2dj; gid.sign=ClU+S4ctwnbDK0ogX0Zx8FAOl58=; web_session=040069b2a37562cb56381e3c4a364b39190ed4; websectiga=3633fe24d49c7dd0eb923edc8205740f10fdb18b25d424d2a2322c6196d2a4ad; sec_poison_id=7c6450d0-08e5-4dd6-b83f-97739fb4ce98', // ใส่คุกกี้ของคุณที่นี่
  },
};

const fetchData = (url) => {
  return axios.get(url, axiosConfig)
    .then(response => response.data)
    .catch(error => {
      console.error(error);
      throw new Error('An error occurred during data retrieval');
    });
};

app.get('/', (req, res) => {
  const { url } = req.query; // รับค่า url จาก query parameter ?url

  if (!url) {
    return res.status(400).send('Missing url parameter');
  }

  fetchData(url)
    .then(htmlText => {
      const $ = cheerio.load(htmlText);
      const traceIds = [];

      function extractTraceIdFromText(text) {
        const regex = /"traceId":"([^"]+)"/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
          traceIds.push(match[1]);
        }
      }

      extractTraceIdFromText(htmlText);

      const imageTags = traceIds.map(traceId => `<img src="https://ci.xiaohongshu.com/${traceId}?imageView2/2/w/format/png" style="width: 384px; height: 512.8px;">`);
      res.send(imageTags.join('\n'));
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('An error occurred');
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
