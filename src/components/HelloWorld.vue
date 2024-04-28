<template>
  <div class="chatbot">
    <h1>Chatbot</h1>
    <ul class="messages">
      <p>{{events}}</p>
    </ul>
    <div class="input-box">
      <input type="text" v-model="userInput" placeholder="Type your message..." />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// import { from, fromEvent } from 'rxjs';
// import { switchMap, map } from 'rxjs/operators';

export default {
  name: 'HelloWorld',
  data() {
    return {
      streamingData: '',
      events: [], // events配列をここで初期化
    };
  },
  methods: {
    async getApi() {
      try {
        const response = await axios.get('http://160.251.238.232:49500/lmm/streaming');
        // 成功時の処理
        console.log(response.data);
        this.streamingData = response.data;
      } catch (error) {
        // エラー時の処理
        console.error('------- error -------', error);
        this.streamingData = 'エラーが発生しました。';
      }
    }
  },
  mounted() {
    // EventSourceを作成し、サーバーからのイベントを購読する
    this.eventSource = new EventSource('http://160.251.238.232:49500/lmm/streaming');

    // イベントを購読し、events配列に追加する
    this.eventSource.addEventListener('message', (event) => {
      console.log('Received event:', event.data);
      this.events.push(event.data);
    });

    // エラーが発生した場合の処理
    this.eventSource.onerror = (event) => {
      console.error('EventSource error:', event);
    };
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

.messages {
  list-style: none;
  padding: 0;
  margin: 0;
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
</style>
