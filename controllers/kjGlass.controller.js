const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const UUID = require('uuid-v4');

const serviceAccount = require('../keys/kjglass-60495-firebase-adminsdk-hleqt-8bf4fcb144.json');

const BUCKET_NAME = 'kjglass-60495.appspot.com';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: BUCKET_NAME
});

const KJGLASS_HOST = 'http://kjglass.co.kr';
const KJGLASS_SPEC_TEST_URL = 'http://kjglass.co.kr/shop.php?shopId=1000200010157';

const KJGLASS_SHOP_GLASSES = 'http://kjglass.co.kr/shop.php?shopId=10001';

const KJGLASS_SHOP_EXPANDABLES = 'http://kjglass.co.kr/shop.php?shopId=10002';

const get = async (type, pageNumber = 1) => {
    const hostUrl = type === 'glass' ? KJGLASS_SHOP_GLASSES : KJGLASS_SHOP_EXPANDABLES;

    console.log('Start KJglass shop crwaling');
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        let itemId = 15 * (Number(pageNumber) - 1) + 1;
        const itemResult = [];
        await page.goto(`${hostUrl}&p=${pageNumber}`);
        await page.waitFor(1000);
        const items = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > a'));
            const res = elements.reduce((acc, cur) => {
                if (cur.innerHTML.indexOf('<img') > -1) {
                    return acc;
                }
                acc.push(cur.getAttribute('href'));
                return acc;
            }, []);
            return res;
        });

        for (const item of items) {
            const specUrl = `${KJGLASS_HOST}${item.slice(1, item.length)}`;

            const res = await getSpec(specUrl, type, itemId);
            itemResult.push(res);
            itemId += 1;
        }
        browser.close();
        return itemResult;
    } catch (error) {
        console.log('Get kj glass shop crwaling error.', error);
    }
};

const getSpec = async (url, type, itemId) => {
    console.log('Start KJglass shop crwaling specification', type);
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });
    try {
        await page.goto(url || KJGLASS_SPEC_TEST_URL);
        await page.waitFor(1000);
        const tableRes = await page.evaluate(() => {
            let isSpecification = false;
            const elements = Array.from(document.querySelectorAll('table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td'));
            const titleInfo = Array.from(document.querySelectorAll('table > tbody > tr > td > table > tbody > tr > td > a'));
            const images = Array.from(document.querySelectorAll('table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > a > img'));
            const image = images[0].src;

            const newTitle = titleInfo.reduce((acc, cur) => {
                if (cur.innerHTML.indexOf('<') > -1 ||
                cur.innerHTML === 'Home' ||
                cur.innerHTML === '글라스' ||
                cur.innerHTML === '소모품') {
                    return acc;
                }
                acc.push(cur.innerHTML);
                return acc;
            }, []);

            const elementsData = elements.reduce((acc, cur) => {
                if (cur.innerHTML.indexOf('\n<br>') > -1) {
                    const contentList = cur.innerHTML.split('\n<br>');
                    contentList.forEach((content) => {
                        acc.content.push(content);
                    });
                    return acc;
                } else if (cur.innerHTML.indexOf('\n<br>\n<br>') > -1) {
                    const contentList = cur.innerHTML.split('\n<br>\n<br>');
                    contentList.forEach((content) => {
                        acc.content.push(content);
                    });
                    return acc;
                } else if (cur.innerHTML.indexOf('<') > -1 ||
                cur.innerHTML === '' ||
                cur.innerHTML === '&nbsp;') {
                    return acc;
                } else if (cur.innerHTML === '상세규격' ||
                cur.innerHTML === '가격' ||
                cur.innerHTML === '수량' ||
                cur.innerHTML === '장바구니' ||
                cur.innerHTML === '회원열람') {
                    return acc;
                }

                if (cur.innerHTML === 'Cat.no') {
                    isSpecification = true;
                    return acc;
                }
                if (isSpecification) {
                    acc.specification.push(cur.innerHTML);
                } else {
                    acc.content.push(cur.innerHTML);
                }
                return acc;
            }, {
                type: '',
                id: '0',
                image: image,
                classify: newTitle[0],
                title: newTitle[1],
                content: [],
                specification: []
            });

            return elementsData;
        });

        let idCount = 1;
        let specificationObj = {};
        const specificationList = [];

        tableRes.specification.forEach((item, index) => {
            if (index % 2 === 0) {
                specificationObj.id = String(idCount);
                specificationObj.number = item;
                specificationObj.selected = false;
                if (tableRes.specification[index + 1]) {
                    specificationObj.content = tableRes.specification[index + 1];
                } else {
                    specificationObj.content = '';
                }
                specificationList.push(specificationObj);
                idCount += 1;
            } else {
                specificationObj = {};
            }
        });
        tableRes.type = type;
        tableRes.specification = specificationList;
        tableRes.id = itemId;
        tableRes.image = await uploadImage(tableRes.image, `${type}/${itemId}.jpg`);
        browser.close();
        return tableRes;
    } catch (error) {
        console.log('Get kj glass shop crwaling error.', error);
    }
};

const uploadImage = (imageUrl, fileName) => {
    return new Promise((resolve) => {
        const bucket = admin.storage().bucket();
        const uuid = UUID();
        const file = bucket.file(fileName);
        fetch(imageUrl).then((res) => {
            const contentType = res.headers.get('content-type');
            const writeStream = file.createWriteStream({
                metadata: {
                    contentType,
                    firebaseStorageDownloadTokens: uuid
                }
            });
            res.body.pipe(writeStream).on('finish', (data) => {
                const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(fileName)}?alt=media&token=${uuid}`;
                resolve(url);
            });
        });
    });
};

module.exports.get = get;
module.exports.getSpec = getSpec;
module.exports.uploadImage = uploadImage;
