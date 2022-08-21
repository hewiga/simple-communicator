function getCookie(name) {
    //this function just return csrf token
    //which is necessary for django to handle request 
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

function select_receiver(friend, user) {

    document.getElementById("receiver-nick").textContent = friend;

    path = "/join_chat";
    data = JSON.stringify({
        "User1": user,
        "User2": friend,
    });
    var request = new XMLHttpRequest();
    var csrftoken = getCookie('csrftoken');

    //download from server all messages in selected chat
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

var interval;
function enter_chat(friend, user) {
    
    var request = new XMLHttpRequest();
    var csrftoken = getCookie('csrftoken');
    document.getElementById("messages").innerHTML = "";

    if(interval) {
        clearInterval(interval);
    }
    //ask server if there is any new message on chat each 5sec
    interval = setInterval(function() {
        request.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                var answ;
                if (this.responseText.length !== 0) { 
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

    receiver = document.getElementById("receiver-nick").innerText; //get receivers nick
    message_content = document.getElementById("message").value;    //get message content
    document.getElementById("message").value = '';                 //clear textarea

    if (receiver.length === 0){
        //chat was not picked
        return;
    }

    path = "/send_message";
    data = JSON.stringify({
        "Sender": sender,
        "Receiver": receiver,
        "Content": message_content
    });

    var request = new XMLHttpRequest();
    var csrftoken = getCookie('csrftoken');

    request.open("POST", path, true);
    request.setRequestHeader('X-CSRFToken', csrftoken);
    request.setRequestHeader('Content-Type', 'application/json');

    request.send(data);
    display_message(sender, message_content);
}

function display_message(sender, content) {


    var message = document.createElement("div");
    message.style.width = "100%";
    message.style.height = "10%";
    message.style.borderBottom = "1px solid grey";
    message.innerHTML = "<b>" + sender + ": </b>" + content;
    let messages_window = document.getElementById("messages");
    messages_window.appendChild(message);
    messages_window.scrollTop = messages_window.scrollHeight;
}

function answer_friend_request(friend, username, e, path) {

    var element = e.parentNode;
    var request = new XMLHttpRequest();

    var csrftoken = getCookie('csrftoken');

    request.open("POST", path, true);
    request.setRequestHeader('X-CSRFToken', csrftoken);
    request.setRequestHeader('Content-Type', 'application/json');

    request.send(JSON.stringify({
        "Friend": friend,
    }));

    element.remove();

    //create new friend on friends bar
    if (path === "/accept") {
        var friends_list = document.getElementById("friends-list");
        var new_friend = document.createElement("div");
        new_friend.setAttribute('class', 'friend');
        new_friend.innerHTML = '<label style="margin-left: 1vh;">' + friend + '</label>';

        var function_call = "select_receiver('" + friend + "', '" + username + "')";
        new_friend.setAttribute('onclick', function_call);
        friends_list.appendChild(new_friend);
    }
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

