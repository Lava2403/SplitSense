import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { OAUTH_PROVIDERS } from "../config/oauth";
import "./OAuthSection.css";

const PROVIDER_ICONS = {
  google: FcGoogle,
  github: FaGithub,
};

function OAuthSection({
  mode = "login",
  dividerText = "or continue with email",
}) {
  const [notice, setNotice] = useState("");

  const handleOAuthClick = (providerId, providerName) => {
    // Frontend only — baad mein yahan real OAuth logic add hogi
    console.log(`OAuth ${mode} clicked:`, providerId);

    setNotice(`${providerName} sign-in coming soon.`);

    setTimeout(() => {
      setNotice("");
    }, 3000);
  };

  const enabledProviders = OAUTH_PROVIDERS.filter((provider) => provider.enabled);

  return (
    <div className="oauth-section">
      {notice && (
        <p className="oauth-notice">{notice}</p>
      )}

      <div className="oauth-buttons">
        {enabledProviders.map((provider) => {
          const Icon = PROVIDER_ICONS[provider.id];

          return (
            <button
              key={provider.id}
              type="button"
              className={`oauth-button oauth-button--${provider.id}`}
              onClick={() => handleOAuthClick(provider.id, provider.name)}
            >
              {Icon && <Icon className="oauth-button__icon" aria-hidden="true" />}
              <span>Continue with {provider.name}</span>
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
