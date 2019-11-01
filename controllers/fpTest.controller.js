const R = require('ramda');

const SUPPORT_QUERY_LOCALE = ['en-us', 'en-sg', 'en-ph', 'en-hk', 'ko-kr', 'ja-jp'];

const _hasCookies = (cookies) => {
    return cookies.get(LOCALE.CODE) && cookies.get(LOCALE.CODE_STRING) && cookies.get(CURRENCY.ID);
};

const _isSupportLocaleCodeString = (localeCodeString) => {
    return SUPPORT_QUERY_LOCALE.includes(localeCodeString);
};

const _isObjectType = (data) => {
    return typeof(data) === 'object';
};

const _setArrayType = (data) => {
    return _isObjectType(data) ? data : [data];
};

const _removeSpace = (data) => {
    return data.replace(/(\s)+/g, '')
}

const _getQueryLocale = (locale) => {
    if (_isObjectType(locale)) {
        const expectedLocale = locale.filter((localeCodeString) => {
            return isSupportLocaleCodeString(localeCodeString);
        });

        if (expectedLocale.length > 0) {
            return expectedLocale[0].replace(/(\s)+/g, '');
        }

        return '';
    }
    return locale.replace(/(\s)+/g, '');
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
            R.filter(_isSupportLocaleCodeString),
            R.map(_removeSpace),
            _setArrayType);

    const test = getQueryLocale('ko-kr  ');
    const test2 = getQueryLocale(['ko-kr', 'en-sg  ', 'tt']);
    const test3 = getQueryLocale('');

    const getDefault = R.partial()

    const getCookies = R.compose(getQueryLocale);

    console.log("AAA", test, test2, test3);
};

module.exports.test = test;
