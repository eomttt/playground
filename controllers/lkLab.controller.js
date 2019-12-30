const puppeteer = require('puppeteer');

const updateData = require('./kjGlass.controller');

const LKLAB_HOST = 'http://lklab.com/';
const LKLAB_SPEC_TEST = 'http://lklab.com/product/product_list.asp?t_no=780';
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
            await page.goto(LKLAB_HOST);
            await page.waitFor(1000);
            await page.click('#header > #gnb > .gnb_01');
            const items = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('#header > #category_all > #category_list > ul > .list_02 > a'));
                return elements.reduce((acc, cur) => {
                    acc.push(cur.getAttribute('href'));
                    return acc;
                }, []);
            });

            for (const item of items) {
                console.log('item', item);
            }
            pageNum += 1;
        }
        // browser.close();
        // updateData(itemResult, TYPE);
        return itemResult;
    } catch (error) {
        console.log('Get lk lab glass shop crwaling error.', error);
    }
};

const getSpec = async (url) => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });
    try {
        await page.goto(url || LKLAB_SPEC_TEST);
        await page.waitFor(1000);
    } catch (error) {
        console.log('get lk lab spec error.', error);
    }
};

module.exports.get = get;
module.exports.getSpec = getSpec;
