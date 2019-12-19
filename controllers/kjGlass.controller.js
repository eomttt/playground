const puppeteer = require('puppeteer');

const MAX_PAGE_NUMBER = 1;
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
        await page.goto(KJGLASS_SHOP_GLASSES);
        await page.waitFor(1000);
        while (pageNumber <= MAX_PAGE_NUMBER) {
            const tableRes = await page.evaluate(() => {
                const history = [];
                const elements = Array.from(document.querySelectorAll('table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > a'));
                const aTagElements = elements.reduce((acc, cur) => {
                    if (cur.innerHTML.indexOf('<img') > -1) {
                        return acc;
                    }
                    acc.push(cur);
                    return acc;
                }, []);

                aTagElements.forEach(async (aTagElement) => {
                    history.push(aTagElement.innerHTML);
                    await aTagElement.click();
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    await page.goBack();
                });
                return history;
            });
            console.log('TTT', tableRes);
            pageNumber += 1;
        }
        return browser.close();
    } catch (error) {
        console.log('Get kj glass shop crwaling error.', error);
    }
};

const getSpec = async () => {
    console.log('Start KJglass shop crwaling specification');
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });
    try {
        await page.goto(KJGLASS_SHOP_GLASS_SPECIFICATION);
        await page.waitFor(1000);
        const tableRes = await page.evaluate(() => {
            let isSpecification = false;
            const elements = Array.from(document.querySelectorAll('table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td'));
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
        console.log('TTT', tableRes);
        return browser.close();
    } catch (error) {
        console.log('Get kj glass shop crwaling error.', error);
    }
};

module.exports.get = get;
module.exports.getSpec = getSpec;
