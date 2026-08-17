const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const result = await authService.registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const result = await authService.requestPasswordReset(email);
    const genericMessage =
      "If an account exists for that email, you can reset your password.";

    if (!result.requested) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const emailResult = await authService.sendResetEmail({
      to: result.email,
      resetLink: result.resetLink,
    });

    const resetLinkMessage = emailResult.sent
      ? "If an account exists for that email, we sent a reset link."
      : emailResult.error
        ? "We could not send the email. Use the reset link below to continue."
        : genericMessage;

    return res.status(200).json({
      success: true,
      message: resetLinkMessage,
      data: emailResult.sent ? undefined : { resetLink: result.resetLink },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    await authService.resetPassword({ token, password });

    res.status(200).json({
      success: true,
      message: "Password updated. You can log in with your new password.",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const googleConfig = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
    },
  });
};

const googleLogin = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;
    const result = await authService.loginWithGoogle({ credential, accessToken });

    res.status(200).json({
      success: true,
      message: "Logged in with Google.",
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await authService.listUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  googleConfig,
  googleLogin,
  listUsers,
};
