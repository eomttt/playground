import * as cgvController from './movie-cgv.controller';
import * as megaController from './movie-megabox.controller';
import * as lotteController from './movie-lotte.controller';

const get = async () => {
    // const mega = await megaController.getTimeTable();
    const lotte = await lotteController.getTimeTable();
    // const cgv = await cgvController.getTimeTable();

    return {
        lotte
    };
    // const cgvRes = await cgvController.getTimeTable();
    // const megaRes = await megaController.getTimeTable();
    // return {
    //     cgv: cgvRes,
    //     megaBox: megaRes
    // };
};

module.exports.get = get;
