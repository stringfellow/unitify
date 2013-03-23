function makeUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
    });
}


function fahrenheitToCentigrade(match, unit) {  
    var val = parseFloat(match[1] + match[2]);
    var conv = (val - 32) / 1.8;
    return "" + conv.toFixed(2) + match[3] + unit;
}

function getConversions(localeString) {
    // Assume we want units in the locale of localeString
    var conversions = {
        "en-gb": [
            {
                from: 'fahrenheit',
                to: 'celsius',
                pattern: /(\d+)(\.*\d*)([A-Za-z ;&]*)(fahrenheit)/gi,
                modifier: function(match) {return fahrenheitToCentigrade(match, 'celsius')}
            },
            {
                from: '°F',
                to: '°C',
                pattern: /(\d+)(\.*\d*)([A-Za-z ;&]*)(°F)/gi,
                modifier: function(match) {return fahrenheitToCentigrade(match, '°C')}
            },
            {
                from: '℉',
                to: '℃',
                pattern: /(\d+)(\.*\d*)([A-Za-z ;&]*)(℉)/gi,
                modifier: function(match) {return fahrenheitToCentigrade(match, '℃')}
            }
        ]
    };

    return conversions[localeString];
}

function replaceUnits(elem) {
    // replace the text in the elements
    var conversions = getConversions("en-gb");  // how do we get locale?
    var html = $(elem).html();
    var repls = [];
    _.each(conversions, function(_c, index, list) {
        var pattern = _c.pattern;
        var match = pattern.exec(html);
        while (match != null) {
            var converted_text = _c.modifier(match);
            console.log(converted_text);
            var repl_elem = $('<span class="converted"></span>');
            var uuid = makeUUID()
            repl_elem.attr('id', uuid);
            repls.push([uuid, match[0]]);
            repl_elem.html(converted_text);
            $(elem).html(html.replace(match[0], repl_elem[0].outerHTML));
            html = $(elem).html();
            match = _c.pattern.exec(html);
        }
        console.log("Done")
    });
    _.each(repls, function(repl, ix, list) {
        $('span#' + repl[0]).attr('title', repl[1]);
    });
}

function runConversion() {
    // find all elements in groups and do something
    _.each(['span', 'p'], function(tag, index, taglist){
        _.each($(tag), function(elem, index, elems){
            replaceUnits(elem);
        });
    });
    $('span.converted').css('color', 'red');
}

runConversion()
