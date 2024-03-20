function responsiveChat(element) {
    // $(element).html('<form class="chat"><span></span><div class="messages"></div><input type="text" placeholder="Your message"><input type="submit" value="Send"></form>');

    function showLatestMessage(element) {
      $('.responsive-html5-chat').find('.messages').scrollTop($('.responsive-html5-chat .messages')[0].scrollHeight);
    }
    showLatestMessage(element);

    $(element + ' input[type="text"]').keypress(function (event) {
        if (event.which == 13) {
            event.preventDefault();
            $(element + ' input[type="submit"]').click();
        }
    });
    $(element + ' input[type="submit"]').click(function (event) {
        event.preventDefault();
        let message = $(element + ' input[type="text"]').val();
        if ($(element + ' input[type="text"]').val()) {
            let d = new Date();
            let clock = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            let month = d.getMonth() + 1;
            let day = d.getDate();
            let currentDate =
                (("" + day).length < 2 ? "0" : "") +
                day +
                "." +
                (("" + month).length < 2 ? "0" : "") +
                month +
                "." +
                d.getFullYear() +
                "&nbsp;&nbsp;" +
                clock;
            $(element + ' div.messages').append(
                '<div class="message"><div class="myMessage"><p>' +
                message +
                "</p><div class='date'>" +
                currentDate +
                "</div></div></div>"
            );
            setTimeout(function () {
                $(element + ' > span').addClass("spinner");
            }, 100);
            setTimeout(function () {
                $(element + ' > span').removeClass("spinner");
            }, 2000);
        }
        $(element + ' input[type="text"]').val("");
        showLatestMessage(element);
    });
}

function responsiveChatPush(element, sender, origin, date, message) {
    let originClass;
    if (origin == 'me') {
        originClass = 'myMessage';
    } else {
        originClass = 'fromThem';
    }
    $(element + ' .messages').append('<div class="message"><div class="' + originClass + '"><p>' + message + '</p><div class="date"><b>' + sender + '</b> ' + date + '</div></div></div>');
}


responsiveChat('.responsive-html5-chat');



