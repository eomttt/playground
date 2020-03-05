const axios = require('axios');

const megaBoxData = require('../datum/megaBox');
const cgvData = require('../datum/cgv');
const lotteData = require('../datum/lotte');

const cgvController = require('./movie-cgv.controller');
const megaController = require('./movie-megabox.controller');
const lotteController = require('./movie-lotte.controller');

const MOVIE_TYPE = {
    MEGA: 'megaBox',
    CGV: 'cgv',
    LOTTE: 'lotte'
};

const KEY = '';

const CONTROLLER = {
    [MOVIE_TYPE.MEGA]: megaController,
    [MOVIE_TYPE.CGV]: cgvController,
    [MOVIE_TYPE.LOTTE]: lotteController
};

const getRegion = async (type) => {
    const result = await CONTROLLER[type].getRegions();

    return result;
};

const getTheatersByRegion = async (type, regionIndex) => {
    const result = await CONTROLLER[type].getTheatersByRegions(regionIndex);

    return result;
};

const getTimeTalbe = async (type, theaterLink) => {
    const result = await CONTROLLER[type].getTimeTable(theaterLink);

    return result;
};

const getBoxOffice = async () => {
    const result = await CONTROLLER[MOVIE_TYPE.CGV].getBoxOffice();

    return result;
};

const setLocation = async (type, index) => {
    let theaterDatum = [];
    let theaterName = '';
    const datum = [];

    if (type === MOVIE_TYPE.MEGA) {
        theaterName = '메가박스 ';
        theaterDatum = megaBoxData.THEATERS;
    } else if (type === MOVIE_TYPE.CGV) {
        theaterDatum = cgvData.THEATERS;
    } else if (type === MOVIE_TYPE.LOTTE) {
        theaterName = '롯데시네마';
        theaterDatum = lotteData.THEATERS;
    }

    for (const theater of theaterDatum[index]) {
        const { title } = theater;
        try {
            const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(`${theaterName}${title}`)}&key=${KEY}`);
            const { results } = res.data;

            if (results[0]) {
                const { location } = results[0].geometry;

                datum.push({
                    ...theater,
                    location
                });
            } else {
                datum.push({
                    ...theater
                });
            }
        } catch (error) {
            console.log('Get request error geocode', error);
        }
    }

    return datum;
};

const setLocationTest = (type) => {
    let theaterDatum = [[]];
    let count = 0;
    const excepted = [];

    if (type === MOVIE_TYPE.MEGA) {
        theaterDatum = megaBoxData.THEATERS;
    } else if (type === MOVIE_TYPE.CGV) {
        theaterDatum = cgvData.THEATERS;
    } else if (type === MOVIE_TYPE.LOTTE) {
        theaterDatum = lotteData.THEATERS;
    }

    for (const theaters of theaterDatum) {
        for (const theater of theaters) {
            count++;
            if (!theater.location) {
                excepted.push(theater);
            }
        }
    }

    return {
        count,
        excepted
    };
};

module.exports.getRegion = getRegion;
module.exports.getTheatersByRegion = getTheatersByRegion;
module.exports.getTimeTalbe = getTimeTalbe;
module.exports.getBoxOffice = getBoxOffice;

module.exports.setLocation = setLocation;
module.exports.setLocationTest = setLocationTest;
