import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  Award, 
  PieChart as PieChartIcon, 
  LayoutDashboard,
  History,
  Trash2,
  Trophy,
  Star,
  ChevronRight,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn, formatCurrency } from './lib/utils';
import { Expense, Category, UserStats } from './types';

const CATEGORIES: Category[] = ['Food', 'Transport', 'Study', 'Entertainment', 'Other'];
const CATEGORY_COLORS = {
  Food: '#F87171',
  Transport: '#60A5FA',
  Study: '#34D399',
  Entertainment: '#FBBF24',
  Other: '#A78BFA'
};

const INITIAL_EXPENSES: Expense[] = [
  { id: '1', title: 'Lunch at Cafeteria', amount: 12.50, category: 'Food', date: subDays(new Date(), 0).toISOString() },
  { id: '2', title: 'Bus Pass', amount: 45.00, category: 'Transport', date: subDays(new Date(), 1).toISOString() },
  { id: '3', title: 'Calculus Textbook', amount: 85.00, category: 'Study', date: subDays(new Date(), 2).toISOString() },
  { id: '4', title: 'Movie Night', amount: 15.00, category: 'Entertainment', date: subDays(new Date(), 3).toISOString() },
  { id: '5', title: 'Coffee', amount: 4.50, category: 'Food', date: subDays(new Date(), 0).toISOString() },
];

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [budget, setBudget] = useState(500);
  const [points, setPoints] = useState(120);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState<{ title: string; amount: string; category: Category }>({
    title: '',
    amount: '',
    category: 'Food'
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = budget - totalSpent;
  const savingsRate = ((budget - totalSpent) / budget) * 100;

  useEffect(() => {
    // Reward simulation: if today's spending is low, give points
    const todayExpenses = expenses.filter(e => 
      format(new Date(e.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).reduce((sum, e) => sum + e.amount, 0);

    const dailyBudget = budget / 30;
    if (todayExpenses > 0 && todayExpenses < dailyBudget) {
      // Potentially reward here, but let's do it on add
    }
  }, [expenses, budget]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;

    const amount = parseFloat(newExpense.amount);
    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      title: newExpense.title,
      amount,
      category: newExpense.category,
      date: new Date().toISOString()
    };

    setExpenses([expense, ...expenses]);
    setShowAddModal(false);
    setNewExpense({ title: '', amount: '', category: 'Food' });

    // Reward logic
    const dailyBudget = budget / 30;
    if (amount < dailyBudget * 0.5) {
      setPoints(prev => prev + 10);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#F87171', '#34D399']
      });
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const pieData = CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(d => d.value > 0);

  const dailyData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const amount = expenses
      .filter(e => format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      name: format(date, 'EEE'),
      amount
    };
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1D1D1D] font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#E5E5E5] hidden md:flex flex-col p-6 z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Wallet size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">StudentSaver</span>
        </div>

        <div className="space-y-2 flex-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<History size={20} />} 
            label="History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <NavItem icon={<Trophy size={20} />} label="Rewards" active={false} />
          <NavItem icon={<Award size={20} />} label="Badges" active={false} />
        </div>

        <div className="pt-6 border-t border-[#F0F0F0] space-y-2">
          <NavItem icon={<Settings size={20} />} label="Settings" active={false} />
          <button className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="md:ml-64 p-4 md:p-8 lg:p-12 max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#111] mb-1">
              Hey, Student! 👋
            </h1>
            <p className="text-[#6B7280] font-medium italic">
              {remainingBudget > 0 ? "You're doing great with your savings!" : "Time to cut down a bit!"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200 animate-pulse">
              <Star size={18} className="fill-yellow-400" />
              <span className="font-bold">{points} Gold</span>
            </div>
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Tab Content */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard 
                title="Monthly Budget" 
                value={formatCurrency(budget)} 
                icon={<Wallet className="text-orange-500" />} 
                className="bg-white"
              />
              <StatCard 
                title="Total Spent" 
                value={formatCurrency(totalSpent)} 
                icon={<TrendingDown className="text-red-500" />} 
                trend={`-${(totalSpent/budget * 100).toFixed(0)}% used`}
                className="bg-white"
              />
              <StatCard 
                title="Potential Savings" 
                value={formatCurrency(remainingBudget)} 
                icon={<TrendingUp className="text-emerald-500" />} 
                trend={`+${savingsRate.toFixed(1)}% safe`}
                className="bg-white"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Spending Patterns */}
              <div className="bg-white p-8 rounded-[2rem] border border-[#EEEEEE] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold">Category Breakdown</h3>
                    <p className="text-sm text-gray-500">Where your money goes</p>
                  </div>
                  <PieChartIcon className="text-gray-400" size={24} />
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
                  {CATEGORIES.map(cat => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                      <span className="text-sm font-medium text-gray-600">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Trend */}
              <div className="bg-white p-8 rounded-[2rem] border border-[#EEEEEE] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold">Weekly Spending</h3>
                    <p className="text-sm text-gray-500">Last 7 days activity</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded">HEALTHY+</div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ stroke: '#F97316', strokeWidth: 2, strokeDasharray: '5 5' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#F97316" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAmt)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Transactions & Rewards Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-[#EEEEEE] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Recent Transactions</h3>
                  <button onClick={() => setActiveTab('history')} className="text-sm font-semibold text-orange-500 hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {expenses.slice(0, 4).map(e => (
                    <div key={e.id} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl border border-[#F2F2F2] hover:border-orange-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm", 
                          e.category === 'Food' ? 'bg-red-400' :
                          e.category === 'Transport' ? 'bg-blue-400' :
                          e.category === 'Study' ? 'bg-emerald-400' :
                          e.category === 'Entertainment' ? 'bg-yellow-400' : 'bg-purple-400'
                        )}>
                          <Plus size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-[#111]">{e.title}</p>
                          <p className="text-xs text-gray-500 font-medium">{format(new Date(e.date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <p className="font-bold text-[#111]">{formatCurrency(e.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-8 rounded-[2rem] text-white shadow-xl shadow-orange-100 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4">
                    <Trophy size={40} className="text-white drop-shadow-md" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter italic">Saver Guru</h3>
                  <p className="text-orange-50 mb-6 text-sm font-medium">You saved $45.20 more than average students this week!</p>
                  <div className="w-full bg-white/20 h-3 rounded-full mb-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      className="h-full bg-white rounded-full" 
                    />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Next Badge: Savings Sensei</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-[#EEEEEE] shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Daily Mission</h3>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Plus size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Add 3 expenses</p>
                      <p className="text-xs text-gray-500 font-medium">Earn 20 Bonus Gold</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    <div className="h-1.5 flex-1 bg-indigo-500 rounded-full" />
                    <div className="h-1.5 flex-1 bg-indigo-100 rounded-full" />
                    <div className="h-1.5 flex-1 bg-indigo-100 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[2rem] border border-[#EEEEEE] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Transaction History</h3>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl text-sm font-semibold hover:bg-white transition-all">Filter</button>
                 <button className="px-4 py-2 bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl text-sm font-semibold hover:bg-white transition-all">Export</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#F0F0F0] text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="pb-4 pt-4 px-4 whitespace-nowrap">Date</th>
                    <th className="pb-4 pt-4 px-4 whitespace-nowrap">Description</th>
                    <th className="pb-4 pt-4 px-4 whitespace-nowrap">Category</th>
                    <th className="pb-4 pt-4 px-4 whitespace-nowrap">Amount</th>
                    <th className="pb-4 pt-4 px-4 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {expenses.map(e => (
                    <tr key={e.id} className="group hover:bg-[#FDFCFB] transition-colors">
                      <td className="py-5 px-4 text-sm font-medium text-gray-500">{format(new Date(e.date), 'MMM dd, yyyy')}</td>
                      <td className="py-5 px-4 font-bold text-[#111]">{e.title}</td>
                      <td className="py-5 px-4">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", 
                          e.category === 'Food' ? 'bg-red-50 text-red-600' :
                          e.category === 'Transport' ? 'bg-blue-50 text-blue-600' :
                          e.category === 'Study' ? 'bg-emerald-50 text-emerald-600' :
                          e.category === 'Entertainment' ? 'bg-yellow-50 text-yellow-600' : 'bg-purple-50 text-purple-600'
                        )}>
                          {e.category}
                        </span>
                      </td>
                      <td className="py-5 px-4 font-black">{formatCurrency(e.amount)}</td>
                      <td className="py-5 px-4">
                        <button 
                          onClick={() => deleteExpense(e.id)} 
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-orange-200 z-50 border-4 border-white"
      >
        <Plus size={32} />
      </motion.button>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-[#EEEEEE]"
            >
              <h2 className="text-2xl font-bold mb-6">Log New Spending</h2>
              <form onSubmit={handleAddExpense} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="E.g. Textbook, Pizza..."
                    className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none font-medium text-lg"
                    value={newExpense.title}
                    onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Amount ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none font-bold text-lg"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Category</label>
                    <select 
                      className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none font-medium appearance-none"
                      value={newExpense.category}
                      onChange={e => setNewExpense({...newExpense, category: e.target.value as Category})}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-4 border border-[#E5E5E5] text-gray-500 font-bold rounded-2xl hover:bg-[#F9FAFB] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
        active 
          ? "bg-orange-50 text-orange-600 shadow-sm" 
          : "text-gray-500 hover:bg-[#F9FAFB] hover:text-[#111]"
      )}
    >
      <div className={cn("transition-transform group-hover:scale-110", active ? "text-orange-500" : "text-gray-400")}>
        {icon}
      </div>
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
    </button>
  );
}

function StatCard({ title, value, icon, trend, className }: { title: string, value: string, icon: React.ReactNode, trend?: string, className?: string }) {
  return (
    <div className={cn("p-8 rounded-[2rem] border border-[#EEEEEE] shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{title}</span>
        <div className="w-10 h-10 bg-[#F9FAFB] border border-[#F0F0F0] rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-black text-[#111] tracking-tighter">{value}</p>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-lg",
            trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
          )}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
