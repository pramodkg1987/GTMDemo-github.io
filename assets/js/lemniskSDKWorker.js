var type = "LIVE";
var version = "v71";
var status = {};
var advid = 'VIZVRM6525';
var target = "pl.dev.hxcd.now.hclsoftware.cloud";
var ctaUrls = ['lp1', 'lp2'];
self.addEventListener('install', function(event) {
  self.skipWaiting().catch(function(err) {
    logError(err);
  });
});
self.addEventListener('activate', function(event) {});
self.addEventListener('push', function(event) {
  try {
    var data = event.data ? event.data.text() : '{}';
    data = JSON.parse(data);
    var showAd = true;
    if (!(data.hasOwnProperty('imprid') && data.hasOwnProperty('engid') && data.hasOwnProperty('title') && data.hasOwnProperty('body') && data.hasOwnProperty('icon') && data.hasOwnProperty('lp'))) {
      showAd = false;
    }
    var uuid = data.imprid;
    status[uuid] = 1;
    var payload = {
      body: data.body,
      icon: data.icon,
      tag: data.tag,
      requireInteraction: true,
      data: {
        url: data.lp,
        ts: epoch,
        engid: data.engid,
        uuid: uuid,
        ck: data.ck
      }
    };
    var orchestrated = 0;
    var isBigImage = false;
    var triggerType="-";
    var label="-";
    var segid="";
    var endpoint = "-";
    var am = {};
    if (data.orchestrated) {
      orchestrated = data.orchestrated;
    }
    payload.data.orchestrated = orchestrated;
    if (data.isBigImage === true && data.hasOwnProperty('image')) {
      payload.image = data.image;
      isBigImage = true;
    }
    payload.data.isBigImage = isBigImage;
    if (data.trtype) {
      triggerType = data.trtype;
    }
    payload.data.trtype=triggerType;
    if (data.label) {
      label = data.label;
    }
    payload.data.label=encodeURIComponent(label);
    if (data.endpoint) {
      endpoint = data.endpoint;
    }
    payload.data.endpoint = encodeURIComponent(endpoint);
    if (data.am){
      am = data.am;
    }
    payload.data.am = am;
    var encodedAM = encodeURIComponent(JSON.stringify(am));
    if (data.segid) {
      segid = data.segid;
    }
    payload.data.segid=segid;
    if (data.isButtonsEnabled === true && data.hasOwnProperty('actions')) {
      payload.actions = data.actions;
      for (i = 0; i < data.actions.length; i++) {
        payload.data[ctaUrls[i]] = data[ctaUrls[i]];
      }
    }
    var epoch = (new Date).getTime();
    if (showAd) {
      event.waitUntil(self.registration.showNotification(data.title, payload).then(function() {
        logEvent(data.engid, uuid, 'PUSH', epoch, "", orchestrated, data.ck, segid, isBigImage, triggerType, payload.data.label, payload.data.endpoint, encodedAM);
        self.registration.getNotifications().then(function(nots) {
          for (var i = 0; i < nots.length; i++) {
            if (nots[i].data.uuid === uuid) {
              var n = nots[i];
              setTimeout(function() {
                if (status[uuid] === 1) {
                  delete status[uuid];
                  n.close();
                  epoch = (new Date).getTime();
                  logEvent(data.engid, uuid, 'DISMISS', epoch, "", orchestrated, data.ck, segid, isBigImage, triggerType, payload.data.label, payload.data.endpoint, encodedAM);
                }
                delete status[uuid];
              }, 36000000);
            }
          }
        }).catch(function(err) {
          logError(err.message);
        })
      }).catch(function(err) {
        logError(err.message);
      }));
    } else {
      logError("Not sufficient data to show push");
    }
  } catch (err) {
    logError("Error in push " + err.message);
  }
});
self.addEventListener('notificationclick', function(event) {
  delete status[event.notification.data.uuid];
  var epoch = (new Date).getTime();
  var targetUrl = event.notification.data && event.notification.data.url;
  var subaction = "";
  if (event.action === 'cta1') {
    targetUrl = event.notification.data && event.notification.data.lp1;
    subaction = 'CTA1';
  } else if (event.action === 'cta2') {
    targetUrl = event.notification.data && event.notification.data.lp2;
    subaction = 'CTA2';
  }
  var isBigImage = false;
  var triggerType="-";
  var label="-";
  var endpoint = "-";
  var segid="";
  var am = {};
  if (event.notification.data.isBigImage) {
   isBigImage = true;
  }
  if (event.notification.data.trtype) {
    triggerType = event.notification.data.trtype;
  }
  if (event.notification.data.label) {
    label = event.notification.data.label;
  }
  if (event.notification.data.endpoint) {
	  endpoint = event.notification.data.endpoint;
  }
  if (event.notification.data.segid) {
    segid = event.notification.data.segid;
  }
  if (event.notification.data.am) {
	  am = event.notification.data.am;
  }
  var encodedAM = encodeURIComponent(JSON.stringify(am));
  logEvent(event.notification.data.engid, event.notification.data.uuid, 'CLICK', epoch, subaction, event.notification.data.orchestrated, event.notification.data.ck, segid, isBigImage, triggerType, label,  endpoint, encodedAM);
  event.notification.close();
  if (targetUrl) event.waitUntil(clients.openWindow(targetUrl));
});
self.addEventListener('notificationclose', function(event) {
  delete status[event.notification.data.uuid];
  var epoch = (new Date).getTime();
  var isBigImage = false;
  var triggerType="-";
  var label="-";
  var endpoint = "-";
  var segid="";
  var am = {};
  if (event.notification.data.isBigImage) {
   isBigImage = true;
  }
  if (event.notification.data.trtype) {
    triggerType = event.notification.data.trtype;
  }
  if (event.notification.data.label) {
    label = event.notification.data.label;
  }
  if (event.notification.data.endpoint) {
    endpoint = event.notification.data.endpoint;
  }
  if (event.notification.data.segid) {
    segid = event.notification.data.segid;
  }
  if (event.notification.data.am) {
    am = event.notification.data.am;
  }
  var encodedAM = encodeURIComponent(JSON.stringify(am));
  logEvent(event.notification.data.engid, event.notification.data.uuid, 'CLOSE', epoch, "", event.notification.data.orchestrated, event.notification.data.ck, segid, isBigImage, triggerType, label, endpoint, encodedAM);
});
self.addEventListener('error', function(event) {
  logError("Error on service worker install");
});
logEvent = function logEvent(engid, tag, action, ts, subAction, orchestrated, ck, segid, isBigImage, triggerType, label,  endpoint, am) {
  var notify = "https://" + target + "/analyze/notification?" + "&version=" + version + "&engid=" + engid + "&action=" + action + "&tag=" + tag + "&ts=" + ts + "&advid=" + advid +"&orchestrated=" + orchestrated +"&hasbigimg=" + isBigImage + "&ttype=" + triggerType + "&label=" + label + "&segid=" + segid + "&endpoint=" + endpoint + "&am=" + am;
  if (subAction) {
    notify += "&subaction=" + subAction;
  }
  if(ck){ 
    notify += "&ck=" + ck;
  }
  fetch(notify, {
    credentials: 'include'
  })
}
logError = function logError(err) {
  if (type === 'LIVE' || type === "DEMO") {
    var message = encodeURIComponent(err);
    var notify = "https://" + target + "/analyze/error?message=" + message + "&advid=" + advid + "&version=" + version;
    fetch(notify, {
      credentials: 'include'
    })
  } else {
    console.log(err);
  }
}