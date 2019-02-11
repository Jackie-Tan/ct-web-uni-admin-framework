Accounts.onLogout(function () {
  localStorage.clear()
})

// Run this when the meteor app is started
AccountsTemplates.configure({
  // Behavior
  confirmPassword: true,
  enablePasswordChange: true,
  forbidClientAccountCreation: false,
  overrideLoginErrors: true,
  sendVerificationEmail: false,
  lowercaseUsername: false,
  focusFirstInput: true,

  // Appearance
  showAddRemoveServices: false,
  showForgotPasswordLink: true,
  showLabels: true,
  showPlaceholders: true,
  showResendVerificationEmailLink: false,

  // Client-side Validation
  continuousValidation: false,
  negativeFeedback: false,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,
  showValidating: true,


  // Redirects
  homeRoutePath: '/',
  redirectTimeout: 4000,

  // Hooks
  // Texts
  texts: {
    button: {
      signUp: "Register Now!"
    },
    socialSignUp: "Register",
    socialIcons: {
      "meteor-developer": "fa fa-rocket"
    },
    title: {
      forgotPwd: "Recover Your Password"
    }
  },
});

AccountsTemplates.addField({
  _id: 'reg_code',
  type: 'hidden'
});

