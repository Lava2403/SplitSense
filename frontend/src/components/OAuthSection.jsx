import { useEffect, useRef, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { OAUTH_PROVIDERS } from "../config/oauth";
import { loginWithGoogle } from "../api/authApi";
import "./OAuthSection.css";

const PROVIDER_ICONS = {
  github: FaGithub,
};

let googleScriptPromise = null;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
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

    script.onerror = () =>
      reject(new Error("Unable to load Google sign-in."));

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

  const googleButtonRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let active = true;

    const setupGoogle = async () => {
      if (!googleClientId) {
        setNotice(
          "Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend .env file."
        );
        return;
      }

      try {
        await loadGoogleScript();

        if (!active || !googleButtonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: googleClientId,

          callback: async (response) => {
            setLoadingProvider("google");
            setNotice("");

            try {
              if (!response?.credential) {
                throw new Error("Google did not return a credential.");
              }

              const result = await loginWithGoogle({
                credential: response.credential,
              });

              onSuccess?.(result.data);
            } catch (error) {
              setNotice(
                error.response?.data?.message ||
                  "Google sign-in failed. Please try again."
              );
            } finally {
              setLoadingProvider("");
            }
          },
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 320,
          }
        );
      } catch (error) {
        if (active) {
          setNotice(
            "Unable to load Google sign-in. Please refresh and try again."
          );
        }
      }
    };

    setupGoogle();

    return () => {
      active = false;
    };
  }, [googleClientId, onSuccess]);

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 4000);
  };

  const handleOAuthClick = (providerId, providerName) => {
    if (providerId === "google") {
      return;
    }

    showNotice(`${providerName} sign-in coming soon.`);
  };

  const enabledProviders = OAUTH_PROVIDERS.filter(
    (provider) => provider.enabled
  );

  return (
    <div className="oauth-section">
      {notice && <p className="oauth-notice">{notice}</p>}

      <div className="oauth-buttons">
        {enabledProviders.map((provider) => {
          if (provider.id === "google") {
            return (
              <div
                key="google"
                className="oauth-button oauth-button--google"
              >
                {loadingProvider === "google" && (
                  <div className="oauth-loading">
                    Connecting...
                  </div>
                )}

                <div
                  ref={googleButtonRef}
                  style={{
                    display:
                      loadingProvider === "google"
                        ? "none"
                        : "flex",
                    justifyContent: "center",
                  }}
                />
              </div>
            );
          }

          const Icon = PROVIDER_ICONS[provider.id];

          return (
            <button
              key={provider.id}
              type="button"
              className={`oauth-button oauth-button--${provider.id}`}
              onClick={() =>
                handleOAuthClick(
                  provider.id,
                  provider.name
                )
              }
              disabled={Boolean(loadingProvider)}
            >
              {Icon && (
                <Icon
                  className="oauth-button__icon"
                  aria-hidden="true"
                />
              )}

              <span>
                Continue with {provider.name}
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