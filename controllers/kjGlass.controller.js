const puppeteer = require('puppeteer');

const get = async () => {
    console.log('Start KJglass shop crwaling');
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });
};

module.exports.get = get;
