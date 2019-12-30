const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const UUID = require('uuid-v4');

const serviceAccount = require('../keys/kjglass-60495-firebase-adminsdk-hleqt-8bf4fcb144.json');

const BUCKET_NAME = 'kjglass-60495.appspot.com';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: BUCKET_NAME,
    databaseURL: 'https://kjglass-60495.firebaseio.com',
    databaseAuthVariableOverride: null
});

const updateData = require('./kjGlass.controller');

const LKLAG_HOST = 'http://lklab.com/';
const TYPE = 'lkLab';
const MAX_ITEM_NUMBER = 1;

const get = async () => {
    console.log('Start lkLab shop crwaling');
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    let pageNum = 1;
    const itemResult = [];
    try {
        while (pageNum <= MAX_ITEM_NUMBER) {
            await page.goto(`${LKLAG_HOST}&p=${pageNum}`);
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

            pageNum += 1;
        }
        browser.close();
        updateData(itemResult, TYPE);
        return itemResult;
    } catch (error) {
        console.log('Get kj glass shop crwaling error.', error);
    }
};

module.exports.get = get;
