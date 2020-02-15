import * as cgvController from './movie-cgv.controller';
import * as megaController from './movie-megabox.controller';
import * as lotteController from './movie-lotte.controller';

const MOVIE_TYPE = {
    MEGA: 'megaBox',
    CGV: 'cgv',
    LOTTE: 'lotte'
};

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

module.exports.getRegion = getRegion;
module.exports.getTheatersByRegion = getTheatersByRegion;
module.exports.getTimeTalbe = getTimeTalbe;
module.exports.getBoxOffice = getBoxOffice;
