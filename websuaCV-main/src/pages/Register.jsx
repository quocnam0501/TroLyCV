import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  UserPlus,
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import AuthLayout from "@/components/AuthLayout";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  generateOtpCode,
  getPendingOtp,
  checkSmtpStatus,
} from "@/utils/emailService";

// Helper kiểm tra email hợp lệ
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Helper tính độ mạnh mật khẩu (1 - 4)
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 8) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd) || /[A-Z]/.test(pwd)) score += 1;

  if (score <= 1) return { score: 1, label: "Yếu", color: "bg-red-500 text-red-600" };
  if (score === 2) return { score: 2, label: "Trung bình", color: "bg-amber-500 text-amber-600" };
  if (score === 3) return { score: 3, label: "Khá", color: "bg-blue-500 text-blue-600" };
  return { score: 4, label: "Mạnh", color: "bg-emerald-500 text-emerald-600" };
}

export default function Register() {
  const navigate = useNavigate();

  const { register, isAuthenticated, isLoadingAuth } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [smtpInfo, setSmtpInfo] = useState({ configured: false });
  const [sendResult, setSendResult] = useState(null);

  const returnTo = safeReturnTo();
  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate, returnTo]);

  useEffect(() => {
    checkSmtpStatus().then((status) => {
      if (status) setSmtpInfo(status);
    });
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập Họ và tên của bạn.";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên tối thiểu 2 ký tự.";
    }

    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập địa chỉ Email.";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Định dạng email không hợp lệ (ví dụ: ten@gmail.com).";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu xác nhận.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });

      if (!data?.user) {
        throw new Error("Đăng ký không thành công. Không nhận được phản hồi người dùng.");
      }

      // Nếu đã có session ngay (tự động đăng nhập)
      if (data.session) {
        toast({
          title: "Đăng ký thành công!",
          description: `Chào mừng ${fullName} gia nhập TroLyCV.`,
        });
        return;
      }

      // Chưa có session -> Tạo và gửi mã OTP (thật qua SMTP cấu hình từ file .env / .evn)
      const otp = generateOtpCode();
      const res = await sendVerificationEmail({
        toEmail: email.trim(),
        fullName: fullName.trim(),
        otpCode: otp,
      });

      setSendResult(res);
      setShowOtp(true);

      if (res?.method === "smtp") {
        toast({
          title: "Đã gửi email xác thực thật!",
          description: `Mã 6 chữ số đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư (cả mục Spam).`,
        });
      } else if (res?.method === "smtp_error") {
        toast({
          variant: "destructive",
          title: "Cảnh báo gửi mail qua SMTP",
          description: res?.message || "Không gửi được qua SMTP. Kiểm tra thông tin trong file .env hoặc .evn",
        });
      } else {
        toast({
          title: "Chế độ Thử Nghiệm",
          description: `Chế độ thử nghiệm: Mã xác thực của bạn là ${otp}`,
        });
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setGeneralError(
        err?.message === "User already registered"
          ? "Email này đã được đăng ký. Vui lòng đăng nhập!"
          : err?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      setGeneralError("Vui lòng nhập đủ 6 chữ số mã xác thực.");
      return;
    }

    setGeneralError("");
    setLoading(true);

    try {
      // Đối chiếu mã OTP đã gửi
      const pendingCode = getPendingOtp(email);
      if (pendingCode && otpCode !== pendingCode && otpCode !== "123456") {
        setGeneralError("Mã xác thực không chính xác. Vui lòng kiểm tra mã số gửi về email của bạn.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode,
        type: "email",
      });

      if (error) {
        throw error;
      }

      // Gửi email chào mừng kích hoạt tài khoản thành công
      sendWelcomeEmail({
        toEmail: email.trim(),
        fullName: fullName.trim(),
      }).catch((e) => console.warn("Welcome email error:", e));

      toast({
        title: "Xác thực thành công!",
        description: "Tài khoản của bạn đã được kích hoạt.",
      });
    } catch (err) {
      console.error("Email verification failed:", err);
      setGeneralError(
        err?.message || "Mã xác thực không hợp lệ hoặc đã hết hạn. Hãy thử lại mã 123456."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setGeneralError("");
    setLoading(true);

    try {
      const newOtp = generateOtpCode();
      const res = await sendVerificationEmail({
        toEmail: email.trim(),
        fullName: fullName.trim(),
        otpCode: newOtp,
      });

      setSendResult(res);

      if (res?.method === "smtp") {
        toast({
          title: "Đã gửi lại email xác thực thật!",
          description: `Mã OTP mới đã được gửi tới ${email}.`,
        });
      } else {
        toast({
          title: "Đã tạo mã xác thực mới",
          description: `Mã xác thực mới của bạn là: ${newOtp}`,
        });
      }
    } catch (err) {
      console.error("Resend failed:", err);
      setGeneralError(err?.message || "Gửi lại mã thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    const isReal = sendResult?.method === "smtp" || (smtpInfo?.configured && !sendResult);
    const isError = sendResult?.method === "smtp_error";

    return (
      <AuthLayout
        icon={Mail}
        title="Xác thực Email của bạn"
        subtitle={`Hệ thống đã gửi yêu cầu xác thực tới ${email}.`}
      >
        {isReal ? (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed text-center shadow-sm">
            📬 <strong>Đã gửi email thật!</strong> Hãy mở hộp thư <strong>{email}</strong> (kiểm tra cả mục Hòm thư Rác / Spam) để lấy mã xác thực 6 chữ số.
          </div>
        ) : isError ? (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs text-left leading-relaxed shadow-sm">
            <div className="font-bold text-amber-800 mb-1">⚠️ Chưa gửi được qua SMTP:</div>
            <p className="text-[11px] text-amber-700 mb-2">{sendResult?.message}</p>
            <div className="text-center pt-1 border-t border-amber-200">
              💡 Bạn có thể dùng mã tạm:{" "}
              <button
                type="button"
                onClick={() => setOtpCode(getPendingOtp(email) || "123456")}
                className="font-bold underline text-amber-950 inline px-1 bg-white rounded border border-amber-300"
              >
                Điền {getPendingOtp(email) || "123456"}
              </button>{" "}
              để hoàn tất.
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs text-center leading-relaxed">
            💡 <strong>Chế độ Thử Nghiệm Thông Minh:</strong> Nhập mã xác thực của bạn hoặc bấm{" "}
            <button
              type="button"
              onClick={() => setOtpCode(getPendingOtp(email) || "123456")}
              className="font-bold underline text-indigo-900 hover:text-black inline px-1 bg-white rounded border border-indigo-300"
            >
              Điền nhanh {getPendingOtp(email) || "123456"}
            </button>{" "}
            để kích hoạt tài khoản ngay.
          </div>
        )}

        {generalError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={(val) => {
              setOtpCode(val);
              if (generalError) setGeneralError("");
            }}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          className="w-full h-12 font-semibold shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleVerify}
          disabled={loading || otpCode.length !== 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xác thực...
            </>
          ) : (
            "Kích hoạt tài khoản"
          )}
        </Button>

        <div className="mt-5 space-y-3 text-center text-sm text-muted-foreground">
          <p>
            Chưa nhận được mã?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-primary font-medium hover:underline inline-block"
              disabled={loading}
            >
              Gửi lại email xác thực
            </button>
          </p>

          <button
            type="button"
            onClick={() => {
              setShowOtp(false);
              setOtpCode("");
              setGeneralError("");
            }}
            className="w-full text-xs text-muted-foreground hover:text-foreground underline pt-2"
          >
            ← Quay lại form đăng ký
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Tạo tài khoản mới"
      subtitle="Đăng ký để tạo CV chuyên nghiệp và đối chiếu JD việc làm"
      footer={
        <>
          Bạn đã có tài khoản?{" "}
          <Link
            to={"/login" + (returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : "")}
            className="text-primary font-semibold hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </>
      }
    >

      {generalError && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Thông tin trạng thái gửi email từ file .env / .evn */}
      {smtpInfo?.configured ? (
        <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <div>
            <strong>Gửi email thật qua SMTP:</strong> Đã kết nối hộp thư{" "}
            <span className="font-mono font-medium">{smtpInfo.userMasked || 'Gmail'}</span>{" "}
            (cấu hình từ file .env)
          </div>
        </div>
      ) : (
        <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">✉️</span>
            <span>Gửi mã xác thực về email thật: Điền tài khoản vào file <code>.env</code> (hoặc <code>.evn</code>)</span>
          </div>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium shrink-0 ml-2">
            Thử nghiệm
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Họ và tên */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-semibold">
            Họ và tên <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="fullName"
              type="text"
              placeholder="Ví dụ: Nguyễn Văn An"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({ ...errors, fullName: null });
              }}
              className={`pl-10 h-11 ${errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold">
            Email <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tenban@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              className={`pl-10 h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>

        {/* Mật khẩu */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-sm font-semibold">
              Mật khẩu <span className="text-destructive">*</span>
            </Label>
            {password && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${strength.color}`}>
                Độ mạnh: {strength.label}
              </span>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              className={`pl-10 h-11 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-sm font-semibold">
            Xác nhận mật khẩu <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Nhập lại đúng mật khẩu"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
              }}
              className={`pl-10 h-11 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            "Đăng ký tài khoản"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}