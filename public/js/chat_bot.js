class StyleQuizBot {
    constructor() {
        this.questions = [
            {
                text: "What's your cultural style preference?",
                options: [
                    { text: "African-inspired fashion", points: { "African Alté": 2, Afrofuturism: 1, "Modern Ankara": 1 } },
                    { text: "Western fashion", points: { Y2K: 2, Minimalist: 1, Streetwear: 1 } },
                    { text: "Mix of both", points: { "African Alté": 1, Y2K: 1, Streetwear: 1 } }
                ]
            },
            {
                text: "Pick your ideal color palette:",
                options: [
                    { text: "Bold African prints and patterns", points: { "Modern Ankara": 2, "African Alté": 1 } },
                    { text: "Metallic and futuristic", points: { Afrofuturism: 2, Y2K: 1 } },
                    { text: "Neutral and minimal", points: { Minimalist: 2, Streetwear: 1 } },
                    { text: "Mix of bright and neutral", points: { "African Alté": 1, Streetwear: 2 } }
                ]
            },
            {
                text: "What's your style goal?",
                options: [
                    { text: "Connect with cultural heritage", points: { "Modern Ankara": 2, "African Alté": 1 } },
                    { text: "Push fashion boundaries", points: { Afrofuturism: 2, Y2K: 1 } },
                    { text: "Keep it simple and clean", points: { Minimalist: 2, Streetwear: 1 } },
                    { text: "Stand out with unique style", points: { "African Alté": 2, Streetwear: 1 } }
                ]
            },
            {
                text: "Choose your favorite outfit vibe:",
                options: [
                    { text: "Modern African streetwear", points: { "African Alté": 2, Streetwear: 1 } },
                    { text: "Futuristic and bold", points: { Afrofuturism: 2, Y2K: 1 } },
                    { text: "Traditional with a twist", points: { "Modern Ankara": 2, "African Alté": 1 } },
                    { text: "Clean and contemporary", points: { Minimalist: 2, Streetwear: 1 } }
                ]
            },
            {
                text: "What's your preferred way to make a statement?",
                options: [
                    { text: "Bold prints and patterns", points: { "Modern Ankara": 2, "African Alté": 1 } },
                    { text: "Unique silhouettes", points: { Afrofuturism: 2, Y2K: 1 } },
                    { text: "Minimalist details", points: { Minimalist: 2, Streetwear: 1 } },
                    { text: "Mix of cultures and styles", points: { "African Alté": 2, Streetwear: 1 } }
                ]
            }
        ];

        this.aesthetics = {
            "African Alté": {
                description: "Modern African streetwear with bold prints and a mix of traditional and contemporary elements",
                images: ["alte_1.jpg", "alte_2.jpg", "alte_3.jpg"]
            },
            "Afrofuturism": {
                description: "Futuristic African fashion with metallic accents and bold geometric patterns",
                images: ["afrofuturism_1.jpg", "afrofuturism_2.jpg", "afrofuturism_3.jpg"]
            },
            "Modern Ankara": {
                description: "Contemporary interpretations of traditional African prints and patterns",
                images: ["ankara_1.jpg", "ankara_2.jpg", "ankara_3.jpg"]
            },
            "Y2K": {
                description: "2000s revival featuring crop tops, low-rise pants, and metallic/glitter elements",
                images: ["y2k_1.jpg", "y2k_2.jpg", "y2k_3.jpg"]
            },
            "Minimalist": {
                description: "Clean lines and simple silhouettes in neutral colors",
                images: ["minimalist_1.jpg", "minimalist_2.jpg", "minimalist_3.jpg"]
            },
            "Streetwear": {
                description: "Urban casual featuring sneakers, oversized fits, and layering",
                images: ["streetwear_1.jpg", "streetwear_2.jpg", "streetwear_3.jpg"]
            }
        };

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
            
            // Create and display option buttons
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
            
            question.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'cyber-button option-btn';
                button.innerHTML = `<span>${option.text}</span>`;
                button.onclick = () => this.handleAnswer(option);
                optionsContainer.appendChild(button);
            });

            // Add options to chat
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.appendChild(optionsContainer);
            chatMessages.scrollTop = chatMessages.scrollHeight;
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
        // Find the top 2 aesthetics with highest scores
        const sortedScores = Object.entries(this.scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2);

        const primaryStyle = sortedScores[0][0];
        const secondaryStyle = sortedScores[1][0];

        const analysis = `
            ✨ YOUR STYLE ANALYSIS ✨


            🎨 PRIMARY AESTHETIC
            ${primaryStyle}
            ${this.aesthetics[primaryStyle].description}



            🌟 SECONDARY INFLUENCE
            ${secondaryStyle}
            This creates a unique fusion style that combines elements of both aesthetics.



            👗 STYLE RECOMMENDATIONS
            ${this.getStyleRecommendations(primaryStyle, secondaryStyle)}



            🛍️ SHOPPING TIPS
            ${this.getShoppingTips(primaryStyle, secondaryStyle)}



            🔑 KEY PIECES TO BUILD YOUR WARDROBE
            ${this.getKeyPieces(primaryStyle)}



            💫 STYLE TIP
            Don't be afraid to mix elements from both ${primaryStyle} and ${secondaryStyle} to create your unique look!
        `;

        // Create a formatted message div
        const formattedMessage = document.createElement('div');
        formattedMessage.className = 'style-analysis-result';
        formattedMessage.innerHTML = analysis.split('\n').map(line => 
            line.trim() ? `<p>${line.trim()}</p>` : '<br>'
        ).join('');

        // Display the formatted message
        const messagesDiv = document.getElementById('chatMessages');
        messagesDiv.appendChild(formattedMessage);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Save results if user is logged in
        this.saveStyleResults({
            primaryStyle,
            secondaryStyle,
            recommendations: this.getStyleRecommendations(primaryStyle, secondaryStyle),
            keyPieces: this.getKeyPieces(primaryStyle)
        });
    }

    async saveStyleResults(styleData) {
        try {
            console.log('Attempting to save style data:', styleData);
            
            const response = await fetch('/api/save-style-preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    primaryStyle: styleData.primaryStyle,
                    secondaryStyle: styleData.secondaryStyle,
                    recommendations: styleData.recommendations,
                    keyPieces: styleData.keyPieces
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Save response data:', data);

            if (data.message) {
                this.displayMessage(data.message + " 💾");
            }
        } catch (error) {
            console.error('Error saving style preferences:', error);
            this.displayMessage("There was an error saving your preferences. Please try again later. ⚠️");
        }
    }

    getStyleRecommendations(primary, secondary) {
        const recommendations = {
            "African Alté": 
                "• Mix traditional prints with modern streetwear\n\n" +
                "• Layer bold patterns with solid basics\n\n" +
                "• Experiment with oversized silhouettes",
            "Afrofuturism": 
                "• Incorporate metallic and holographic elements\n\n" +
                "• Use geometric patterns and bold shapes\n\n" +
                "• Mix traditional African elements with futuristic pieces",
            "Modern Ankara": 
                "• Update traditional prints with contemporary cuts\n\n" +
                "• Mix Ankara prints with solid colors\n\n" +
                "• Play with modern silhouettes in traditional fabrics",
            "Y2K": 
                "• Layer crop tops with low-rise bottoms\n\n" +
                "• Add metallic and sparkly accessories\n\n" +
                "• Mix fitted and loose pieces",
            "Minimalist": 
                "• Focus on clean lines and simple shapes\n\n" +
                "• Stick to a neutral color palette\n\n" +
                "• Invest in quality basics",
            "Streetwear": 
                "• Layer different pieces creatively\n\n" +
                "• Mix high and low fashion\n\n" +
                "• Focus on comfort and statement pieces"
        };

        return recommendations[primary];
    }

    getShoppingTips(primary, secondary) {
        return `
            • Look for pieces that blend ${primary} and ${secondary} elements

            • Invest in versatile items that can be styled multiple ways

            • Focus on quality over quantity

            • Start with basic pieces and add statement items gradually
        `;
    }

    getKeyPieces(style) {
        const keyPieces = {
            "African Alté": 
                "• Statement Ankara print jacket\n\n" +
                "• Modern cut traditional fabric pants\n\n" +
                "• Graphic tees with African motifs\n\n" +
                "• Statement accessories",
            "Afrofuturism": 
                "• Metallic finish clothing\n\n" +
                "• Geometric pattern pieces\n\n" +
                "• Futuristic accessories\n\n" +
                "• Bold statement jewelry",
            "Modern Ankara": 
                "• Contemporary Ankara dresses\n\n" +
                "• Modern cut blazers in traditional prints\n\n" +
                "• Mixed media clothing\n\n" +
                "• Statement accessories",
            "Y2K": 
                "• Crop tops\n\n" +
                "• Platform shoes\n\n" +
                "• Metallic accessories\n\n" +
                "• Low-rise pants",
            "Minimalist": 
                "• Quality basic tees\n\n" +
                "• Well-fitted neutral pants\n\n" +
                "• Simple, elegant dresses\n\n" +
                "• Classic accessories",
            "Streetwear": 
                "• Oversized hoodies\n\n" +
                "• Statement sneakers\n\n" +
                "• Cargo pants\n\n" +
                "• Layering pieces"
        };

        return keyPieces[style];
    }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StyleQuizBot();
});

const styleAesthetics = {
    African: {
        alte: {
            name: "African Alté",
            description: "Modern African streetwear with bold prints and a mix of traditional and contemporary elements",
            keyPieces: [
                "Oversized shirts with African prints",
                "High-waisted pants",
                "Statement accessories",
                "Mixed pattern outfits",
                "Modern takes on traditional fabrics"
            ]
        },
        afrofuturism: {
            name: "Afrofuturism",
            description: "Futuristic African fashion with metallic accents and bold geometric patterns",
            keyPieces: [
                "Metallic fabrics",
                "Geometric pattern clothing",
                "Avant-garde accessories",
                "Space-age inspired pieces",
                "Traditional patterns with futuristic twists"
            ]
        },
        ankara: {
            name: "Modern Ankara",
            description: "Contemporary interpretations of traditional African prints and patterns",
            keyPieces: [
                "Ankara print blazers",
                "Modern cut dresses with traditional prints",
                "Ankara accessories",
                "Mixed media clothing",
                "Contemporary silhouettes with traditional fabrics"
            ]
        }
    },
    Western: {
        y2k: {
            name: "Y2K",
            description: "2000s revival featuring crop tops, low-rise pants, and metallic/glitter elements",
            keyPieces: [
                "Crop tops",
                "Low-rise jeans",
                "Platform shoes",
                "Metallic accessories",
                "Mini skirts"
            ]
        },
        minimalist: {
            name: "Minimalist",
            description: "Clean lines and simple silhouettes in neutral colors",
            keyPieces: [
                "Basic tees",
                "Straight-leg pants",
                "Simple dresses",
                "Clean-line blazers",
                "Neutral-colored pieces"
            ]
        },
        streetwear: {
            name: "Streetwear",
            description: "Urban casual featuring sneakers, oversized fits, and layering",
            keyPieces: [
                "Oversized hoodies",
                "Statement sneakers",
                "Cargo pants",
                "Graphic tees",
                "Layered pieces"
            ]
        }
    }
};

function handleStyleQuestion(message) {
    message = message.toLowerCase();
    
    // Check for specific aesthetic inquiries
    for (const region in styleAesthetics) {
        for (const style in styleAesthetics[region]) {
            if (message.includes(style.toLowerCase())) {
                const aesthetic = styleAesthetics[region][style];
                return `
                    ${aesthetic.name}:
                    ${aesthetic.description}
                    
                    Key Pieces:
                    ${aesthetic.keyPieces.map(piece => `• ${piece}`).join('\n')}
                    
                    Would you like specific outfit ideas for this style?
                `;
            }
        }
    }

    // General style inquiry
    if (message.includes('style') || message.includes('fashion') || message.includes('aesthetic')) {
        return `
            I can help you explore different style aesthetics! Here are some options:

            African Styles:
            • African Alté (modern African streetwear)
            • Afrofuturism (futuristic African fashion)
            • Modern Ankara (contemporary traditional prints)

            Western Styles:
            • Y2K (2000s revival)
            • Minimalist (clean and simple)
            • Streetwear (urban casual)

            Which style would you like to learn more about?
        `;
    }

    // Handle specific outfit requests
    if (message.includes('outfit') || message.includes('wear')) {
        return `
            I can suggest outfits based on different styles! Would you like recommendations for:
            
            1. African Alté outfits
            2. Afrofuturism looks
            3. Modern Ankara styles
            4. Y2K fashion
            5. Minimalist outfits
            6. Streetwear combinations

            Just let me know which style interests you!
        `;
    }

    return null; // Let other handlers process the message
}

// Add this to your existing message handlers
function handleMessage(message) {
    // Try style-specific response first
    const styleResponse = handleStyleQuestion(message);
    if (styleResponse) return styleResponse;

    // Your existing message handling logic...
}
