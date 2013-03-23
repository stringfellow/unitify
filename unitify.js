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

function fracTextToFloat(fracText) {
    return eval(fracText);  // Hmm...
}

function cupsFlourToGramsFlour(match, unit) {
    console.log(match);
    var val1 = parseFloat(match[1]);
    var val2 = match[2];
    var val = val1;
    if (val2.length > 0) {
        if (val2[0] == '/') {
            val2 = "" + val1 + val2;
            val = 0;
        }
        val += fracTextToFloat(val2);
    }
    var conv = val * 136; // http://allrecipes.com/howto/cup-to-gram-conversions/
    return "" + conv.toFixed(0) + " grams" + match[5] + "flour"
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
                from: 'degrees F',
                to: 'degrees C',
                pattern: /(\d+)(\.*\d*)([A-Za-z ;&]*)(degrees F)/gi,
                modifier: function(match) {return fahrenheitToCentigrade(match, 'degrees C')}
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
            },
            {
                from: 'cups ... flour',
                to: 'grams ... flour',
                pattern: /(\d+\s*)(\d*\/*\d*)([A-Za-z ;&]*)cup(s*)([A-Za-z ;&-]*)(flour)/gi,
                modifier: function(match) {return cupsFlourToGramsFlour(match, 'grams')}
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
