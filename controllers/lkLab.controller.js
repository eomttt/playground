const puppeteer = require('puppeteer');

const kjGlassController = require('./kjGlass.controller');

const LKLAB_HOST = 'http://lklab.com';
const LKLAB_SPEC_TEST = 'http://lklab.com/product/product_list.asp?t_no=780';
const LKLAB_DETAIL_TEST = 'http://lklab.com/product/product_info.asp?g_no=8024&t_no=780';
const TYPE = 'expendables';
const LKLAB_OFFSET = 'lkLabOffset';
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

            // i는 firebase lkLabOffset number + 1 부터 시작해야함
            for (let i = 11, len = items.length; i < len; i++) {
                const res = await getItems(`${LKLAB_HOST}${items[i].link}`, items[i].classify);
                await kjGlassController.updateData(res, TYPE);
                await kjGlassController.updateData({ number: i }, LKLAB_OFFSET);
            }
            pageNum += 1;
        }
        browser.close();

        return 'Succes to update in firebase';
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

        const existArray = await kjGlassController.getData(TYPE);

        let itemId = existArray ? existArray.length + 1 : 1;
        const itemDetailList = existArray ? [...existArray] : [];

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
            const items = Array.from(document.querySelectorAll('body > center > #con > form > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td:nth-child(2), td:nth-child(4), td:nth-child(6)'));
            return items.map((item) => {
                return item.innerText.trim();
            }).filter((item) => {
                if (item === 'Cat. No' || item === 'Model' || item === 'Description') {
                    return false;
                }
                return !!item;
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
