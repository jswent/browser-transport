// Copied into the dedicated profile on every launch; overrides anything changed in the UI.

// --- Proxy: everything through gluetun, never direct ---
user_pref("network.proxy.type", 1);
user_pref("network.proxy.http", "127.0.0.1");
user_pref("network.proxy.http_port", 8888);
user_pref("network.proxy.ssl", "127.0.0.1");
user_pref("network.proxy.ssl_port", 8888);
user_pref("network.proxy.share_proxy_settings", true);
user_pref("network.proxy.no_proxies_on", "");
user_pref("network.proxy.allow_hijacking_localhost", true); // pages can't reach services on your host's localhost
user_pref("network.proxy.failover_direct", false);          // proxy down => fail closed, not direct

// --- DNS: hostnames go to the proxy; nothing resolved locally ---
user_pref("network.trr.mode", 5); // disable DoH (would bypass gluetun's resolver config)
user_pref("network.dns.disablePrefetch", true);
user_pref("network.dns.disablePrefetchFromHTTPS", true);
user_pref("network.prefetch-next", false);
user_pref("network.predictor.enabled", false);
user_pref("network.http.speculative-parallel-limit", 0);
user_pref("browser.urlbar.speculativeConnect.enabled", false);
user_pref("browser.places.speculativeConnect.enabled", false);

// --- UDP can't traverse an HTTP proxy: disable/contain it ---
user_pref("network.http.http3.enable", false);
user_pref("media.peerconnection.ice.proxy_only", true); // WebRTC only via proxy (TCP), no direct UDP
user_pref("media.peerconnection.ice.default_address_only", true);
user_pref("media.peerconnection.ice.no_host", true);    // don't expose local IPs

// --- Location leaks beyond IP ---
user_pref("geo.enabled", false);
user_pref("browser.region.update.enabled", false);

// --- Background connections ---
user_pref("network.captive-portal-service.enabled", false);
user_pref("network.connectivity-service.enabled", false);
user_pref("browser.shell.checkDefaultBrowser", false);
