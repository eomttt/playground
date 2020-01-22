const puppeteer = require('puppeteer');

const kjGlassController = require('./kjGlass.controller');

const LKLAB_HOST = 'http://lklab.com';
const LKLAB_SPEC_TEST = 'http://lklab.com/product/product_list.asp?t_no=780';
const LKLAB_DETAIL_TEST = 'http://lklab.com/product/product_info.asp?g_no=12419&t_no=862';
const LKLAB_OFFSET = 'lkLabOffset';
const MAX_ITEM_NUMBER = 1;

const TYPE = 'expendables';

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
                const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
                const elements = Array.from(document.querySelectorAll('#header > #category_all > #category_list > ul > .list_02 > a'));
                return elements.reduce((acc, cur) => {
                    const one = cur.innerText.slice(0, 1);
                    const alphabetIndex = ALPHABET.indexOf(one);
                    acc.push({
                        classify: cur.innerText,
                        alphabet: ALPHABET[alphabetIndex],
                        link: cur.getAttribute('href')
                    });
                    return acc;
                }, []);
            });

            console.log('Whole len', items.length);

            let itemId = 114;
            // i는 firebase lkLabOffset number + 1 부터 시작해야함
            for (let i = 10, len = items.length; i < len; i++) {
                console.log('Start', i);
                const type = `${TYPE}_${items[i].alphabet}`;
                const res = await getItems(`${LKLAB_HOST}${items[i].link}`, items[i].classify, type, itemId);
                await kjGlassController.updateData(res, type);
                await kjGlassController.updateData({ number: i }, LKLAB_OFFSET);
                const data = await kjGlassController.getData(type);
                itemId = Number(data[data.length - 1].id) + 1;
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

const getItems = async (url, classify, type, itemId) => {
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

        const existArray = await kjGlassController.getData(type);
        const itemDetailList = existArray ? [...existArray] : [];

        for (const item of items) {
            console.log('Item', item);
            console.log('Item id', itemId);
            if (item !== './product_info.asp?g_no=12419&t_no=862') {
                const itemDetail = await getItemDetail(`${LKLAB_HOST}/product${item.slice(1)}`, classify, itemId, type);
                itemDetailList.push(itemDetail);
                itemId += 1;
            }
        }
        browser.close();
        return itemDetailList;
    } catch (error) {
        console.log('get lk lab spec error.', error);
        throw new Error(error);
    }
};

const getItemDetail = async (url, classify = 'test', itemId, type) => {
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

        const res = {
            classify: classify,
            content: contents,
            id: String(itemId || 1),
            image: image,
            specification: specificationObjects,
            tableItems: tableItems,
            title: `${englishTitle} (${korTitle})`,
            type: type
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
