class AIChatBot {
    constructor() {
        // 使用备选API端点
        this.apiEndpoints = [
            'https://api.chatanywhere.tech/v1/chat/completions',
            'https://api.chatanywhere.cn/v1/chat/completions',
            'https://free.churchless.tech/v1/chat/completions'
        ];
        this.currentEndpointIndex = 0;
        this.apiKey = 'sk-ON2AoTKJvUDrzFXd67894f52Db32424197EfE9Bb245b7252';
        
        this.initializeElements();
        this.setupEventListeners();
        this.isChatVisible = false;
        this.conversationHistory = [];
        this.isProcessing = false;
        
        // 添加默认欢迎消息
        setTimeout(() => {
            this.addMessage('assistant', '您好！我是您的马来西亚旅游助手。我可以帮您：\n' +
                '• 规划行程和推荐景点\n' +
                '• 推荐当地特色美食\n' +
                '• 提供交通和住宿建议\n' +
                '• 解答签证和入境问题\n' +
                '请问需要什么帮助？');
        }, 1000);
    }

    initializeElements() {
        this.chatContainer = document.querySelector('.chat-container');
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendMessage');
        this.toggleButton = document.getElementById('toggleChat');
        this.minimizeButton = document.getElementById('minimizeChat');
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.toggleButton.addEventListener('click', () => this.toggleChat());
        this.minimizeButton.addEventListener('click', () => this.toggleChat());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
    }

    toggleChat() {
        this.isChatVisible = !this.isChatVisible;
        this.chatContainer.style.display = this.isChatVisible ? 'flex' : 'none';
        this.toggleButton.style.display = this.isChatVisible ? 'none' : 'block';
    }

    async handleSendMessage() {
        if (this.isProcessing) return;
        
        const userMessage = this.userInput.value.trim();
        if (!userMessage) return;

        this.isProcessing = true;
        this.sendButton.disabled = true;
        this.userInput.value = '';

        this.addMessage('user', userMessage);
        const loadingId = this.addMessage('assistant', '正在思考...');

        try {
            const response = await this.tryAllEndpoints(userMessage);
            this.removeMessage(loadingId);
            
            if (response && response.choices && response.choices[0]) {
                const aiResponse = response.choices[0].message.content;
                this.addMessage('assistant', this.formatResponse(aiResponse));
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error:', error);
            this.removeMessage(loadingId);
            this.addMessage('assistant', '抱歉，我暂时无法回答您的问题。请稍后再试。');
        } finally {
            this.isProcessing = false;
            this.sendButton.disabled = false;
        }
    }

    async tryAllEndpoints(userMessage) {
        let lastError = null;
        
        for (let i = 0; i < this.apiEndpoints.length; i++) {
            try {
                const response = await this.callAPI(this.apiEndpoints[i], userMessage);
                this.currentEndpointIndex = i; // 记住成功的端点
                return response;
            } catch (error) {
                console.error(`Error with endpoint ${i}:`, error);
                lastError = error;
                continue;
            }
        }
        
        throw lastError || new Error('All endpoints failed');
    }

    async callAPI(endpoint, userMessage) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `你是一位专业的马来西亚旅游顾问，请用中文回答所有问题。
                        
你需要了解以下信息：
1. 主要旅游城市：吉隆坡、槟城、兰卡威、马六甲等
2. 著名景点：双子塔、云顶高原、乔治市古迹等
3. 特色美食：肉骨茶、叻沙、椰浆饭等
4. 交通方式：轻轨、巴士、Grab打车等
5. 住宿选择：酒店、民宿、青旅等
6. 天气和季节：最佳旅游季节为11月至次年3月
7. 货币：马来西亚吉特(MYR)，1人民币约等于0.65林吉特

请提供：
1. 具体的价格信息
2. 实用的交通建议
3. 安全提醒
4. 省钱小贴士
5. 当地特色推荐`
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    formatResponse(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>');
    }

    addMessage(role, content) {
        const messageId = Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}-message animate__animated animate__fadeIn`;
        messageDiv.id = `message-${messageId}`;

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">
                    <i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'}"></i>
                </div>
                <div class="message-bubble">
                    <div class="message-text">${content}</div>
                    <div class="message-time">${this.getFormattedTime()}</div>
                </div>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return messageId;
    }

    removeMessage(messageId) {
        const message = document.getElementById(`message-${messageId}`);
        if (message) {
            message.remove();
        }
    }

    getFormattedTime() {
        return new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// 初始化聊天机器人
document.addEventListener('DOMContentLoaded', () => {
    new AIChatBot();
}); 