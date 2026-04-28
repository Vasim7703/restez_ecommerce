# RESTEZ - Ultra-Luxury Modern Indian Sofa E-commerce Platform

A full-stack, production-ready e-commerce platform for **RESTEZ**, a luxury sofa brand by **Artech Furniture**. This application combines the advanced functionality of Amazon/Flipkart with the premium visual storytelling of a luxury boutique brand, specifically tailored for the Indian market.

---

## 🌟 Core Features

### **1. The 360° Scrollytelling Feature** (Signature UI)
- **Sticky Product Viewer**: Main product image stays fixed while scrolling
- **Scroll-Triggered Rotation**: Images automatically transition through different angles (Front → 45° → Side → Back → Close-up) as users scroll through product details
- **Cinematic Experience**: Creates an immersive product exploration similar to high-end automotive or luxury watch websites

### **2. Customer-Facing Features**
#### Homepage
- **Hero Slider**: Auto-rotating high-resolution lifestyle imagery
- **Collections Grid**: "Shop by Collection" with 4 curated categories
- **Trust Section**: Showcases Artech Furniture manufacturing credentials

#### Product Listing Page (PLP)
- **Advanced Filtering**:
  - Price Range slider
  - Material selection (Teak, Sheesham, Mango Wood)
  - Seating Capacity (1-6+ seaters, L-Shape)
  - Style categories (Traditional, Modern, Contemporary, Classic)
- **Real-time Filter Updates**: Products update instantly without page reload
- **Responsive Grid**: 1/2/3 columns based on screen size

#### Product Detail Page (PDP)
- **360° Scrollytelling Viewer** (see above)
- **Dynamic Pricing**: Price updates instantly when switching between Standard/Premium fabric options
- **Variant Selector**: Choose from curated fabric collections
- **Pincode Serviceability**: Check delivery availability by entering Indian pincode
- **AR Viewer** (placeholder): "View in My Room" button for future AR integration
- **Customer Reviews**: Star ratings and testimonials
- **Trust Badges**: Free delivery, 5-year warranty, customer satisfaction

#### Shopping Cart & Checkout
- **Persistent Cart**: Uses Zustand with localStorage persistence
- **Coupon System**: Apply discount codes (FESTIVE20, WELCOME10)
- **Dynamic Totals**: Real-time calculation including discounts and shipping
- **Free Shipping Threshold**: Orders above ₹50,000 get free delivery

#### Additional Features
- **WhatsApp Floating Button**: Direct customer support integration
- **Responsive Design**: Mobile-first approach with touch-optimized controls
- **SEO Optimized**: Meta tags, semantic HTML, and performance optimizations

### **3. Admin Dashboard** (Backend Control Center)
#### Dashboard Overview
- **Analytics Cards**: Total Revenue, Orders, Products, Customers
- **Recent Orders Table**: Quick view of latest transactions
- **Low Stock Alerts**: Automatic notifications for inventory management
- **Quick Actions**: Fast access to common tasks

#### Product Management (CRUD)
- **Full Product Lifecycle**:
  - Create/Edit/Delete products
  - Toggle In Stock / Out of Stock status
  - Upload 6 sequential images for 360° feature (Front, 45°, Side, Back, Close-up, Lifestyle)
  - Manage fabric options (Standard & Premium collections)
  - Set pricing with premium fabric upcharge
  - Define dimensions, materials, seating capacity
- **Search & Filter**: Find products quickly
- **Bulk Operations**: Manage multiple products efficiently

#### Order Management System
- **Complete Order Tracking**: View customer details, shipping address, order items
- **Status Workflow**: Update orders through 5 stages:
  1. **Pending** → Order received
  2. **Manufacturing at Artech** → In production
  3. **Quality Check** → Final inspection
  4. **Shipped** → Out for delivery
  5. **Delivered** → Completed
- **Customer Communication**: Email, phone, and address readily available
- **Payment Details**: Track payment method and amounts

#### Coupon/Discount Engine
- **Create Coupons**: Generate discount codes with:
  - Custom code names (e.g., FESTIVE20)
  - Percentage discounts (1-100%)
  - Validity dates
  - Maximum usage limits
- **Usage Analytics**: Track redemption rates
- **Toggle Active/Inactive**: Enable/disable coupons without deletion
- **Copy to Clipboard**: Easy sharing with customers

---

## 🎨 Design System

### **Color Palette** (Modern Indian Royal)
- **Deep Emerald Green** (`#004d40`): Primary brand color, luxury and sophistication
- **Charcoal Grey** (`#121212`): Text and dark UI elements
- **Champagne Gold** (`#C5A059`): Accents, CTAs, and premium indicators

### **Typography**
- **Playfair Display** (Serif): Headings - Elegant and timeless
- **Montserrat** (Sans-serif): Body text - Clean and highly readable

### **UI Elements**
- **Border Radius**: 8px (rounded-luxury class)
- **Shadows**: Luxury-grade drop shadows for depth
- **Jali Pattern**: Subtle Indian decorative pattern in backgrounds
- **Gold Dividers**: Ornamental section separators

---

## 🛠️ Technical Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion for scroll effects and transitions
- **Icons**: Lucide React

### **State Management**
- **Global State**: Zustand
- **Cart Persistence**: localStorage with Zustand persist middleware
- **Filter State**: Zustand stores for product filtering

### **Backend & Database**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (for admin)
- **Storage**: Supabase Storage (for product images)
- **Real-time**: Supabase Realtime subscriptions

### **Infrastructure**
- **Deployment**: Vercel (recommended) / Netlify / AWS Amplify
- **CDN**: Automatic with Next.js Image Optimization
- **Analytics**: Vercel Analytics / Google Analytics integration ready

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Supabase account (free tier works)
- Git

### **Step 1: Clone & Install**
```bash
git clone <repository-url>
cd restez-ecommerce
npm install
```

### **Step 2: Environment Configuration**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Step 3: Database Setup**

Create the following tables in your Supabase project:

#### **products** table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price INTEGER NOT NULL,
  category TEXT,
  collection TEXT,
  material TEXT,
  seating_capacity INTEGER,
  style TEXT,
  dimensions JSONB,
  fabric_options JSONB,
  premium_upcharge INTEGER DEFAULT 0,
  images JSONB,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **orders** table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **coupons** table
```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL,
  valid_until DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  max_uses INTEGER DEFAULT 100,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Step 4: Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```
restez-ecommerce/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── products/
│   │   ├── page.tsx               # Product Listing Page (PLP)
│   │   └── [slug]/
│   │       └── page.tsx           # Product Detail Page (PDP) with 360°
│   ├── cart/
│   │   └── page.tsx               # Shopping Cart
│   ├── admin/
│   │   ├── layout.tsx             # Admin Dashboard Layout
│   │   ├── page.tsx               # Admin Overview
│   │   ├── products/
│   │   │   └── page.tsx           # Product Management
│   │   ├── orders/
│   │   │   └── page.tsx           # Order Management
│   │   └── coupons/
│   │       └── page.tsx           # Coupon Management
│   ├── layout.tsx                 # Root Layout
│   └── globals.css                # Global Styles
│
├── components/
│   ├── Header.tsx                 # Navigation Bar
│   ├── Footer.tsx                 # Footer with Jali pattern
│   ├── WhatsAppButton.tsx         # Floating WhatsApp widget
│   └── ScrollytellingViewer.tsx   # 360° Scroll Component
│
├── lib/
│   ├── supabase.ts                # Supabase client & types
│   ├── store.ts                   # Zustand state management
│   ├── utils.ts                   # Utility functions
│   └── mockData.ts                # Development mock data
│
├── tailwind.config.js             # Tailwind customization
├── next.config.js                 # Next.js configuration
└── package.json                   # Dependencies
```

---

## 🚀 Deployment

### **Vercel (Recommended)**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### **Manual Steps**
```bash
npm run build
npm run start
```

---

## 🔐 Admin Access

Default admin route: `/admin`

**Note**: For production, implement Supabase Auth:
1. Enable Supabase Auth in your project
2. Create admin user roles
3. Protect admin routes with middleware

---

## 🎯 Key User Flows

### **Customer Journey**
1. Land on homepage → Browse collections
2. Filter products by price/material/style
3. Click product → Experience 360° scrollytelling
4. Select fabric → Add to cart
5. Apply coupon code
6. Checkout with Indian payment methods

### **Admin Workflow**
1. Login to `/admin`
2. View dashboard analytics
3. Add new product with 360° images
4. Monitor orders → Update status (Pending → Manufacturing → Shipped)
5. Create seasonal discount coupons

---

## 🌐 Indian Market Features

- **Pricing**: INR formatting with Indian number system
- **Pincode Validation**: 6-digit Indian postal codes
- **Payment Methods**: UPI, Net Banking, Credit/Debit Cards
- **Delivery Zones**: India-wide shipping with pincode checks
- **WhatsApp Integration**: Primary customer support channel
- **Festival Coupons**: Diwali, Holi, New Year campaigns

---

## 📱 Mobile Optimization

- **Touch-Optimized**: 360° scrollytelling works seamlessly on mobile
- **Responsive Filters**: Collapsible sidebar on mobile
- **Mobile Cart**: Full-featured cart experience
- **WhatsApp Direct**: One-tap customer support

---

## 🔮 Future Enhancements

### Phase 2
- [ ] Web-AR Integration (WebXR for "View in My Room")
- [ ] Payment Gateway (Razorpay/Paytm integration)
- [ ] Email Notifications (Order confirmations, shipping updates)
- [ ] Customer Accounts (Order history, wishlists)
- [ ] Product Reviews System

### Phase 3
- [ ] Multi-language Support (Hindi, Gujarati)
- [ ] Live Chat Integration
- [ ] Inventory Management Dashboard
- [ ] Sales Analytics & Reports
- [ ] B2B Wholesale Portal

---

## 🤝 Contributing

Developed for **RESTEZ by Artech Furniture**

For support or customization requests, contact the development team.

---

## 📄 License

Proprietary - All rights reserved by Artech Furniture

---

## 🙏 Acknowledgments

- **Artech Furniture**: Manufacturing partner and brand owner
- **Design Inspiration**: Luxury furniture brands, Indian heritage motifs
- **Technology Stack**: Next.js, Supabase, Tailwind CSS, Framer Motion

---

**Built with ❤️ for the Indian luxury furniture market**

**RESTEZ** - Where Royal Tradition Meets Modern Elegance
