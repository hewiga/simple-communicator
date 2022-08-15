function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function send_request(path, data) {

    var request = new XMLHttpRequest();
    var csrftoken = getCookie('csrftoken');

    request.open("POST", path, true);
    request.setRequestHeader('X-CSRFToken', csrftoken);
    request.setRequestHeader('Content-Type', 'application/json');

    request.send(data)
}

function select_receiver(friend, user) {

    document.getElementById("receiver-nick").textContent = friend;

    path = "/join_chat";
    data = JSON.stringify({
        "User1": user,
        "User2": friend,
    });
    //send_request(path, data);
    var request = new XMLHttpRequest();
    var csrftoken = getCookie('csrftoken');

    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var answ = JSON.parse(this.responseText)
            for (var i = 0; i < answ.length; i++) {
                
                display_message(answ[i].Sender, answ[i].Content)
            }
        }
    };
    request.open("POST", path, true);
    request.setRequestHeader('X-CSRFToken', csrftoken);
    request.setRequestHeader('Content-Type', 'application/json');

    request.send(data)
    enter_chat(friend, user);
}

function enter_chat(friend, user) {
    
    var request = new XMLHttpRequest();
    var csrftoken = getCookie('csrftoken');

    var interval = setInterval(function() {
        request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var answ;
                if (this.responseText.length != 0) { 
                    answ = JSON.parse(this.responseText);
                    for (var i = 0; i < answ.length; i++) {
                        display_message(answ[i].Sender, answ[i].Content)
                    }
                }
            }
        }
        request.open("POST", "/get_messages", true);
        request.setRequestHeader('X-CSRFToken', csrftoken);
        request.setRequestHeader("Content-type", "application/json");
    	request.send(JSON.stringify({
            "Sender": user,
            "Receiver": friend
        }));
    }, 5000);
}

function send_message(sender) {

    receiver = document.getElementById("receiver-nick").textContent;
    message_content = document.getElementById("message").value;
    document.getElementById("message").value = '';
    path = "/send_message";
    data = JSON.stringify({
        "Sender": sender,
        "Receiver": receiver,
        "Content": message_content
    });

    send_request(path, data);
    display_message(sender, message_content);
}

function display_message(sender, content) {

    var message = document.createElement("div");
    message.style.width = "100%";
    message.style.height = "10%";
    message.style.borderBottom = "1px solid grey";
    message.innerHTML = "<b>" + sender + ": </b>" + content;
    document.getElementById("messages").appendChild(message);
}

function send_accept(friend, e) {

    var element = e.parentNode;
    var request = new XMLHttpRequest();

    var csrftoken = getCookie('csrftoken');

    request.open("POST", "/accept", true);
    request.setRequestHeader('X-CSRFToken', csrftoken);
    request.setRequestHeader('Content-Type', 'application/json');

    request.send(JSON.stringify({
        "Friend": friend,
    }));

    element.remove();
}

function show_add_friend_form() {

    if (document.getElementById("friends-request-list").style.display == "block") {

        document.getElementById("friends-request-list").style.display = "none";
    }
    
    document.getElementById("add-friend-form").style.display = "block";
}
function hide_add_friend_for() {
    document.getElementById("add-friend-form").style.display = "none";
}

function show_friends_request_list() {

    if (document.getElementById("add-friend-form").style.display == "block") {

        document.getElementById("add-friend-form").style.display = "none";
    }

    if (document.getElementById("friends-request-list").style.display == "block") {

        document.getElementById("friends-request-list").style.display = "none";
    }
    else{

        document.getElementById("friends-request-list").style.display = "block";
    }
    
}

