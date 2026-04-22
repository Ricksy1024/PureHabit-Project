import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Lock, User, Palette, LogOut, LogIn, Save, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isAuthenticated: boolean;
  onAuthAction: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  setIsDarkMode,
  isAuthenticated,
  onAuthAction,
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 123-4567',
  });
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    achievements: true,
    updates: false,
  });
  const [profilePhoto, setProfilePhoto] = useState<string>(() => {
    const saved = localStorage.getItem('userProfilePhoto');
    return saved || 'https://picsum.photos/seed/alex/200/200';
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isActiveSessionsModalOpen, setIsActiveSessionsModalOpen] = useState(false);

  // Sample active sessions data
  const [activeSessions] = useState([
    {
      id: 1,
      device: 'Chrome on Windows',
      deviceType: '💻',
      location: 'Budapest, Hungary',
      lastActive: 'Just now',
      ipAddress: '192.168.1.100',
      current: true,
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      deviceType: '📱',
      location: 'Budapest, Hungary',
      lastActive: '2 hours ago',
      ipAddress: '192.168.1.101',
      current: false,
    },
    {
      id: 3,
      device: 'Chrome on Linux',
      deviceType: '💻',
      location: 'Budapest, Hungary',
      lastActive: '1 day ago',
      ipAddress: '192.168.1.102',
      current: false,
    },
  ]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoData = event.target?.result as string;
        setProfilePhoto(photoData);
        localStorage.setItem('userProfilePhoto', photoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Save logic here
    console.log('Settings saved:', { formData, notifications });
    onClose();
  };

  const closeAllModals = () => {
    setIsPasswordModalOpen(false);
    setIsTwoFactorModalOpen(false);
    setIsActiveSessionsModalOpen(false);
  };

  const openModal = (modalName: 'password' | 'twoFactor' | 'activeSessions') => {
    closeAllModals();
    if (modalName === 'password') setIsPasswordModalOpen(true);
    if (modalName === 'twoFactor') setIsTwoFactorModalOpen(true);
    if (modalName === 'activeSessions') setIsActiveSessionsModalOpen(true);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Az új jelszavak nem egyeznek!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('A jelszónak legalább 6 karakterből kell állnia!');
      return;
    }
    console.log('Password changed successfully');
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setIsPasswordModalOpen(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ opacity: 0, x: -400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed left-0 top-0 h-screen w-96 rounded-r-3xl soft-shadow z-50 transition-colors duration-500 ${
              isDarkMode ? 'bg-[#2A2421]' : 'bg-[#FAF5F0]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#D0705B]/20">
              <h2 className={`text-2xl font-serif font-bold transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                Settings
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-[#4A2C24] text-[#FDF8F3]' : 'hover:bg-[#E8DCD1] text-[#2A2421]'
                }`}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className={`flex gap-1 px-4 py-4 border-b transition-colors ${
              isDarkMode ? 'bg-[#2A2421]/50 border-[#4A2C24]/30' : 'bg-[#FAF5F0]/50 border-[#E8DCD1]/30'
            }`}>
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-sm font-medium ${
                      activeTab === tab.id
                        ? 'bg-[#D0705B] text-white shadow-md'
                        : isDarkMode
                        ? 'text-[#A58876] hover:bg-[#4A2C24]'
                        : 'text-[#8A7E7A] hover:bg-[#E8DCD1]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-6"
                >
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center border-4 transition-colors ${
                      isDarkMode ? 'border-[#D0705B] bg-[#4A2C24]' : 'border-[#D0705B] bg-[#FDECE8]'
                    }`}>
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg bg-[#D0705B] text-white text-sm font-medium hover:bg-[#B85F4C] transition-colors"
                    >
                      Change Photo
                    </motion.button>
                  </div>

                  {/* Form Fields */}
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 transition-colors ${
                      isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                    }`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-[#4A2C24]/50 border border-[#4A2C24] text-[#FDF8F3] focus:border-[#D0705B] focus:outline-none'
                          : 'bg-white border border-[#E8DCD1] text-[#2A2421] focus:border-[#D0705B] focus:outline-none'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 transition-colors ${
                      isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                    }`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-[#4A2C24]/50 border border-[#4A2C24] text-[#FDF8F3] focus:border-[#D0705B] focus:outline-none'
                          : 'bg-white border border-[#E8DCD1] text-[#2A2421] focus:border-[#D0705B] focus:outline-none'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 transition-colors ${
                      isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                    }`}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-[#4A2C24]/50 border border-[#4A2C24] text-[#FDF8F3] focus:border-[#D0705B] focus:outline-none'
                          : 'bg-white border border-[#E8DCD1] text-[#2A2421] focus:border-[#D0705B] focus:outline-none'
                      }`}
                    />
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-4"
                >
                  {[
                    { key: 'dailyReminder', label: 'Daily Reminders', desc: 'Get reminded about your daily habits' },
                    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive your weekly summary' },
                    { key: 'achievements', label: 'Achievements', desc: 'Celebrate your milestones' },
                    { key: 'updates', label: 'App Updates', desc: 'Get notified about new features' },
                  ].map((notif) => (
                    <motion.div
                      key={notif.key}
                      whileHover={{ x: 5 }}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        isDarkMode ? 'bg-[#4A2C24]/30 hover:bg-[#4A2C24]/50' : 'bg-[#E8DCD1]/30 hover:bg-[#E8DCD1]/50'
                      }`}
                    >
                      <div>
                        <p className={`font-medium transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                          {notif.label}
                        </p>
                        <p className={`text-xs transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                          {notif.desc}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[notif.key as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [notif.key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer transition-colors ${
                          notifications[notif.key as keyof typeof notifications]
                            ? 'bg-[#D0705B]'
                            : isDarkMode
                            ? 'bg-[#4A2C24]'
                            : 'bg-[#E8DCD1]'
                        }`}></div>
                        <span className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all peer-checked:translate-x-5 ${
                          notifications[notif.key as keyof typeof notifications]
                            ? 'bg-white'
                            : isDarkMode
                            ? 'bg-[#A58876]'
                            : 'bg-[#8A7E7A]'
                        }`}></span>
                      </label>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-4"
                >
                  <div>
                    <p className={`text-sm font-bold mb-4 transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                      Theme
                    </p>
                    <div className="flex gap-4">
                      {[
                        { id: 'light', label: 'Light', icon: '☀️' },
                        { id: 'dark', label: 'Dark', icon: '🌙' },
                      ].map((theme) => (
                        <motion.button
                          key={theme.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsDarkMode(theme.id === 'dark')}
                          className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${
                            (theme.id === 'dark' && isDarkMode) || (theme.id === 'light' && !isDarkMode)
                              ? 'bg-[#D0705B] text-white shadow-md'
                              : isDarkMode
                              ? 'bg-[#4A2C24]/30 text-[#FDF8F3] hover:bg-[#4A2C24]/50'
                              : 'bg-[#E8DCD1]/30 text-[#2A2421] hover:bg-[#E8DCD1]/50'
                          }`}
                        >
                          <span className="text-2xl">{theme.icon}</span>
                          <span className="text-xs font-medium">{theme.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-[#4A2C24]/30' : 'bg-[#E8DCD1]/30'
                  }`}>
                    <p className={`text-sm transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                      ✨ More theme options coming soon!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-4"
                >
                  <motion.button
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openModal('password')}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                      isDarkMode ? 'bg-[#4A2C24]/30 hover:bg-[#4A2C24]/50' : 'bg-[#E8DCD1]/30 hover:bg-[#E8DCD1]/50'
                    }`}
                  >
                    <div>
                      <p className={`font-medium transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                        Change Password
                      </p>
                      <p className={`text-xs transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                        Update your password regularly
                      </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`} />
                  </motion.button>

                  <motion.button
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openModal('twoFactor')}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                      isDarkMode ? 'bg-[#4A2C24]/30 hover:bg-[#4A2C24]/50' : 'bg-[#E8DCD1]/30 hover:bg-[#E8DCD1]/50'
                    }`}
                  >
                    <div>
                      <p className={`font-medium transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                        Two-Factor Authentication
                      </p>
                      <p className={`text-xs transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                        Enable for extra security
                      </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`} />
                  </motion.button>

                  <motion.button
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openModal('activeSessions')}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                      isDarkMode ? 'bg-[#4A2C24]/30 hover:bg-[#4A2C24]/50' : 'bg-[#E8DCD1]/30 hover:bg-[#E8DCD1]/50'
                    }`}
                  >
                    <div>
                      <p className={`font-medium transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                        Active Sessions
                      </p>
                      <p className={`text-xs transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                        Manage your logged-in devices
                      </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`} />
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className={`border-t transition-colors p-6 space-y-3 ${isDarkMode ? 'bg-[#2A2421]/50 border-[#4A2C24]/30' : 'bg-white/50 border-[#E8DCD1]/30'}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#D0705B] text-white font-medium hover:bg-[#B85F4C] transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAuthAction}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isAuthenticated
                    ? isDarkMode
                      ? 'bg-[#EF5350]/20 text-[#EF5350] hover:bg-[#EF5350]/30'
                      : 'bg-[#EF5350]/10 text-[#EF5350] hover:bg-[#EF5350]/20'
                    : isDarkMode
                    ? 'bg-[#D0705B]/20 text-[#FDF8F3] hover:bg-[#D0705B]/30'
                    : 'bg-[#D0705B]/10 text-[#B85F4C] hover:bg-[#D0705B]/20'
                }`}
              >
                {isAuthenticated ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {isAuthenticated ? 'Log Out' : 'Sign In'}
              </motion.button>
            </div>
          </motion.div>

          {/* Password Change Modal */}
          <AnimatePresence>
            {isPasswordModalOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="fixed inset-0 bg-black/40 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 rounded-3xl soft-shadow z-50 transition-colors duration-500 ${
                    isDarkMode ? 'bg-[#2A2421]' : 'bg-[#FAF5F0]'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-[#D0705B]/20">
                    <h3 className={`text-xl font-serif font-bold transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                      Jelszó módosítása
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsPasswordModalOpen(false)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-[#4A2C24] text-[#FDF8F3]' : 'hover:bg-[#E8DCD1] text-[#2A2421]'
                      }`}
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Old Password */}
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-2 transition-colors ${
                        isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                      }`}>
                        Régi jelszó
                      </label>
                      <div className="relative">
                        <input
                          type={showOldPassword ? 'text' : 'password'}
                          value={passwordData.oldPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                          className={`w-full px-4 py-2 pr-10 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'bg-[#4A2C24]/50 border border-[#4A2C24] text-[#FDF8F3] focus:border-[#D0705B] focus:outline-none'
                              : 'bg-white border border-[#E8DCD1] text-[#2A2421] focus:border-[#D0705B] focus:outline-none'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                            isDarkMode ? 'text-[#A58876] hover:text-[#FDF8F3]' : 'text-[#8A7E7A] hover:text-[#2A2421]'
                          }`}
                        >
                          {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-2 transition-colors ${
                        isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                      }`}>
                        Új jelszó
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className={`w-full px-4 py-2 pr-10 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'bg-[#4A2C24]/50 border border-[#4A2C24] text-[#FDF8F3] focus:border-[#D0705B] focus:outline-none'
                              : 'bg-white border border-[#E8DCD1] text-[#2A2421] focus:border-[#D0705B] focus:outline-none'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                            isDarkMode ? 'text-[#A58876] hover:text-[#FDF8F3]' : 'text-[#8A7E7A] hover:text-[#2A2421]'
                          }`}
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-2 transition-colors ${
                        isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'
                      }`}>
                        Jelszó megerősítése
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className={`w-full px-4 py-2 pr-10 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'bg-[#4A2C24]/50 border border-[#4A2C24] text-[#FDF8F3] focus:border-[#D0705B] focus:outline-none'
                              : 'bg-white border border-[#E8DCD1] text-[#2A2421] focus:border-[#D0705B] focus:outline-none'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                            isDarkMode ? 'text-[#A58876] hover:text-[#FDF8F3]' : 'text-[#8A7E7A] hover:text-[#2A2421]'
                          }`}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`border-t transition-colors p-6 flex gap-3 ${isDarkMode ? 'bg-[#2A2421]/50 border-[#4A2C24]/30' : 'bg-white/50 border-[#E8DCD1]/30'}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePasswordChange}
                      className="flex-1 px-4 py-2 rounded-lg bg-[#D0705B] text-white font-medium hover:bg-[#B85F4C] transition-colors"
                    >
                      Mentés
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsPasswordModalOpen(false)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-[#4A2C24]/30 text-[#FDF8F3] hover:bg-[#4A2C24]/50'
                          : 'bg-[#E8DCD1]/30 text-[#2A2421] hover:bg-[#E8DCD1]/50'
                      }`}
                    >
                      Mégse
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Two-Factor Authentication Modal */}
          <AnimatePresence>
            {isTwoFactorModalOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsTwoFactorModalOpen(false)}
                  className="fixed inset-0 bg-black/40 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 rounded-3xl soft-shadow z-50 transition-colors duration-500 ${
                    isDarkMode ? 'bg-[#2A2421]' : 'bg-[#FAF5F0]'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-[#D0705B]/20">
                    <h3 className={`text-xl font-serif font-bold transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                      Kétfaktoros azonosítás
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsTwoFactorModalOpen(false)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-[#4A2C24] text-[#FDF8F3]' : 'hover:bg-[#E8DCD1] text-[#2A2421]'
                      }`}
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Status */}
                    <div className={`p-4 rounded-lg transition-colors ${
                      twoFactorEnabled
                        ? (isDarkMode ? 'bg-[#4A2C24]/30' : 'bg-green-100')
                        : (isDarkMode ? 'bg-[#4A2C24]/30' : 'bg-[#E8DCD1]/30')
                    }`}>
                      <p className={`text-sm transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                        Jelenlegi állapot:
                      </p>
                      <p className={`text-lg font-bold mt-1 transition-colors ${
                        twoFactorEnabled
                          ? 'text-[#4CAF50]'
                          : (isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]')
                      }`}>
                        {twoFactorEnabled ? '✓ Engedélyezve' : '✗ Letiltva'}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <p className={`text-sm transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                        A kétfaktoros azonosítás további biztonsági réteg hozzáadása a fiókodhoz. Ha engedélyezed, jelszavad mellett SMS-ben vagy egy alkalmazáson keresztül kapott kódot is meg kell adnod a bejelentkezéshez.
                      </p>
                    </div>

                    {/* Toggle */}
                    <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      isDarkMode ? 'bg-[#4A2C24]/30' : 'bg-[#E8DCD1]/30'
                    }`}>
                      <label className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                        {twoFactorEnabled ? 'Tiltás' : 'Engedélyezés'}
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={twoFactorEnabled}
                          onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer transition-colors ${
                          twoFactorEnabled
                            ? 'bg-[#D0705B]'
                            : isDarkMode
                            ? 'bg-[#4A2C24]'
                            : 'bg-[#E8DCD1]'
                        }`}></div>
                        <span className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all peer-checked:translate-x-5 ${
                          twoFactorEnabled
                            ? 'bg-white'
                            : isDarkMode
                            ? 'bg-[#A58876]'
                            : 'bg-[#8A7E7A]'
                        }`}></span>
                      </label>
                    </div>

                    {/* Info */}
                    <div className={`p-4 rounded-lg transition-colors ${
                      isDarkMode ? 'bg-[#4A2C24]/20' : 'bg-[#D0705B]/10'
                    }`}>
                      <p className={`text-xs transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                        💡 <span className="font-semibold">Tipp:</span> Javasoljuk, hogy engedélyezd a kétfaktoros azonosítást a fiók maximális biztonságához.
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`border-t transition-colors p-6 flex gap-3 ${isDarkMode ? 'bg-[#2A2421]/50 border-[#4A2C24]/30' : 'bg-white/50 border-[#E8DCD1]/30'}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        console.log('Two-Factor Authentication:', twoFactorEnabled ? 'Enabled' : 'Disabled');
                        setIsTwoFactorModalOpen(false);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-[#D0705B] text-white font-medium hover:bg-[#B85F4C] transition-colors"
                    >
                      Mentés
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsTwoFactorModalOpen(false)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-[#4A2C24]/30 text-[#FDF8F3] hover:bg-[#4A2C24]/50'
                          : 'bg-[#E8DCD1]/30 text-[#2A2421] hover:bg-[#E8DCD1]/50'
                      }`}
                    >
                      Mégse
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Active Sessions Modal */}
          <AnimatePresence>
            {isActiveSessionsModalOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsActiveSessionsModalOpen(false)}
                  className="fixed inset-0 bg-black/40 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[80vh] overflow-y-auto rounded-3xl soft-shadow z-50 transition-colors duration-500 ${
                    isDarkMode ? 'bg-[#2A2421]' : 'bg-[#FAF5F0]'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-[#D0705B]/20 sticky top-0 bg-inherit rounded-t-3xl">
                    <h3 className={`text-xl font-serif font-bold transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                      Aktív Munkamenetek
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsActiveSessionsModalOpen(false)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-[#4A2C24] text-[#FDF8F3]' : 'hover:bg-[#E8DCD1] text-[#2A2421]'
                      }`}
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {activeSessions.map((session, idx) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-lg transition-colors ${
                          isDarkMode
                            ? `${session.current ? 'bg-[#D0705B]/20 border border-[#D0705B]/30' : 'bg-[#4A2C24]/30'}`
                            : `${session.current ? 'bg-[#D0705B]/10 border border-[#D0705B]/20' : 'bg-[#E8DCD1]/30'}`
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{session.deviceType}</span>
                              <div>
                                <p className={`font-medium transition-colors ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                                  {session.device}
                                </p>
                                {session.current && (
                                  <p className="text-xs text-[#D0705B] font-semibold">Jelenlegi eszköz</p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1 text-xs">
                              <p className={`transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                                📍 {session.location}
                              </p>
                              <p className={`transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                                🕐 {session.lastActive}
                              </p>
                              <p className={`transition-colors ${isDarkMode ? 'text-[#A58876]' : 'text-[#8A7E7A]'}`}>
                                🔗 IP: {session.ipAddress}
                              </p>
                            </div>
                          </div>

                          {!session.current && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isDarkMode
                                  ? 'bg-[#EF5350]/20 text-[#EF5350] hover:bg-[#EF5350]/30'
                                  : 'bg-[#EF5350]/10 text-[#EF5350] hover:bg-[#EF5350]/20'
                              }`}
                              onClick={() => console.log('Disconnect session:', session.id)}
                            >
                              Kijelentkezés
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className={`border-t transition-colors p-6 sticky bottom-0 bg-inherit ${isDarkMode ? 'bg-[#2A2421]/50 border-[#4A2C24]/30' : 'bg-white/50 border-[#E8DCD1]/30'}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsActiveSessionsModalOpen(false)}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-[#4A2C24]/30 text-[#FDF8F3] hover:bg-[#4A2C24]/50'
                          : 'bg-[#E8DCD1]/30 text-[#2A2421] hover:bg-[#E8DCD1]/50'
                      }`}
                    >
                      Bezárás
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};
