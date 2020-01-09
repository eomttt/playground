const puppeteer = require('puppeteer');

const kjGlassController = require('./kjGlass.controller');

const LKLAB_HOST = 'http://lklab.com';
const LKLAB_SPEC_TEST = 'http://lklab.com/product/product_list.asp?t_no=780';
const LKLAB_DETAIL_TEST = 'http://lklab.com/product/product_info.asp?g_no=5444&t_no=780';
const TYPE = 'expendables';
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
    let itemResult = [];
    try {
        while (pageNum <= MAX_ITEM_NUMBER) {
            await page.goto(LKLAB_HOST);
            await page.waitFor(1000);
            await page.click('#header > #gnb > .gnb_01');
            const items = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('#header > #category_all > #category_list > ul > .list_02 > a'));
                return elements.reduce((acc, cur) => {
                    acc.push({
                        classify: cur.innerText,
                        link: cur.getAttribute('href')
                    });
                    return acc;
                }, []);
            });

            // for (const item of items) {
                const res = await getItems(`${LKLAB_HOST}${items[1].link}`, items[1].classify);
                itemResult = [...itemResult, ...res];
            // }
            pageNum += 1;
            console.log('res', res);
        }
        browser.close();
        kjGlassController.updateData(itemResult, TYPE);
        return itemResult;
    } catch (error) {
        console.log('Get lk lab glass shop crwaling error.', error);
        throw new Error(error);
    }
};

const getItems = async (url, classify) => {
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

        let itemId = 1;
        const itemDetailList = [];

        for (const item of items) {
            const itemDetail = await getItemDetail(`${LKLAB_HOST}/product${item.slice(1)}`, classify, itemId);
            itemDetailList.push(itemDetail);
            itemId += 1;
        }
        browser.close();
        return itemDetailList;
    } catch (error) {
        console.log('get lk lab spec error.', error);
        throw new Error(error);
    }
};

const getItemDetail = async (url, classify = 'test', itemId) => {
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
        const englishTitle = await page.evaluate(() => {
            return document.querySelector('#content > #prod_top > #prod_info > #prod_info_01 > ul > .name_eng').innerText;
        });
        const korTitle = await page.evaluate(() => {
            return document.querySelector('#content > #prod_top > #prod_info > #prod_info_01 > ul > .name_kor').innerText;
        });
        const contents = await page.evaluate(() => {
            const items = document.querySelector('#content > #prod_top > #prod_info > #prod_info_02 > .keyword').innerText;
            return items.split('\n').filter((item) => {
                return !!item;
            });
        });
        const tableItems = await page.evaluate(() => {
            const menuItems = Array.from(document.querySelectorAll('#product_tab_02 > center > ul > li'));
            const menuItemTexts = menuItems.map((menuItem) => {
                return menuItem.innerHTML.replace(/(\t\n|\n|\t|&nbsp;)/gm, '');
            });
            return menuItemTexts;
        });
        const frame = await page.frames().find(frame => frame.name() === 'product_order');
        await page.waitFor(1000);
        const specifications = await frame.evaluate(() => {
            const items = Array.from(document.querySelectorAll('body > center > #con > form > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td'));
            return items.map((item) => {
                return item.innerText.trim();
            }).filter((item) => {
                if (item === 'Cat. No' || item === 'Model' || item === 'Description') {
                    return false;
                } else if (item === 'Unit' || item === 'Price(VAT별도)' || item === '재고' || item === '예정재고' || item === '0') {
                    return false;
                } else if (item.indexOf('/EA') > -1 || item.indexOf('소비자가') > -1 || item.indexOf('/PK') > -1 ||
                           item.indexOf('Day') > -1 || item.indexOf('본사') > -1 || item.indexOf('공장') > -1) {
                    return false;
                } else if (item === '') {
                    return false;
                }
                return true;
            });
        });
        let specificationId = 1;
        let specificationObject = {};
        const specificationObjects = [];

        specifications.forEach((item, index) => {
            if (index % 3 === 0) {
                specificationObject = {
                    id: String(specificationId),
                    number: item
                };
            } else if (index % 3 === 1) {
                specificationObject.model = item;
            } else {
                specificationObject.content = item;
                specificationObject.isSelected = false;
                specificationObjects.push(specificationObject);
                specificationId += 1;
            }
        });

        const imageUrl = await kjGlassController.uploadImage(image, `${TYPE}/${itemId || 1}.jpg`);

        const res = {
            classify: classify,
            content: contents,
            id: String(itemId || 1),
            image: imageUrl,
            specification: specificationObjects,
            tableItems: tableItems,
            title: `${englishTitle} (${korTitle})`,
            type: TYPE
        };
        browser.close();
        return res;
    } catch (error) {
        console.log('Get lk lab item deatil error.', error);
        throw new Error(error);
    }
};

module.exports.get = get;
module.exports.getItems = getItems;
module.exports.getItemDetail = getItemDetail;
