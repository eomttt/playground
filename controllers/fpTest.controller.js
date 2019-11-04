const R = require('ramda');

const SUPPORT_QUERY_LOCALE = ['en-us', 'en-sg', 'en-ph', 'en-hk', 'ko-kr', 'ja-jp'];
const QUERY_LOCALE = 'en-us';

const _hasCookies = (cookies) => {
    return cookies.get(LOCALE.CODE) && cookies.get(LOCALE.CODE_STRING) && cookies.get(CURRENCY.ID);
};

const _hasQueryLocale = (query) => {
    return query && query.locale;
};

const _isSupportLocaleCodeString = (localeCodeString) => {
    return SUPPORT_QUERY_LOCALE.includes(localeCodeString);
};

const _isObjectType = (data) => {
    return typeof(data) === 'object';
};

const _setQueryLocaleArray = (data) => {
    return _isObjectType(data) ? data : [data];
};

const _addDefaultQueryLocale = (data) => {
    return [...data, QUERY_LOCALE]; 
}

const _removeSpace = (data) => {
    return data.replace(/(\s)+/g, '')
}

const setNewCookies = (query, acceptLanguage) => {
    if (query && query.locale) {
        const queryLocale = _getQueryLocale(query.locale);
        if (_isSupportLocaleCodeString(queryLocale)) {
            return queryLocale 
        }
        // 이상한 query 일 경우
        return QUERY_LOCALE 
    }
    // query 가 없는 경우

    // 쿠키가 없을 경우 Accept-language 로 쿠키 새로 세팅
    if (!_hasCookies(originCookies)) {
        return acceptLanguage;
    }
    // 쿠키가 있을 경우, 원래 쿠키로 반환
    return originCookies;
}

const test = async (req, res) => {
    const getQueryLocale = R.compose(
        R.map(_removeSpace),
        R.filter(_isSupportLocaleCodeString),
        _addDefaultQueryLocale,
        _setQueryLocaleArray
    );

    let newLang = _hasCookies(originCookies) ? originCookies.get() : acceptLanguage;

    if (query && query.locale) {
        newLang = getQueryLocale(query.locale)[0];
    }

    return setNewCookies(originCookies, newLang);



    console.log("AAAA", getQueryLocale('ko-kr'), getQueryLocale(['ko-kr', 'en-sg']), getQueryLocale(''), getQueryLocale())
};

module.exports.test = test;
