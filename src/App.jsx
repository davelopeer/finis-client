import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
import CreateReviewPage from "./pages/CreateReviewPage.jsx";
import RegisterFinisPage from "./pages/RegisterFinisPage.jsx";
import RequestWorkPage from "./pages/RequestWorkPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import StaticPage from "./pages/StaticPage.jsx";

function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/profile" replace /> : <LoginPage />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/cadastro" element={<SignupPage />} />

      <Route element={<PublicLayout />}>
        <Route path="/user/:username" element={<ProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/perfil" element={<Navigate to="/profile" replace />} />
          <Route
            path="/perfil/editar"
            element={<Navigate to="/profile/edit" replace />}
          />
          <Route path="/criar-review" element={<CreateReviewPage />} />
          <Route path="/criar-review/solicitar" element={<RequestWorkPage />} />
          <Route
            path="/criar-review/:mediaType"
            element={<RegisterFinisPage />}
          />
          <Route path="/amigos" element={<FriendsPage />} />

          <Route
            path="/quem-somos"
            element={
              <StaticPage
                title="Quem somos"
                subtitle="Uma biblioteca moderna que virou rede social."
              >
                <p>
                  Finis nasce da crença de que o que lemos, assistimos e jogamos
                  diz muito sobre quem somos. Aqui você registra sua trajetória
                  cultural, para si mesmo.
                </p>
                <p>
                  Aqui não tem métrica de popularidade, só conversa honesta
                  sobre obras — de clássicos a descobertas recentes.
                </p>
              </StaticPage>
            }
          />
          <Route
            path="/contato"
            element={
              <StaticPage
                title="Contato"
                subtitle="Adoramos ouvir leitores, espectadores e jogadores."
              >
                <p>Email: ola@finis.app</p>
                <p>Instagram: @finis.app</p>
              </StaticPage>
            }
          />
          <Route
            path="/faq"
            element={
              <StaticPage
                title="Perguntas frequentes"
                subtitle="As dúvidas mais comuns."
              >
                <p>
                  <strong>Posso importar meus livros do Goodreads?</strong> Em
                  breve.
                </p>
                <p>
                  <strong>Finis é gratuito?</strong> Sim, nas funcionalidades
                  principais.
                </p>
                <p>
                  <strong>Como descubro amigos?</strong> Pela página de amigos,
                  buscando por nickname ou id.
                </p>
              </StaticPage>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
