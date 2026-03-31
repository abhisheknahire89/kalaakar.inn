import { sendPhoneOTP, verifyPhoneOTP, continueAsGuest, getCurrentUser, getCreatorProfile } from '../auth.js';
import { navigateTo } from '../router.js';
import { showToast } from '../components/toast.js';

let otpUserId = null;
let resendCountdown = null;

let loginViewInitialized = false;

export function initLoginView() {
  if (loginViewInitialized) return;
  loginViewInitialized = true;

  document.getElementById('send-otp-btn').addEventListener('click', handleSendOTP);
  document.getElementById('verify-otp-btn').addEventListener('click', handleVerifyOTP);
  document.getElementById('resend-btn').addEventListener('click', handleResendOTP);
  document.getElementById('change-number-btn').addEventListener('click', showPhoneForm);
  document.getElementById('guest-btn').addEventListener('click', handleGuestLogin);
  
  initOTPInputs();
}

async function handleSendOTP() {
  const countryCode = document.getElementById('country-code').value;
  const phoneNumber = document.getElementById('phone-input').value.trim();

  if (!phoneNumber || phoneNumber.length < 10) {
    showToast('Please enter a valid 10-digit phone number.', 'warning');
    return;
  }

  const fullPhone = countryCode + phoneNumber;
  const btn = document.getElementById('send-otp-btn');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  const result = await sendPhoneOTP(fullPhone);

  if (result.success) {
    otpUserId = result.userId;
    document.getElementById('phone-form').classList.add('hidden');
    document.getElementById('otp-form').classList.remove('hidden');
    document.getElementById('otp-phone-display').textContent = fullPhone.replace(/(\+\d{2})(\d{5})(\d{5})/, '$1 $2 $3');
    document.querySelector('.otp-digit[data-index="0"]').focus();
    startResendCountdown(30);
    showToast('OTP sent to your phone!', 'success');
  } else {
    showToast(result.error, 'error');
  }

  btn.disabled = false;
  btn.textContent = 'Send OTP';
}

async function handleVerifyOTP() {
  const digits = document.querySelectorAll('.otp-digit');
  const otp = Array.from(digits).map(d => d.value).join('');

  if (otp.length !== 4) {
    showToast('Please enter all 4 digits.', 'warning');
    return;
  }

  const btn = document.getElementById('verify-otp-btn');
  btn.disabled = true;
  btn.textContent = 'Verifying...';

  const result = await verifyPhoneOTP(otpUserId, otp);

  if (result.success) {
    showToast('Login successful!', 'success');
    await handlePostLogin();
  } else {
    showToast(result.error, 'error');
    digits.forEach(d => { d.value = ''; });
    digits[0].focus();
  }

  btn.disabled = false;
  btn.textContent = 'Verify';
}

function initOTPInputs() {
  const digits = document.querySelectorAll('.otp-digit');

  digits.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      if (value && index < 3) digits[index + 1].focus();
      if (index === 3 && value) handleVerifyOTP();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) digits[index - 1].focus();
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').trim();
      if (/^\d{4}$/.test(pasted)) {
        digits.forEach((d, i) => { d.value = pasted[i]; });
        digits[3].focus();
        handleVerifyOTP();
      }
    });
  });
}

function startResendCountdown(seconds) {
  let remaining = seconds;
  const timerEl = document.getElementById('resend-timer');
  const resendBtn = document.getElementById('resend-btn');

  timerEl.classList.remove('hidden');
  resendBtn.classList.add('hidden');

  clearInterval(resendCountdown);
  resendCountdown = setInterval(() => {
    remaining--;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    timerEl.textContent = `Resend in ${mins}:${secs.toString().padStart(2, '0')}`;

    if (remaining <= 0) {
      clearInterval(resendCountdown);
      timerEl.classList.add('hidden');
      resendBtn.classList.remove('hidden');
    }
  }, 1000);
}

async function handleResendOTP() {
  const phone = document.getElementById('otp-phone-display').textContent.replace(/\s/g, '');
  const result = await sendPhoneOTP(phone);
  if (result.success) {
    otpUserId = result.userId;
    showToast('New OTP sent!', 'success');
    startResendCountdown(30);
  } else {
    showToast(result.error, 'error');
  }
}

function showPhoneForm() {
  document.getElementById('phone-form').classList.remove('hidden');
  document.getElementById('otp-form').classList.add('hidden');
  clearInterval(resendCountdown);
}

async function handleGuestLogin() {
  const btn = document.getElementById('guest-btn');
  btn.disabled = true;
  btn.innerHTML = 'Connecting...';
  
  const result = await continueAsGuest();
  if (result.success) {
    showToast('Logged in as Guest', 'success');
    await handlePostLogin();
  } else {
    showToast(result.error, 'error');
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="user" class="w-5 h-5 mr-2"></i> Continue as Guest';
    if (window.lucide) window.lucide.createIcons();
  }
}

export async function handlePostLogin() {
  const user = await getCurrentUser();
  if (!user) return;

  const profile = await getCreatorProfile(user.$id);

  if (!profile) {
    navigateTo('onboarding');
    import('./onboarding.js').then(m => m.initOnboardingView());
  } else {
    window.location.hash = 'stage';
    import('../app.js').then(m => m.boot());
  }
}
