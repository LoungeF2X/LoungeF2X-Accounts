window.premiumCheck = async function({
  onPremium, 
  onNotPremium, 
  onError
} = {}) {
  try {
    const accountId = localStorage.getItem("account");
    if (!accountId) {
      if (onNotPremium) onNotPremium();
      return;
    }
    if (typeof CheckPremium !== "function") {
      throw new Error("CheckPremium is not defined. Make sure firebase.js is loaded.");
    }
    const isPremium = await CheckPremium(accountId);
    if (isPremium) {
      if (onPremium) onPremium();
    } else {
      if (onNotPremium) onNotPremium();
    }
  } catch (e) {
    if (onError) onError(e);
    else if (onNotPremium) onNotPremium();
  }
};
function showPremiumModal() {
    var modal = document.getElementById('premium-modal');
    if (modal) {
      modal.style.display = 'flex';
      // Attach button handlers if needed
      document.getElementById('buy-premium-btn').onclick = function() {
        window.location.href = '/static/dash/premium.html';
      };
      document.getElementById('nevermind-btn').onclick = function() {
        window.history.back();
      };
      document.getElementById('close-premium-modal').onclick = function() {
        window.history.back();
      };
    } else {
      alert('You need to be a Premium member to use this feature.');
    }
  };
