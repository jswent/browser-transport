# browser-transport

A dedicated Firefox that sends all its traffic through a WireGuard VPN (for example ProtonVPN). The rest of your system keeps using your normal network connection.

```
Firefox (dedicated profile) ──HTTP proxy──▶ 127.0.0.1:8888 ──▶ gluetun container ──WireGuard──▶ VPN
```

## Requirements

- Docker with Compose v2 (Docker Desktop, OrbStack, or Linux Docker)
- Firefox Developer Edition. Regular Firefox is used if Dev Edition isn't installed, or you can set `FIREFOX=/path/to/firefox`.

## Usage

1. Download a WireGuard config from your provider and save it as `wg0.conf` in this directory. For Proton, go to Account → WireGuard and pick a server. NAT-PMP and VPN Accelerator aren't needed.
2. Start everything:

```sh
./bt              # start gluetun, verify the egress IP, launch Firefox
./bt start <url>  # same, and open a URL
./bt check        # compare the proxy's egress IP with your direct IP
./bt status | logs | down
```

Always start through `./bt`. It checks the config and refuses to launch Firefox if the proxy's egress IP matches your real one.

## Security model

| Concern | Mitigation |
|---|---|
| Private key exposure | `wg0.conf` is gitignored, forced to `chmod 600` and mounted read-only. `bt` aborts if git tracks it. |
| Proxy reachable by other machines | The port is published on `127.0.0.1` only, never `0.0.0.0`. |
| VPN drops and traffic leaks | gluetun's firewall acts as a kill switch and only allows traffic through the tunnel. Firefox has `failover_direct=false`, so it fails closed when the proxy is down. |
| DNS leaks | Firefox sends hostnames to the proxy (HTTP CONNECT) and never resolves them locally. DoH and DNS prefetch are disabled. gluetun resolves names over DoT inside the tunnel. |
| WebRTC / QUIC (UDP) bypassing the proxy | HTTP/3 is disabled. WebRTC is limited to proxy-only and doesn't expose host IPs. |
| Mixing with your normal browsing | A separate profile in `./profile` and `-no-remote` keep it apart from your main Firefox: no shared cookies or sessions, and links aren't handed to the unproxied instance. |
| Supply chain | The gluetun image is pinned by tag and digest. Container runs with `no-new-privileges`, and it has only `NET_ADMIN`. |
| Proxy fingerprinting / logs | `HTTPPROXY_STEALTH` strips proxy headers. Proxy request logging is off. |

The prefs are in `firefox/user.js`. They're re-applied on every launch, so changes you make in the settings UI don't persist.

### Limitations

- **This is not anonymity.** The browser fingerprint, time zone, locale, and any accounts you log into still identify you. For stronger anonymity use Tor Browser. Setting `privacy.resistFingerprinting` helps somewhat but breaks some sites.
- Any local process can use the loopback proxy. If that matters, set `HTTPPROXY_USER` and `HTTPPROXY_PASSWORD`. Firefox will then ask for the credentials.
- Your VPN provider can see your traffic metadata, just as with any VPN.
- **DNS options.** By default, gluetun sends DNS to Cloudflare over DoT, through the tunnel. To use Proton's resolver instead, uncomment the `DNS_UPSTREAM_*` lines in `compose.yaml`. That adds no third party, but the DNS traffic is plaintext inside the tunnel.

## Updating gluetun

Pick a new release tag, get its digest with `docker buildx imagetools inspect qmcgaw/gluetun:<tag>`, and update `image:` in `compose.yaml`.
