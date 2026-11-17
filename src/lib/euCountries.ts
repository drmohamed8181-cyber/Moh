// Countries where marketing email needs an explicit opt-in (EU, EEA, UK,
// Switzerland). Visitors from these see an unticked "inventory updates" box
// under our forms instead of the notice-only wording (see ConsentNotice).
export const OPT_IN_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
  "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO",
  "GB", "CH",
]);
