<template>
  <div class="file-area">
    <ul class="file-name-list">
      <h3>ファイル一覧</h3>
      <li v-for="(name, index) in fileList" :key="index" class="file-name">
        <p>{{name}}</p>
      </li>
    </ul>
    <div>
      <h3>ファイルアップロード</h3>
      <p class="file-description">テキストファイル (.txt), CSV ファイル (.csv), または JSON ファイル (.json) を選択してアップロードしてください。</p>
      <input type="file" @change="handleFileChange" multiple accept=".txt,.csv,.json" />
      <button @click="processFileData">アップロード</button>
      <div v-if="fileData">
        <h2>ファイル内容</h2>
        <pre>{{ fileData }}</pre>
    </div>
  </div>
  </div>
  <div class="chatbot-page">
    <div class="chatbot-area">
      <h1>Chatbot</h1>
      <ul class="message-area">
        <li v-for="(data, index) in streamingDataList" :key="index">
          <p :class='[data.isUser ? "balloon-right" : "balloon"]'>{{ data.text }}
            <span v-for="(source, index) in data.sources" :key="index"><br>{{ (index+1) + '番目参照：' + source + ', '}}</span>
          </p>
        </li>
      </ul>
    </div>
    <div class="input-box">
      <input type="text" v-model="userInput" placeholder="Type your message..." />
      <a @click="sendQuestion" class="send-button">Send</a>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChatBot',
  data() {
    return {
      msg: '',
      streamingDataList: [{isUser:true, text:'testtes\nttesttest'}, {isUser:false, text:'hogehogehogehogehogehogehogheohgeohgoehgoheo', sources:['あいうえお','かきくけこ','さしすせそ']}],
      fileList: ["test","---------"],
      selectedFiles: [],
      fileData: null,
      userInput: ''
    };
  },
  methods: {
    formattedMessage(text) {
      return text.replace(/\n/g, '<br>');
    },
    handleFileChange(event) {
      const allowedExtensions = ['txt', 'csv', 'json'];
      this.selectedFiles = event.target.files;

      const validFiles = [];
      for (const file of this.selectedFiles) {
        const fileExtension = file.name.split('.').pop();
        console.log('fileExtension', fileExtension)
        if (allowedExtensions.includes(fileExtension)) {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) {
        alert('サポートされているファイル形式 (.txt, .csv, .json) を選択してください。');
        return;
      }else {
        this.selectedFiles = validFiles;
      }

    },
  async processFileData() {
    if (this.selectedFiles.length === 0) {
      alert('ファイルを選択してください');
      return;
    }

    const file = this.selectedFiles.shift();
    console.log(this.selectedFiles);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://160.251.238.232:49510/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set the content type header for binary data
        },
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.error('ファイルの送信に失敗しました:', error);
      alert('ファイルの送信に失敗しました。');
    }
    this.fileData = null;
  },
  async sendQuestion(){
    if(!this.userInput){
      return;
    }
    // Create an HTTP client using Axios
    // const axios = require('axios');
      this.streamingDataList.push({isUser:true, text:this.userInput});
      const params = {
        question: this.userInput  // Replace 'this.userInput' to use the user input
      };
      this.userInput = null;

    try {
      // Send the GET request to the server with query parameters
      const response = await axios.get('https://160.251.238.232:49510/lmm/question', { params: params, withCredentials: true });
      // const response = await axios.get('https://160.251.238.232:49510/lmm/streaming', { params: params });
      console.log('Response:', response.data);

      // Subscribe to the response stream
      // const eventSource = new EventSource(response.data.url);
      const eventSource = new EventSource('https://160.251.238.232:49510/lmm/question');

      // Handle incoming messages
      eventSource.addEventListener('message', (event) => {
        console.log('Received event:', event.data.message);
        this.msg += event.data.message;
        // this.msg += event.data;
      });
      let sources = []
      // Handle errors
      eventSource.onerror = (event) => {
        console.error('EventSource error:', event);
        for(let i; i<event.data.sources.length; i++){
          sources.push(event.data.sources[i].slice(0, 5));
        }
        this.streamingDataList.push({isUser:false, text:this.msg, sources: this.sources});
        eventSource.close();
      };
    } catch (error) {
      console.error('Error sending request:', error);
    }
  }
  },
  computed: {
  },
  mounted() {
    // EventSourceを作成し、サーバーからのイベントを購読する
  },
  beforeUnmount() {
    // コンポーネントが破棄される前にEventSourceをクローズする
    if (this.eventSource) {
      this.eventSource.close();
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.chatbot {
  /* Add your styles for the chat window */
}
.chatbot-page {
  width: 60%;
  min-width: 280px;
  margin: 0 5%;
}
.file-area {
  max-width: 400px;
  flex: 1 1 auto;
  margin-bottom: 0;
}

.file-name-list {
  height: 72%;
}

.file-name {
  text-align: start;
}
.file-description {
  margin: 4px 10px;
}
.message-area {
  height: calc(100vh - 200px);
  list-style: none;
  padding: 0;
  margin: 0 0 8px 0;
  opacity: 0.6;
  border-radius: 6px;
}

.message {
  padding: 10px;
  margin-bottom: 5px;
}

.user {
  /* Style for user messages */
}

.bot-message {
  /* Style for bot messages */
  color: blue;
  text-align: right;
}

.input-box {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.input-box input {
  flex: 1;
  padding: 10px;
}
a.send-button {
	display: block;
	text-align: center;
	vertical-align: middle;
	text-decoration: none;
	width: 60px;
	margin: 0 1px 0 12px;
	padding: 1rem 4rem;
	font-weight: bold;
	border: 2px solid #27acd9;
	color: #27acd9;
	transition: 0.5s;
  border-radius: 8px;
}
a.send-button:hover {
	color: #fff;
	background: #27acd9;
}

.balloon{
  text-align: left;
  overflow-wrap: break-word;
  background-color:#ddd;
  border-radius:5px;
  color:#222;
  position:relative;
  padding:8px 16px;
  margin:20px;
}
.balloon::after{
  border-top:solid 7px transparent;
  border-bottom:solid 7px transparent;
  border-right:solid 10px #ddd;
  left:-10px;
  content:"";
  display:block;
  height:0;
  top:20%;
  position:absolute;
  width:0;
}

.balloon-right{
  text-align: left;
  overflow-wrap: break-word;
  background-color:#ddd;
  border-radius:5px;
  color:#222;
  position:relative;
  padding:8px 16px;
  margin:20px;
}
.balloon-right::after{
  border-top:solid 7px transparent;
  border-bottom:solid 7px transparent;
  border-left:solid 10px #ddd;
  right:-10px;
  content:"";
  display:block;
  height:0;
  top:20%;
  position:absolute;
  width:0;
}
</style>
