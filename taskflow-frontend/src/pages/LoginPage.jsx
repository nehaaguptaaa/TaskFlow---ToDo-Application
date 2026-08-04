import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!EMAIL_REGEX.test(email)) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ email: true, password: true });
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      login(res.data.token, { fullName: res.data.fullName, email: res.data.email });
      navigate("/calendar");
    } catch (err) {
      setServerError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (field) =>
    `w-full border rounded px-3 py-2 bg-paper focus:outline-none focus:ring-2 transition-shadow ${
      touched[field] && errors[field]
        ? "border-brick focus:ring-brick/30 focus:border-brick"
        : "border-line focus:ring-accent/40 focus:border-accent"
    }`;

  return (
    <div className="flex items-center justify-center min-h-screen bg-paper">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-paper-raised border border-line p-8 rounded-lg shadow-sm w-full max-w-sm animate-[fadeUp_0.3s_ease-out]"
      >
        <p className="font-mono text-xs tracking-widest text-ink-soft uppercase mb-1">Daily Planner</p>
        <h2 className="font-display text-2xl font-semibold mb-6 text-ink">Welcome back</h2>

        {serverError && (
          <p className="text-brick text-sm mb-4 bg-brick/10 border border-brick/20 rounded px-3 py-2">
            {serverError}
          </p>
        )}

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => { setTouched((t) => ({ ...t, email: true })); setErrors(validate()); }}
            className={fieldClass("email")}
          />
          {touched.email && errors.email && <p className="text-brick text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => { setTouched((t) => ({ ...t, password: true })); setErrors(validate()); }}
              className={`${fieldClass("password")} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {touched.password && errors.password && <p className="text-brick text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent hover:bg-accent-deep text-white font-medium py-2 rounded transition-colors disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Login"}
        </button>

        <p className="text-sm text-center mt-4 text-ink-soft">
          No account? <Link to="/register" className="text-accent hover:text-accent-deep">Register</Link>
        </p>
      </form>
    </div>
  );
}