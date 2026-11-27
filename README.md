# E-Commerce Admin Dashboard
A modern and responsive admin dashboard for managing an e-commerce platform, built with React and Vite.

## ✨ Features

- **Dashboard:** Overview of store activities and statistics.
- **Products Management:** Browse, add, edit, and view product details.
- **Orders Management:** View and manage customer orders.
- **Users Management:** Manage registered users.
- **Carts Management:** View shopping carts.
- **Wishlists:** View customer wishlists.
- **Settings:** Manage dashboard settings.
- **Authentication:** Login and logout functionality.
- **Responsive Design:** Layout optimized for different screen sizes.
- **Dark & Light Themes:** Theme customization.
- **Animations:** Smooth page transitions.
- **Notifications:** User feedback through toast notifications.
- **Lazy Loading:** Load pages on demand for improved performance.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | UI development |
| Vite | Development and build tool |
| Tailwind CSS | Styling |
| React Router DOM | Routing |
| Redux Toolkit | State management |
| RTK Query | API integration |
| Framer Motion | Animations |
| Lucide React | Icons |
| React Toastify | Notifications |
| js-cookie | Cookie handling |
| Biome & ESLint | Code quality |
| Husky & lint-staged | Git hooks |

## 📂 Project Structure

```text
src/
├── components/
│   ├── common/
│   ├── layout/
│   └── products/
├── config/
├── hooks/
├── pages/
│   ├── addProduct/
│   ├── auth/
│   ├── carts/
│   ├── dashboard/
│   ├── error/
│   ├── orders/
│   ├── products/
│   ├── setting/
│   ├── users/
│   └── wishlists/
├── redux/
│   ├── app/
│   │   └── api/
│   └── features/
├── routes/
├── App.jsx
├── index.css
└── main.jsx
```

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/me3010/Admin_Dashboard_Ecommerce-.git
```

2. Navigate to the project directory:

```bash
cd Admin_Dashboard_Ecommerce-
```

3. Install dependencies:

```bash
npm install
```

4. Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

5. Configure the API URL in `.env`:
```env
VITE_BASE_URL=https://your-api-url.com
```

6. Start the development server:

```bash
npm run dev
```

## 🧪 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build production files |
| `npm run preview` | Preview production build |
| `npm run lint` | Run Biome and ESLint checks |
| `npm run format` | Format source files |

## 🔌 API Integration

The application uses Redux Toolkit Query with `fetchBaseQuery` to communicate with the backend API.

- Configurable API base URL through `VITE_BASE_URL`.
- Cookie credentials included in API requests.
- Bearer token authorization header when a token is available.
- Handles unauthorized (`401`) responses by clearing the token and redirecting to the login page.

## 🗺️ Application Routes

| Route | Description |
|---|---|
| `/` | Login |
| `/auth/login` | Login |
| `/dashboard` | Dashboard |
| `/dashboard/products` | Products |
| `/dashboard/products/view/:id` | Product details |
| `/dashboard/products/edit/:id` | Edit product |
| `/dashboard/add_products` | Add product |
| `/dashboard/orders` | Orders |
| `/dashboard/users` | Users |
| `/dashboard/carts` | Carts |
| `/dashboard/settings` | Settings |
| `/dashboard/wishlists` | Wishlists |

## 🌐 Live Demo

https://admin-dashboard-psi-jet-96.vercel.app

## 📄 License

This project is currently not distributed under a specified open-source license  .
