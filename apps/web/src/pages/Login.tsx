import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      navigate('/dashboard');
    } catch (err) {
      const error = err as Error & { status?: number };
      const status = error.status || 0;

      // Handle errors by HTTP status code instead of string matching
      if (status === 429) {
        setError(t('login.tooManyAttempts'));
      } else if (status === 401) {
        // 401 covers both invalid credentials and inactive accounts
        // Backend returns generic message for both, so we use the message text
        // to distinguish between them if available
        const errorMessage = error.message;
        if (errorMessage.includes('inactive') || errorMessage.includes('تعطيل')) {
          setError(t('login.accountInactive'));
        } else {
          setError(t('login.invalidCredentials'));
        }
      } else {
        setError(error.message || t('login.invalidCredentials'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F8FC] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -top-28 start-[-10%] h-72 w-[120%] rounded-[50%] bg-[#DDEBFA] sm:-top-44 sm:h-[26rem]" />
      <div className="pointer-events-none absolute -bottom-36 end-[-12%] h-72 w-[120%] rounded-[50%] bg-[#C8DCF4] sm:-bottom-52 sm:h-[28rem]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/80 to-transparent" />

      <main className="relative z-10 w-full max-w-[480px]">
        <div className="mb-5 flex items-center justify-center gap-3">
          <img src="/assets/logo.png" alt="" className="h-14 w-14 rounded-2xl bg-white object-contain p-1.5 shadow-md" />
          <div className="text-start">
            <p className="font-bold text-[#102F63]">مركز العيادات التخصصية</p>
            <p className="text-xs text-[#64748B]">Specialized Clinics Center</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-[0_22px_65px_rgba(16,47,99,0.18)] backdrop-blur sm:p-10">
          <div className="absolute -end-16 -top-16 h-32 w-32 rounded-full bg-[#E7F0FB]" />
          <div className="relative mb-6 text-center">
            <img src="/assets/clinic-login-visual.jfif" alt="" className="mx-auto mb-4 h-24 w-36 rounded-xl object-contain opacity-90 shadow-sm sm:h-28 sm:w-44" />
            <h1 className="text-[28px] font-bold text-[#102F63]">{t('login.title')}</h1>
            <p className="mt-1 text-[13px] text-[#64748B]">{t('login.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 px-3.5 py-3 bg-red-50 border border-red-100 text-[#C4362B] rounded-[10px] text-[13px]">
              <AlertCircle size={16} className="shrink-0 mt-0.5" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#102F63] mb-2">{t('login.email')}</label>
              <div className="relative">
                <Mail size={17} strokeWidth={1.75} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="ui-input ps-11"
                  placeholder={t('login.emailPlaceholder')}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#102F63] mb-2">{t('login.password')}</label>
              <div className="relative">
                <Lock size={17} strokeWidth={1.75} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="ui-input ps-11 pe-11"
                  placeholder={t('login.passwordPlaceholder')}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#173B78]"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] text-[#64748B] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E2E8F0] text-[#173B78] focus:ring-[#173B78]"
                  disabled={loading}
                />
                {t('login.rememberMe')}
              </label>
              <button
                type="button"
                className="text-[13px] text-[#64748B] cursor-not-allowed opacity-50"
                disabled={true}
                title="Password reset is not yet available"
              >
                {t('login.forgotPassword')}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-[14px]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t('login.loggingIn')}
                </span>
              ) : (
                t('login.submit')
              )}
            </button>
          </form>
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <ShieldCheck size={15} className="text-[#4B5694]" />
          <span>{t('login.secureAccess')}</span>
        </div>
        <p className="mt-2 text-center text-xs text-[#94A3B8]">{t('login.copyright')}</p>
      </main>
    </div>
  );
}
