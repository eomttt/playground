import * as cgvController from './movie-cgv.controller';
import * as megaController from './movie-megabox.controller';

const get = async () => {
    const res = await megaController.getTheatersByRegions();
    // const res = await cgvController.getTimeTable();
    return res;
};

module.exports.get = get;
