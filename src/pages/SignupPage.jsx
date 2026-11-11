import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import Button from "../components/ui/Button.jsx";
import { loadPresetAsFile } from "../utils/presetAvatar.js";
import bearBook from "../assets/avatars/bear-book.svg";
import rabbitCinema from "../assets/avatars/rabbit-cinema.svg";
import wolfGaming from "../assets/avatars/wolf-gaming.svg";
import giraffeSeries from "../assets/avatars/giraffe-series.svg";
import styles from "./LoginPage.module.css";

const usernamePattern = /^[a-zA-Z0-9_-]+$/;

const PRESET_AVATARS = [
  { id: "bear-book", label: "Urso leitor", src: bearBook },
  { id: "rabbit-cinema", label: "Coelho no cinema", src: rabbitCinema },
  { id: "wolf-gaming", label: "Lobo gamer", src: wolfGaming },
  { id: "giraffe-series", label: "Girafa das séries", src: giraffeSeries },
];

function validateUsername(username) {
  if (!username) {
    return "Informe um username.";
  }
  if (username.startsWith("@")) {
    return "Informe o username sem @.";
  }
  if (username.length < 3 || username.length > 30) {
    return "O username deve ter entre 3 e 30 caracteres.";
  }
  if (!usernamePattern.test(username)) {
    return "Use apenas letras, números, hífen e underline.";
  }
  return "";
}

function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    username: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!avatarFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (name === "username") {
      setUsernameError("");
    }
  };

  const handleAvatarChange = (event) => {
    setAvatarFile(event.target.files?.[0] ?? null);
    setSelectedPresetId("");
    setAvatarError("");
  };

  const handlePresetSelect = async (preset) => {
    setAvatarError("");
    try {
      const file = await loadPresetAsFile(preset.src, preset.id);
      setAvatarFile(file);
      setSelectedPresetId(preset.id);
    } catch (err) {
      setAvatarError(err.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setUsernameError("");
    setAvatarError("");

    const normalizedUsername = formData.username.trim().toLowerCase();
    const nextUsernameError = validateUsername(normalizedUsername);
    if (nextUsernameError) {
      setUsernameError(nextUsernameError);
      return;
    }

    if (!avatarFile) {
      setAvatarError("Selecione uma foto de perfil.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp(
        {
          ...formData,
          username: normalizedUsername,
          age: Number(formData.age),
          phone: formData.phone.trim() || undefined,
        },
        avatarFile,
      );
      navigate("/profile", { replace: true });
    } catch (err) {
      if (err.message.toLowerCase().includes("username")) {
        setUsernameError(err.message);
      } else if (
        err.message.toLowerCase().includes("imagem") ||
        err.message.toLowerCase().includes("avatar")
      ) {
        setAvatarError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.form}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>F</span>
          <h1 className={styles.brandName}>Finis</h1>
        </div>

        <p className={styles.tagline}>
          Crie sua conta e comece a registrar tudo que você consumiu.
        </p>

        <form className={styles.fields} onSubmit={handleSubmit}>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Nome</span>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Sobrenome</span>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>E-mail</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ana@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Senha</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              placeholder="Mínimo de 8 caracteres"
              autoComplete="new-password"
              required
            />
          </label>

          <label className={styles.field} htmlFor="username">
            <span>Username</span>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              maxLength={30}
              placeholder="ana_vieira"
              autoComplete="username"
              required
              aria-describedby={usernameError ? "username-error" : undefined}
              aria-invalid={Boolean(usernameError)}
            />
            {usernameError ? (
              <span
                id="username-error"
                className={styles.errorMessage}
                role="alert"
              >
                {usernameError}
              </span>
            ) : null}
          </label>

          <section className={styles.avatarSection}>
            <Avatar src={previewUrl} alt="Prévia da foto de perfil" size="lg" />
            <div className={styles.avatarControls}>
              <label className={styles.field} htmlFor="avatar">
                <span>Foto de perfil</span>
                <input
                  id="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                />
              </label>

              <div className={styles.presetPicker}>
                <span className={styles.presetLabel}>
                  Ou escolha uma foto pronta
                </span>
                <div
                  className={styles.presetOptions}
                  role="group"
                  aria-label="Fotos prontas"
                >
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={[
                        styles.presetOption,
                        selectedPresetId === preset.id
                          ? styles.presetOptionSelected
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handlePresetSelect(preset)}
                      aria-pressed={selectedPresetId === preset.id}
                      title={preset.label}
                    >
                      <img src={preset.src} alt={preset.label} />
                    </button>
                  ))}
                </div>
              </div>

              {avatarError ? (
                <span className={styles.errorMessage} role="alert">
                  {avatarError}
                </span>
              ) : null}
            </div>
          </section>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Idade</span>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="13"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Celular opcional</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+5511999999999"
                autoComplete="tel"
              />
            </label>
          </div>

          {error ? (
            <p
              className={styles.errorMessage}
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => navigate("/")}
          >
            Ja tenho uma conta
          </Button>
        </form>
      </section>

      <section className={styles.showcase} aria-hidden="true">
        <div className={styles.signupPanel}>
          <span className={styles.pillarLabel}>Autenticação real</span>
          <h2>Seu espaço cultural começa com uma sessão segura.</h2>
          <p>
            O cadastro cria a conta no backend, gera um token JWT e inicia a
            sessão automaticamente.
          </p>
        </div>
      </section>
    </div>
  );
}

export default SignupPage;
