// Secure Netlify function for generating roofing estimates
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { customerData } = JSON.parse(event.body);
    
    // Validate required data
    if (!customerData || !customerData.name || !customerData.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required customer data' })
      };
    }

    // Generate AI estimate using OpenAI
    const estimate = await generateAIEstimate(customerData);
    
    // Send email to customer with their estimate
    await sendEstimateToCustomer(customerData, estimate);
    
    // Send notification to you with lead info
    await sendLeadNotification(customerData, estimate);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        success: true, 
        estimate: estimate,
        message: 'Estimate generated and sent successfully'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate estimate' })
    };
  }
};

async function generateAIEstimate(customerData) {
  const prompt = `You are a professional roofing estimator for Ironclad Roofing. Create a detailed, professional estimate for this customer:

Customer: ${customerData.name}
Address: ${customerData.address}
Roof Size: ${customerData.roofSize}
Roof Type: ${customerData.roofType}
Material: ${customerData.material}
Work Type: ${customerData.workType}
Urgency: ${customerData.urgency}
Budget: ${customerData.budget}

Provide a professional estimate including:
1. Material costs breakdown
2. Labor costs
3. Timeline
4. Total cost range
5. Next steps

Format as a professional document they can save/print.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert roofing contractor with 20+ years experience. Provide detailed, accurate estimates with realistic pricing.'
        },
        {
          role: 'user', 
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function sendEstimateToCustomer(customerData, estimate) {
  // Send estimate directly to customer using Formspree
  const formData = new FormData();
  
  // Customer gets the estimate
  formData.append('_to', customerData.email);
  formData.append('_subject', `Your Free Roofing Estimate from Ironclad Roofing`);
  formData.append('customer_name', customerData.name);
  formData.append('estimate', estimate);
  formData.append('_template', 'table');
  
  await fetch('https://formspree.io/f/xld1lenb', {
    method: 'POST',
    body: formData
  });
}

async function sendLeadNotification(customerData, estimate) {
  // Send lead info to you using Formspree
  const formData = new FormData();
  
  formData.append('_subject', `NEW LEAD: ${customerData.name} - Roofing Estimate`);
  formData.append('customer_name', customerData.name);
  formData.append('customer_email', customerData.email);
  formData.append('customer_phone', customerData.phone);
  formData.append('customer_address', customerData.address);
  formData.append('project_details', `${customerData.workType} - ${customerData.material} - ${customerData.roofSize}`);
  formData.append('urgency', customerData.urgency);
  formData.append('budget', customerData.budget);
  formData.append('ai_estimate', estimate);
  formData.append('timestamp', new Date().toISOString());
  
  await fetch('https://formspree.io/f/xld1lenb', {
    method: 'POST', 
    body: formData
  });
}