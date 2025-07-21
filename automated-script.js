// Ironclad Roofing - Automated AI Estimate System
class AutomatedRoofingEstimator {
    constructor() {
        this.currentStep = 0;
        this.userData = {};
        this.isProcessing = false;
        
        // Configuration for secure API endpoint
        this.config = {
            // This will be your Netlify function URL once deployed
            apiEndpoint: '/.netlify/functions/generate-estimate',
            formspreeEndpoint: 'https://formspree.io/f/xld1lenb' // Backup for notifications
        };
        
        // Conversation flow
        this.questions = [
            {
                key: 'name',
                question: "What's your name?",
                type: 'text'
            },
            {
                key: 'email', 
                question: "What's your email address? (Your estimate will be sent here)",
                type: 'email'
            },
            {
                key: 'phone',
                question: "What's your phone number?",
                type: 'tel'
            },
            {
                key: 'address',
                question: "What's the property address where you need roofing work?",
                type: 'text'
            },
            {
                key: 'roofSize',
                question: "What's the approximate size of your roof?",
                type: 'select',
                options: [
                    'Small (up to 1,500 sq ft)',
                    'Medium (1,500 - 2,500 sq ft)',
                    'Large (2,500 - 4,000 sq ft)',
                    'Very Large (4,000+ sq ft)',
                    'Not sure - needs measurement'
                ]
            },
            {
                key: 'roofType',
                question: "What type of roof do you have?",
                type: 'select',
                options: [
                    'Gable roof',
                    'Hip roof',
                    'Mansard roof',
                    'Flat roof',
                    'Shed roof',
                    'Not sure'
                ]
            },
            {
                key: 'material',
                question: "What roofing material are you interested in?",
                type: 'select',
                options: [
                    'Asphalt Shingles',
                    'Metal Roofing',
                    'Tile Roofing',
                    'Slate Roofing',
                    'Wood Shingles',
                    'Not sure - need recommendation'
                ]
            },
            {
                key: 'workType',
                question: "What type of work do you need?",
                type: 'select',
                options: [
                    'Complete roof replacement',
                    'Roof repair',
                    'New construction',
                    'Partial replacement',
                    'Inspection and assessment'
                ]
            },
            {
                key: 'urgency',
                question: "How urgent is this project?",
                type: 'select',
                options: [
                    'Emergency (immediate)',
                    'Within 1 month',
                    'Within 3 months',
                    'Within 6 months',
                    'Planning for next year'
                ]
            },
            {
                key: 'budget',
                question: "What's your budget range for this project?",
                type: 'select',
                options: [
                    'Under $10,000',
                    '$10,000 - $20,000',
                    '$20,000 - $35,000',
                    '$35,000 - $50,000',
                    'Over $50,000',
                    'Not sure - need estimate'
                ]
            }
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.startConversation();
    }
    
    bindEvents() {
        // Chat input
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        
        if (sendButton) {
            sendButton.addEventListener('click', () => this.handleUserInput());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleUserInput();
                }
            });
        }
    }
    
    startConversation() {
        setTimeout(() => {
            this.addMessage('🏠 Welcome to Ironclad Roofing! I\'ll help you get an instant AI-powered roofing estimate that will be sent directly to your email. Let\'s get started!', 'bot');
            setTimeout(() => {
                this.askNextQuestion();
            }, 1000);
        }, 500);
    }
    
    handleUserInput() {
        const input = document.getElementById('chat-input');
        if (!input) return;
        
        const message = input.value.trim();
        
        if (!message || this.isProcessing) return;
        
        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        
        // Process the response
        this.processUserResponse(message);
    }
    
    addMessage(content, sender, extraClass = '') {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message ${extraClass}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (typeof content === 'string') {
            messageContent.innerHTML = content.replace(/\n/g, '<br>');
        } else {
            messageContent.appendChild(content);
        }
        
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return messageDiv;
    }
    
    processUserResponse(response) {
        if (this.currentStep < this.questions.length) {
            const currentQuestion = this.questions[this.currentStep];
            this.userData[currentQuestion.key] = response;
            this.currentStep++;
            
            setTimeout(() => {
                this.askNextQuestion();
            }, 500);
        }
    }
    
    askNextQuestion() {
        if (this.currentStep < this.questions.length) {
            const question = this.questions[this.currentStep];
            let messageContent = question.question;
            
            // Add options for select type questions
            if (question.type === 'select' && question.options) {
                messageContent += '\n\nPlease choose from:';
                question.options.forEach((option, index) => {
                    messageContent += `\n${index + 1}. ${option}`;
                });
            }
            
            this.addMessage(messageContent, 'bot');
            
            // Add quick options for select questions
            if (question.type === 'select' && question.options) {
                this.addQuickOptions(question.options);
            }
        } else {
            // All questions answered, generate AI estimate
            this.generateAIEstimate();
        }
    }
    
    addQuickOptions(options) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'quick-options';
        
        options.forEach((option) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'quick-option';
            optionButton.textContent = option;
            optionButton.addEventListener('click', () => {
                this.handleQuickOption(option);
                optionsContainer.remove();
            });
            optionsContainer.appendChild(optionButton);
        });
        
        messagesContainer.appendChild(optionsContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    handleQuickOption(option) {
        this.addMessage(option, 'user');
        this.processUserResponse(option);
    }
    
    showLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('show');
        }
        this.isProcessing = true;
        
        // Update loading text
        const loadingText = loadingIndicator.querySelector('span');
        if (loadingText) {
            loadingText.textContent = 'AI is generating your personalized estimate...';
        }
    }
    
    hideLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('show');
        }
        this.isProcessing = false;
    }
    
    async generateAIEstimate() {
        this.addMessage('Perfect! I have all the information I need. Let me generate your personalized roofing estimate using AI...', 'bot');
        this.showLoading();
        
        try {
            // Call secure Netlify function
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerData: this.userData
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Display the AI estimate
                this.displayAIEstimate(result.estimate);
                
                // Confirm email delivery
                setTimeout(() => {
                    this.addMessage(`✅ Your detailed estimate has been sent to ${this.userData.email}! Please check your inbox (and spam folder). Our team will also follow up within 24 hours.`, 'bot', 'success-message');
                }, 2000);
                
            } else {
                throw new Error(result.error || 'Failed to generate estimate');
            }
            
        } catch (error) {
            console.error('Error generating AI estimate:', error);
            
            // Fallback to manual process
            this.addMessage('I\'m experiencing a temporary issue with our AI system. Don\'t worry - I\'ve collected all your information and our team will prepare a detailed estimate manually and send it to your email within 2 hours.', 'bot', 'error-message');
            
            // Send basic notification as fallback
            await this.sendFallbackNotification();
            
        } finally {
            this.hideLoading();
        }
    }
    
    displayAIEstimate(estimate) {
        this.addMessage('🎉 Your AI-powered roofing estimate is ready!', 'bot');
        
        // Create estimate display
        const estimateContainer = document.createElement('div');
        estimateContainer.className = 'estimate-content';
        
        const estimateHeader = document.createElement('div');
        estimateHeader.className = 'estimate-header';
        estimateHeader.innerHTML = `
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.292-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.292c.415.764-.42 1.6-1.185 1.184l-.292-.159a1.873 1.873 0 0 0-2.692 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.693-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.292A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
            </svg>
            <strong>Your Personalized AI Estimate</strong>
        `;
        
        const estimateText = document.createElement('div');
        estimateText.innerHTML = estimate.replace(/\n/g, '<br>');
        estimateText.style.marginTop = '15px';
        estimateText.style.lineHeight = '1.6';
        
        estimateContainer.appendChild(estimateHeader);
        estimateContainer.appendChild(estimateText);
        
        this.addMessage(estimateContainer, 'bot');
    }
    
    async sendFallbackNotification() {
        // Fallback to direct Formspree if main function fails
        try {
            const formData = new FormData();
            formData.append('_subject', `URGENT LEAD: ${this.userData.name} - AI System Down`);
            formData.append('customer_name', this.userData.name);
            formData.append('customer_email', this.userData.email);
            formData.append('customer_phone', this.userData.phone);
            formData.append('customer_address', this.userData.address);
            formData.append('project_details', `${this.userData.workType} - ${this.userData.material} - ${this.userData.roofSize}`);
            formData.append('urgency', this.userData.urgency);
            formData.append('budget', this.userData.budget);
            formData.append('note', 'AI system temporary issue - needs manual estimate ASAP');
            formData.append('timestamp', new Date().toISOString());
            
            await fetch(this.config.formspreeEndpoint, {
                method: 'POST',
                body: formData
            });
            
        } catch (error) {
            console.error('Fallback notification failed:', error);
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AutomatedRoofingEstimator();
});

// Make available globally
window.AutomatedRoofingEstimator = AutomatedRoofingEstimator;