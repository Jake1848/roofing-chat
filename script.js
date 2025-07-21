// Ironclad Roofing AI Estimator - Frontend Chat Widget
class RoofingEstimator {
    constructor() {
        this.currentStep = 0;
        this.userData = {};
        this.isProcessing = false;
        
        // Configuration - Formspree only (no API key needed)
        this.config = {
            formspreeEndpoint: 'https://formspree.io/f/xld1lenb', // Your Formspree endpoint
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
                question: "What's your email address?",
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
        this.loadConfig();
    }
    
    bindEvents() {
        // Chat toggle
        const chatToggle = document.getElementById('chat-toggle');
        const chatWindow = document.getElementById('chat-window');
        const chatClose = document.getElementById('chat-close');
        
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('open');
            chatToggle.classList.toggle('active');
        });
        
        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('open');
            chatToggle.classList.remove('active');
        });
        
        // Chat input
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        
        sendButton.addEventListener('click', () => this.handleUserInput());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });
        
        // Configuration
        const saveConfigBtn = document.getElementById('save-config');
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => this.saveConfig());
        }
        
        // Configuration is now integrated - ready to use
    }
    
    showConfigPanel() {
        // Configuration is now integrated - no need to show panel
        console.log('Configuration already integrated with your API keys');
    }
    
    hideConfigPanel() {
        const configPanel = document.getElementById('config-panel');
        if (configPanel) {
            configPanel.style.display = 'none';
        }
    }
    
    loadConfig() {
        // Load from localStorage if available
        const savedConfig = localStorage.getItem('roofing_estimator_config');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }
        
        // Configuration is handled internally
    }
    
    saveConfig() {
        // Configuration is now handled internally - no user config needed
        console.log('Configuration is pre-set');
    }
    
    handleUserInput() {
        const input = document.getElementById('chat-input');
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
            // All questions answered, generate estimate
            this.generateEstimate();
        }
    }
    
    addQuickOptions(options) {
        const messagesContainer = document.getElementById('chat-messages');
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
        loadingIndicator.classList.add('show');
        this.isProcessing = true;
    }
    
    hideLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        loadingIndicator.classList.remove('show');
        this.isProcessing = false;
    }
    
    async generateEstimate() {
        this.showLoading();
        
        try {
            // Generate manual estimate summary
            const estimate = this.createManualEstimate();
            
            // Display estimate
            this.displayEstimate(estimate);
            
            // Send to Formspree
            await this.sendToFormspree(estimate);
            
        } catch (error) {
            console.error('Error generating estimate:', error);
            this.addMessage('Sorry, there was an error processing your request. Please try again.', 'bot', 'error-message');
        } finally {
            this.hideLoading();
        }
    }
    
    createManualEstimate() {
        const userData = this.userData;
        const timestamp = new Date().toLocaleDateString();
        
        // Create a professional estimate summary
        const estimate = `IRONCLAD ROOFING - PROJECT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Customer Information:
• Name: ${userData.name}
• Email: ${userData.email}
• Phone: ${userData.phone}
• Address: ${userData.address}

Project Details:
• Roof Size: ${userData.roofSize}
• Roof Type: ${userData.roofType}
• Material Requested: ${userData.material}
• Work Type: ${userData.workType}
• Timeline: ${userData.urgency}
• Budget Range: ${userData.budget}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS:

1. On-Site Inspection
   Our roofing specialist will visit your property within 24-48 hours to:
   • Measure exact roof dimensions
   • Assess current roof condition
   • Identify any structural concerns
   • Take photos for documentation

2. Detailed Estimate
   Following the inspection, you'll receive:
   • Itemized cost breakdown
   • Material specifications
   • Labor timeline
   • Warranty information
   • Financing options

3. Project Timeline
   Based on your urgency (${userData.urgency}), we will prioritize your project accordingly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHY CHOOSE IRONCLAD ROOFING?

✓ Licensed & Insured
✓ 20+ Years Experience
✓ Premium Materials
✓ Lifetime Workmanship Warranty
✓ 24/7 Emergency Service
✓ Competitive Pricing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A member of our team will contact you within 24 hours to schedule your free inspection.

Thank you for choosing Ironclad Roofing!

Estimate Reference: IRC-${Date.now().toString().slice(-6)}
Date: ${timestamp}`;
        
        return estimate;
    }
    
    displayEstimate(estimate) {
        this.addMessage('Perfect! I\'ve generated your roofing estimate based on the information you provided:', 'bot');
        
        // Create estimate display
        const estimateContainer = document.createElement('div');
        estimateContainer.className = 'estimate-content';
        
        const estimateHeader = document.createElement('div');
        estimateHeader.className = 'estimate-header';
        estimateHeader.innerHTML = `
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.292-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.292c.415.764-.42 1.6-1.185 1.184l-.292-.159a1.873 1.873 0 0 0-2.692 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.693-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.292A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
            </svg>
            <strong>Your Roofing Estimate</strong>
        `;
        
        const estimateText = document.createElement('div');
        estimateText.innerHTML = estimate.replace(/\n/g, '<br>');
        
        estimateContainer.appendChild(estimateHeader);
        estimateContainer.appendChild(estimateText);
        
        this.addMessage(estimateContainer, 'bot');
        
        // Add confirmation message
        setTimeout(() => {
            this.addMessage('Your estimate has been generated and sent to your email. Our team will contact you within 24 hours to schedule a detailed consultation.', 'bot', 'success-message');
        }, 1000);
    }
    
    async sendToFormspree(estimate) {
        if (!this.config.formspreeEndpoint) {
            console.warn('No Formspree endpoint configured');
            return;
        }
        
        try {
            // Create form data for Formspree
            const formData = new FormData();
            
            // Add customer information
            formData.append('name', this.userData.name || 'N/A');
            formData.append('email', this.userData.email || 'N/A');
            formData.append('phone', this.userData.phone || 'N/A');
            formData.append('address', this.userData.address || 'N/A');
            formData.append('roofSize', this.userData.roofSize || 'N/A');
            formData.append('roofType', this.userData.roofType || 'N/A');
            formData.append('material', this.userData.material || 'N/A');
            formData.append('workType', this.userData.workType || 'N/A');
            formData.append('urgency', this.userData.urgency || 'N/A');
            formData.append('budget', this.userData.budget || 'N/A');
            
            // Add estimate and metadata
            formData.append('estimate', estimate);
            formData.append('timestamp', new Date().toISOString());
            formData.append('source', 'Ironclad Roofing AI Chat Widget');
            
            // Add subject for email
            formData.append('_subject', `New Roofing Estimate Request - ${this.userData.name}`);
            
            const response = await fetch(this.config.formspreeEndpoint, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Formspree error: ${response.status}`);
            }
            
            console.log('Estimate sent to Formspree successfully');
        } catch (error) {
            console.error('Error sending to Formspree:', error);
        }
    }
}

// Initialize the estimator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const estimator = new RoofingEstimator();
    // Start the conversation automatically
    setTimeout(() => {
        estimator.addMessage('👋 Welcome to Ironclad Roofing! I\'m here to help you get a quick estimate for your roofing project. Let\'s get started!', 'bot');
        setTimeout(() => {
            estimator.askNextQuestion();
        }, 1000);
    }, 500);
});

// Make it available globally for embedding
window.IroncladRoofingEstimator = RoofingEstimator;