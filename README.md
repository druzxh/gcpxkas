# Squad GCP Management System

A comprehensive management system for organizations to handle financial transactions (kas) and member data. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Authentication & Security
- **Secure Authentication**: Email/password login with Supabase Auth
- **Row Level Security**: Users can only access their own data
- **Protected Routes**: Authentication required for all operations
- **Session Management**: Automatic login state persistence

### Financial Management (Kas)
- **Transaction Management**: Add, edit, delete income and expense records
- **Categories & Types**: Organize transactions by category and type (income/expense)
- **Search & Filter**: Find transactions by description, category, or type
- **Financial Statistics**: Real-time calculations of totals, balance, and trends
- **Date Management**: Track transactions by date with proper formatting

### Member Management (Anggota)
- **Member Profiles**: Comprehensive member information (name, email, role, etc.)
- **Status Tracking**: Manage active/inactive member status
- **Role Management**: Assign and track member roles
- **Search & Filter**: Find members by name, email, role, or status
- **Member Statistics**: Overview of total members and status distribution

### Dashboard & Analytics
- **Overview Dashboard**: Quick stats and recent activity
- **Recent Transactions**: Latest financial activities
- **Quick Actions**: Fast access to common operations
- **Data Summaries**: Comprehensive statistics and insights

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context API
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account and project
- Git for version control

## 🔧 Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd gcp
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Follow the detailed setup guide in `SUPABASE_SETUP.md`
   - Create your Supabase project
   - Run the database setup SQL
   - Configure environment variables

4. **Configure environment variables**
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── kas/               # Financial management
│   └── anggota/           # Member management
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── kas/               # Financial management components
│   └── anggota/           # Member management components
├── contexts/              # React Context providers
├── services/              # API service layers
├── types/                 # TypeScript type definitions
└── lib/                   # Utility libraries
```

## 🗄️ Database Schema

The application uses two main tables:

### `kas` (Financial Transactions)
- Transaction details (description, amount, type, category)
- Date tracking and user association
- Row-level security for data isolation

### `anggota` (Members)
- Member information (name, email, role, status)
- Join date and status tracking
- User-specific data access

See `database-setup.sql` for complete schema.

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication Required**: All operations require login
- **Data Isolation**: Users only see their own data
- **Secure API**: All operations through Supabase's secure endpoints
- **Input Validation**: Client and server-side validation

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The application works on any platform supporting Node.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## 📚 Documentation

- **Setup Guide**: `SUPABASE_SETUP.md` - Complete Supabase integration guide
- **Migration Tool**: `migration-utility.js` - Migrate from localStorage
- **Database Schema**: `database-setup.sql` - Database setup SQL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the setup documentation
2. Review browser console for errors
3. Verify Supabase configuration
4. Check database logs in Supabase dashboard

---

Built with ❤️ for Squad GCP
