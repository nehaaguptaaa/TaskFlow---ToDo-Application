import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const NAME_REGEX = /^[A-Za-z ]+$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,20}$/;

function validate({ fullName, email, password, confirmPassword }) {
  const errors = {};

  const name = fullName.trim();
  if (!name) errors.fullName = "Full name is required";
  else if (name.length < 3 || name.length > 30) errors.fullName = "Must be 3-30 characters";
  else if (!NAME_REGEX.test(name)) errors.fullName = "Only letters and spaces allowed";

  if (!email.trim()) errors.email = "Email is required";
  else if (email.length > 100) errors.email = "Email cannot exceed 100 characters";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Enter a valid email address";

  if (!password) errors.password = "Password is required";
  else if (!PASSWORD_REGEX.test(password))
    errors.password = "8-20 chars, incl. uppercase, lowercase, digit & symbol (@#$%^&+=!)";

  if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (password && confirmPassword !== password) errors.confirmPassword = "Passwords do not match";

  return errors;
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const fields = { fullName, email, password, confirmPassword };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(fields));
  };

  const handleChange = (field, value) => {
    const next = { ...fields, [field]: value };
    if (field === "fullName") setFullName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
    if (touched[field]) setErrors(validate(next));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const validationErrors = validate(fields);
    setErrors(validationErrors);
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/auth/register", { fullName, email, password });
      login(res.data.token, { fullName: res.data.fullName, email: res.data.email });
      navigate("/calendar");
    } catch (err) {
      if (err.response?.status === 400) {
        const data = err.response.data;
        setServerError(typeof data === "object" ? Object.values(data).join(", ") : data);
      } else {
        setServerError("Registration failed");
      }
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
        <h2 className="font-display text-2xl font-semibold mb-6 text-ink">Create account</h2>

        {serverError && (
          <p className="text-brick text-sm mb-4 bg-brick/10 border border-brick/20 rounded px-3 py-2">
            {serverError}
          </p>
        )}

        {/* Full Name */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            maxLength={25}
            onChange={(e) => handleChange("fullName", e.target.value)}
            onBlur={() => handleBlur("fullName")}
            className={fieldClass("fullName")}
          />
          {touched.fullName && errors.fullName && (
            <p className="text-brick text-xs mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={fieldClass("email")}
          />
          {touched.email && errors.email && (
            <p className="text-brick text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              maxLength={25}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
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
          {touched.password && errors.password ? (
            <p className="text-brick text-xs mt-1">{errors.password}</p>
          ) : (
            <p className="text-ink-soft text-[11px] mt-1">
              8-20 characters, with uppercase, lowercase, a digit and a symbol.
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              className={`${fieldClass("confirmPassword")} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="text-brick text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent hover:bg-accent-deep text-white font-medium py-2 rounded transition-colors disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p className="text-sm text-center mt-4 text-ink-soft">
          Already have an account? <Link to="/login" className="text-accent hover:text-accent-deep">Login</Link>
        </p>
      </form>
    </div>
  );
}