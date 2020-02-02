const puppeteer = require('puppeteer');

const MEGA_GET_BY_REGION = 'http://www.megabox.co.kr/?menuId=timetable-cinema';

const GANGWON_INDEX = 6;

const getRegions = async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        await page.goto(MEGA_GET_BY_REGION);
        await page.waitFor(1000);
        const regions = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.content_wrap > #main > #container > .section > .theater_lst > .content_wrap > .menu > li > a'));
            return elements.map((element) => {
                return element.innerText;
            });
        });

        return regions.slice(1, regions.length);
    } catch (error) {
        console.log('Get regions error MEGA', error);
    } finally {
        browser.close();
    }
};

const getTheatersByRegions = async (regionIndex = GANGWON_INDEX) => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        await page.goto(MEGA_GET_BY_REGION);
        await page.waitFor(1000);
        await page.click(`.content_wrap > #main > #container > .section > .theater_lst > .content_wrap > .menu > li:nth-child(${regionIndex + 2})`);
        await page.waitFor(1000);

        const theatersInfo = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.content_wrap > #main > #container > .section > .theater_lst > .content_wrap > .menu > li > .active > li > a'));
            return elements.map((element) => {
                return element.innerText;
            });
        });

        return theatersInfo;
    } catch (error) {
        console.log('Get theater by region error MEGA', error);
    } finally {
        browser.close();
    }
};

module.exports.getRegions = getRegions;
module.exports.getTheatersByRegions = getTheatersByRegions;
