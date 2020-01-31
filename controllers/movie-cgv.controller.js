const puppeteer = require('puppeteer');

const CGV_GET_BY_TITLE_URL = 'http://www.cgv.co.kr/movies/';

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
            page.goto(selectedMovie.link);

        } else {
            console.log('Cannot find movie.');
        }
    } catch (error) {
        console.log('Get by title error', error);
    } finally {
        browser.close();
    }
};

module.exports.getByTitle = getByTitle;
