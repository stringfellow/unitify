function fahrenheitToCentigrade(match) {  
    var val = parseFloat(match[1]);
    var conv = (val - 32) / 1.8;
    return "" + conv.toFixed(2) + match[2] + "centigrade";
}

function getConversions(localeString) {
    // Assume we want units in the locale of localeString
    var conversions = [
        {
            from: 'fahrenheit',
            to: 'centigrade',
            pattern: /(\d+)([A-Za-z ]*)(fahrenheit)/gi,
            modifier: fahrenheitToCentigrade
        },
        {
            from: 'farenheit',
            to: 'centigrade',
            pattern: /(\d+)([A-Za-z ]*)(fahrenheit)/gi,
            modifier: fahrenheitToCentigrade
        }
    ];

    return conversions;
}

function replaceUnits(elem) {
    // replace the text in the elements
    var conversions = getConversions("en-gb");    
    var html = $(elem).html();
    _.each(conversions, function(_c, index, list) {
        var pattern = _c.pattern;
        var match = pattern.exec(html);
        while (match != null) {
            var converted_text = _c.modifier(match);
            console.log(converted_text);
            var repl_elem = $('<span class="converted"></span>');
            repl_elem.html(converted_text);
            $(elem).html(html.replace(pattern, repl_elem[0].outerHTML));
            html = $(elem).html();
            match = _c.pattern.exec(html);
        }
        console.log("Done")
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
