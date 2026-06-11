/**
 * Disposable / temporary email domains blocked at signup.
 * Covers the major providers (incl. mail.tm and its rotating domains' anchors).
 * Extend freely — checked as exact domain match plus subdomain suffix match.
 */
const BLOCKED = [
  // mail.tm family
  "mail.tm", "indigobook.com", "punkproof.com", "dcpa.net", "freeml.net",
  // big temp-mail services
  "10minutemail.com", "10minutemail.net", "20minutemail.com", "temp-mail.org",
  "temp-mail.io", "tempmail.com", "tempmail.net", "tempmail.dev", "tempmailo.com",
  "tempr.email", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamail.biz", "sharklasers.com", "grr.la", "mailinator.com",
  "mailinator.net", "maildrop.cc", "yopmail.com", "yopmail.fr", "yopmail.net",
  "throwawaymail.com", "getnada.com", "nada.email", "inboxkitten.com",
  "dispostable.com", "trashmail.com", "trashmail.de", "trash-mail.com",
  "mytrashmail.com", "fakeinbox.com", "fakemail.net", "mohmal.com",
  "emailondeck.com", "spamgourmet.com", "mintemail.com", "mailnesia.com",
  "mailcatch.com", "tempinbox.com", "burnermail.io", "spambox.us",
  "33mail.com", "anonbox.net", "deadaddress.com", "despam.it",
  "disposableinbox.com", "dropmail.me", "easytrashmail.com", "emailfake.com",
  "email-fake.com", "fakemailgenerator.com", "harakirimail.com",
  "incognitomail.com", "jetable.org", "kasmail.com", "mail-temp.com",
  "mailexpire.com", "mailforspam.com", "mailmoat.com", "meltmail.com",
  "mt2015.com", "mvrht.com", "mytemp.email", "no-spam.ws", "noclickemail.com",
  "nogmailspam.info", "nospam4.us", "nowmymail.com", "objectmail.com",
  "obobbo.com", "odnorazovoe.ru", "oneoffemail.com", "onewaymail.com",
  "owlpic.com", "pookmail.com", "proxymail.eu", "rcpt.at", "receiveee.com",
  "rmqkr.net", "rppkn.com", "safe-mail.net", "sendspamhere.com",
  "shieldemail.com", "smellfear.com", "snakemail.com", "sneakemail.com",
  "sogetthis.com", "soodonims.com", "spam4.me", "spamavert.com",
  "spambob.net", "spamcero.com", "spamcon.org", "spamcorptastic.com",
  "spamcowboy.com", "spamday.com", "spamex.com", "spamfree24.com",
  "spamfree24.de", "spamfree24.org", "spamgoes.in", "spamherelots.com",
  "spamhereplease.com", "spamhole.com", "spamify.com", "spaml.de",
  "spammotel.com", "spamobox.com", "spamslicer.com", "spamspot.com",
  "spamthis.co.uk", "spamtroll.net", "stuffmail.de", "supergreatmail.com",
  "superrito.com", "tempemail.net", "tempinbox.co.uk", "tempmaildemo.com",
  "tempmailer.com", "tempomail.fr", "temporaryemail.net", "temporaryinbox.com",
  "thankyou2010.com", "thisisnotmyrealemail.com", "tradermail.info",
  "trash2009.com", "trashdevil.com", "trashemail.de", "trashymail.com",
  "tyldd.com", "uggsrock.com", "wegwerfmail.de", "wegwerfmail.net",
  "wegwerfmail.org", "wh4f.org", "whyspam.me", "willhackforfood.biz",
  "willselfdestruct.com", "winemaven.info", "wronghead.com", "wuzup.net",
  "wuzupmail.net", "xagloo.com", "xemaps.com", "xents.com", "xmaily.com",
  "xoxy.net", "yep.it", "yogamaven.com", "yopmail.gq", "yuurok.com",
  "za.com", "zippymail.info", "zoemail.net", "zomg.info",
  "moakt.com", "moakt.cc", "tmails.net", "disbox.net", "disbox.org",
  "vomoto.com", "fexbox.org", "mailbox.in.ua", "rover.info", "spamfighter.cf",
  "etranquil.com", "internxt.com", "crazymailing.com", "tempail.com",
  "tempmail.plus", "smailpro.com", "snapmail.cc", "mail7.io", "luxusmail.org",
  "1secmail.com", "1secmail.org", "1secmail.net", "emailnator.com",
  "mailsac.com", "tmpmail.org", "tmpmail.net", "tmpeml.com", "minuteinbox.com",
  "tempm.com", "haribu.net", "vjuum.com", "laafd.com", "rteet.com",
];

const BLOCKED_SET = new Set(BLOCKED);

export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 0) return true;
  const domain = email.slice(at + 1).trim().toLowerCase();
  if (BLOCKED_SET.has(domain)) return true;
  // also block subdomains of known disposable roots
  return BLOCKED.some((d) => domain.endsWith("." + d));
}
