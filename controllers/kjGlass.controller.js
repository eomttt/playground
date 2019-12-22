const puppeteer = require('puppeteer');

const MAX_PAGE_NUMBER = 21;
const KJGLASS_HOST = 'http://kjglass.co.kr';
const KJGLASS_SHOP_GLASSES = 'http://kjglass.co.kr/shop.php?shopId=10001';
const KJGLASS_SHOP_GLASS_SPECIFICATION = 'http://kjglass.co.kr/shop.php?shopId=1000100010001';

const get = async () => {
    let pageNumber = 1;

    console.log('Start KJglass shop crwaling');
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        const itemResult = [];
        while (pageNumber <= MAX_PAGE_NUMBER) {
            await page.goto(`${KJGLASS_SHOP_GLASSES}&p=${pageNumber}`);
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
                console.log('tableRes', specUrl);

                const res = await getSpec(specUrl);
                itemResult.push(res);
            }
            pageNumber += 1;
        }
        browser.close();
        return itemResult;
    } catch (error) {
        console.log('Get kj glass shop crwaling error.', error);
    }
};

const getSpec = async (url) => {
    console.log('Start KJglass shop crwaling specification');
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });
    try {
        await page.goto(url || KJGLASS_SHOP_GLASS_SPECIFICATION);
        await page.waitFor(1000);
        const tableRes = await page.evaluate(() => {
            let isSpecification = false;
            const elements = Array.from(document.querySelectorAll('table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td'));
            const titleInfo = Array.from(document.querySelectorAll('table > tbody > tr > td > table > tbody > tr > td > a'));

            const newTitle = titleInfo.reduce((acc, cur) => {
                if (cur.innerHTML.indexOf('<') > -1 ||
                    cur.innerHTML === 'Home' ||
                    cur.innerHTML === '글라스') {
                    return acc;
                }
                acc.push(cur.innerHTML);
                return acc;
            }, []);

            const elementsData = elements.reduce((acc, cur) => {
                if (cur.innerHTML.indexOf('<') > -1 ||
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
                type: 'glass',
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
            } else {
                specificationObj.content = item;
                specificationObj.selected = false;
                specificationList.push(specificationObj);
                specificationObj = {};
                idCount += 1;
            }
        });
        tableRes.specification = specificationList;
        browser.close();
        return tableRes;
    } catch (error) {
        console.log('Get kj glass shop crwaling error.', error);
    }
};

module.exports.get = get;
module.exports.getSpec = getSpec;
