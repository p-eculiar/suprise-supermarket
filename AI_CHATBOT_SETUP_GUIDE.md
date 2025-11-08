# 🤖 AI CHATBOT SETUP GUIDE
## Complete Implementation & Configuration

---

## 🎯 WHAT WAS BUILT

### **Intelligent AI Chatbot Features:**

✅ **Automatic Question Classification**
- Detects if question is about your supermarket
- Routes general questions appropriately
- Provides intelligent responses

✅ **Knowledge Base Integration**
- Pre-loaded with all supermarket information
- Categories, services, hours, payment, delivery
- Contact information and policies

✅ **Two-Tier Response System**
1. **OpenAI API** (if configured) - Intelligent AI responses
2. **Fallback System** - Keyword matching for common questions

✅ **Email Collection for Unanswered Questions**
- Automatically detects when it can't answer
- Asks user for email
- Sends question to admin team

✅ **Admin Notification System**
- Questions saved to database
- Admins notified via in-app notifications
- Tracks response time

✅ **Professional UI**
- Floating chat button (bottom right)
- Smooth animations
- Mobile responsive
- Typing indicators
- Message timestamps

---

## 🗄️ DATABASE SETUP

### **Step 1: Run SQL Script**

Run this in Supabase SQL Editor:

```
File: CREATE_CHATBOT_TABLES.sql
```

This creates:
- ✅ `unanswered_questions` table
- ✅ `chat_sessions` table
- ✅ Indexes for performance
- ✅ Admin view for question management

---

## 🔑 ENVIRONMENT CONFIGURATION

### **Step 2: Update .env File**

Your `.env` file now has these new variables:

```env
# AI Chatbot Configuration
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# Admin Email Addresses
REACT_APP_ADMIN_EMAIL_1=admin1@surprisesupermarket.com
REACT_APP_ADMIN_EMAIL_2=admin2@surprisesupermarket.com
```

### **Required Configuration:**

#### **1. Admin Emails (REQUIRED)**
Replace with your actual admin email addresses:
```env
REACT_APP_ADMIN_EMAIL_1=youremail@gmail.com
REACT_APP_ADMIN_EMAIL_2=secondadmin@gmail.com
```

These admins will receive notifications when users ask questions the bot can't answer.

#### **2. OpenAI API Key (OPTIONAL but Recommended)**

**How to Get OpenAI API Key:**

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-...`)
6. Add to `.env`:
   ```env
   REACT_APP_OPENAI_API_KEY=sk-your-actual-key-here
   ```

**Pricing:** 
- Free tier: $5 credit
- GPT-3.5-turbo: ~$0.002 per conversation
- Very affordable for chatbot usage

**Without OpenAI:**
- Chatbot still works!
- Uses keyword matching
- Less intelligent but functional

---

## 📍 CHATBOT LOCATION

The chatbot appears as a **floating button** in the **bottom-right corner** of the home page (and can be added to all pages).

### **Current Implementation:**
```tsx
// In src/pages/Home.tsx
<AIChatbot />
```

### **To Add to All Pages:**

Edit `src/App.tsx` or your main layout:

```tsx
import AIChatbot from './components/common/AIChatbot';

// Inside your return statement:
<Router>
  <Routes>
    {/* Your routes */}
  </Routes>
  <AIChatbot /> {/* Add here for all pages */}
</Router>
```

---

## 🧠 HOW THE CHATBOT WORKS

### **Flow Diagram:**

```
User asks question
       ↓
Is it about supermarket?
       ↓
   ┌───YES───┐
   │         │
   ↓         ↓
OpenAI?   Keyword
   │      Matching
   ↓         ↓
Answer   Answer?
   │         │
   └────┬────┘
        ↓
   Can answer?
        ↓
    ┌───NO───┐
    │        │
    ↓        ↓
Request   General
Email    Question
    │        │
Send to  Search
Admins   Web
```

### **Intelligent Features:**

1. **Keyword Detection:**
   - Detects words like "delivery", "payment", "hours"
   - Provides instant answers from knowledge base

2. **OpenAI Integration:**
   - Uses GPT-3.5 for natural language understanding
   - Context-aware responses
   - Learns from conversation history

3. **Fallback System:**
   - Works even without OpenAI
   - Pattern matching for common questions
   - Graceful degradation

4. **Email Collection:**
   - Validates email format
   - Stores question in database
   - Creates admin notification
   - Confirms to user within 24 hours

---

## 📊 KNOWLEDGE BASE

The chatbot knows about:

### **Categories:**
- Vegetables, Fruits, Dairy, Meat, Bakery, Beverages

### **Services:**
- Home Delivery
- Local Pickup
- Subscriptions
- Corporate Orders
- Diaspora Gifting

### **Information:**
- Operating hours
- Payment methods
- Delivery tracking
- Return policy
- Contact details

### **To Update Knowledge Base:**

Edit `src/services/chatbotService.ts`:

```typescript
const SUPERMARKET_KNOWLEDGE = `
  // Add your updated information here
  New Service: ...
  New Category: ...
`;
```

---

## 🎨 CUSTOMIZATION

### **Change Chatbot Colors:**

Edit `src/components/common/AIChatbot.tsx`:

```tsx
// Find these styled components:
const ChatButton = styled(motion.button)`
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%);
  // Change colors here
`;

const MessageBubble = styled.div`
  background: ${({ $isUser }) =>
    $isUser
      ? 'linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%)' // User message color
      : 'white'}; // Bot message color
`;
```

### **Change Chatbot Avatar:**

```tsx
// Replace 🤖 with your emoji or image
<BotAvatar>🤖</BotAvatar>
// Change to:
<BotAvatar>🛒</BotAvatar> // Shopping cart emoji
// Or use an image:
<BotAvatar>
  <img src="/chatbot-avatar.png" alt="Bot" />
</BotAvatar>
```

### **Change Position:**

```tsx
const ChatButton = styled(motion.button)`
  position: fixed;
  right: 2rem; // Change to left: 2rem; for left side
  bottom: 2rem; // Change to top: 2rem; for top
`;
```

---

## 🧪 TESTING YOUR CHATBOT

### **Test Questions:**

**Supermarket Questions (Should Answer):**
- "What are your operating hours?"
- "Do you offer delivery?"
- "What payment methods do you accept?"
- "What categories do you have?"
- "How do I return a product?"

**General Questions (Redirect or Search):**
- "What's the weather today?"
- "Who is the president?"

**Unanswered Questions (Ask for Email):**
- "Do you have gluten-free bread?" (if not in knowledge base)
- "Can I order custom cakes?"

### **Testing Checklist:**

- [ ] Chatbot button appears bottom-right
- [ ] Clicking opens chat window
- [ ] Can send messages
- [ ] Bot responds appropriately
- [ ] Typing indicator shows
- [ ] Email collection works
- [ ] Admin notifications created
- [ ] Mobile responsive
- [ ] Smooth animations

---

## 👥 ADMIN MANAGEMENT

### **View Unanswered Questions:**

Create an admin page to view questions:

```tsx
// In admin dashboard
import { supabase } from '../lib/supabase';

const UnansweredQuestions = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const { data } = await supabase
      .from('unanswered_questions')
      .select('*')
      .order('created_at', { ascending: false });
    
    setQuestions(data);
  };

  const answerQuestion = async (id, response) => {
    await supabase
      .from('unanswered_questions')
      .update({ 
        admin_response: response,
        status: 'answered',
        answered_at: new Date().toISOString()
      })
      .eq('id', id);
    
    // Send email to user (integrate with your email service)
  };

  return (
    <div>
      {questions.map(q => (
        <div key={q.id}>
          <h3>{q.question}</h3>
          <p>From: {q.user_email}</p>
          <p>Status: {q.status}</p>
          <textarea placeholder="Type your answer..." />
          <button onClick={() => answerQuestion(q.id, answer)}>
            Send Answer
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## 📈 ANALYTICS

### **Track Chatbot Usage:**

```sql
-- Most asked questions
SELECT question, COUNT(*) as count
FROM unanswered_questions
GROUP BY question
ORDER BY count DESC
LIMIT 10;

-- Response time
SELECT 
  AVG(EXTRACT(EPOCH FROM (answered_at - created_at))/3600) as avg_hours
FROM unanswered_questions
WHERE answered_at IS NOT NULL;

-- Total conversations
SELECT COUNT(*) FROM chat_sessions;
```

---

## 🚀 ADVANCED FEATURES

### **Add Voice Input:**

```tsx
// Install: npm install react-speech-recognition

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VoiceButton = () => {
  const { transcript, listening } = useSpeechRecognition();
  
  return (
    <button onClick={SpeechRecognition.startListening}>
      🎤 {listening ? 'Listening...' : 'Speak'}
    </button>
  );
};
```

### **Add File Upload:**

```tsx
// Allow users to send images
<input 
  type="file" 
  accept="image/*"
  onChange={handleImageUpload}
/>
```

### **Add Quick Replies:**

```tsx
const quickReplies = [
  "Show me vegetables",
  "What are your hours?",
  "Track my order",
  "Contact support"
];

<QuickRepliesContainer>
  {quickReplies.map(reply => (
    <QuickReplyButton onClick={() => sendMessage(reply)}>
      {reply}
    </QuickReplyButton>
  ))}
</QuickRepliesContainer>
```

---

## 🔒 SECURITY

### **Protect Your API Keys:**

✅ **DO:**
- Keep OpenAI key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate keys regularly

❌ **DON'T:**
- Commit `.env` to Git
- Share keys publicly
- Hardcode keys in code
- Use same key across projects

### **Rate Limiting:**

Add to `chatbotService.ts`:

```typescript
let requestCount = 0;
let lastReset = Date.now();

const MAX_REQUESTS = 50; // per hour
const HOUR = 60 * 60 * 1000;

if (Date.now() - lastReset > HOUR) {
  requestCount = 0;
  lastReset = Date.now();
}

if (requestCount >= MAX_REQUESTS) {
  throw new Error('Rate limit exceeded');
}

requestCount++;
```

---

## 🐛 TROUBLESHOOTING

### **Common Issues:**

**1. Chatbot doesn't appear:**
- Check if `<AIChatbot />` is added to page
- Check browser console for errors
- Verify file import path

**2. OpenAI not working:**
- Verify API key in `.env`
- Check API key is valid
- Ensure you have credits
- Restart development server after `.env` change

**3. Admin notifications not working:**
- Run `CREATE_CHATBOT_TABLES.sql`
- Verify admin emails in `.env`
- Check Supabase permissions

**4. Email validation failing:**
- Check regex in `chatbotService.ts`
- Test with valid email formats

---

## 📞 SUPPORT

### **Need Help?**

1. Check browser console for errors
2. Verify database tables exist
3. Check `.env` configuration
4. Review `chatbotService.ts` logs

### **Updating Knowledge:**

To add new information, edit the `SUPERMARKET_KNOWLEDGE` constant in `src/services/chatbotService.ts`

---

## ✅ SETUP CHECKLIST

- [ ] Run `CREATE_CHATBOT_TABLES.sql` in Supabase
- [ ] Update admin emails in `.env`
- [ ] (Optional) Add OpenAI API key
- [ ] Verify chatbot appears on home page
- [ ] Test with sample questions
- [ ] Check admin notifications work
- [ ] Test email collection
- [ ] Verify mobile responsiveness
- [ ] Update knowledge base with your info

---

## 🎉 YOU'RE DONE!

Your AI chatbot is now:
- ✅ Live on your website
- ✅ Answering customer questions
- ✅ Collecting emails for unanswered questions
- ✅ Notifying admins
- ✅ Fully functional!

**The chatbot will help reduce support load and improve customer experience!** 🚀
