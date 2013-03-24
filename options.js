chrome.storage.sync.get(['translateTo', 'doTranslate'], function(data){
    $('#translate-to')
        .change(function(event) {
            var val = $(event.target).val();
            if (val != '----') {
                chrome.storage.sync.set({'translateTo': val}, function() {
                    $('#message-box').html("Changed to " + val).fadeIn().removeClass('hidden');
                });
            }
        })
        .val(data.translateTo ? data.translateTo : '----');
    $('#do-translate')
        .change(function(event) {
            var val = event.target.checked;
            chrome.storage.sync.set({'doTranslate': val}, function() {
                $('#message-box').html(val ? "Will translate!" : "Won't translate").fadeIn().removeClass('hidden');
            });
        })
        .attr(
            'checked',
            data.doTranslate === undefined ? "checked" :
                data.doTranslate === true ? "checked" : undefined);
});
$('#doneButton').click(function(){ window.close(); });
