const puppeteer = require('puppeteer');

const CGV_GET_BY_TITLE_URL = 'http://www.cgv.co.kr/movies/';
const CGV_GET_BY_REGION = 'http://www.cgv.co.kr/theaters/';

const getByTitle = async (title, region, { year, month, date }) => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        let selectedMovie = null;
        await page.goto(CGV_GET_BY_TITLE_URL);
        await page.waitFor(1000);
        // Click to show more movies
        await page.click('#cgvwrap > #contaniner > #contents > .wrap-movie-chart > .sect-movie-chart > button');
        await page.waitFor(1000);

        const movies = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#cgvwrap > #contaniner > #contents > .wrap-movie-chart > .sect-movie-chart > ol > li > .box-contents'));
            return elements.map((element) => {
                return {
                    link: element.querySelector('.like > .link-reservation').getAttribute('href'),
                    title: element.querySelector('a > strong').innerText
                };
            });
        });
        const moreMovies = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#cgvwrap > #contaniner > #contents > .wrap-movie-chart > .sect-movie-chart > #movie_more_container > li > .box-contents'));
            return elements.map((element) => {
                return {
                    link: element.querySelector('.like > .link-reservation').getAttribute('href'),
                    title: element.querySelector('a > strong').innerText
                };
            });
        });

        const allMovies = [...movies, moreMovies];

        allMovies.some((movie) => {
            if (movie.title === title) {
                selectedMovie = movie;
                return true;
            }
        });
        console.log('selectedMovie', selectedMovie);

        if (selectedMovie) {
            return selectedMovie;
        } else {
            console.log('Cannot find movie.');
        }
    } catch (error) {
        console.log('Get by title error', error);
    } finally {
        browser.close();
    }
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
        await page.goto(CGV_GET_BY_REGION);
        await page.waitFor(1000);
        const regions = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#cgvwrap > #contaniner > #contents > .sect-common > .favorite-wrap > .sect-city > ul > li > a'));
            return elements.map((element) => {
                return element.innerText;
            });
        });

        console.log('regions', regions);
    } catch (error) {
        console.log('Get info error', error);
    } finally {
        browser.close();
    }
};

const getTheatersByRegions = async (regionIndex) => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        await page.goto(CGV_GET_BY_REGION);
        await page.waitFor(1000);
        await page.click(`#cgvwrap > #contaniner > #contents > .sect-common > .favorite-wrap > .sect-city > ul > li:nth-child(${regionIndex + 1})`);
        await page.waitFor(1000);

        const theaters = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('#cgvwrap > #contaniner > #contents > .sect-common > .favorite-wrap > .sect-city > ul > .on > .area > ul > li > a'));
            return elements.map((element) => {
                return {
                    title: element.getAttribute('title'),
                    link: element.getAttribute('href')
                };
            });
        });

        console.log('theaters', theaters);
    } catch (error) {
        console.log('Get info error', error);
    } finally {
        browser.close();
    }
};

module.exports.getByTitle = getByTitle;
module.exports.getRegions = getRegions;
module.exports.getTheatersByRegions = getTheatersByRegions;
