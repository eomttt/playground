const puppeteer = require('puppeteer');

const MEGA_GET_BY_REGION = 'http://www.megabox.co.kr/?menuId=timetable-cinema';

const GANGWON_INDEX = 6;
const GANGWON_NAM_CHUNCHEON_THEATER_INDEX = 0;

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
        // Click region
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

const getTimeTable = async (regionIndex = GANGWON_INDEX, theaterIndex = GANGWON_NAM_CHUNCHEON_THEATER_INDEX) => {
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
        // Click region
        await page.click(`.content_wrap > #main > #container > .section > .theater_lst > .content_wrap > .menu > li:nth-child(${regionIndex + 2})`);
        await page.waitFor(1000);
        // Click theater
        await page.click(`.content_wrap > #main > #container > .section > .theater_lst > .content_wrap > .menu > li > .active > li:nth-child(${theaterIndex + 1})`);
        await page.waitFor(1000);

        const theatersInfo = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.content_wrap > #main > #container > .section > .content_wrap > #timeTableCinemaList > .movie_time_table > tbody > .lineheight_80'));
            return items.map((item) => {
                const tiemTables = Array.from(item.querySelectorAll('td > .cinema_time > .time_info'));
                const timeInfo = tiemTables.map((timeTable) => {
                    return {
                        time: timeTable.querySelector('.time').innerText,
                        seats: timeTable.querySelector('.seat').innerText
                    };
                });

                const titleElement = item.querySelector('.title > div > strong > a');
                let title = '';
                if (titleElement) {
                    title = titleElement.innerText;
                    return {
                        title,
                        timeInfo
                    };
                } else {
                    return {
                        title: null,
                        timeInfo
                    };
                }
            });
        });

        const tempObject = {};
        const result = theatersInfo.reduce((acc, cur) => {
            if (cur.title) {
                if (cur.title === tempObject.title) {
                    acc.push(tempObject);
                }
                tempObject.title = cur.title;
                tempObject.timeInfo = [];
            }
            tempObject.timeInfo = [...tempObject.timeInfo, ...cur.timeInfo];

            return acc;
        }, []);

        console.log('theatersInfo', theatersInfo);
        console.log('result', result);
        return result;
    } catch (error) {
        console.log('Get theater timetable error MEGA', error);
    } finally {
        browser.close();
    }
};

module.exports.getRegions = getRegions;
module.exports.getTheatersByRegions = getTheatersByRegions;
module.exports.getTimeTable = getTimeTable;
