# Simple email proxy server using Python Flask
# This is an alternative to the Node.js version

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.proxy')

app = Flask(__name__)
CORS(app)

RESEND_API_KEY = os.getenv('RESEND_API_KEY')
FROM_EMAIL = os.getenv('FROM_EMAIL', 'onboarding@resend.dev')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'timestamp': __import__('datetime').datetime.utcnow().isoformat(),
        'resendApiKeyConfigured': bool(RESEND_API_KEY)
    })

@app.route('/send-email', methods=['POST', 'OPTIONS'])
def send_email():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        print(f"Received email request: {data}")
        
        # Validate input
        if not data or not data.get('to') or not data.get('subject') or not data.get('html'):
            return jsonify({'error': 'Missing required fields: to, subject, html'}), 400
        
        # Prepare request to Resend API
        resend_data = {
            'from': data.get('from', FROM_EMAIL),
            'to': data['to'] if isinstance(data['to'], list) else [data['to']],
            'subject': data['subject'],
            'html': data['html']
        }
        
        # Check if Resend is properly configured
        if not RESEND_API_KEY:
            return jsonify({
                'error': 'Resend API key not configured',
                'details': 'Please set RESEND_API_KEY in environment variables'
            }), 500
        
        # Send email using Resend API
        headers = {
            'Authorization': f'Bearer {RESEND_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            'https://api.resend.com/emails',
            json=resend_data,
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"Email sent successfully: {result}")
            return jsonify({'success': True, 'data': result})
        else:
            error_text = response.text
            print(f"Email sending failed: {error_text}")
            return jsonify({'error': 'Failed to send email', 'details': error_text}), response.status_code
            
    except Exception as error:
        print(f"Email sending error: {error}")
        return jsonify({'error': 'Failed to send email', 'details': str(error)}), 500

if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 3001))
    print(f"Email proxy server running on port {PORT}")
    print(f"Health check: http://localhost:{PORT}/health")
    print(f"Send email endpoint: http://localhost:{PORT}/send-email")
    
    # Check if API key is configured
    if not RESEND_API_KEY:
        print("WARNING: RESEND_API_KEY is not set in environment variables")
        print("Email sending will not work until you configure the API key")
    else:
        print("Resend API key is configured correctly")
    
    app.run(host='0.0.0.0', port=PORT, debug=False)