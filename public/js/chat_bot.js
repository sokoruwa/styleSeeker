const conversationHistory = [];
let isWaiting = false;

function safeHttpUrl(value) {
    if (typeof value !== 'string' || !value.trim()) {
        return '';
    }

    try {
        const url = new URL(value.trim());
        return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (error) {
        return '';
    }
}

function addMessage(text, sender) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return messageDiv;
}

function showTypingIndicator() {
    const messagesDiv = document.getElementById('chatMessages');
    const indicator = document.createElement('div');
    indicator.className = 'message bot-message typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.textContent = '...';
    messagesDiv.appendChild(indicator);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

async function sendMessage(userText) {
    if (isWaiting || !userText.trim()) return;
    isWaiting = true;

    addMessage(userText, 'user');
    conversationHistory.push({ role: 'user', content: userText });

    showTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ messages: conversationHistory }),
        });

        removeTypingIndicator();

        const messagesDiv = document.getElementById('chatMessages');
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot-message';
        messagesDiv.appendChild(botMessageDiv);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const data = JSON.parse(line.slice(6));

                if (data.type === 'text') {
                    fullResponse += data.text;
                    botMessageDiv.textContent = fullResponse;
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                } else if (data.type === 'products') {
                    const grid = document.createElement('div');
                    grid.className = 'product-grid';
                    const products = Array.isArray(data.products) ? data.products : [];
                    products.forEach(p => {
                        const productUrl = safeHttpUrl(p.url);
                        if (!productUrl) return;

                        const card = document.createElement('a');
                        card.className = 'product-card';
                        card.href = productUrl;
                        card.target = '_blank';
                        card.rel = 'noopener noreferrer';

                        const imageUrl = safeHttpUrl(p.image);
                        if (imageUrl) {
                            const image = document.createElement('img');
                            image.src = imageUrl;
                            image.alt = p.title || 'Product image';
                            card.appendChild(image);
                        }

                        const info = document.createElement('div');
                        info.className = 'product-info';

                        const title = document.createElement('div');
                        title.className = 'product-title';
                        title.textContent = p.title || 'Untitled product';

                        const price = document.createElement('div');
                        price.className = 'product-price';
                        price.textContent = p.price || '';

                        info.append(title, price);
                        card.appendChild(info);
                        grid.appendChild(card);
                    });
                    messagesDiv.appendChild(grid);
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                } else if (data.type === 'saved') {
                    const savedDiv = document.createElement('div');
                    savedDiv.className = 'message bot-message save-confirmation';
                    savedDiv.textContent = `✓ Style profile saved: ${data.profile?.aesthetics?.[0] || 'Updated profile'}`;
                    messagesDiv.appendChild(savedDiv);
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                } else if (data.type === 'error') {
                    botMessageDiv.textContent = data.message;
                }
            }
        }

        if (fullResponse) {
            conversationHistory.push({ role: 'assistant', content: fullResponse });
        }
    } catch (error) {
        removeTypingIndicator();
        addMessage('Connection error. Please try again.', 'bot');
        console.error('Chat error:', error);
    }

    isWaiting = false;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('userInput');

    // Greeting
    addMessage("Hey! I'm StyleAI ✨ I'm here to help you discover your personal style. Tell me a little about yourself — what's your vibe?", 'bot');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        sendMessage(text);
    });
});
