const puppeteer = require('puppeteer');

const MEGA_HOST_URL = 'https://www.megabox.co.kr/';
const MEGA_GET_BY_REGION = 'https://www.megabox.co.kr/theater/list';

const GANGWON_INDEX = 6;
const MOCK_THEATER_INFO = {
    title: '속초',
    link: '/theater/time?brchNo=2171'
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
        await page.goto(MEGA_GET_BY_REGION);
        await page.waitFor(1000);
        const regions = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.body-wrap > .container > #contents > .inner-wrap > .theater-box > .theater-place > ul > li > .sel-city'));
            return elements.map((element) => {
                return element.innerText;
            });
        });

        return regions;
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
        await page.click(`.body-wrap > .container > #contents > .inner-wrap > .theater-box > .theater-place > ul > li:nth-child(${regionIndex + 1})`);
        await page.waitFor(1000);

        const theatersInfo = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.body-wrap > .container > #contents > .inner-wrap > .theater-box > .theater-place > ul > .on > .theater-list > ul > li > a'));
            return elements.map((element) => {
                const hrefLink = element.getAttribute('href');
                const linkArr = hrefLink.split('?');
                return {
                    title: element.innerText,
                    link: `${linkArr[0]}/time?${linkArr[1]}` 
                };
            });
        });

        return theatersInfo;
    } catch (error) {
        console.log('Get theater by region error MEGA', error);
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
        await page.goto(`${MEGA_HOST_URL}${theaterInfo.link}`);
        await page.waitFor(1000);
        // Click region
        await page.click('.body-wrap > #schdlContainer > #contents > .inner-wrap > .tab-list > ul > li:nth-child(1)');
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
