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
    <div className="min-h-screen bg-[#F4F7FB] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#111844] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#4B5694]/40 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-4">
            <img src="/assets/logo.png" alt="" className="h-20 w-20 rounded-2xl bg-white/95 object-contain p-2" />
            <div>
              <p className="text-xl font-bold">مركز العيادات التخصصية</p>
              <p className="mt-1 text-sm text-white/70">Specialized Clinics Center</p>
            </div>
          </div>
          <div className="mt-28 max-w-lg">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#B9C9E8]">{t('login.tagline')}</p>
            <h1 className="text-5xl font-bold leading-tight">Care that feels personal.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/75">{t('login.subtitle')}</p>
          </div>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-white/70">
          <ShieldCheck size={18} /> <span>{t('login.secureAccess')}</span>
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/assets/logo.png" alt="" className="h-14 w-14 rounded-xl bg-white object-contain p-1 shadow-sm" />
            <div>
              <p className="font-bold text-[#102F63]">مركز العيادات التخصصية</p>
              <p className="text-xs text-[#64748B]">Specialized Clinics Center</p>
            </div>
          </div>
        <div className="rounded-2xl border border-[#DCE3EF] bg-white p-6 shadow-[0_18px_55px_rgba(16,47,99,0.12)] sm:p-9">
          <h2 className="text-[28px] font-bold text-[#102F63] mb-1">{t('login.title')}</h2>
          <p className="text-[13px] text-[#64748B] mb-6">{t('login.subtitle')}</p>

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
                <Mail size={17} strokeWidth={1.75} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="ui-input pr-11"
                  placeholder={t('login.emailPlaceholder')}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#102F63] mb-2">{t('login.password')}</label>
              <div className="relative">
                <Lock size={17} strokeWidth={1.75} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="ui-input pr-11 pl-11"
                  placeholder={t('login.passwordPlaceholder')}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#173B78]"
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
        <p className="mt-6 text-center text-xs text-[#94A3B8]">{t('login.copyright')}</p>
        </div>
      </main>
    </div>
  );
}
