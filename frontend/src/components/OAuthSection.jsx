import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { OAUTH_PROVIDERS } from "../config/oauth";
import { getGoogleConfig, loginWithGoogle } from "../api/authApi";
import "./OAuthSection.css";

const PROVIDER_ICONS = {
  google: FcGoogle,
  github: FaGithub,
};

let googleScriptPromise = null;

const loadGoogleScript = () => {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Unable to load Google sign-in."))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Google sign-in."));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

function OAuthSection({
  mode = "login",
  dividerText = "or continue with email",
  onSuccess,
}) {
  const [notice, setNotice] = useState("");
  const [loadingProvider, setLoadingProvider] = useState("");
  const [googleClientId, setGoogleClientId] = useState("");

  useEffect(() => {
    let active = true;

    getGoogleConfig()
      .then((response) => {
        if (active) {
          setGoogleClientId(response.data?.clientId || "");
        }
      })
      .catch(() => {
        if (active) setGoogleClientId("");
      });

    return () => {
      active = false;
    };
  }, []);

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 4000);
  };

  const handleGoogleSignIn = async () => {
    if (!googleClientId) {
      showNotice(
        "Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID in the backend .env file."
      );
      return;
    }

    setLoadingProvider("google");

    try {
      await loadGoogleScript();

      await new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          callback: async (tokenResponse) => {
            try {
              if (tokenResponse.error) {
                throw new Error(tokenResponse.error);
              }

              const response = await loginWithGoogle({
                accessToken: tokenResponse.access_token,
              });
              onSuccess?.(response.data);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
        });

        client.requestAccessToken();
      });
    } catch (error) {
      showNotice(
        error.response?.data?.message ||
          "Google sign-in was cancelled or failed."
      );
    } finally {
      setLoadingProvider("");
    }
  };

  const handleOAuthClick = (providerId, providerName) => {
    if (providerId === "google") {
      handleGoogleSignIn();
      return;
    }

    showNotice(`${providerName} sign-in coming soon.`);
  };

  const enabledProviders = OAUTH_PROVIDERS.filter((provider) => provider.enabled);

  return (
    <div className="oauth-section">
      {notice && <p className="oauth-notice">{notice}</p>}

      <div className="oauth-buttons">
        {enabledProviders.map((provider) => {
          const Icon = PROVIDER_ICONS[provider.id];

          return (
            <button
              key={provider.id}
              type="button"
              className={`oauth-button oauth-button--${provider.id}`}
              onClick={() => handleOAuthClick(provider.id, provider.name)}
              disabled={Boolean(loadingProvider)}
            >
              {Icon && <Icon className="oauth-button__icon" aria-hidden="true" />}
              <span>
                {loadingProvider === provider.id
                  ? "Connecting..."
                  : `Continue with ${provider.name}`}
              </span>
            </button>
          );
        })}
      </div>

      <div className="auth-divider">
        <span>{dividerText}</span>
      </div>
    </div>
  );
}

export default OAuthSection;
