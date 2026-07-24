# Quick Start Guide

## Get Started in 3 Minutes

### 1. Extract Project
```bash
tar -xzf ksp-login-portal.tar.gz
cd v0-project
```

### 2. Install & Run
```bash
pnpm install
pnpm dev
```

### 3. Open Browser
Visit: **http://localhost:3000**

---

## Test the Application

### Mobile Number + OTP Mode
1. Enter mobile: `9876543210`
2. Click "Send OTP"
3. Enter OTP: `123456` (any 6 digits)
4. Click "Verify"
5. Select district and language
6. Check terms checkbox
7. Click "Submit"

### PSN + PIN Mode
1. Click "Use PSN" toggle
2. Enter PSN: `EMP12345`
3. Enter PIN: `1234` (4 digits)
4. Select district and language
5. Check terms checkbox
6. Click "Submit"

---

## File Structure

```
📦 v0-project
├── 📂 app/
│   ├── page.tsx           ← Main login page
│   ├── layout.tsx         ← App layout & metadata
│   └── globals.css        ← Styles & theme
├── 📂 components/
│   ├── login-form.tsx     ← Form logic & UI
│   └── ksp-logo.tsx       ← Logo component
├── 📂 public/
│   ├── ksp-emblem.png     ← Official emblem
│   └── ksp-background.png ← Background image
├── package.json           ← Dependencies
└── INSTALLATION.md        ← Full guide
```

---

## Customization

### Change Colors
Edit `app/globals.css`:
```css
:root {
  --primary: #1e40af;          /* Change blue */
  --background: #0a1628;       /* Change background */
}
```

### Add Districts
Edit `components/login-form.tsx`:
```typescript
const districts = [
  'Bengaluru (Urban)',
  'Your District',  // Add here
  // ...
]
```

### Update Languages
Edit `components/login-form.tsx`:
```typescript
const languages = [
  { code: 'en', name: 'English' },
  { code: 'ka', name: 'ಕನ್ನಡ' },
  // Add more languages
]
```

---

## Production Deployment

### Deploy to Vercel (Easiest)
1. Push to GitHub
2. Import in Vercel dashboard
3. Click "Deploy"
4. Done! 🚀

### Deploy to Other Platforms
```bash
pnpm build
pnpm start
```

Then deploy the `.next/` folder to your hosting service.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `pnpm dev -- -p 3001` |
| Module not found | `pnpm install` |
| Styles not loading | Restart dev server |
| Images not showing | Check `public/` folder |

---

## Key Features

✅ Dual authentication (Mobile OTP + PSN PIN)  
✅ Peak glassmorphism design  
✅ Official KSP branding  
✅ Responsive on all devices  
✅ Form validation  
✅ Success animations  
✅ Professional UI  

---

## Tech Stack

- Next.js 16 (React)
- Tailwind CSS v4
- TypeScript
- shadcn/ui

---

**Need Help?** See `INSTALLATION.md` for detailed documentation.
