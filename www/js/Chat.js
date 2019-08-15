window.onload = () => {
    let chat = new Chat();
    chat.init();
};

class Chat {
    constructor() {
        this.socket = null;
    }
    init() {
        this.socket = io.connect();
        this.socket.on('connect', () => {
            document.getElementById('info').textContent = 'get yourself a nickname';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        this.socket.on('loginSuccess', () => {
            document.title = 'Chat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();
        })

        this.socket.on('nickNameExisted', () => {
            alert('Nickname ' + document.getElementById('nicknameInput').value + ' existed, please change another one');
            document.getElementById('messageInput').focus();
        })

        this.socket.on('system', (nickname, userCount, userAction) => {
            let msg = nickname + ((userAction == 'login') ? ' join' : ' left');

            this.displayMsg('system', msg, 'red');
            document.getElementById('status').textContent = userCount + ((userCount > 1) ? ' users' : ' user' + ' online');
        })

        this.socket.on('newMsg', (nickname, msg, color) => {
            this.displayMsg(nickname, msg, color);
        })

        this.socket.on('newImg', (nickname, imgData) => {
            this.displayImage(nickname, imgData);
        })


        document.getElementById('loginBtn').addEventListener('click', this.login, false);
        document.getElementById('nicknameInput').addEventListener('keyup', (e) => {
            if (e.keyCode == 13) {
                this.login();
            }
        }, false);

        document.getElementById('sendBtn').addEventListener('click', this.sendMsg,false);
        document.getElementById('messageInput').addEventListener('keyup', (e) => {
            if (e.keyCode == 13) {
                this.sendMsg();
            }
        }, false);


        document.getElementById('sendImage').addEventListener('change', () => {
            let file = document.getElementById('sendImage').files[0];
            if (file) {
                let reader = new FileReader();
                if (!reader) {
                    this.displayMsg('system', '!browser not support fileReader', 'red');
                    this.value = '';
                    return;
                }
                reader.onload = (e) => {
                    this.value = '';
                    this.socket.emit('img', e.target.result);
                    this.displayImage('me', e.target.result);
                }
                reader.readAsDataURL(file);
            }
        }, false);

        this.initEmoji();
        document.getElementById('emoji').addEventListener('click', (e) => {
            let emojiWrapper = document.getElementById('emojiWrapper');
            emojiWrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', (e) => {
            let emojiWrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiWrapper) {
                emojiWrapper.style.display = 'none';
            }
        }, false);
        document.getElementById('emojiWrapper').addEventListener('click', (e) => {
            let target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                let messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            }
        }, false);
    }
    login = () => {
        let nickname = document.getElementById('nicknameInput').value;
        if (nickname.trim().length != 0) {
            this.socket.emit('login', nickname);
        } else {
            document.getElementById('nicknameInput').focus();
        }
    }
    sendMsg = () => {
        let messageInput = document.getElementById('messageInput');
        let msg = messageInput.value;
        let color = document.getElementById('colorStyle').value;

        messageInput.value = '';
        messageInput.focus();
        if (msg.trim().length > 0) {
            this.socket.emit('postMsg', msg, color);
            this.displayMsg('me', msg, color);
        }
    }
    displayMsg(user, msg, color) {
        let container = document.getElementById('historyMsg');
        let msgToDisplay = document.createElement('p');
        let now = new Date();
        let date = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

        msg = this.displayEmoji(msg);
        msgToDisplay.style.color = color || 'black';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '):</span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
    displayImage(user, imgData, color) {
        let container = document.getElementById('historyMsg');
        let msgToDisplay = document.createElement('p');
        let now = new Date();
        let date = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

        msgToDisplay.style.color = color || 'black';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '):</span><br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '" /></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
    displayEmoji(msg) {
        let reg = /\[emoji:\d+]/g;
        let match;
        while (match = reg.exec(msg)) {
            let emojiIndex = match[0].slice(7, -1);
            msg = msg.replace(match[0], '<img class="emoji" src="../emoji/' + emojiIndex + '.gif"/>');
        }
        return msg;
    }
    initEmoji() {
        let emojiContainer = document.getElementById('emojiWrapper');
        let docFragment = document.createDocumentFragment();
        for (let i = 1; i < 7; i++) {
            let emojiItem = document.createElement('img');
            emojiItem.src = 'emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        }
        emojiContainer.appendChild(docFragment);
    }
}