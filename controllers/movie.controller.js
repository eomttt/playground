const puppeteer = require('puppeteer');

import { getByTitle, getRegions, getTheatersByRegions, getTimeTable } from './movie-cgv.controller';

const CGV_CONSTANT = {
    URL: 'http://www.cgv.co.kr/reserve/show-times/',
    AREA_CODE: {
        서울: 1,
        경기: 2,
        인천: 3,
        강원: 4,
        대전: 5,
        충청: 5,
        대구: 6,
        부산: 7,
        울산: 7,
        경상: 8,
        광주: 9,
        전라: 9,
        제주: 9
    }
};

const CGV_TIME_TABLE = 'http://section.cgv.co.kr/theater/popup/r_MovieTimeTable.aspx';

const _getCGV = async (movieTitle, region, { year, month, day }) => {
    const config = {
        homepage: CGV_CONSTANT.URL,
        title: movieTitle,
        region: region,
        theater: 'CGV용산아이파크몰',
        year: year,
        month: month,
        day: day
    };

    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        await page.goto(CGV_TIME_TABLE);
        await page.waitFor(1000);
        await page.click(`#contents > div.sect-common > div > div.sect-city > ul > li:nth-child(${CGV_CONSTANT.AREA_CODE[config.region]})`); // 지역선택

        let nthElement = 1;
        let theater = await page.evaluate(() => {
            return document.querySelector(`#contents > div.sect-common > div > div.sect-city > ul > li.on > div > ul > li:nth-child(${1}) > a`).innerHTML;
        });
        console.log('AAAA', theater);

        while (theater !== config.theater) {
            nthElement++;
            theater = await page.evaluate(nthElement => {
                return document.querySelector(`#contents > div.sect-common > div > div.sect-city > ul > li.on > div > ul > li:nth-child(${nthElement}) > a`).innerHTML;
            }, nthElement);
        }
        const theaterCodeInner = await page.evaluate(nthElement => {
            return document.querySelector(`#contents > div.sect-common > div > div.sect-city > ul > li.on > div > ul > li:nth-child(${nthElement})`).innerHTML;
        }, nthElement);

        const theaterCode = theaterCodeInner.split('&')[1].split('=')[1];
        const url = `http://www.cgv.co.kr/common/showtimes/iframeTheater.aspx?areacode=0${CGV_CONSTANT.AREA_CODE[config.region]}&theatercode=${theaterCode}&date=${config.year}${config.month}${config.day}`;

        await page.goto(url);

        const day = await page.evaluate(() => {
            return document.querySelector('li.on > div > a > strong').innerText;
        });

        let flag = false;
        if (day === config.day) {
            const moviesNumber = await page.evaluate(() => {
                return document.querySelectorAll('.info-movie').length;
            });

            for (let i = 1; i <= moviesNumber; i++) {
                const movie = await page.evaluate(i => {
                    return document.querySelector(`body > div > div.sect-showtimes > ul > li:nth-child(${i}) > div > div:nth-child(1) > a > strong`).innerText;
                }, i);
                if (movie === ` ${config.title}`) {
                    const theaterNumber = await page.evaluate(i => {
                        return document.querySelectorAll(`body > div > div.sect-showtimes > ul > li:nth-child(${i}) > div > div.type-hall`).length;
                    }, i);
                    for (let j = 2; j <= theaterNumber + 1; j++) {
                        const theater = await page.evaluate((i, j) => {
                            return document.querySelector(`body > div > div.sect-showtimes > ul > li:nth-child(${i}) > div > div:nth-child(${j}) > div:nth-child(1) > ul > li`).innerText;
                        }, i, j);
                        if (theater.includes('IMAX')) {
                            flag = true;
                            break;
                        }
                    }
                }
            }
        }

        if (flag) {
            console.log('예매하세요!');
        } else {
            console.log('기다리세요!');
        }

        return browser.close();
    } catch (err) {
        console.log(err);
    }
};

const get = async () => {
    getTimeTable();
    // getTheatersByRegions(3);
    // getRegions();
    // getByTitle('남산의 부장들', '서울', { year: 2019, month: 11, day: 1 });
    // _getCGV('터미네이터', '서울', { year: 2019, month: 11, day: 1 });
};

module.exports.get = get;
