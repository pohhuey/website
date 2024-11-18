require('dotenv').config();
const express = require('express');
const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // 从环境变量获取API密钥

router.post('/chat', async (req, res) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的马来西亚旅游顾问，可以回答游客关于马来西亚旅游的各种问题。'
                    },
                    {
                        role: 'user',
                        content: req.body.message
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            res.json({
                success: true,
                reply: data.choices[0].message.content
            });
        } else {
            throw new Error('Invalid response from OpenAI');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: '服务器错误'
        });
    }
});

module.exports = router; 