const puppeteer = require('puppeteer');

const LOTTE_HOST_URL = 'https://www.lottecinema.co.kr/NLCHS';

const GANGWON_INDEX = 7;
const MOCK_THEATER_INFO = {
    title: '동해',
    link: 'https://www.lottecinema.co.kr/NLCHS/Cinema/Detail?divisionCode=1&detailDivisionCode=6&cinemaID=7002'
};

const getRegions = async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        await page.goto(LOTTE_HOST_URL);
        await page.waitFor(1000);
        const regions = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#header_section > #nav > ul > li:nth-child(3) > div > ul > li > a'));
            return elements.map((element) => {
                return element.innerText;
            });
        });

        return regions;
    } catch (error) {
        console.log('Get regions error Lotte', error);
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
        await page.goto(LOTTE_HOST_URL);
        await page.waitFor(1000);
        // Click region
        await page.click('#header_section > #nav > ul > li:nth-child(3)');
        await page.waitFor(1000);
        await page.click(`#header_section > #nav > ul > li:nth-child(3) > div > ul > li:nth-child(${regionIndex + 1})`);
        await page.waitFor(1000);

        const theatersInfo = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#nav > ul > li:nth-child(3) > div > ul > .ov > div > ul > li > a'));
            return elements.map((element) => {
                return {
                    title: element.innerText,
                    link: element.getAttribute('href')
                };
            });
        });

        return theatersInfo;
    } catch (error) {
        console.log('Get theater by region error Lotte', error);
    } finally {
        browser.close();
    }
};

const getTimeTable = async (theaterInfo = MOCK_THEATER_INFO) => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        await page.goto(theaterInfo.link);
        await page.waitFor(1000);

        const theatersInfo = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('#contents > .tab_wrap > .active > .tab_con > .mCustomScrollbar > #mCSB_1 > #mCSB_1_container > .time_select_wrap'));
            return items.map((item) => {
                const title = item.querySelector('.list_tit > p').innerText;
                const timeTables = Array.from(item.querySelectorAll('.list_time > li'));
                const timeInfo = timeTables.map((timeTable) => {

                });
                return {
                    title,
                    timeInfo
                };
            });
        });
    } catch (error) {
        console.log('Get theater timetable error LOTTE', error);
    } finally {
        browser.close();
    }
};

module.exports.getRegions = getRegions;
module.exports.getTheatersByRegions = getTheatersByRegions;
module.exports.getTimeTable = getTimeTable;
