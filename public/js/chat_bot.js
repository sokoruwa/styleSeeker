class StyleQuizBot {
    constructor() {
        this.aesthetics = {
            'Y2K': {
                description: 'A nostalgic revival of late 90s and early 2000s fashion featuring crop tops, low-rise jeans, butterfly motifs, and metallic fabrics.',
                images: [
                    'https://i.pinimg.com/564x/y2k_style_1.jpg',
                    'https://i.pinimg.com/564x/y2k_style_2.jpg',
                    'https://i.pinimg.com/564x/y2k_style_3.jpg'
                ]
            },
            'Cottagecore': {
                description: 'Romantic rural lifestyle aesthetic with flowing dresses, floral prints, and natural elements.',
                images: [
                    'https://i.pinimg.com/564x/cottagecore_1.jpg',
                    'https://i.pinimg.com/564x/cottagecore_2.jpg',
                    'https://i.pinimg.com/564x/cottagecore_3.jpg'
                ]
            },
            'Alté Nigerian': {
                description: 'Alternative Nigerian fashion combining traditional elements with modern streetwear.',
                images: [
                    'https://i.pinimg.com/564x/alte_1.jpg',
                    'https://i.pinimg.com/564x/alte_2.jpg',
                    'https://i.pinimg.com/564x/alte_3.jpg'
                ]
            },
            'Dark Academia': {
                description: 'Scholarly aesthetic inspired by classic literature, featuring tweed, plaid, and dark neutral colors.',
                images: [
                    'https://i.pinimg.com/564x/dark_academia_1.jpg',
                    'https://i.pinimg.com/564x/dark_academia_2.jpg',
                    'https://i.pinimg.com/564x/dark_academia_3.jpg'
                ]
            },
            'Minimalist': {
                description: 'Clean lines, neutral colors, and simple silhouettes focusing on quality basics.',
                images: [
                    'https://i.pinimg.com/564x/minimalist_1.jpg',
                    'https://i.pinimg.com/564x/minimalist_2.jpg',
                    'https://i.pinimg.com/564x/minimalist_3.jpg'
                ]
            },
            'Streetwear': {
                description: 'Urban fashion mixing comfort with style, featuring sneakers, oversized clothing, and bold graphics.',
                images: [
                    'https://i.pinimg.com/564x/streetwear_1.jpg',
                    'https://i.pinimg.com/564x/streetwear_2.jpg',
                    'https://i.pinimg.com/564x/streetwear_3.jpg'
                ]
            },
            'Soft Girl': {
                description: 'Cute and feminine style with pastels, hearts, and playful accessories.',
                images: [
                    'https://i.pinimg.com/564x/softgirl_1.jpg',
                    'https://i.pinimg.com/564x/softgirl_2.jpg',
                    'https://i.pinimg.com/564x/softgirl_3.jpg'
                ]
            },
            'Grunge': {
                description: 'Edgy and rebellious style with distressed elements, dark colors, and oversized fits.',
                images: [
                    'https://i.pinimg.com/564x/grunge_1.jpg',
                    'https://i.pinimg.com/564x/grunge_2.jpg',
                    'https://i.pinimg.com/564x/grunge_3.jpg'
                ]
            },
            'Bohemian': {
                description: 'Free-spirited style with natural fabrics, earthy colors, and ethnic-inspired prints.',
                images: [
                    'https://i.pinimg.com/564x/boho_1.jpg',
                    'https://i.pinimg.com/564x/boho_2.jpg',
                    'https://i.pinimg.com/564x/boho_3.jpg'
                ]
            },
            'Cyber Y2K': {
                description: 'Futuristic take on Y2K fashion with metallic fabrics, neon colors, and tech-inspired elements.',
                images: [
                    'https://i.pinimg.com/564x/cyber_1.jpg',
                    'https://i.pinimg.com/564x/cyber_2.jpg',
                    'https://i.pinimg.com/564x/cyber_3.jpg'
                ]
            }
        };

        this.questions = [
            {
                text: "What's your ideal weekend activity?",
                options: [
                    { text: "Browsing vintage shops", points: { Y2K: 2, Grunge: 1 } },
                    { text: "Picnicking in nature", points: { Cottagecore: 2, Bohemian: 1 } },
                    { text: "Going to art galleries", points: { "Dark Academia": 2, Minimalist: 1 } },
                    { text: "Dancing at concerts", points: { Streetwear: 2, "Cyber Y2K": 1 } }
                ]
            },
            {
                text: "Pick a color palette:",
                options: [
                    { text: "Pastels and pinks", points: { "Soft Girl": 2, Y2K: 1 } },
                    { text: "Earth tones", points: { Bohemian: 2, Cottagecore: 1 } },
                    { text: "Dark and moody", points: { Grunge: 2, "Dark Academia": 1 } },
                    { text: "Bright and bold", points: { "Alté Nigerian": 2, "Cyber Y2K": 1 } }
                ]
            },
            {
                text: "What's your favorite music genre?",
                options: [
                    { text: "Pop and R&B", points: { Y2K: 2, "Soft Girl": 1 } },
                    { text: "Alternative/Rock", points: { Grunge: 2, Streetwear: 1 } },
                    { text: "Classical/Jazz", points: { "Dark Academia": 2, Minimalist: 1 } },
                    { text: "Afrobeats", points: { "Alté Nigerian": 2, "Cyber Y2K": 1 } }
                ]
            },
            {
                text: "Choose a movie vibe:",
                options: [
                    { text: "Indie films", points: { "Dark Academia": 2, Grunge: 1 } },
                    { text: "Fantasy/Magical", points: { Cottagecore: 2, "Soft Girl": 1 } },
                    { text: "Sci-fi/Futuristic", points: { "Cyber Y2K": 2, Minimalist: 1 } },
                    { text: "Cultural/Documentary", points: { "Alté Nigerian": 2, Bohemian: 1 } }
                ]
            },
            {
                text: "What's your social media aesthetic?",
                options: [
                    { text: "Vintage filters", points: { Y2K: 2, Grunge: 1 } },
                    { text: "Clean and minimal", points: { Minimalist: 2, "Dark Academia": 1 } },
                    { text: "Bright and colorful", points: { "Soft Girl": 2, "Cyber Y2K": 1 } },
                    { text: "Natural and earthy", points: { Cottagecore: 2, Bohemian: 1 } }
                ]
            }
        ];

        this.currentQuestion = 0;
        this.scores = {};
        this.initialize();
    }

    initialize() {
        this.displayMessage("Hi! Let's discover your perfect aesthetic style! 🌟");
        setTimeout(() => {
            this.askQuestion();
        }, 1000);
    }

    displayMessage(text, isUser = false) {
        const messagesDiv = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    askQuestion() {
        if (this.currentQuestion < this.questions.length) {
            const question = this.questions[this.currentQuestion];
            this.displayMessage(question.text);
            
            const optionsContainer = document.getElementById('optionsContainer');
            optionsContainer.innerHTML = '';
            
            question.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = option.text;
                button.onclick = () => this.handleAnswer(option);
                optionsContainer.appendChild(button);
            });
        } else {
            this.showResult();
        }
    }

    handleAnswer(option) {
        this.displayMessage(option.text, true);
        
        // Update scores
        Object.entries(option.points).forEach(([aesthetic, points]) => {
            this.scores[aesthetic] = (this.scores[aesthetic] || 0) + points;
        });

        this.currentQuestion++;
        setTimeout(() => {
            this.askQuestion();
        }, 1000);
    }

    showResult() {
        // Find the aesthetic with the highest score
        const result = Object.entries(this.scores).reduce((a, b) => 
            (a[1] > b[1] ? a : b)
        )[0];

        const aesthetic = this.aesthetics[result];
        
        document.getElementById('chatMessages').style.display = 'none';
        document.getElementById('optionsContainer').style.display = 'none';
        
        const resultContainer = document.getElementById('resultContainer');
        const aestheticResult = document.getElementById('aestheticResult');
        const imageGrid = document.getElementById('aestheticImages');
        
        resultContainer.style.display = 'block';
        aestheticResult.innerHTML = `
            <h2>${result}</h2>
            <p>${aesthetic.description}</p>
        `;

        imageGrid.innerHTML = aesthetic.images.map(img => 
            `<img src="${img}" alt="${result} style" loading="lazy">`
        ).join('');

        document.getElementById('restartQuiz').onclick = () => {
            location.reload();
        };
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StyleQuizBot();
});
