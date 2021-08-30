import configs from "./configs";

// limit FPS by throttling tick for all components
import "aframe";
const { registerComponent, registerSystem } = AFRAME;
let maxFPS = new URLSearchParams(location.search).get("max_fps");
if (maxFPS && (maxFPS = parseInt(maxFPS)) && maxFPS > 0) {
  AFRAME.registerSystem = (name, def) => {
    if (def.tick && def.tick !== AFRAME.utils.throttleTick) {
      const init = def.init;
      def.init = function() {
        if (init) {
          init.apply(this, arguments);
        }
        if (this.tick !== AFRAME.utils.throttleTick) {
          this.tick = AFRAME.utils.throttleTick(this.tick, 1000 / maxFPS, this);
        }
      };
    }
    return registerSystem(name, def);
  };
  AFRAME.registerComponent = (name, def) => {
    if (def.tick) {
      const init = def.init;
      def.init = function() {
        if (init) {
          init.apply(this, arguments);
        }
        if (this.tick !== AFRAME.utils.throttleTick) {
          this.tick = AFRAME.utils.throttleTick(this.tick, 1000 / maxFPS, this);
        }
      };
    }
    return registerComponent(name, def);
  };
}

export function getCurrentHubId() {
  const qs = new URLSearchParams(location.search);
  const defaultRoomId = configs.feature("default_room_id");

  return (
    qs.get("hub_id") ||
    (document.location.pathname === "/" && defaultRoomId
      ? defaultRoomId
      : document.location.pathname.substring(1).split("/")[0])
  );
}

export function updateVRHudPresenceCount({ presence }) {
  const occupantCount = Object.getOwnPropertyNames(presence.state).length;
  const vrHudPresenceCount = document.querySelector("#hud-presence-count");
  vrHudPresenceCount.setAttribute("text", "value", occupantCount.toString());
}
export function updateSceneCopresentState(presence, scene) {
  const occupantCount = Object.getOwnPropertyNames(presence.state).length;
  if (occupantCount > 1) {
    scene.addState("copresent");
  } else {
    scene.removeState("copresent");
  }
}

export function createHubChannelParams({
  permsToken,
  profile,
  pushSubscriptionEndpoint,
  isMobile,
  isMobileVR,
  isEmbed,
  hubInviteId,
  authToken
}) {
  return {
    profile,
    push_subscription_endpoint: pushSubscriptionEndpoint,
    auth_token: authToken || null,
    perms_token: permsToken || null,
    context: {
      mobile: isMobile || isMobileVR,
      embed: isEmbed,
      hmd: isMobileVR
    },
    hub_invite_id: hubInviteId
  };
}
