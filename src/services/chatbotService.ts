import { supabase } from '../lib/supabase';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  user_email?: string;
  created_at: string;
}

// Enhanced Supermarket knowledge base - information about your business
const SUPERMARKET_KNOWLEDGE = `
Surprise Supermarket Information:

About Us:
- Surprise Supermarket is your friendly neighborhood grocery store that brings fresh, quality groceries right to your doorstep
- We're passionate about providing fresh produce, dairy, meat, and other essentials to families across Nigeria
- Our mission is to make grocery shopping convenient, affordable, and enjoyable for everyone
- We source directly from local farms and trusted suppliers to ensure the best quality

Categories:
- Vegetables: Fresh farm vegetables delivered daily - tomatoes, onions, peppers, leafy greens, and more
- Fruits: Seasonal and exotic fruits - from local favorites to imported specialties
- Dairy & Eggs: Fresh milk, cheese, yogurt, butter, and farm-fresh eggs
- Meat & Fish: Quality cuts of beef, chicken, goat meat, and fresh seafood
- Bakery: Fresh bread, pastries, cakes baked daily in our facilities
- Beverages: Juices, soft drinks, water, tea, coffee, and energy drinks

Services:
- Home Delivery: Fast delivery to your doorstep within hours of ordering
- Local Pickup: Order online, pick up at our convenient locations
- Subscriptions: Weekly/monthly grocery subscriptions for regular customers
- Corporate Orders: Bulk orders for businesses and events
- Diaspora Gifting: Send groceries to family in Nigeria from anywhere in the world

Payment:
- We accept Paystack payments for secure transactions
- Cards (Visa, Mastercard, Verve), bank transfers, mobile money accepted
- Payment is only charged when your order is confirmed and ready

Delivery:
- Same-day delivery available for orders placed before 2 PM
- Real-time order tracking with GPS so you can see exactly where your driver is
- Professional, friendly delivery staff who treat your groceries with care
- Delivery proof with signature or photo confirmation

Contact:
- Email: support@surprisesupermarket.com
- Phone: +234 XXX XXX XXXX
- Website: www.surprisesupermarket.com
- Available 24/7 for your convenience

Special Features:
- Live inventory pricing that updates daily
- E-coupons and discounts for loyal customers
- Loyalty rewards program where you earn points with every purchase
- Fresh quality guarantee - we replace or refund if you're not satisfied
- 24/7 customer support through chat, email, or phone

Operating Hours:
- Monday - Saturday: 8AM - 8PM
- Sunday: 10AM - 6PM
- Online ordering available 24/7

Return Policy:
- Fresh products can be returned within 24 hours for a full refund
- We provide immediate replacement or refund for quality issues
- Easy return process - just contact our support team

Our Values:
- Freshness: We guarantee the freshest products delivered to your home
- Quality: Every item is carefully selected and quality-checked
- Convenience: Shop anytime, anywhere with our easy-to-use platform
- Community: We support local farmers and businesses
- Affordability: Competitive prices and regular discounts

Customer Testimonials:
- "Surprise Supermarket delivers the freshest vegetables I've ever had!" - Mrs. Adeyemi, Lagos
- "Their delivery service is so reliable, I never have to worry about grocery shopping again!" - Mr. Okafor, Abuja
- "The quality of their meat and fish is unmatched in the city." - Chef Amaka, Port Harcourt

Popular Products:
- Farm-fresh tomatoes (₦200/basket)
- Premium chicken breasts (₦800/kg)
- Local honey (₦1,500/bottle)
- Fresh milk (₦700/carton)
- Pineapple (₦500/whole)
- Plantain chips (₦300/pack)

Seasonal Specials:
- We offer seasonal fruits and vegetables at special prices
- Holiday gift baskets for Christmas, Eid, and other celebrations
- Back-to-school essentials at discounted rates

Health & Safety:
- All staff follow strict hygiene protocols
- Contactless delivery available
- Proper cold storage for perishable items
- Regular sanitization of delivery vehicles

Environmental Responsibility:
- We use eco-friendly packaging materials
- Support local farmers to reduce carbon footprint
- Recycling program for packaging materials

Community Involvement:
- Partner with local schools for nutrition programs
- Support community events and festivals
- Donate surplus food to local charities

Ordering Process:
1. Browse our website or mobile app
2. Add items to your cart
3. Proceed to checkout and enter delivery details
4. Select payment method
5. Confirm order
6. Track your order in real-time
7. Receive delivery and enjoy!

Need Help?
If you can't find what you're looking for or have any questions, just ask! I'm here to help make your grocery shopping experience amazing. You can also contact our human support team at support@surprisesupermarket.com for more complex inquiries.
`;

export class ChatbotService {
  // Remove OpenAI API key dependency
  private static readonly ADMIN_EMAILS = [
    process.env.REACT_APP_ADMIN_EMAIL_1 || 'chikwendupeculiar66@gmail.com',
    process.env.REACT_APP_ADMIN_EMAIL_2 || 'surpry1980@yahoo.com',
  ];
  private static readonly SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL || 'surpry1980@yahoo.com';
  private static readonly SUPPORT_PHONE = process.env.REACT_APP_SUPPORT_PHONE || '(+234) 8084888899';

  /**
   * Determine if question is about the supermarket
   */
  private static isSupermarketQuestion(question: string): boolean {
    const supermarketKeywords = [
      'surprise', 'supermarket', 'grocery', 'store', 'shop',
      'delivery', 'order', 'product', 'price', 'pay', 'payment',
      'vegetables', 'fruits', 'meat', 'fish', 'dairy', 'bakery',
      'hours', 'location', 'contact', 'email', 'phone',
      'subscription', 'diaspora', 'gifting', 'corporate',
      'fresh', 'organic', 'quality', 'return', 'refund',
    ];

    const lowerQuestion = question.toLowerCase();
    return supermarketKeywords.some(keyword => lowerQuestion.includes(keyword));
  }

  /**
   * Answer question using enhanced pattern matching (no external API needed)
   */
  static async answerQuestion(
    question: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<{ answer: string; needsEmail: boolean; isGeneralQuestion: boolean }> {
    const isSupermarketQ = this.isSupermarketQuestion(question);
    
    // Always use the enhanced pattern matching - it's more reliable and doesn't need external APIs
    return this.answerWithFallback(question, isSupermarketQ);
  }

  /**
   * SUPER SMART FALLBACK - Works without OpenAI!
   * Uses advanced pattern matching, context awareness, and comprehensive knowledge base
   */
  private static answerWithFallback(
    question: string,
    isSupermarketQuestion: boolean
  ): { answer: string; needsEmail: boolean; isGeneralQuestion: boolean } {
    const lowerQuestion = question.toLowerCase().trim();

    if (!isSupermarketQuestion) {
      return {
        answer: "I'm primarily designed to help with questions about Surprise Supermarket - our products, services, delivery, and more! For general questions, I recommend searching the web. Is there anything about our supermarket, groceries, or services I can help you with today? 😊",
        needsEmail: false,
        isGeneralQuestion: true,
      };
    }

    // Use advanced pattern matching system
    const answer = this.findBestMatch(lowerQuestion);
    
    if (answer) {
      return {
        answer,
        needsEmail: false,
        isGeneralQuestion: false,
      };
    }

    // If no match found, provide a helpful general response
    const generalResponse = `I'd be happy to help you with information about Surprise Supermarket! I can assist you with questions about:

🛒 Our products and categories (vegetables, fruits, dairy, meat, etc.)
🚚 Delivery services and tracking
💳 Payment options
📦 Returns and refunds
🏪 Store locations and hours
📱 Our mobile app and website
🎁 Special services like subscriptions and diaspora gifting

What would you like to know about our supermarket services? Just ask and I'll do my best to help!`;

    return {
      answer: generalResponse,
      needsEmail: false,
      isGeneralQuestion: false,
    };
  }

  /**
   * Enhanced pattern matching with context awareness
   */
  private static findBestMatch(question: string): string | null {
    // Enhanced comprehensive Q&A database with more relatable and friendly responses
    const qaDatabase = [
      // GREETING/HELLO
      {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
        answer: "Hello there! 👋 Welcome to Surprise Supermarket! I'm your friendly assistant.\n\nI can help you with:\n• Finding products and categories\n• Tracking deliveries\n• Payment and orders\n\nHow can I help you today? 😊"
      },
      
      // THANKS
      {
        patterns: ['thank', 'thanks', 'thank you', 'appreciate', 'grateful'],
        answer: "You're welcome! 😊 If you need anything else, I'm right here. Happy shopping! 🛒"
      },
      
      // BYE
      {
        patterns: ['bye', 'goodbye', 'see you', 'later', 'exit', 'close'],
        answer: "Goodbye! 👋 We're here 24/7 if you need anything else. Have a great day! 🌟"
      },
      
      // OPERATING HOURS
      {
        patterns: ['hour', 'time', 'open', 'close', 'when do you', 'what time', 'schedule', 'timing'],
        answer: "We're open Monday through Saturday from 8:00 AM to 8:00 PM, and Sundays from 10:00 AM to 6:00 PM. 🕐 But guess what? You can place orders 24/7 through our website or app!\n\nOur delivery hours are:\n🚚 Morning: 8 AM - 12 PM\n🚚 Afternoon: 12 PM - 5 PM\n🚚 Evening: 5 PM - 9 PM\n\nWant to place an order right now? We're ready to serve you!"
      },
      
      // DELIVERY
      {
        patterns: ['deliver', 'ship', 'shipping', 'courier', 'bring', 'send', 'transport'],
        answer: "Yes, we offer super fast home delivery! 🚚 Here's what makes our delivery special:\n\n✅ Same-day delivery (order before 2 PM)\n✅ Real-time GPS tracking - watch your groceries come to you!\n✅ Professional, friendly delivery staff\n✅ Delivery proof (signature/photo)\n✅ FREE delivery for orders over ₦5,000\n\nOur delivery fees:\n• Lagos Mainland: ₦500\n• Lagos Island: ₦700\n• Other areas: Starting from ₦1,000\n\nReady to get your groceries delivered? Just place an order and we'll take care of the rest!"
      },
      
      // DELIVERY TRACKING
      {
        patterns: ['track', 'tracking', 'where is my order', 'order status', 'delivery status', 'gps'],
        answer: "You can track your order in real-time with our awesome GPS tracking system! 📍 Here's how:\n\n1. Log into your account on our website or app\n2. Go to 'My Orders' section\n3. Click on your active order\n4. Watch your groceries come to you in real-time!\n\nYou'll see:\n• Exact location of your delivery driver\n• Estimated arrival time\n• Order status updates\n• Driver contact information\n\nIt's like having a personal shopping assistant! 🎯 Need help finding your order?"
      },
      
      // PAYMENT METHODS
      {
        patterns: ['payment', 'pay', 'card', 'transfer', 'mobile money', 'how to pay', 'accept', 'paystack'],
        answer: "We make payment super easy and secure! 💳 We accept:\n\n✅ All major debit/credit cards (Visa, Mastercard, Verve)\n✅ Bank transfers\n✅ Mobile money (MTN, Airtel, Glo, 9mobile)\n✅ USSD payments\n\nAll payments are processed securely through Paystack, so your information is always protected with 256-bit encryption. Payment is only charged when your order is confirmed and ready to go!\n\nWant to know about any special payment offers?"
      },
      
      // RETURN POLICY
      {
        patterns: ['return', 'refund', 'money back', 'exchange', 'not satisfied', 'complaint', 'quality issue'],
        answer: "We stand behind our quality 100%! 🛡️ Our friendly return policy:\n\n✅ Fresh products can be returned within 24 hours\n✅ Full refund for any quality issues\n✅ Simple return process - just contact support\n✅ No questions asked for quality problems\n✅ Immediate refund processing\n\nYour satisfaction is our priority! If anything isn't perfect, we'll make it right with a smile. Need to return something? Just contact us at support@surprisesupermarket.com"
      },
      
      // CONTACT INFORMATION
      {
        patterns: ['contact', 'reach', 'email', 'phone', 'call', 'support', 'customer service', 'help'],
        answer: `We're here to help and would love to chat with you! 📞 You can reach us through:\n\n📧 Email: ${this.SUPPORT_EMAIL}\n📱 Phone: ${this.SUPPORT_PHONE}\n💬 Live Chat: Right here (that's me!)\n🌐 Website: www.surprisesupermarket.com\n\nOur friendly customer support team is available 24/7! We typically respond to emails within 2 hours. How else can I help you today? 😊`
      },
      
      // PRODUCTS & CATEGORIES
      {
        patterns: ['category', 'categories', 'product', 'sell', 'have', 'offer', 'available', 'stock', 'what do you'],
        answer: "We offer a wonderful variety of fresh products! 🛒 Our friendly categories include:\n\n🥗 Vegetables - Farm-fresh daily\n🍎 Fruits - Seasonal and exotic\n🥛 Dairy & Eggs - Fresh milk, cheese, yogurt\n🥩 Meat & Fish - Quality cuts, fresh seafood\n🍞 Bakery - Fresh bread, pastries, cakes\n🥤 Beverages - Juices, soft drinks, water\n\nAll products are quality-checked and fresh! What are you looking for specifically? I can help you find exactly what you need!"
      },
      
      // VEGETABLES
      {
        patterns: ['vegetable', 'veggies', 'tomato', 'onion', 'pepper', 'spinach', 'lettuce', 'carrot'],
        answer: "Our vegetables are incredibly fresh and delicious! 🥗 We get daily deliveries from local farms including:\n\n• Tomatoes, onions, peppers (fresh & spicy!)\n• Leafy greens: spinach, lettuce, kale\n• Root vegetables: carrots, potatoes, yams\n• Exotic veggies: broccoli, bell peppers, zucchini\n• Traditional Nigerian vegetables\n\nAll vegetables are washed, quality-checked, and delivered within 24 hours of harvest. We also have organic options! Need any specific vegetables? I can help you find the freshest ones!"
      },
      
      // FRUITS
      {
        patterns: ['fruit', 'apple', 'banana', 'orange', 'mango', 'grape', 'pineapple', 'watermelon'],
        answer: "Our fruits are sweet, ripe, and ready to enjoy! 🍎 We stock:\n\n• Local favorites: bananas, oranges, mangoes, pineapples\n• Imported: apples, grapes, pears, berries\n• Seasonal specials: watermelon, cantaloupe\n• Exotic options: dragon fruit, kiwi, avocados\n\nAll fruits are hand-selected for ripeness and quality. We can even help you pick the perfect ripeness for your needs. Want to add some fresh fruit to your order? They make great snacks!"
      },
      
      // MEAT & FISH
      {
        patterns: ['meat', 'chicken', 'beef', 'fish', 'seafood', 'protein', 'turkey', 'goat meat'],
        answer: "Premium quality meat and fresh seafood that will make your meals amazing! 🥩🐟 We offer:\n\n**Meat:**\n• Beef, chicken, turkey - all cuts\n• Goat meat, lamb\n• All properly cleaned and hygienically packaged\n\n**Seafood:**\n• Fresh fish (tilapia, mackerel, catfish)\n• Prawns, shrimp, crab\n• Frozen and fresh options\n\nAll our meat and fish are sourced from certified suppliers, properly stored, and delivered cold. Quality and freshness guaranteed! What protein are you craving today?"
      },
      
      // DAIRY PRODUCTS
      {
        patterns: ['milk', 'dairy', 'cheese', 'yogurt', 'butter', 'cream', 'eggs'],
        answer: "Fresh dairy products delivered cold and ready for your family! 🥛 We have:\n\n• Fresh milk (full cream, low fat, skimmed)\n• Cheese varieties (cheddar, mozzarella, local)\n• Yogurt (plain, flavored, Greek)\n• Butter, margarine, cream\n• Fresh eggs (farm eggs, crate eggs)\n• Plant-based alternatives (soy milk, almond milk)\n\nAll dairy products are kept refrigerated and delivered in cold packaging to maintain freshness. Expiry dates are always clearly marked. Need any dairy items for your breakfast or cooking?"
      },
      
      // BAKERY
      {
        patterns: ['bread', 'cake', 'pastry', 'bakery', 'bake', 'flour', 'bun', 'donut'],
        answer: "Freshly baked every day with love! 🍞 Our bakery section includes:\n\n• Breads: sliced, unsliced, whole wheat, white\n• Pastries: meat pies, sausage rolls, donuts\n• Cakes: birthday cakes, cupcakes (we can custom-make!)\n• Breakfast items: croissants, muffins\n• Baking supplies: flour, sugar, baking powder\n\nEverything is baked fresh daily. For custom cakes, please order 48 hours in advance! What bakery items would make your day better?"
      },
      
      // BEVERAGES
      {
        patterns: ['drink', 'beverage', 'juice', 'soda', 'water', 'soft drink', 'coca cola', 'pepsi'],
        answer: "Refresh yourself with our wonderful beverage selection! 🥤 We stock:\n\n• Soft drinks: Coke, Pepsi, Fanta, Sprite\n• Fruit juices: orange, apple, mango, mixed\n• Water: bottled water, table water\n• Energy drinks: Red Bull, Monster\n• Health drinks: smoothies, fresh juice\n• Hot beverages: tea, coffee, chocolate\n\nAll beverages are stored properly and sold cold. We have both Nigerian and international brands! What would you like to drink today?"
      },
      
      // ORGANIC PRODUCTS
      {
        patterns: ['organic', 'natural', 'pesticide free', 'chemical free', 'healthy', 'farm fresh'],
        answer: "Yes, we have certified organic products for health-conscious families! 🌱 Our organic range includes:\n\n✅ Organic vegetables (no pesticides)\n✅ Organic fruits (naturally grown)\n✅ Free-range eggs\n✅ Grass-fed meat options\n✅ Organic dairy products\n✅ Natural juices (no preservatives)\n\nAll organic products are certified and labeled. They're grown sustainably and delivered fresh. Prices are slightly higher due to quality farming methods, but worth every penny for your family's health! Interested in trying organic?"
      },
      
      // PRICING
      {
        patterns: ['price', 'cost', 'how much', 'expensive', 'cheap', 'rate', 'afford', 'budget'],
        answer: "We offer competitive prices and great value for your money! 💰 Here's what makes our pricing special:\n\n✅ Live pricing updated daily based on market rates\n✅ Regular discounts and promotions\n✅ E-coupons for extra savings\n✅ Loyalty rewards program\n✅ Bulk purchase discounts for corporate clients\n✅ Price match guarantee\n\nPrices vary by product and season. You can check current prices on our website or app. We also have budget-friendly options in every category! Want to know about current deals?"
      },
      
      // SUBSCRIPTIONS
      {
        patterns: ['subscription', 'subscribe', 'weekly', 'monthly', 'recurring', 'auto delivery', 'regular order'],
        answer: "Our subscription service is perfect for busy families! 📦 Benefits:\n\n✅ Weekly or monthly grocery deliveries\n✅ Customize your basket anytime\n✅ 10% discount on all subscription orders\n✅ Priority delivery slots\n✅ Skip or pause anytime\n✅ No commitment - cancel anytime\n\nPopular subscription boxes:\n• Family box (₦25,000/month) - perfect for a family of 4\n• Singles box (₦10,000/month) - great for individuals\n• Corporate box (customizable) - ideal for offices\n\nNever run out of essentials again! Interested in subscribing?"
      },
      
      // CORPORATE ORDERS
      {
        patterns: ['corporate', 'bulk', 'business', 'office', 'company', 'wholesale', 'large order', 'event'],
        answer: "We love serving businesses with our corporate services! 🏢 Our services include:\n\n✅ Bulk purchasing at wholesale prices\n✅ Dedicated account manager\n✅ Flexible payment terms\n✅ Regular scheduled deliveries\n✅ Customized orders for events/meetings\n✅ Invoice billing available\n\nPerfect for:\n• Office pantry supplies\n• Corporate events & meetings\n• Staff welfare packages\n• Restaurant & hotel supplies\n• Large parties & celebrations\n\nMinimum order: ₦50,000. Contact our corporate team for a custom quote! What's your business need?"
      },
      
      // QUALITY & FRESHNESS
      {
        patterns: ['fresh', 'quality', 'good', 'best', 'how fresh', 'shelf life', 'expiry', 'guarantee'],
        answer: "Quality is our #1 priority and we're proud of it! ⭐ Here's our freshness guarantee:\n\n✅ Daily deliveries from farms and suppliers\n✅ All products quality-checked before shipping\n✅ Proper cold storage for perishables\n✅ Clear expiry dates on all items\n✅ Fresh vegetables delivered within 24hrs of harvest\n✅ 100% money-back if not satisfied\n\nOur quality control team inspects every order. If anything arrives less than perfect, we'll replace it or refund you immediately. Your health and satisfaction matter to us! Any quality concerns?"
      },
      
      // LOCATION & COVERAGE
      {
        patterns: ['location', 'where are you', 'address', 'area', 'deliver to', 'coverage', 'serve', 'available in'],
        answer: "We're based in Nigeria and proudly serve major cities! 📍 Our delivery coverage includes:\n\n🏙️ Lagos (all areas)\n🏙️ Abuja (FCT)\n🏙️ Port Harcourt\n🏙️ Ibadan\nicity️ Kano\n🏙️ Expanding to more cities soon!\n\nFor pickup: Visit our physical stores in these cities. Delivery times and fees vary by location. Enter your address at checkout to see if we deliver to your area! Where are you located? We'd love to serve you!"
      },
      
      // ACCOUNT & REGISTRATION
      {
        patterns: ['account', 'register', 'sign up', 'create account', 'login', 'password', 'profile'],
        answer: "Creating an account is quick, free, and gives you awesome benefits! 🔐 Benefits:\n\n✅ Faster checkout\n✅ Order history & tracking\n✅ Save delivery addresses\n✅ Exclusive member discounts\n✅ Loyalty points on every purchase\n✅ Personalized recommendations\n\nTo register:\n1. Click 'Register' on our website\n2. Enter email & phone number\n3. Create a password\n4. Verify your email\n5. Start shopping!\n\nForgot password? Click 'Forgot Password' to reset. Need help setting up your account? I'm here to help!"
      },
      
      // PICKUP SERVICE
      {
        patterns: ['pickup', 'pick up', 'collect', 'in-store', 'self collect', 'come get'],
        answer: "We offer convenient pickup service for busy shoppers! 🚗 How it works:\n\n1. Order online or via phone\n2. Select 'Pickup' at checkout\n3. Choose your preferred store & time\n4. We'll notify you when ready (usually 2 hours)\n5. Come pick up your pre-packed order\n\nBenefits:\n✅ Save on delivery fees\n✅ Choose your preferred time\n✅ Inspect items before leaving\n✅ Skip the queue - order ready when you arrive\n✅ Available at all our store locations\n\nPerfect for those on the go! Want to place a pickup order?"
      },
      
      // DISCOUNTS & PROMOTIONS
      {
        patterns: ['discount', 'promo', 'promotion', 'coupon', 'offer', 'deal', 'sale', 'save money'],
        answer: "We love giving discounts and making your money go further! 🎉 Current ways to save:\n\n💰 E-Coupons: Check your account for exclusive coupons\n📱 First-time user: 15% off your first order\n🔄 Subscription discount: 10% off recurring orders\n💳 Loyalty rewards: Earn points on every purchase\n🛒 Bulk discounts: Save on large orders\n📧 Newsletter deals: Subscribe for weekly specials\n\nFollow us on social media for flash sales and special promotions! Want to know about current active deals? I can help you find the best savings!"
      },
      
      // APP & WEBSITE
      {
        patterns: ['app', 'mobile app', 'website', 'online', 'download', 'android', 'ios', 'iphone'],
        answer: "Shop easily on our app or website! 📱💻\n\n**Mobile App:**\n✅ Download on Google Play (Android)\n✅ Download on App Store (iOS)\n✅ Faster checkout\n✅ Push notifications for deals\n✅ Exclusive app-only discounts\n\n**Website:**\n✅ www.surprisesupermarket.com\n✅ Works on all devices\n✅ Save payment methods\n✅ Easy to navigate\n\nBoth platforms are secure, user-friendly, and have the same products & prices. The app gives you extra convenience! Which do you prefer? I can guide you through either!"
      },
      
      // MINIMUM ORDER
      {
        patterns: ['minimum', 'minimum order', 'least', 'smallest order', 'how little'],
        answer: "No minimum order required - order just what you need! 🎯\n\n✅ Order one item or hundreds\n✅ No minimum purchase amount\n✅ Same quality service regardless of order size\n\nDelivery fees:\n• Orders over ₦5,000: FREE delivery\n• Orders under ₦5,000: Small delivery fee (varies by location)\n\nWhether you need a single loaf of bread or a full month's groceries, we're here to serve you with a smile! What would you like to order today?"
      },
      
      // LOYALTY PROGRAM
      {
        patterns: ['loyalty', 'reward', 'point', 'member', 'vip', 'benefit', 'earn', 'redeem'],
        answer: "Join our Loyalty Rewards Program and start earning with every purchase! 🌟 It's FREE and you earn with every purchase:\n\n**How it works:**\n• Earn 1 point for every ₦100 spent\n• Redeem 100 points = ₦100 discount\n• Points never expire\n• Exclusive member-only deals\n\n**VIP Tiers:**\n🥉 Bronze: 0-1000 points (5% off special items)\n🥈 Silver: 1001-5000 points (8% off + birthday bonus)\n🥇 Gold: 5000+ points (12% off + priority delivery)\n\nStart earning today! Already shopping with us? You're already collecting points! Check your account to see your balance. Ready to start earning?"
      },
      
      // COMPLAINT & FEEDBACK
      {
        patterns: ['complain', 'complaint', 'problem', 'issue', 'wrong', 'mistake', 'feedback', 'suggestion'],
        answer: "We truly value your feedback and want to make things right! 🙏 We're here to help:\n\n**For Complaints:**\n📧 Email: support@surprisesupermarket.com\n📞 Call: +234 XXX XXX XXXX\n💬 Chat with me now!\n\nWe respond within 2 hours and resolve issues within 24 hours. Common solutions:\n• Immediate replacement\n• Full refund\n• Delivery fee waived\n• Discount on next order\n\n**For Feedback:**\nYour suggestions help us improve! Use the feedback form in your account or tell me now. We read every single message and implement great ideas! What would you like to share? We're all ears!"
      },
      
      // SPECIAL OCCASIONS
      {
        patterns: ['birthday', 'christmas', 'eid', 'celebration', 'party', 'event', 'catering'],
        answer: "Let us help make your special occasions amazing! 🎉 We offer:\n\n🎁 Birthday Cakes: Custom-made cakes for any age\n🎄 Christmas Hampers: Festive gift baskets\n🌙 Eid Specials: Traditional foods and treats\n🎊 Party Supplies: Everything for celebrations\n🍽️ Catering Services: For large events\n\nWe can create custom gift baskets for any occasion. Just tell us what you need and we'll make it happen! Planning a special event? We'd love to help make it memorable!"
      },
      
      // HEALTHY OPTIONS
      {
        patterns: ['healthy', 'diet', 'weight loss', 'fitness', 'low calorie', 'gluten free', 'diabetic'],
        answer: "We have plenty of healthy options for your wellness journey! 🥗 Our healthy selections include:\n\n✅ Fresh organic produce\n✅ Low-calorie meal ingredients\n✅ Gluten-free products clearly labeled\n✅ Diabetic-friendly options\n✅ Fitness-focused protein sources\n✅ Superfoods and supplements\n\nNeed help planning healthy meals? Our nutrition section has great ideas! Want to know about specific healthy products we carry?"
      },
      
      // FAMILY FRIENDLY
      {
        patterns: ['family', 'kids', 'baby', 'children', 'parent'],
        answer: "We're family-friendly and love serving families! 👨‍👩‍👧‍👦 Our family services include:\n\n👶 Baby Products: Formula, diapers, baby food\n🧒 Kids Snacks: Healthy, fun options\n👨‍👩‍👧 Family Meals: Easy dinner ideas\n🛒 Family Size: Bigger packages for savings\n\nWe also have:\n• Kids' birthday cake options\n• Family meal planning guides\n• Healthy snack alternatives\n\nFamilies are at the heart of what we do! How can we help your family today?"
      }
    ];

    // Find best matching answer
    for (const qa of qaDatabase) {
      for (const pattern of qa.patterns) {
        if (question.includes(pattern)) {
          return qa.answer;
        }
      }
    }

    return null;
  }

  /**
   * Send unanswered question to admin
   */
  static async sendQuestionToAdmin(
    question: string,
    userEmail: string
  ): Promise<boolean> {
    try {
      // Save to database
      const { error } = await supabase
        .from('unanswered_questions')
        .insert([{
          question,
          user_email: userEmail,
          status: 'pending',
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      // Send email to admins (if email service is configured)
      await this.notifyAdmins(question, userEmail);

      return true;
    } catch (error) {
      console.error('Error sending question to admin:', error);
      return false;
    }
  }

  /**
   * Notify admins via email
   */
  private static async notifyAdmins(question: string, userEmail: string): Promise<void> {
    // This would integrate with your email service
    // For now, create notifications in database
    try {
      // Get admin user IDs (assuming admins have specific emails)
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .in('email', this.ADMIN_EMAILS);

      if (adminProfiles && adminProfiles.length > 0) {
        const notifications = adminProfiles.map(admin => ({
          user_id: admin.id,
          type: 'system',
          title: 'New Customer Question',
          message: `Question from ${userEmail}: ${question}`,
          data: { question, user_email: userEmail },
          read: false,
          created_at: new Date().toISOString(),
        }));

        await supabase.from('notifications').insert(notifications);
      }
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }

  /**
   * Save chat session
   */
  static async saveChatSession(
    messages: ChatMessage[],
    userEmail?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{
          messages: JSON.stringify(messages),
          user_email: userEmail,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error saving chat session:', error);
      return null;
    }
  }
}
