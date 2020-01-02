const puppeteer = require('puppeteer');

const updateData = require('./kjGlass.controller');

const LKLAB_HOST = 'http://lklab.com/';
const LKLAB_SPEC_TEST = 'http://lklab.com/product/product_list.asp?t_no=780';
const LKLAB_DETAIL_TEST = 'http://lklab.com/product/product_info.asp?g_no=5444&t_no=780';
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
        throw new Error(error);
    }
};

const getItems = async (url) => {
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
        const items = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#content > .prod_list > .prod_box > .thumb > a'));
            return elements.reduce((acc, cur) => {
                acc.push(cur.getAttribute('href'));
                return acc;
            }, []);
        });

        for (const item of items) {
            console.log('item', item, items.length);
        }
    } catch (error) {
        console.log('get lk lab spec error.', error);
        throw new Error(error);
    }
};

const getItemDetail = async (url) => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });
    try {
        await page.goto(url || LKLAB_DETAIL_TEST);
        await page.waitFor(1000);

        const image = await page.evaluate(() => {
            return document.querySelector('#content > #prod_top > #prod_thumb > form > #thumb_l > img').src;
        });
        console.log('image: ', image);
        const englishTitle = await page.evaluate(() => {
            return document.querySelector('#content > #prod_top > #prod_info > #prod_info_01 > ul > .name_eng').innerText;
        });
        console.log('englishTitle: ', englishTitle);
        const korTitle = await page.evaluate(() => {
            return document.querySelector('#content > #prod_top > #prod_info > #prod_info_01 > ul > .name_kor').innerText;
        });
        console.log('korTitle: ', korTitle);
        const specifications = await page.evaluate(() => {
            const items = document.querySelector('#content > #prod_top > #prod_info > #prod_info_02 > .keyword').innerText;
            return items.split('\n');
        });
        console.log('specifications', specifications);
        const tableMenu = await page.evaluate(() => {
            const menus = Array.from(document.querySelectorAll('#product_tab_02 > center > ul > li > table > thead > tr > th'));
            return menus.map((menu) => {
                return menu.innerText;
            });
        });
        console.log('tableMenu', tableMenu);
        const tableMenuItems = await page.evaluate(() => {
            const menuItems = Array.from(document.querySelectorAll('#product_tab_02 > center > ul > li > table > tbody > tr > td'));
            return menuItems.map((menuItem) => {
                return menuItem.innerText;
            });
        });
        console.log('tableMenuItems', tableMenuItems);
        let itemIndex = -1;
        const tableItems = tableMenuItems.reduce((acc, cur, index) => {
            if (index % 4 === 0) {
                itemIndex += 1;
                acc[itemIndex] = [];
            }
            acc[itemIndex].push(cur);
        }, []);
        console.log('tableItems', tableItems);
    } catch (error) {
        console.log('Get lk lab item deatil error.', error);
        throw new Error(error);
    }
};

module.exports.get = get;
module.exports.getItems = getItems;
module.exports.getItemDetail = getItemDetail;
