const puppeteer = require('puppeteer');

const MAX_PAGE_NUMBER = 1;
const KJGLASS_SHOP_GLASSES = 'http://kjglass.co.kr/shop.php?shopId=10001';

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
        // return browser.close();
    } catch (error) {
        console.log('Get kj glass shop crwaling error.', error);
    }
};

module.exports.get = get;
