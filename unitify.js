function makeUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        }
    );
}

function fahrenheitToCentigrade(match, unit) {  
    var val = parseFloat(match[2] + match[3]);
    if (match[1].length > 0){
        val = 0 - val;
    }
    var conv = (val - 32) * (5/9);
    return "" + conv.toFixed(2) + match[4] + unit;
}

function fracTextToFloat(fracText) {
    return eval(fracText);  // Hmm...
}

function cupsItemToGramsItem(match, unit, multiplier) {
    var val1 = parseFloat(match[1]);
    var val2 = match[2];
    var val = val1;
    if (val2.length > 0) {  // this is pretty horrid but I can't figure the RE
        if (val2[0] == '/') {
            val2 = "" + val1 + val2;
            val = 0;
        }
        val += fracTextToFloat(val2);
    }
    // http://allrecipes.com/howto/cup-to-gram-conversions/
    var conv = val * multiplier;
    return "" + conv.toFixed(0) + " " + unit + match[5] + match[6];
}


function getConversions(localeString) {
    // Assume we want units in the locale of localeString
    var conversions = {
        "en-gb": [
            {
                from: 'fahrenheit',
                to: 'celsius',
                pattern: /([-−]*)(\d+)(\.*\d*)([A-Za-z ;&]*)(fahrenheit)/gi,
                modifier: function(match) {
                    return fahrenheitToCentigrade(match, 'celsius')}
            },
            {
                from: 'degrees F',
                to: 'degrees C',
                pattern: /([-−]*)(\d+)(\.*\d*)([A-Za-z ;&]*)(degrees F)/gi,
                modifier: function(match) {
                    return fahrenheitToCentigrade(match, 'degrees C')}
            },
            {
                from: '°F',
                to: '°C',
                pattern: /([-−]*)(\d+)(\.*\d*)([A-Za-z ;&]*)(°F)/gi,
                modifier: function(match) {
                    return fahrenheitToCentigrade(match, '°C')}
            },
            {
                from: '℉',
                to: '℃',
                pattern: /([-−]*)(\d+)(\.*\d*)([A-Za-z ;&]*)(℉)/gi,
                modifier: function(match) {
                    return fahrenheitToCentigrade(match, '℃')}
            },
            {
                from: 'cups ... flour',
                to: 'grams ... flour',
                pattern: /(\d+\s*)(\d*\/*\d*)([A-Za-z ;&]*)cup(s*)([A-Za-z ;&-]*)(flour)/gi,
                modifier: function(match) {
                return cupsItemToGramsItem(match, 'grams', 136)}
            },
            {
                from: 'cups ... honey, molasses or syrup',
                to: 'grams ... honey, molasses or syrup',
                pattern: /(\d+\s*)(\d*\/*\d*)([A-Za-z ;&]*)cup(s*)([A-Za-z ;&-]*)(honey|molasses|syrup)/gi,
                modifier: function(match) {
                return cupsItemToGramsItem(match, 'grams', 201)}
            },
            {
                from: 'cups ... sugar',
                to: 'grams ... sugar',
                pattern: /(\d+\s*)(\d*\/*\d*)([A-Za-z ;&]*)cup(s*)([A-Za-z ;&-]*)(sugar)/gi,
                modifier: function(match) {
                return cupsItemToGramsItem(match, 'grams', 340)}
            },
            {
                from: 'cups ... milk',
                to: 'mL ... milk',
                pattern: /(\d+\s*)(\d*\/*\d*)([A-Za-z ;&]*)cup(s*)([A-Za-z ;&-]*)(milk)/gi,
                modifier: function(match) {
                return cupsItemToGramsItem(match, 'mL', 236)}
            },
            {
                from: 'cups ... butter',
                to: 'grams ... butter',
                pattern: /(\d+\s*)(\d*\/*\d*)([A-Za-z ;&]*)cup(s*)([A-Za-z ;&-]*)(butter)/gi,
                modifier: function(match) {
                return cupsItemToGramsItem(match, 'grams', 227)}
            }
        ]
    };

    return conversions[localeString];
}

function replaceUnits(elem, translateTo) {
    // replace the text in the elements
    var conversions = getConversions(translateTo);  // how do we get locale?
    var html = $(elem).html();
    var repls = [];
    _.each(conversions, function(_c, index, list) {
        var pattern = _c.pattern;
        var match = pattern.exec(html);
        while (match != null) {
            var converted_text = _c.modifier(match);
            var repl_elem = $('<span class="converted"></span>');
            var uuid = makeUUID()
            repl_elem.attr('id', uuid);
            repls.push([uuid, match[0]]);
            repl_elem.html(converted_text);
            $(elem).html(html.replace(match[0], repl_elem[0].outerHTML));
            html = $(elem).html();
            match = _c.pattern.exec(html);
        }
    });
    _.each(repls, function(repl, ix, list) {
        var title = repl[1].replace('&nbsp;', ' ');
        $('span#' + repl[0]).attr('title', title);
    });
    $(elem).addClass('unitified');
}

function runConversion(settings) {
    var translateTo = settings.translateTo ? settings.translateTo : 'en-gb';
    var doTranslate = settings.doTranslate === true ? true : settings.doTranslate === undefined ? true : false;
    if (doTranslate) {
        if (window.unitifyTest) {
            $('#unitifyDoTranslate').html("Translating to:");
            $('#unitifyTranslateTo').html(translateTo);
        }
        _.each(['span', 'li', 'p'], function(tag, index, taglist){
            _.each($(tag + ":not(.unitified)"), function(elem, index, elems){
                replaceUnits(elem, translateTo);
            });
        });
        $('span.converted').css('color', 'red');
    }
}

function go() {
    // find all elements in groups and do something
    chrome.storage.sync.get(['translateTo', 'doTranslate'], function(data){
        runConversion(data);
    });
}

if (window.unitifyTest === undefined || window.unitifyTest === false) {
    go();
} else {
    runConversion({doTranslate: true, translateTo: 'en-gb'});
}
